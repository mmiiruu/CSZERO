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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  useEffect(() => {
    // Check if user is admin
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.role !== "admin") { router.push("/"); return; }
        setRole(d.role);
      })
      .catch(() => router.push("/"));

    // Fetch registrations
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage registrations and house assignments</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {["all", "cs101", "hello-world"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
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
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}>
            {seedMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-sm text-slate-400">Total Registrations</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{registrations.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-sm text-slate-400">CS101</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{registrations.filter((r) => r.event === "cs101").length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-sm text-slate-400">Hello World</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{registrations.filter((r) => r.event === "hello-world").length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-400">No registrations found.</p>
          </div>
        ) : (
          /* Table */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-4 text-slate-500 font-medium">Name</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-medium">Email</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-medium">Event</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-medium">House</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-medium">Date</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg) => (
                    <React.Fragment key={reg._id}>
                      <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-800 font-medium">{reg.name}</td>
                        <td className="px-6 py-4 text-slate-500">{reg.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            reg.event === "cs101"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}>
                            {reg.event === "cs101" ? "CS101" : "Hello World"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {reg.event === "hello-world" ? (
                            <select
                              value={reg.house || ""}
                              onChange={(e) => handleHouseChange(reg._id, e.target.value)}
                              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            >
                              <option value="">Unassigned</option>
                              {houseOptions.map((h) => (
                                <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedId(expandedId === reg._id ? null : reg._id)}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium cursor-pointer"
                          >
                            {expandedId === reg._id ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {expandedId === reg._id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 bg-slate-50">
                            <div className="max-w-2xl">
                              <h4 className="text-sm font-semibold text-slate-700 mb-3">Form Responses</h4>
                              {reg.answers && Object.keys(reg.answers).length > 0 ? (
                                <div className="space-y-2">
                                  {Object.entries(reg.answers).map(([key, value]) => (
                                    <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                      <span className="text-xs text-slate-400 min-w-[150px] font-medium">{key}</span>
                                      <span className="text-sm text-slate-600">{value || "—"}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 text-sm">No answers recorded.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
