"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { DEPARTMENTS } from "@/config/team";
import { upload } from "@vercel/blob/client";
import ImageUploadWithCrop from "@/components/ui/ImageUploadWithCrop";
import { helloWorldFormConfig } from "@/config/forms/hello-world-register";
import { cs101FormConfig } from "@/config/forms/cs101-register";

// Expected answer keys per event — used so that registrations submitted
// before a new field was added still show that field (as "-") in the
// dashboard and Excel export. `name` and `email` are stored top-level on the
// Registration document, not inside `answers`, so they're excluded here.
const TOP_LEVEL_KEYS = new Set(["name", "email"]);
const EXPECTED_ANSWER_KEYS: Record<string, string[]> = {
  "hello-world": helloWorldFormConfig.steps.flatMap((s) => s.fields.map((f) => f.name)).filter((n) => !TOP_LEVEL_KEYS.has(n)),
  "cs101":       cs101FormConfig.steps.flatMap((s) => s.fields.map((f) => f.name)).filter((n) => !TOP_LEVEL_KEYS.has(n)),
};

/* ─── Types ─────────────────────────────────────────────────────── */
type Registration = {
  _id: string; event: string; name: string; email: string; house?: string;
  answers: Record<string, string>; createdAt: string;
};

type Role = "user" | "staff" | "admin";

type ManagedUser = {
  _id: string; name?: string; email: string; image?: string;
  role: Role; createdAt: string;
};

const ROLES: Role[] = ["user", "staff", "admin"];
const ROLE_ORDER: Record<Role, number> = { admin: 0, staff: 1, user: 2 };
const houseOptions = ["spongebob", "conan", "kungfupanda", "zootopia", "toystory"];

/* ─── Role badge ─────────────────────────────────────────────────── */
const roleBadge: Record<Role, string> = {
  admin: "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800",
  staff: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  user:  "bg-hover text-secondary border border-border",
};

/* ─── Answer value renderer ──────────────────────────────────────── */
function AnswerValue({ value }: { value: string }) {
  const text = String(value ?? "").trim();
  if (!text) {
    return <p className="text-sm text-muted">—</p>;
  }
  const isUrl     = /^https?:\/\/\S+$/i.test(text);
  const isImage   = isUrl && /\.(jpe?g|png|webp|heic|gif|avif)(\?|$)/i.test(text);
  const isBlobImg = isUrl && /\.public\.blob\.vercel-storage\.com\//i.test(text);

  if (isImage || isBlobImg) {
    return (
      <div className="space-y-2">
        <a href={text} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={text}
            alt="answer attachment"
            className="rounded-lg max-h-64 w-auto object-contain border border-border bg-card"
          />
        </a>
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline break-all inline-block"
        >
          {text} ↗
        </a>
      </div>
    );
  }

  if (isUrl) {
    return (
      <a
        href={text}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
      >
        {text} ↗
      </a>
    );
  }

  return (
    <p className="text-sm text-secondary whitespace-pre-wrap break-words">
      {text}
    </p>
  );
}

/* ─── Response Modal ─────────────────────────────────────────────── */
function ResponseModal({ reg, onClose }: { reg: Registration; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog on mount; restore it to the trigger on unmount
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => { trigger?.focus(); };
  }, []);

  // Escape closes; Tab is trapped within the dialog
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-card border border-border"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle">
          <div>
            <h3 id="modal-title" className="text-base font-semibold text-foreground">{reg.name}</h3>
            <p className="text-xs text-muted mt-0.5">{reg.email}</p>
          </div>
          <button ref={closeRef} onClick={onClose} className="p-3 -mr-1 text-muted hover:text-secondary transition-colors cursor-pointer" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4">Form Responses</h4>
          {(() => {
            // Merge expected keys for the event (from the current form config)
            // with whatever the registration actually has, so newly-added fields
            // still render as "-" for older submissions.
            const expected = EXPECTED_ANSWER_KEYS[reg.event] ?? [];
            const actualKeys = Object.keys(reg.answers ?? {});
            const seen = new Set<string>();
            const orderedKeys = [...expected, ...actualKeys].filter((k) => {
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
            if (orderedKeys.length === 0) {
              return <p className="text-muted text-sm">No answers recorded.</p>;
            }
            return (
              <div className="space-y-4">
                {orderedKeys.map((key) => (
                  <div key={key} className="rounded-xl bg-hover px-4 py-3">
                    <p className="text-xs font-medium text-muted mb-1">{key}</p>
                    <AnswerValue value={reg.answers?.[key] ?? ""} />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ─── Registrations Tab ──────────────────────────────────────────── */
function RegistrationsTab({ callerRole, fixedEvent }: { callerRole: Role; fixedEvent?: string }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(fixedEvent ?? "all");
  const [modalReg, setModalReg] = useState<Registration | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Registration | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDelete._id }),
      });
      if (res.ok) {
        setRegistrations((p) => p.filter((r) => r._id !== confirmDelete._id));
        showToast(`✓ Deleted ${confirmDelete.name}`, true);
      } else {
        const data = await res.json();
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  useEffect(() => {
    fetch("/api/registrations")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setRegistrations(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSeedCandidates = async () => {
    setSeeding(true); setSeedMsg("");
    try {
      const res = await fetch("/api/admin/seed-candidates", { method: "POST" });
      const data = await res.json();
      setSeedMsg(res.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
    } catch { setSeedMsg("✗ Failed to seed candidates"); }
    finally { setSeeding(false); }
  };

  const handleHouseChange = async (regId: string, house: string) => {
    const res = await fetch("/api/admin/assign-house", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId, house }),
    });
    if (res.ok) setRegistrations((p) => p.map((r) => r._id === regId ? { ...r, house } : r));
  };

  const filtered = useMemo(
    () => filter === "all" ? registrations : registrations.filter((r) => r.event === filter),
    [registrations, filter]
  );

  const regStats = useMemo(() => ({
    total: registrations.length,
    cs101: registrations.filter((r) => r.event === "cs101").length,
    helloWorld: registrations.filter((r) => r.event === "hello-world").length,
  }), [registrations]);

  const handleExportExcel = async () => {
    if (filtered.length === 0) return;
    const { default: ExcelJS } = await import("exceljs");
    // Include expected keys per event so newly-added form fields appear as
    // columns even if old registrations don't have a value for them.
    const expectedKeys = Array.from(new Set(filtered.flatMap((r) => EXPECTED_ANSWER_KEYS[r.event] ?? [])));
    const actualKeys = Array.from(new Set(filtered.flatMap((r) => Object.keys(r.answers ?? {}))));
    const seen = new Set<string>();
    const answerKeys = [...expectedKeys, ...actualKeys].filter((k) => {
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const headers = ["Name", "Email", "Event", "House", "Date", ...answerKeys];
    const rows = filtered.map((r) => [
      r.name,
      r.email,
      r.event === "cs101" ? "CS101" : "Hello World",
      r.house || "-",
      new Date(r.createdAt).toLocaleDateString(),
      ...answerKeys.map((k) => {
        const v = r.answers?.[k];
        return v == null || v === "" ? "-" : String(v);
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registrations");
    sheet.addRow(headers).font = { bold: true };
    sheet.addRows(rows);
    sheet.columns.forEach((col, i) => {
      const widest = Math.max(headers[i].length, ...rows.map((r) => String(r[i] ?? "").length));
      col.width = Math.min(Math.max(widest + 2, 12), 60);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${filter}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center mb-6">
        {!fixedEvent && ["all", "cs101", "hello-world"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === f ? "bg-blue-600 text-white shadow-sm" : "bg-card text-secondary border border-border hover:bg-hover"}`}>
            {f === "all" ? "All" : f === "cs101" ? "CS101" : "Hello World"}
          </button>
        ))}
        <button onClick={handleExportExcel} disabled={filtered.length === 0}
          className="px-4 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export Excel
        </button>
        {!fixedEvent && (
          <button onClick={handleSeedCandidates} disabled={seeding}
            className="px-4 py-3 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer">
            {seeding ? "Seeding…" : "Seed Candidates"}
          </button>
        )}
      </div>

      {seedMsg && (
        <div className={`mb-6 p-3 rounded-xl text-sm border ${seedMsg.startsWith("✓") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"}`}>
          {seedMsg}
        </div>
      )}

      {/* Summary strip — shown only in "all" view */}
      {!fixedEvent && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-sm">
          <span>
            <strong className="font-semibold text-foreground">{regStats.total}</strong>
            <span className="ml-1.5 text-muted">registrations</span>
          </span>
          <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
          <span>
            <strong className="font-semibold text-blue-600 dark:text-blue-400">{regStats.cs101}</strong>
            <span className="ml-1.5 text-muted">CS101</span>
          </span>
          <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
          <span>
            <strong className="font-semibold text-amber-600 dark:text-amber-400">{regStats.helloWorld}</strong>
            <span className="ml-1.5 text-muted">Hello World</span>
          </span>
        </div>
      )}
      {fixedEvent && (
        <div className="flex items-center gap-x-4 mb-6 text-sm">
          <span>
            <strong className="font-semibold text-foreground">{filtered.length}</strong>
            <span className="ml-1.5 text-muted">ผู้ลงทะเบียน</span>
          </span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div role="status" aria-label="กำลังโหลด..." className="flex items-center justify-center py-20"><div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">No registrations found.</p>
        </div>
      ) : (
        <>
          {/* Desktop / tablet ≥ md — full table */}
          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-hover">
                    {["Name","Email","Event","House","Date","Actions"].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-secondary font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg) => (
                    <tr key={reg._id} className="border-b border-border-subtle hover:bg-hover transition-colors">
                      <td className="px-6 py-4 text-foreground font-medium">{reg.name}</td>
                      <td className="px-6 py-4 text-secondary">{reg.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${reg.event === "cs101" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"}`}>
                          {reg.event === "cs101" ? "CS101" : "Hello World"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {reg.event === "hello-world" ? (
                          <select value={reg.house || ""} onChange={(e) => handleHouseChange(reg._id, e.target.value)}
                            aria-label={`House for ${reg.name}`}
                            className="px-3 py-1.5 border border-border rounded-lg text-sm bg-card text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500">
                            <option value="">Unassigned</option>
                            {houseOptions.map((h) => <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
                          </select>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setModalReg(reg)} aria-label={`View responses for ${reg.name}`} className="text-primary hover:text-primary-dark text-sm font-medium cursor-pointer transition-colors">View</button>
                          {callerRole === "admin" && (
                            <button onClick={() => setConfirmDelete(reg)} aria-label={`Delete registration for ${reg.name}`} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium cursor-pointer transition-colors">Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile < md — card list. Same data, reflowed for thumb reach. */}
          <ul className="md:hidden bg-card border border-border rounded-2xl shadow-sm divide-y divide-border overflow-hidden">
            {filtered.map((reg) => (
              <li key={reg._id} className="p-4 space-y-3">
                {/* Top row: event badge + date, View action */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${reg.event === "cs101" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"}`}>
                      {reg.event === "cs101" ? "CS101" : "Hello World"}
                    </span>
                    <span className="text-xs text-muted tabular-nums">{new Date(reg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => setModalReg(reg)}
                      aria-label={`View responses for ${reg.name}`}
                      className="min-h-[44px] inline-flex items-center px-3 text-primary hover:text-primary-dark text-sm font-medium cursor-pointer transition-colors"
                    >
                      View
                    </button>
                    {callerRole === "admin" && (
                      <button
                        onClick={() => setConfirmDelete(reg)}
                        aria-label={`Delete registration for ${reg.name}`}
                        className="min-h-[44px] inline-flex items-center px-3 -mr-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium cursor-pointer transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Identity */}
                <div className="min-w-0">
                  <p className="text-foreground font-medium truncate">{reg.name}</p>
                  <p className="text-secondary text-sm break-all">{reg.email}</p>
                </div>

                {/* House selector — hello-world only */}
                {reg.event === "hello-world" && (
                  <div>
                    <label htmlFor={`house-mobile-${reg._id}`} className="block text-xs font-medium text-secondary mb-1">
                      House
                    </label>
                    <select
                      id={`house-mobile-${reg._id}`}
                      value={reg.house || ""}
                      onChange={(e) => handleHouseChange(reg._id, e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {houseOptions.map((h) => <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
                    </select>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {modalReg && <ResponseModal reg={modalReg} onClose={() => setModalReg(null)} />}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDelete(null); }}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl shadow-2xl bg-card border border-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete registration?</h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  This will permanently delete <strong className="text-secondary">{confirmDelete.name}</strong> ({confirmDelete.email}) from <strong className="text-secondary">{confirmDelete.event === "cs101" ? "CS101" : "Hello World"}</strong>. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}

/* ─── Users Tab ──────────────────────────────────────────────────── */
function UsersTab({ callerEmail, callerRole }: { callerEmail: string; callerRole: Role }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setUsers(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = useCallback(async (userId: string, newRole: Role) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
        showToast(`✓ Role updated to "${newRole}"`, true);
      } else {
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setUpdating(null);
    }
  }, []);

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${confirmDelete._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== confirmDelete._id));
        showToast(`✓ ลบ ${confirmDelete.name || confirmDelete.email} แล้ว`, true);
      } else {
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const isSelf = (u: ManagedUser) => u.email === callerEmail;

  const sortedUsers = useMemo(() =>
    [...users].sort((a, b) => {
      const roleDiff = (ROLE_ORDER[a.role] ?? 2) - (ROLE_ORDER[b.role] ?? 2);
      if (roleDiff !== 0) return roleDiff;
      return (a.name ?? a.email).localeCompare(b.name ?? b.email, "th");
    }),
  [users]);

  const userStats = useMemo(() => ({
    total: users.length,
    staff: users.filter((u) => u.role === "staff").length,
    admins: users.filter((u) => u.role === "admin").length,
  }), [users]);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-colors motion-safe:animate-slide-up ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-sm">
        <span>
          <strong className="font-semibold text-foreground">{userStats.total}</strong>
          <span className="ml-1.5 text-muted">users</span>
        </span>
        <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
        <span>
          <strong className="font-semibold text-amber-600 dark:text-amber-400">{userStats.staff}</strong>
          <span className="ml-1.5 text-muted">staff</span>
        </span>
        <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
        <span>
          <strong className="font-semibold text-pink-600 dark:text-pink-400">{userStats.admins}</strong>
          <span className="ml-1.5 text-muted">admins</span>
        </span>
      </div>

      {loading ? (
        <div role="status" aria-label="กำลังโหลด..." className="flex items-center justify-center py-20"><div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Desktop / tablet ≥ md — full table */}
          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-hover">
                    {["User","Email","Role","Joined", callerRole === "admin" ? "Change Role" : "Access", ...(callerRole === "admin" ? [""] : [])].map((h, i) => (
                      <th key={`${h}-${i}`} className="text-left px-6 py-4 text-secondary font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((u) => (
                    <tr key={u._id} className={`border-b border-border-subtle transition-colors ${isSelf(u) ? "bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-hover"}`}>
                      {/* Avatar + name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.image ? (
                            <img src={u.image} alt={u.name || u.email} referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-bold">{(u.name || u.email).charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-foreground font-medium truncate max-w-[140px]">{u.name || "—"}</p>
                            {isSelf(u) && <p className="text-xs text-primary">(you)</p>}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-secondary max-w-[180px]">
                        <span className="truncate block">{u.email}</span>
                      </td>

                      {/* Current role badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge[u.role || "user"]}`}>
                          {(u.role || "user").charAt(0).toUpperCase() + (u.role || "user").slice(1)}
                        </span>
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4 text-muted text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Role dropdown — admin only; staff sees read-only lock */}
                      <td className="px-6 py-4">
                        {callerRole !== "admin" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Read-only
                          </span>
                        ) : isSelf(u) ? (
                          <span className="text-xs text-muted italic">Cannot edit own role</span>
                        ) : (
                          <div className="relative inline-flex items-center gap-2">
                            <select
                              value={u.role || "user"}
                              disabled={updating === u._id}
                              onChange={(e) => handleRoleChange(u._id, e.target.value as Role)}
                              aria-label={`Change role for ${u.name || u.email}`}
                              className="pl-3 pr-8 py-1.5 border border-border rounded-lg text-sm bg-card text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 disabled:opacity-60 cursor-pointer appearance-none dark:[color-scheme:dark]"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                              ))}
                            </select>
                            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            {updating === u._id && (
                              <div role="status" aria-label="กำลังบันทึก...">
                                <div aria-hidden="true" className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      {callerRole === "admin" && (
                        <td className="px-6 py-4">
                          {!isSelf(u) && (
                            <button
                              onClick={() => setConfirmDelete(u)}
                              aria-label={`Delete ${u.name || u.email}`}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile < md — card list. Avatar + identity on top, role action at bottom. */}
          <ul className="md:hidden bg-card border border-border rounded-2xl shadow-sm divide-y divide-border overflow-hidden">
            {sortedUsers.map((u) => (
              <li key={u._id} className={`p-4 space-y-3 ${isSelf(u) ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                {/* Top row: avatar + name/email + role badge */}
                <div className="flex items-start gap-3">
                  {u.image ? (
                    <img src={u.image} alt={u.name || u.email} referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">{(u.name || u.email).charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-foreground font-medium truncate">{u.name || "—"}</p>
                      {isSelf(u) && <span className="text-xs text-primary shrink-0">(you)</span>}
                    </div>
                    <p className="text-secondary text-sm break-all">{u.email}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge[u.role || "user"]}`}>
                    {(u.role || "user").charAt(0).toUpperCase() + (u.role || "user").slice(1)}
                  </span>
                </div>

                {/* Joined date */}
                <p className="text-xs text-muted">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </p>

                {/* Role action */}
                {callerRole !== "admin" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Read-only
                  </span>
                ) : isSelf(u) ? (
                  <span className="text-xs text-muted italic">Cannot edit own role</span>
                ) : (
                  <div>
                    <label htmlFor={`role-mobile-${u._id}`} className="block text-xs font-medium text-secondary mb-1">
                      Change Role
                    </label>
                    <div className="relative">
                      <select
                        id={`role-mobile-${u._id}`}
                        value={u.role || "user"}
                        disabled={updating === u._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value as Role)}
                        className="w-full pl-3 pr-9 py-2.5 border border-border rounded-lg text-sm bg-card text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 disabled:opacity-60 cursor-pointer appearance-none dark:[color-scheme:dark]"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      {updating === u._id && (
                        <div role="status" aria-label="กำลังบันทึก..." className="absolute right-9 top-1/2 -translate-y-1/2">
                          <div aria-hidden="true" className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {callerRole === "admin" && !isSelf(u) && (
                  <button
                    onClick={() => setConfirmDelete(u)}
                    className="w-full mt-1 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer border border-red-200 dark:border-red-800"
                  >
                    Delete User
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Delete user confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDelete(null); }}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl shadow-2xl bg-card border border-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ลบ User?</h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  จะลบ <strong className="text-secondary">{confirmDelete.name || "—"}</strong> ({confirmDelete.email}) ออกจากระบบ ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleDeleteUser} disabled={deleting} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">
                {deleting ? "กำลังลบ..." : "ลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Candidates Tab ─────────────────────────────────────────────── */
type CandidateApplication = {
  _id: string;
  name: string;
  email: string;
  nickname?: string;
  section?: string;
  image?: string;
  motto?: string;
  videoUrl?: string;
  dutyAnswer?: string;
  visionAnswer?: string;
  strengthWeaknessAnswer?: string;
  conflictAnswer?: string;
  // Legacy
  studentId?: string;
  year?: string;
  role?: string;
  bio?: string;
  motivation?: string;
  promoted: boolean;
  promotedCandidateId?: string;
  voteCount?: number;
  createdAt: string;
};

type Voter = {
  _id: string;
  voterEmail: string;
  voterName: string;
  studentId: string;
  createdAt: string;
};

type CandidateEditForm = {
  name: string; nickname: string; section: string; image: string; motto: string;
  videoUrl: string; dutyAnswer: string; visionAnswer: string;
  strengthWeaknessAnswer: string; conflictAnswer: string;
};

function CandidatesTab({ callerRole }: { callerRole: Role }) {
  const [apps, setApps] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<CandidateApplication | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CandidateApplication | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<"all" | "ปกติ" | "พิเศษ">("all");
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingLoading, setVotingLoading] = useState(true);
  const [votingToggling, setVotingToggling] = useState(false);
  const [voterModal, setVoterModal] = useState<{ app: CandidateApplication; voters: Voter[] } | null>(null);
  const [voterLoading, setVoterLoading] = useState(false);
  const [deletingVoterId, setDeletingVoterId] = useState<string | null>(null);
  const [editApp, setEditApp] = useState<CandidateApplication | null>(null);
  const [editForm, setEditForm] = useState<CandidateEditForm | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDeleteVote = async (voteId: string) => {
    if (!confirm("ลบโหวตนี้?")) return;
    setDeletingVoterId(voteId);
    try {
      const res = await fetch(`/api/admin/votes/${voteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setVoterModal((prev) => {
        if (!prev) return prev;
        return { ...prev, voters: prev.voters.filter((v) => v._id !== voteId) };
      });
      setApps((prev) => prev.map((a) => {
        if (!voterModal || a._id !== voterModal.app._id) return a;
        return { ...a, voteCount: Math.max(0, (a.voteCount ?? 1) - 1) };
      }));
      showToast("ลบโหวตสำเร็จ", true);
    } catch {
      showToast("ลบโหวตไม่สำเร็จ", false);
    } finally {
      setDeletingVoterId(null);
    }
  };

  const handleViewVoters = async (app: CandidateApplication) => {
    setVoterLoading(true);
    try {
      const res = await fetch(`/api/admin/votes?candidateId=${app._id}`);
      const data = await res.json();
      setVoterModal({ app, voters: Array.isArray(data) ? data : [] });
    } catch {
      setVoterModal({ app, voters: [] });
    } finally {
      setVoterLoading(false);
    }
  };

  const openEdit = (a: CandidateApplication) => {
    setEditApp(a);
    setEditForm({
      name: a.name, nickname: a.nickname || "", section: a.section || "",
      image: a.image || "", motto: a.motto || "", videoUrl: a.videoUrl || "",
      dutyAnswer: a.dutyAnswer || "", visionAnswer: a.visionAnswer || "",
      strengthWeaknessAnswer: a.strengthWeaknessAnswer || "", conflictAnswer: a.conflictAnswer || "",
    });
  };

  const handleEditSave = async () => {
    if (!editApp || !editForm) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/candidate-applications/${editApp._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setApps((p) => p.map((a) => a._id === editApp._id ? { ...a, ...editForm } : a));
        showToast("✓ อัปเดตข้อมูลแล้ว", true);
        setEditApp(null);
        setEditForm(null);
      } else {
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setEditSaving(false);
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/candidate-applications")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setApps(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/admin/voting")
      .then((r) => r.json())
      .then((d) => { setVotingOpen(d.votingOpen ?? false); })
      .catch(() => {})
      .finally(() => setVotingLoading(false));
  }, []);

  const handleToggleVoting = async () => {
    setVotingToggling(true);
    try {
      const res = await fetch("/api/admin/voting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open: !votingOpen }),
      });
      const data = await res.json();
      if (res.ok) {
        setVotingOpen(data.votingOpen);
        showToast(data.votingOpen ? "✓ เปิดโหวตแล้ว" : "✓ ปิดโหวตแล้ว", true);
      } else {
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setVotingToggling(false);
    }
  };

  const handleDeleteApp = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/candidate-applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDelete._id }),
      });
      if (res.ok) {
        setApps((p) => p.filter((a) => a._id !== confirmDelete._id));
        showToast(`✓ ลบ ${confirmDelete.name} แล้ว`, true);
      } else {
        const data = await res.json();
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleClearVotes = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/admin/vote-data", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ ล้างข้อมูลโหวตแล้ว (${data.votesDeleted} คะแนน)`, true);
        load();
      } else {
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setClearing(false);
      setConfirmClear(false);
    }
  };

  const filteredApps = useMemo(() =>
    sectionFilter === "all" ? apps : apps.filter((a) => a.section === sectionFilter),
  [apps, sectionFilter]);

  const stats = useMemo(() => ({
    total: apps.length,
    normal: apps.filter((a) => a.section === "ปกติ").length,
    special: apps.filter((a) => a.section === "พิเศษ").length,
  }), [apps]);

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Section filter + voting toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: "all",   label: `ทั้งหมด (${stats.total})` },
            { key: "ปกติ",  label: `ภาคปกติ (${stats.normal})` },
            { key: "พิเศษ", label: `ภาคพิเศษ (${stats.special})` },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setSectionFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${sectionFilter === key ? "bg-blue-600 text-white shadow-sm" : "text-secondary hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {callerRole === "admin" && (
            <button
              onClick={handleToggleVoting}
              disabled={votingLoading || votingToggling}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2 ${votingOpen ? "bg-green-600 text-white hover:bg-green-700" : "bg-card text-secondary border border-border hover:bg-hover"}`}
            >
              <span className={`w-2 h-2 rounded-full ${votingOpen ? "bg-white" : "bg-muted"}`} aria-hidden="true" />
              {votingToggling ? "..." : votingOpen ? "โหวตเปิดอยู่" : "เปิดโหวต"}
            </button>
          )}
          {callerRole === "admin" && (
            <button
              onClick={() => setConfirmClear(true)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              ล้างข้อมูลโหวต
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div role="status" aria-label="กำลังโหลด..." className="flex items-center justify-center py-20">
          <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">{apps.length === 0 ? "ยังไม่มีใบสมัคร" : "ไม่มีใบสมัครในภาคนี้"}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-hover">
                  {["ชื่อ","อีเมล","ชื่อเล่น","ภาค",...(callerRole === "admin" ? ["โหวต"] : []),"Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-secondary font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((a) => (
                  <tr key={a._id} className="border-b border-border-subtle hover:bg-hover transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">{a.name}</td>
                    <td className="px-6 py-4 text-secondary">{a.email}</td>
                    <td className="px-6 py-4 text-secondary">{a.nickname || a.role || "—"}</td>
                    <td className="px-6 py-4 text-secondary">{a.section ? `ภาค${a.section}` : "—"}</td>
                    {callerRole === "admin" && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewVoters(a)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {a.voteCount ?? 0}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setDetail(a)} className="text-primary hover:text-primary-dark text-sm font-medium cursor-pointer">View</button>
                        {callerRole === "admin" && (
                          <button
                            onClick={() => openEdit(a)}
                            className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer transition-colors"
                          >
                            แก้ไข
                          </button>
                        )}
                        {callerRole === "admin" && (
                          <button
                            onClick={() => setConfirmDelete(a)}
                            className="text-sm font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer transition-colors"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div role="dialog" aria-modal="true" className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-card border border-border">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-semibold text-foreground">{detail.name}</h3>
                <p className="text-xs text-muted mt-0.5">{detail.email}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-3 -mr-1 text-muted hover:text-secondary transition-colors cursor-pointer" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {([
                ["ชื่อเล่น", detail.nickname || detail.role || "—"],
                ["ภาค", detail.section ? `ภาค${detail.section}` : "—"],
                ["คติประจำใจ", detail.motto || "—"],
                ["ลิงก์วิดีโอ", detail.videoUrl || "—"],
                ["หน้าที่ของประธานรุ่น", detail.dutyAnswer || "—"],
                ["แนวคิด/กิจกรรม", detail.visionAnswer || "—"],
                ["จุดแข็งและจุดอ่อน", detail.strengthWeaknessAnswer || "—"],
                ["รูปภาพ (URL)", detail.image || "—"],
                ["วันที่สมัคร", new Date(detail.createdAt).toLocaleString("th-TH")],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-hover px-4 py-3">
                  <p className="text-xs font-medium text-muted mb-1">{k}</p>
                  {k === "ลิงก์วิดีโอ" && v !== "—" ? (
                    <a href={v} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">{v}</a>
                  ) : (
                    <p className="text-sm text-secondary whitespace-pre-wrap break-words">{v}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit application modal */}
      {editApp && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !editSaving) { setEditApp(null); setEditForm(null); } }}>
          <div role="dialog" aria-modal="true" className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border-subtle shrink-0">
              <h3 className="text-base font-semibold text-foreground">แก้ไขใบสมัคร — {editApp.name}</h3>
              <button onClick={() => { setEditApp(null); setEditForm(null); }} disabled={editSaving}
                className="p-2 -mr-1 text-muted hover:text-secondary transition-colors cursor-pointer" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Image */}
              <ImageUploadWithCrop
                prefix="candidates"
                value={editForm.image}
                onChange={(url) => setEditForm((f) => f ? { ...f, image: url } : f)}
              />

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">ชื่อจริง-นามสกุล (ใส่คำนำหน้า)</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => f ? { ...f, name: e.target.value } : f)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">ชื่อเล่น</label>
                <input
                  value={editForm.nickname}
                  onChange={(e) => setEditForm((f) => f ? { ...f, nickname: e.target.value } : f)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>

              {/* Section */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">ภาค</p>
                <div className="flex gap-2">
                  {(["ปกติ", "พิเศษ"] as const).map((s) => (
                    <button key={s} type="button"
                      onClick={() => setEditForm((f) => f ? { ...f, section: s } : f)}
                      className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${editForm.section === s ? "bg-blue-600 text-white shadow-sm" : "bg-card border border-border text-secondary hover:bg-hover"}`}>
                      ภาค{s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motto */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">คติประจำใจ</label>
                <input
                  value={editForm.motto}
                  onChange={(e) => setEditForm((f) => f ? { ...f, motto: e.target.value } : f)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">ลิงก์คลิปวิดีโอ (YouTube)</label>
                <input
                  value={editForm.videoUrl}
                  onChange={(e) => setEditForm((f) => f ? { ...f, videoUrl: e.target.value } : f)}
                  placeholder="https://youtu.be/..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>

              {/* dutyAnswer */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">หน้าที่ของประธานรุ่นคืออะไร</label>
                <textarea rows={3}
                  value={editForm.dutyAnswer}
                  onChange={(e) => setEditForm((f) => f ? { ...f, dutyAnswer: e.target.value } : f)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>

              {/* visionAnswer */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">แนวคิดหรือกิจกรรมที่อยากผลักดัน</label>
                <textarea rows={3}
                  value={editForm.visionAnswer}
                  onChange={(e) => setEditForm((f) => f ? { ...f, visionAnswer: e.target.value } : f)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>

              {/* strengthWeaknessAnswer */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">จุดแข็งและจุดอ่อนของตัวเอง</label>
                <textarea rows={3}
                  value={editForm.strengthWeaknessAnswer}
                  onChange={(e) => setEditForm((f) => f ? { ...f, strengthWeaknessAnswer: e.target.value } : f)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>

              {/* conflictAnswer */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">จัดการความขัดแย้งระหว่างเพื่อนในทีม</label>
                <textarea rows={3}
                  value={editForm.conflictAnswer}
                  onChange={(e) => setEditForm((f) => f ? { ...f, conflictAnswer: e.target.value } : f)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle shrink-0">
              <button onClick={() => { setEditApp(null); setEditForm(null); }} disabled={editSaving}
                className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleEditSave} disabled={editSaving || !editForm?.name.trim() || !editForm?.nickname.trim() || !editForm?.section}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">
                {editSaving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete application confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDelete(null); }}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl shadow-2xl bg-card border border-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ลบใบสมัครของ {confirmDelete.name}?</h3>
                <p className="mt-1 text-sm text-secondary">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleDeleteApp} disabled={deleting} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">
                {deleting ? "กำลังลบ..." : "ลบ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear votes confirmation modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !clearing) setConfirmClear(false); }}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl shadow-2xl bg-card border border-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ล้างข้อมูลโหวตทั้งหมด?</h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  จะลบคะแนนโหวตทั้งหมด รีเซ็ต hasVoted ของทุก user และรีเซ็ต voteCount ของทุกผู้สมัคร ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmClear(false)} disabled={clearing} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleClearVotes} disabled={clearing} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">
                {clearing ? "กำลังล้าง..." : "ล้างข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voter modal */}
      {voterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setVoterModal(null); }}>
          <div role="dialog" aria-modal="true" className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-card border border-border">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-semibold text-foreground">ผู้โหวต — {voterModal.app.name}</h3>
                <p className="text-xs text-muted mt-0.5">{voterModal.voters.length} คน</p>
              </div>
              <button onClick={() => setVoterModal(null)} className="p-3 -mr-1 text-muted hover:text-secondary transition-colors cursor-pointer" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {voterLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div aria-hidden="true" className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : voterModal.voters.length === 0 ? (
                <p className="text-center text-muted py-12 text-sm">ยังไม่มีผู้โหวต</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-hover">
                      <th className="text-left px-6 py-3 text-secondary font-medium">#</th>
                      <th className="text-left px-6 py-3 text-secondary font-medium">ชื่อ-นามสกุล</th>
                      <th className="text-left px-6 py-3 text-secondary font-medium">อีเมล</th>
                      <th className="text-left px-6 py-3 text-secondary font-medium">รหัสนิสิต</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {voterModal.voters.map((v, i) => (
                      <tr key={v._id} className="border-b border-border-subtle hover:bg-hover transition-colors">
                        <td className="px-6 py-3 text-muted">{i + 1}</td>
                        <td className="px-6 py-3 text-foreground">{v.voterName || "—"}</td>
                        <td className="px-6 py-3 text-foreground">{v.voterEmail || "—"}</td>
                        <td className="px-6 py-3 text-foreground font-mono">{v.studentId || "—"}</td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => handleDeleteVote(v._id)}
                            disabled={deletingVoterId === v._id}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {deletingVoterId === v._id ? "..." : "ลบ"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Team Image Upload ──────────────────────────────────────────── */
function TeamImageUpload({ value, onChange, prefix = "team" }: { value: string; onChange: (url: string) => void; prefix?: string }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setErrMsg("ต้องอัปโหลดน้อยกว่า 8 MB"); setStatus("error"); return; }
    setStatus("uploading"); setErrMsg("");
    try {
      const result = await upload(`${prefix}/${file.name}`, file, { access: "public", handleUploadUrl: "/api/upload" });
      onChange(result.url);
      setStatus("idle");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setErrMsg(/size|too large|exceed|limit/i.test(raw) ? "ต้องอัปโหลดน้อยกว่า 8 MB" : (raw || "อัปโหลดไม่สำเร็จ"));
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="w-24 h-24 rounded-full object-cover border-2 border-border shadow-sm" />
            <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden" disabled={status === "uploading"} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </label>
            <button type="button" onClick={() => onChange("")} aria-label="ลบรูป" className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors cursor-pointer">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <label className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed transition-colors ${status === "uploading" ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-border bg-hover hover:border-blue-400"}`}>
            {status === "uploading" ? (
              <svg aria-hidden="true" className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <svg aria-hidden="true" className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] text-muted leading-tight text-center px-1">อัปโหลด<br/>รูป</span>
              </>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden" disabled={status === "uploading"} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          </label>
        )}
      </div>
      {errMsg && <p className="text-xs text-red-500">{errMsg}</p>}
      {!errMsg && !value && <p className="text-xs text-muted">JPG / PNG / WebP · สูงสุด 8 MB</p>}
    </div>
  );
}

/* ─── Team Tab ───────────────────────────────────────────────────── */
type TeamMemberAdmin = {
  _id: string;
  name: string;
  nickname: string;
  role: string;
  bio: string;
  image: string;
  order: number;
  department: string;
  isHead: boolean;
};

const EMPTY_FORM = { name: "", nickname: "", role: "", bio: "", image: "", order: 0, department: "", isHead: false };

function TeamTab({ callerRole }: { callerRole: Role }) {
  const [members, setMembers] = useState<TeamMemberAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; member?: TeamMemberAdmin } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TeamMemberAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setMembers(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: "add" });
  };

  const openEdit = (m: TeamMemberAdmin) => {
    setForm({ name: m.name, nickname: m.nickname || "", role: m.role, bio: m.bio || "", image: m.image || "", order: m.order ?? 0, department: m.department || "", isHead: m.isHead ?? false });
    setModal({ mode: "edit", member: m });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) return;
    setSaving(true);
    try {
      const isEdit = modal?.mode === "edit";
      const url = isEdit ? `/api/admin/team/${modal!.member!._id}` : "/api/admin/team";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? "✓ อัปเดตแล้ว" : "✓ เพิ่มสมาชิกแล้ว", true);
        setModal(null);
        load();
      } else {
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/team/${confirmDelete._id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((p) => p.filter((m) => m._id !== confirmDelete._id));
        showToast(`✓ ลบ ${confirmDelete.name} แล้ว`, true);
      } else {
        const data = await res.json();
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-secondary">
          <strong className="font-semibold text-foreground">{members.length}</strong>
          <span className="ml-1.5">สมาชิก</span>
        </span>
        <button
          onClick={openAdd}
          className="px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มสมาชิก
        </button>
      </div>

      {loading ? (
        <div role="status" aria-label="กำลังโหลด..." className="flex items-center justify-center py-20">
          <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">ยังไม่มีสมาชิก</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-hover">
                  {["ลำดับ", "ชื่อ", "ตำแหน่ง", "ฝ่าย", "หัวหน้า", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-secondary font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id} className="border-b border-border-subtle hover:bg-hover transition-colors">
                    <td className="px-6 py-4 text-muted tabular-nums">{m.order}</td>
                    <td className="px-6 py-4 text-foreground font-medium">{m.name}</td>
                    <td className="px-6 py-4 text-secondary">{m.role}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-secondary">{m.department || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {m.isHead ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">หัวหน้า</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(m)} className="text-primary hover:text-primary-dark text-sm font-medium cursor-pointer transition-colors">แก้ไข</button>
                        {callerRole === "admin" && (
                          <button onClick={() => setConfirmDelete(m)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium cursor-pointer transition-colors">ลบ</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !saving) setModal(null); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
            className="w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl bg-card border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
              <div>
                <h3 id="member-modal-title" className="text-base font-semibold text-foreground">
                  {modal.mode === "add" ? "เพิ่มสมาชิกใหม่" : "แก้ไขข้อมูลสมาชิก"}
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {modal.mode === "edit" && modal.member?.name ? modal.member.name : "กรอกข้อมูลสมาชิก"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { if (!saving) setModal(null); }}
                aria-label="ปิด"
                className="p-2 rounded-lg text-muted hover:text-secondary hover:bg-hover transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Avatar */}
              <div className="flex justify-center py-1">
                <TeamImageUpload value={form.image} onChange={(url) => setForm((p) => ({ ...p, image: url }))} />
              </div>

              {/* Name + Nickname */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    ชื่อ-นามสกุล <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุล"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-[colors,shadow]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">ชื่อเล่น</label>
                  <input
                    type="text"
                    placeholder="ชื่อเล่น"
                    value={form.nickname}
                    onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-[colors,shadow]"
                  />
                </div>
              </div>

              {/* Role + Dept */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    ตำแหน่ง <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ประธาน, รองประธาน"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-[colors,shadow]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">ฝ่าย</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-[colors,shadow] appearance-none cursor-pointer dark:[color-scheme:dark]"
                  >
                    <option value="">— ไม่ระบุ —</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                <textarea
                  placeholder="แนะนำตัวสั้นๆ"
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-[colors,shadow] resize-none"
                />
              </div>

              {/* Order + isHead */}
              <div className="flex items-end justify-between gap-4 pt-1">
                <div className="w-24 shrink-0">
                  <label className="block text-sm font-medium text-foreground mb-1.5">ลำดับ</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-[colors,shadow]"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none pb-0.5">
                  <span className="text-sm font-medium text-foreground">หัวหน้าฝ่าย</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isHead}
                    onClick={() => setForm((p) => ({ ...p, isHead: !p.isHead }))}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shrink-0 ${form.isHead ? "bg-blue-600" : "bg-border"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.isHead ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle bg-background shrink-0">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.role.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {saving && (
                  <svg className="animate-spin w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {saving ? "กำลังบันทึก..." : modal.mode === "add" ? "เพิ่มสมาชิก" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDelete(null); }}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl shadow-2xl bg-card border border-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ลบสมาชิก?</h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  จะลบ <strong className="text-secondary">{confirmDelete.name}</strong> ออกจากหน้า Team ถาวร
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">
                {deleting ? "กำลังลบ..." : "ลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Projects Tab ───────────────────────────────────────────────── */
const PROJECTS = [
  {
    key: "cs101",
    label: "CS101",
    description: "ข้อมูลการลงทะเบียนและผู้เข้าร่วม",
    href: "/events/cs101",
    cardClasses: "hover:border-blue-400 dark:hover:border-blue-600",
    iconClasses: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    eyebrowClasses: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "hello-world",
    label: "Hello World",
    description: "ข้อมูลการลงทะเบียนและบ้านที่ได้รับมอบหมาย",
    href: "/events/hello-world",
    cardClasses: "hover:border-amber-400 dark:hover:border-amber-600",
    iconClasses: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    eyebrowClasses: "text-amber-600 dark:text-amber-400",
  },
] as const;

type ProjectKey = typeof PROJECTS[number]["key"];

function ProjectsTab({ callerRole }: { callerRole: Role }) {
  const [selected, setSelected] = useState<ProjectKey | null>(null);

  if (selected) {
    const project = PROJECTS.find((p) => p.key === selected)!;
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            โครงการ
          </button>
          <span className="text-muted text-sm">/</span>
          <span className="text-sm font-medium text-foreground">{project.label}</span>
          <div className="flex-1" />
          <Link
            href={project.href}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-card border border-border rounded-lg hover:bg-hover transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            ไปหน้า event
          </Link>
        </div>
        <RegistrationsTab callerRole={callerRole} fixedEvent={project.key} />
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
      {PROJECTS.map((project) => (
        <button
          key={project.key}
          onClick={() => setSelected(project.key as ProjectKey)}
          className={`text-left p-6 rounded-2xl bg-card border border-border transition-colors cursor-pointer ${project.cardClasses}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${project.iconClasses}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className={`text-xs font-mono font-semibold uppercase tracking-widest mb-1 ${project.eyebrowClasses}`}>โครงการ</p>
          <h3 className="text-lg font-bold text-foreground mb-1">{project.label}</h3>
          <p className="text-sm text-secondary">{project.description}</p>
        </button>
      ))}
    </div>
  );
}

/* ─── Club Tab ──────────────────────────────────────────────────── */
type ClubApp = {
  _id: string; name: string; surname: string; nickname: string; email: string;
  phone: string; contactChannel: string; photo: string; educationType: string;
  answers: Record<string, string>; interviewSlotId?: string; createdAt: string;
  interviewSlot?: { date: string; startTime: string; endTime: string } | null;
};

type AdminSlot = {
  _id: string; date: string; startTime: string; endTime: string;
  bookedBy?: string; bookedByEmail?: string;
};

function ClubTab({ callerRole }: { callerRole: Role }) {
  const [subView, setSubView] = useState<"apps" | "slots">("apps");
  const [apps, setApps] = useState<ClubApp[]>([]);
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [detail, setDetail] = useState<ClubApp | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ClubApp | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<"all" | "regular" | "special">("all");

  // Slot creation
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotStart, setNewSlotStart] = useState("09:00");
  const [newSlotEnd, setNewSlotEnd] = useState("09:15");
  const [newSlotInterval, setNewSlotInterval] = useState(15);
  const [newSlotBulkEnd, setNewSlotBulkEnd] = useState("17:00");
  const [creatingSingle, setCreatingSingle] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/club/applications")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setApps(d); })
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/club/slots")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setSlots(d); })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
    fetch("/api/admin/club/settings")
      .then((r) => r.json())
      .then((d) => setBookingOpen(d.clubBookingOpen ?? false))
      .catch(() => {});
  }, []);

  const handleToggleBooking = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/admin/club/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open: !bookingOpen }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingOpen(data.clubBookingOpen);
        showToast(data.clubBookingOpen ? "✓ เปิดจองแล้ว" : "✓ ปิดจองแล้ว", true);
      }
    } catch { showToast("✗ Network error", false); }
    finally { setToggling(false); }
  };

  const handleDeleteApp = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/club/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDelete._id }),
      });
      if (res.ok) {
        setApps((p) => p.filter((a) => a._id !== confirmDelete._id));
        showToast(`✓ ลบ ${confirmDelete.name} แล้ว`, true);
      } else {
        const data = await res.json();
        showToast(`✗ ${data.error}`, false);
      }
    } catch { showToast("✗ Network error", false); }
    finally { setDeleting(false); setConfirmDelete(null); }
  };

  const handleCreateSlots = async (bulk: boolean) => {
    if (!newSlotDate) { showToast("✗ กรุณาเลือกวัน", false); return; }
    setCreatingSingle(true);
    const slotsToCreate: { startTime: string; endTime: string }[] = [];
    if (bulk) {
      let [h, m] = newSlotStart.split(":").map(Number);
      const [eh, em] = newSlotBulkEnd.split(":").map(Number);
      while (h * 60 + m + newSlotInterval <= eh * 60 + em) {
        const start = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        m += newSlotInterval;
        if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
        const end = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        slotsToCreate.push({ startTime: start, endTime: end });
      }
    } else {
      slotsToCreate.push({ startTime: newSlotStart, endTime: newSlotEnd });
    }
    if (slotsToCreate.length === 0) { showToast("✗ ไม่มี slot ที่สร้างได้", false); setCreatingSingle(false); return; }
    try {
      const res = await fetch("/api/admin/club/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newSlotDate, slots: slotsToCreate }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ ${data.message}`, true);
        const r2 = await fetch("/api/admin/club/slots");
        const d2 = await r2.json();
        if (Array.isArray(d2)) setSlots(d2);
      } else { showToast(`✗ ${data.error}`, false); }
    } catch { showToast("✗ Network error", false); }
    finally { setCreatingSingle(false); }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const res = await fetch("/api/admin/club/slots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSlots((p) => p.filter((s) => s._id !== id));
        showToast("✓ ลบ slot แล้ว", true);
      }
    } catch { showToast("✗ Network error", false); }
  };

  const handleExportExcel = async () => {
    const filtered = sectionFilter === "all" ? apps : apps.filter((a) => a.educationType === sectionFilter);
    if (filtered.length === 0) return;
    const { default: ExcelJS } = await import("exceljs");
    const answerKeys = Array.from(new Set(filtered.flatMap((a) => Object.keys(a.answers ?? {}))));
    const headers = ["ชื่อ", "นามสกุล", "ชื่อเล่น", "อีเมล", "เบอร์โทร", "ช่องทางติดต่อ", "ภาค", "รอบสัมภาษณ์", "วันที่สมัคร", ...answerKeys];
    const rows = filtered.map((a) => [
      a.name, a.surname, a.nickname, a.email, a.phone, a.contactChannel,
      a.educationType === "regular" ? "ปกติ" : "พิเศษ",
      a.interviewSlot ? `${a.interviewSlot.date} ${a.interviewSlot.startTime}-${a.interviewSlot.endTime}` : "-",
      new Date(a.createdAt).toLocaleDateString("th-TH"),
      ...answerKeys.map((k) => a.answers?.[k] ?? "-"),
    ]);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Club Applications");
    sheet.addRow(headers).font = { bold: true };
    sheet.addRows(rows);
    sheet.columns.forEach((col, i) => {
      const widest = Math.max(headers[i].length, ...rows.map((r) => String(r[i] ?? "").length));
      col.width = Math.min(Math.max(widest + 2, 12), 60);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `club-applications-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredApps = sectionFilter === "all" ? apps : apps.filter((a) => a.educationType === sectionFilter);
  const stats = { total: apps.length, regular: apps.filter((a) => a.educationType === "regular").length, special: apps.filter((a) => a.educationType === "special").length };

  // Group slots by date for display
  const slotsByDate = new Map<string, AdminSlot[]>();
  for (const s of slots) {
    if (!slotsByDate.has(s.date)) slotsByDate.set(s.date, []);
    slotsByDate.get(s.date)!.push(s);
  }

  return (
    <>
      {toast && <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}

      {/* Sub-view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          <button onClick={() => setSubView("apps")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${subView === "apps" ? "bg-blue-600 text-white shadow-sm" : "text-secondary hover:text-foreground"}`}>ใบสมัคร ({stats.total})</button>
          <button onClick={() => setSubView("slots")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${subView === "slots" ? "bg-blue-600 text-white shadow-sm" : "text-secondary hover:text-foreground"}`}>รอบสัมภาษณ์ ({slots.length})</button>
        </div>
        {callerRole === "admin" && (
          <button onClick={handleToggleBooking} disabled={toggling}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2 ${bookingOpen ? "bg-green-600 text-white hover:bg-green-700" : "bg-card text-secondary border border-border hover:bg-hover"}`}>
            <span className={`w-2 h-2 rounded-full ${bookingOpen ? "bg-white" : "bg-muted"}`} aria-hidden="true" />
            {toggling ? "..." : bookingOpen ? "จองเปิดอยู่" : "เปิดจอง"}
          </button>
        )}
      </div>

      {/* Applications sub-view */}
      {subView === "apps" && (
        <>
          <div className="flex flex-wrap gap-2 items-center mb-6">
            {([ { key: "all" as const, label: `ทั้งหมด (${stats.total})` }, { key: "regular" as const, label: `ภาคปกติ (${stats.regular})` }, { key: "special" as const, label: `ภาคพิเศษ (${stats.special})` } ]).map(({ key, label }) => (
              <button key={key} onClick={() => setSectionFilter(key)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${sectionFilter === key ? "bg-blue-600 text-white shadow-sm" : "bg-card text-secondary border border-border hover:bg-hover"}`}>{label}</button>
            ))}
            <button onClick={handleExportExcel} disabled={filteredApps.length === 0}
              className="px-4 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export Excel
            </button>
          </div>

          {loadingApps ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center"><p className="text-muted">ยังไม่มีใบสมัคร</p></div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-hover">
                      {["ชื่อ", "นามสกุล", "ชื่อเล่น", "อีเมล", "ภาค", "รอบสัมภาษณ์", "Actions"].map((h) => (
                        <th key={h} className="text-left px-6 py-4 text-secondary font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((a) => (
                      <tr key={a._id} className="border-b border-border-subtle hover:bg-hover transition-colors">
                        <td className="px-6 py-4 text-foreground font-medium">{a.name}</td>
                        <td className="px-6 py-4 text-secondary">{a.surname}</td>
                        <td className="px-6 py-4 text-secondary">{a.nickname}</td>
                        <td className="px-6 py-4 text-secondary">{a.email}</td>
                        <td className="px-6 py-4 text-secondary">{a.educationType === "regular" ? "ปกติ" : "พิเศษ"}</td>
                        <td className="px-6 py-4 text-secondary">
                          {a.interviewSlot ? `${a.interviewSlot.date} ${a.interviewSlot.startTime}` : <span className="text-muted">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setDetail(a)} className="text-primary hover:text-primary-dark text-sm font-medium cursor-pointer">View</button>
                            {callerRole === "admin" && (
                              <button onClick={() => setConfirmDelete(a)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium cursor-pointer">ลบ</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Slots sub-view */}
      {subView === "slots" && (
        <>
          {callerRole === "admin" && (() => {
            const previewSlots: string[] = [];
            if (newSlotDate && newSlotStart && newSlotBulkEnd && newSlotInterval > 0) {
              let [h, m] = newSlotStart.split(":").map(Number);
              const [eh, em] = newSlotBulkEnd.split(":").map(Number);
              while (h * 60 + m + newSlotInterval <= eh * 60 + em) {
                const s = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                m += newSlotInterval;
                if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
                const e = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                previewSlots.push(`${s}-${e}`);
              }
            }
            return (
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-foreground mb-4">สร้าง Slot สัมภาษณ์</h3>

              {/* Row 1: Date + Time range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">วันที่</label>
                  <input type="date" value={newSlotDate} onChange={(e) => setNewSlotDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">เวลาเริ่ม</label>
                  <input type="time" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">เวลาจบ</label>
                  <input type="time" value={newSlotBulkEnd} onChange={(e) => setNewSlotBulkEnd(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                </div>
              </div>

              {/* Row 2: Interval presets */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-secondary mb-2">รอบละกี่นาที</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 15, 20, 30].map((mins) => (
                    <button key={mins} type="button" onClick={() => setNewSlotInterval(mins)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${newSlotInterval === mins ? "bg-blue-600 text-white shadow-sm" : "bg-hover text-secondary border border-border hover:bg-card"}`}>
                      {mins} นาที
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {previewSlots.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                    จะสร้าง {previewSlots.length} slot ({newSlotDate})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewSlots.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-300 font-mono">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => handleCreateSlots(true)} disabled={creatingSingle || previewSlots.length === 0}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors cursor-pointer">
                {creatingSingle ? "กำลังสร้าง..." : `สร้าง ${previewSlots.length} Slot`}
              </button>
            </div>
            );
          })()}

          {loadingSlots ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : slots.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center"><p className="text-muted">ยังไม่มี slot</p></div>
          ) : (
            <div className="space-y-6">
              {Array.from(slotsByDate.entries()).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="text-sm font-bold text-foreground mb-3">{date}</h3>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-subtle bg-hover">
                            {["เวลา", "สถานะ", "ผู้จอง", "อีเมล", ...(callerRole === "admin" ? [""] : [])].map((h, i) => (
                              <th key={`${h}-${i}`} className="text-left px-5 py-3 text-secondary font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dateSlots.map((s) => (
                            <tr key={s._id} className="border-b border-border-subtle hover:bg-hover transition-colors">
                              <td className="px-5 py-3 text-foreground font-medium">{s.startTime} - {s.endTime}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.bookedBy ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800" : "bg-hover text-muted border border-border"}`}>
                                  {s.bookedBy ? "จองแล้ว" : "ว่าง"}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-secondary">{s.bookedByEmail ? s.bookedByEmail.split("@")[0] : "—"}</td>
                              <td className="px-5 py-3 text-secondary">{s.bookedByEmail || "—"}</td>
                              {callerRole === "admin" && (
                                <td className="px-5 py-3">
                                  <button onClick={() => handleDeleteSlot(s._id)} className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer">ลบ</button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div role="dialog" aria-modal="true" className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-card border border-border">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-semibold text-foreground">{detail.name} {detail.surname}</h3>
                <p className="text-xs text-muted mt-0.5">{detail.email}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-3 -mr-1 text-muted hover:text-secondary transition-colors cursor-pointer" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {detail.photo && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={detail.photo} alt={detail.name} className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                </div>
              )}
              {([
                ["ชื่อเล่น", detail.nickname],
                ["เบอร์โทร", detail.phone],
                ["ช่องทางติดต่อ", detail.contactChannel],
                ["ภาค", detail.educationType === "regular" ? "ปกติ" : "พิเศษ"],
                ["รอบสัมภาษณ์", detail.interviewSlot ? `${detail.interviewSlot.date} ${detail.interviewSlot.startTime}-${detail.interviewSlot.endTime}` : "ยังไม่ได้จอง"],
                ["วันที่สมัคร", new Date(detail.createdAt).toLocaleString("th-TH")],
                ...Object.entries(detail.answers ?? {}).map(([k, v]) => [k, v || "—"]),
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-hover px-4 py-3">
                  <p className="text-xs font-medium text-muted mb-1">{k}</p>
                  <p className="text-sm text-secondary whitespace-pre-wrap break-words">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDelete(null); }}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl shadow-2xl bg-card border border-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ลบใบสมัครของ {confirmDelete.name}?</h3>
                <p className="mt-1 text-sm text-secondary">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">ยกเลิก</button>
              <button onClick={handleDeleteApp} disabled={deleting} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">{deleting ? "กำลังลบ..." : "ลบ"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
type Tab = "projects" | "candidates" | "team" | "users" | "club";

export default function AdminPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const [tab, setTab] = useState<Tab>("projects");
  const [seenTabs, setSeenTabs] = useState<Set<Tab>>(new Set<Tab>(["projects"]));
  const [role, setRole] = useState<string | null>(null);
  const [callerEmail, setCallerEmail] = useState("");

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.role !== "admin" && d.role !== "staff") { router.push("/"); return; }
        setRole(d.role);
        if (d.email) setCallerEmail(d.email);
      })
      .catch(() => router.push("/"));
  }, [router]);

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div role="status" aria-label="กำลังโหลด...">
          <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-secondary text-sm mt-1">
              {role === "admin" ? "Manage registrations, houses, and user roles" : "View registrations and user list (read-only)"}
            </p>
          </div>
          {/* Dark mode toggle */}
          <button onClick={toggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={dark}
            className="p-2 rounded-lg border border-border bg-card text-secondary hover:bg-hover transition-colors cursor-pointer self-end sm:self-auto">
            {dark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Dashboard sections" className="flex flex-wrap gap-1 mb-8 bg-card border border-border rounded-xl p-1 w-fit">
          {([
            { id: "projects" as Tab,   label: "โครงการ",       icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { id: "candidates" as Tab, label: "สมัครประธาน",   icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
            { id: "team" as Tab,       label: "ชุมนุมนิสิต",   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
            { id: "users" as Tab,      label: "Users",          icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
            { id: "club" as Tab,       label: "สมัครชุมนุม",    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
          ]).map(({ id, label, icon }) => (
            <button key={id} id={`tab-${id}`} onClick={() => { setTab(id); setSeenTabs((p) => new Set([...p, id])); }}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${tab === id ? "bg-blue-600 text-white shadow-sm" : "text-secondary hover:text-foreground"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content — lazy: only mount a panel after it has been visited */}
        <div role="tabpanel" id="panel-projects" aria-labelledby="tab-projects" hidden={tab !== "projects"}>
          {seenTabs.has("projects") && <ProjectsTab callerRole={(role as Role) ?? "staff"} />}
        </div>
        <div role="tabpanel" id="panel-candidates" aria-labelledby="tab-candidates" hidden={tab !== "candidates"}>
          {seenTabs.has("candidates") && <CandidatesTab callerRole={(role as Role) ?? "staff"} />}
        </div>
        <div role="tabpanel" id="panel-team" aria-labelledby="tab-team" hidden={tab !== "team"}>
          {seenTabs.has("team") && <TeamTab callerRole={(role as Role) ?? "staff"} />}
        </div>
        <div role="tabpanel" id="panel-users" aria-labelledby="tab-users" hidden={tab !== "users"}>
          {seenTabs.has("users") && <UsersTab callerEmail={callerEmail} callerRole={(role as Role) ?? "staff"} />}
        </div>
        <div role="tabpanel" id="panel-club" aria-labelledby="tab-club" hidden={tab !== "club"}>
          {seenTabs.has("club") && <ClubTab callerRole={(role as Role) ?? "staff"} />}
        </div>

      </div>
    </div>
  );
}
