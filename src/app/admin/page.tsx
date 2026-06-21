"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { DEPARTMENTS } from "@/config/team";
import { upload } from "@vercel/blob/client";
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

  const isSelf = (u: ManagedUser) => u.email === callerEmail;

  const roleOrder: Record<Role, number> = { admin: 0, staff: 1, user: 2 };

  const sortedUsers = useMemo(() =>
    [...users].sort((a, b) => {
      const roleDiff = roleOrder[a.role] - roleOrder[b.role];
      if (roleDiff !== 0) return roleDiff;
      return (a.name ?? a.email).localeCompare(b.name ?? b.email, "th");
    }),
  [users]); // eslint-disable-line react-hooks/exhaustive-deps

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
                    {["User","Email","Role","Joined", callerRole === "admin" ? "Change Role" : "Access"].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-secondary font-medium">{h}</th>
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
              </li>
            ))}
          </ul>
        </>
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
  // Legacy
  studentId?: string;
  year?: string;
  role?: string;
  bio?: string;
  motivation?: string;
  promoted: boolean;
  promotedCandidateId?: string;
  createdAt: string;
};

function CandidatesTab({ callerRole }: { callerRole: Role }) {
  const [apps, setApps] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [detail, setDetail] = useState<CandidateApplication | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
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

  const handlePromote = async (id: string) => {
    setWorking(id);
    try {
      const res = await fetch(`/api/admin/candidate-applications/${id}/promote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApps((p) => p.map((a) => a._id === id ? { ...a, promoted: true, promotedCandidateId: data.candidateId } : a));
        showToast("✓ เพิ่มเข้าระบบโหวตแล้ว", true);
      } else {
        showToast(`✗ ${data.error}`, false);
      }
    } catch {
      showToast("✗ Network error", false);
    } finally {
      setWorking(null);
    }
  };

  const handleClearVotes = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/admin/vote-data", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ ลบแล้ว: ผู้สมัคร ${data.candidatesDeleted}, คะแนน ${data.votesDeleted}`, true);
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

  const stats = useMemo(() => ({
    total: apps.length,
    promoted: apps.filter((a) => a.promoted).length,
    pending: apps.filter((a) => !a.promoted).length,
  }), [apps]);

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Summary strip + Danger button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>
            <strong className="font-semibold text-foreground">{stats.total}</strong>
            <span className="ml-1.5 text-muted">applications</span>
          </span>
          <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
          <span>
            <strong className="font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</strong>
            <span className="ml-1.5 text-muted">pending</span>
          </span>
          <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
          <span>
            <strong className="font-semibold text-green-600 dark:text-green-400">{stats.promoted}</strong>
            <span className="ml-1.5 text-muted">promoted</span>
          </span>
        </div>
        {callerRole === "admin" && (
          <button
            onClick={() => setConfirmClear(true)}
            className="px-4 py-3 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            Clear all candidates & votes
          </button>
        )}
      </div>

      {loading ? (
        <div role="status" aria-label="กำลังโหลด..." className="flex items-center justify-center py-20">
          <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">No applications yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-hover">
                  {["ชื่อ","อีเมล","ชื่อเล่น","สถานะ","Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-secondary font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a._id} className="border-b border-border-subtle hover:bg-hover transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">{a.name}</td>
                    <td className="px-6 py-4 text-secondary">{a.email}</td>
                    <td className="px-6 py-4 text-secondary">{a.nickname || a.role || "—"}</td>
                    <td className="px-6 py-4">
                      {a.promoted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Promoted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setDetail(a)} className="text-primary hover:text-primary-dark text-sm font-medium cursor-pointer">View</button>
                        {callerRole === "admin" && !a.promoted && (
                          <button
                            onClick={() => handlePromote(a._id)}
                            disabled={working === a._id}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition-colors"
                          >
                            {working === a._id ? "..." : "Add to Vote"}
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

      {/* Clear confirmation modal */}
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
                <h3 className="font-semibold text-foreground">Clear all candidates & votes?</h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  This deletes every Candidate and Vote document, resets user vote flags, and unmarks promoted applications so they can be re-promoted. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmClear(false)} disabled={clearing} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleClearVotes} disabled={clearing} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer">
                {clearing ? "Clearing..." : "Yes, clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Team Image Upload ──────────────────────────────────────────── */
function TeamImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setErrMsg("ต้องอัปโหลดน้อยกว่า 8 MB"); setStatus("error"); return; }
    setStatus("uploading"); setErrMsg("");
    try {
      const result = await upload(`team/${file.name}`, file, { access: "public", handleUploadUrl: "/api/upload" });
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

function TeamTab() {
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
                        <button onClick={() => setConfirmDelete(m)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium cursor-pointer transition-colors">ลบ</button>
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

/* ─── PAGE ───────────────────────────────────────────────────────── */
type Tab = "projects" | "candidates" | "team" | "users";

export default function AdminPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const [tab, setTab] = useState<Tab>("projects");
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
          ]).map(({ id, label, icon }) => (
            <button key={id} id={`tab-${id}`} onClick={() => setTab(id)}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${tab === id ? "bg-blue-600 text-white shadow-sm" : "text-secondary hover:text-foreground"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel" id="panel-projects" aria-labelledby="tab-projects" hidden={tab !== "projects"}>
          <ProjectsTab callerRole={(role as Role) ?? "staff"} />
        </div>
        <div role="tabpanel" id="panel-candidates" aria-labelledby="tab-candidates" hidden={tab !== "candidates"}>
          <CandidatesTab callerRole={(role as Role) ?? "staff"} />
        </div>
        <div role="tabpanel" id="panel-team" aria-labelledby="tab-team" hidden={tab !== "team"}>
          <TeamTab />
        </div>
        <div role="tabpanel" id="panel-users" aria-labelledby="tab-users" hidden={tab !== "users"}>
          <UsersTab callerEmail={callerEmail} callerRole={(role as Role) ?? "staff"} />
        </div>

      </div>
    </div>
  );
}
