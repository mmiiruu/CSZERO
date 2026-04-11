"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Registration = {
  _id: string; event: string; name: string; email: string; house?: string;
  answers: Record<string, string>; createdAt: string;
};

const houseOptions = ["spade", "heart", "diamond", "club"];

export default function AdminPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

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

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage registrations and house assignments</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
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
              ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
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
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
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
                    <tr key={reg._id} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">{reg.name}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{reg.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          reg.event === "cs101"
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                            : "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
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
                          onClick={() => setSelectedReg(reg)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
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

      {/* Response Modal */}
      {selectedReg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]"
          onClick={() => setSelectedReg(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] animate-[scale-in_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{selectedReg.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedReg.email}</p>
                <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedReg.event === "cs101"
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                }`}>
                  {selectedReg.event === "cs101" ? "CS101" : "Hello World"}
                </span>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="ml-4 mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal Body — Scrollable */}
            <div className="overflow-y-auto flex-1 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Form Responses</p>
              {selectedReg.answers && Object.keys(selectedReg.answers).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(selectedReg.answers).map(([key, value]) => (
                    <div key={key} className="pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">{key}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-sm">No answers recorded.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setSelectedReg(null)}
                className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
