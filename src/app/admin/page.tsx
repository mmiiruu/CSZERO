"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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
const houseOptions = ["spade", "heart", "diamond", "club"];

/* ─── Role badge ─────────────────────────────────────────────────── */
const roleBadge: Record<Role, string> = {
  admin: "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800",
  staff: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  user:  "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600",
};

/* ─── Response Modal ─────────────────────────────────────────────── */
function ResponseModal({ reg, onClose }: { reg: Registration; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{reg.name}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{reg.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Form Responses</h4>
          {reg.answers && Object.keys(reg.answers).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(reg.answers).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">{key}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{value || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-sm">No answers recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Registrations Tab ──────────────────────────────────────────── */
function RegistrationsTab({ dark }: { dark: boolean }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [modalReg, setModalReg] = useState<Registration | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

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

  const filtered = filter === "all" ? registrations : registrations.filter((r) => r.event === filter);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const answerKeys = Array.from(new Set(filtered.flatMap((r) => Object.keys(r.answers ?? {}))));
    const headers = ["Name", "Email", "Event", "House", "Date", ...answerKeys];
    const escape = (v: string) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s; };
    const rows = filtered.map((r) => [r.name, r.email, r.event === "cs101" ? "CS101" : "Hello World", r.house || "", new Date(r.createdAt).toLocaleDateString(), ...answerKeys.map((k) => r.answers?.[k] ?? "")]);
    const csv = "\uFEFF" + [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `registrations-${filter}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center mb-6">
        {["all", "cs101", "hello-world"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${filter === f ? "bg-blue-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
            {f === "all" ? "All" : f === "cs101" ? "CS101" : "Hello World"}
          </button>
        ))}
        <button onClick={handleExportCSV} disabled={filtered.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export CSV
        </button>
        <button onClick={handleSeedCandidates} disabled={seeding}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-all cursor-pointer">
          {seeding ? "Seeding…" : "Seed Candidates"}
        </button>
      </div>

      {seedMsg && (
        <div className={`mb-6 p-3 rounded-xl text-sm border ${seedMsg.startsWith("✓") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"}`}>
          {seedMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Registrations", value: registrations.length, color: "text-slate-800 dark:text-slate-100" },
          { label: "CS101", value: registrations.filter((r) => r.event === "cs101").length, color: "text-blue-600" },
          { label: "Hello World", value: registrations.filter((r) => r.event === "hello-world").length, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <p className="text-sm text-slate-400 dark:text-slate-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-slate-400 dark:text-slate-500">No registrations found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  {["Name","Email","Event","House","Date","Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg) => (
                  <tr key={reg._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">{reg.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{reg.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${reg.event === "cs101" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"}`}>
                        {reg.event === "cs101" ? "CS101" : "Hello World"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reg.event === "hello-world" ? (
                        <select value={reg.house || ""} onChange={(e) => handleHouseChange(reg._id, e.target.value)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500">
                          <option value="">Unassigned</option>
                          {houseOptions.map((h) => <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
                        </select>
                      ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500 text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setModalReg(reg)} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium cursor-pointer transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalReg && <ResponseModal reg={modalReg} onClose={() => setModalReg(null)} />}
    </>
  );
}

/* ─── Users Tab ──────────────────────────────────────────────────── */
function UsersTab({ callerEmail }: { callerEmail: string }) {
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

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all animate-slide-up ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {([
          { label: "Total Users",  value: users.length,                                    color: "text-slate-800 dark:text-slate-100" },
          { label: "Staff",        value: users.filter((u) => u.role === "staff").length,   color: "text-amber-600" },
          { label: "Admins",       value: users.filter((u) => u.role === "admin").length,   color: "text-pink-600" },
        ] as const).map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <p className="text-sm text-slate-400 dark:text-slate-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  {["User","Email","Role","Joined","Change Role"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={`border-b border-slate-50 dark:border-slate-700/50 transition-colors ${isSelf(u) ? "bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}>
                    {/* Avatar + name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img src={u.image} alt={u.name || u.email} referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">{(u.name || u.email).charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[140px]">{u.name || "—"}</p>
                          {isSelf(u) && <p className="text-xs text-blue-500 dark:text-blue-400">(you)</p>}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-[180px]">
                      <span className="truncate block">{u.email}</span>
                    </td>

                    {/* Current role badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge[u.role]}`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>

                    {/* Joined date */}
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Role dropdown */}
                    <td className="px-6 py-4">
                      {isSelf(u) ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">Cannot edit own role</span>
                      ) : (
                        <div className="relative inline-flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={updating === u._id}
                            onChange={(e) => handleRoleChange(u._id, e.target.value as Role)}
                            className="pl-3 pr-8 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-60 cursor-pointer appearance-none"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                          </select>
                          {/* Custom chevron */}
                          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                          {updating === u._id && (
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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
      )}
    </>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
type Tab = "registrations" | "users";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("registrations");
  const [role, setRole] = useState<string | null>(null);
  const [callerEmail, setCallerEmail] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-dark");
    if (saved === "true") setDark(true);
  }, []);

  const toggleDark = () => setDark((d) => {
    localStorage.setItem("admin-dark", String(!d));
    return !d;
  });

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.role !== "admin") { router.push("/"); return; }
        setRole(d.role);
      })
      .catch(() => router.push("/"));

    // Also grab current user email for the self-edit guard in UsersTab
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.user?.email) setCallerEmail(d.user.email); })
      .catch(() => {});
  }, [router]);

  if (role === null) {
    return (
      <div className={dark ? "dark" : ""}>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage registrations, houses, and user roles</p>
            </div>
            {/* Dark mode toggle */}
            <button onClick={toggleDark}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer self-end sm:self-auto"
              aria-label="Toggle dark mode">
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 w-fit">
            {([
              { id: "registrations" as Tab, label: "Registrations", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { id: "users" as Tab,         label: "Users",         icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
            ]).map(({ id, label, icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "registrations" ? (
            <RegistrationsTab dark={dark} />
          ) : (
            <UsersTab callerEmail={callerEmail} />
          )}

        </div>
      </div>
    </div>
  );
}
