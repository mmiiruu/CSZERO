"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Registration = {
  _id: string; event: string; name: string; email: string; house?: string;
  answers: Record<string, string>; createdAt: string;
};

const houseOptions = ["spade", "heart", "diamond", "club"];

function ResponseModal({ reg, onClose }: { reg: Registration; onClose: () => void }) {
  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {/* Modal header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{reg.name}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{reg.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mt-0.5 cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Form Responses
          </h4>
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

export default function AdminPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [modalReg, setModalReg] = useState<Registration | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [dark, setDark] = useState(false);

  // Persist dark mode
  useEffect(() => {
    const saved = localStorage.getItem("admin-dark");
    if (saved === "true") setDark(true);
  }, []);
  const toggleDark = () => {
    setDark((d) => {
      localStorage.setItem("admin-dark", String(!d));
      return !d;
    });
  };

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.role !== "admin") { router.push("/"); return; }
        setRole(d.role);
      })
      .catch(() => router.push("/"));

    fetch("/api/registrations")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRegistrations(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleSeedCandidates = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/admin/seed-candidates", { method: "POST" });
      const data = await res.json();
      setSeedMsg(res.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
    } catch {
      setSeedMsg("✗ Failed to seed candidates");
    } finally {
      setSeeding(false);
    }
  };

  const handleHouseChange = async (regId: string, house: string) => {
    try {
      const res = await fetch("/api/admin/assign-house", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId, house }),
      });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === regId ? { ...r, house } : r))
        );
      }
    } catch {}
  };

  const filtered = filter === "all" ? registrations : registrations.filter((r) => r.event === filter);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    // Collect all unique answer keys across filtered registrations
    const answerKeys = Array.from(
      new Set(filtered.flatMap((r) => (r.answers ? Object.keys(r.answers) : [])))
    );
    const headers = ["Name", "Email", "Event", "House", "Date", ...answerKeys];

    const escape = (val: string) => {
      const s = String(val ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const rows = filtered.map((reg) => [
      reg.name,
      reg.email,
      reg.event === "cs101" ? "CS101" : "Hello World",
      reg.house || "",
      new Date(reg.createdAt).toLocaleDateString(),
      ...answerKeys.map((k) => reg.answers?.[k] ?? ""),
    ]);

    const csv = "\uFEFF" + [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage registrations and house assignments</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {dark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Event filters */}
              {["all", "cs101", "hello-world"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {f === "all" ? "All" : f === "cs101" ? "CS101" : "Hello World"}
                </button>
              ))}

              <button
                onClick={handleExportCSV}
                disabled={filtered.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={handleSeedCandidates}
                disabled={seeding}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-all cursor-pointer"
              >
                {seeding ? "Seeding…" : "Seed Candidates"}
              </button>
            </div>
          </div>

          {seedMsg && (
            <div className={`mb-6 p-3 rounded-xl text-sm border ${
              seedMsg.startsWith("✓")
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
            }`}>
              {seedMsg}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-sm text-slate-400 dark:text-slate-500">Total Registrations</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{registrations.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-sm text-slate-400 dark:text-slate-500">CS101</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{registrations.filter((r) => r.event === "cs101").length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-sm text-slate-400 dark:text-slate-500">Hello World</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{registrations.filter((r) => r.event === "hello-world").length}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
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
                      <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">Name</th>
                      <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                      <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">Event</th>
                      <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">House</th>
                      <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">Date</th>
                      <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((reg) => (
                      <tr key={reg._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">{reg.name}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{reg.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            reg.event === "cs101"
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          }`}>
                            {reg.event === "cs101" ? "CS101" : "Hello World"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {reg.event === "hello-world" ? (
                            <select
                              value={reg.house || ""}
                              onChange={(e) => handleHouseChange(reg._id, e.target.value)}
                              className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            >
                              <option value="">Unassigned</option>
                              {houseOptions.map((h) => (
                                <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 dark:text-slate-500 text-xs">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setModalReg(reg)}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium cursor-pointer transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response modal */}
      {modalReg && (
        <ResponseModal reg={modalReg} onClose={() => setModalReg(null)} />
      )}
    </div>
  );
}
