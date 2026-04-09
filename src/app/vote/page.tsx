"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

interface Candidate {
  _id: string; name: string; role: string; image: string; bio: string; voteCount: number;
}

const fallbackCandidates: Candidate[] = [
  { _id: "c1", name: "Alice Johnson", role: "President Candidate", image: "", bio: "Passionate about making CS accessible to everyone.", voteCount: 0 },
  { _id: "c2", name: "David Kim", role: "President Candidate", image: "", bio: "Focused on industry partnerships and internship opportunities.", voteCount: 0 },
  { _id: "c3", name: "Sara Martinez", role: "President Candidate", image: "", bio: "Believes in community-first leadership and inclusive events.", voteCount: 0 },
];

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/votes").then((r) => r.json()).then((data) => {
      setCandidates(data.candidates?.length > 0 ? data.candidates : fallbackCandidates);
      setHasVoted(data.hasVoted || false);
    }).catch(() => setCandidates(fallbackCandidates)).finally(() => setLoading(false));
  }, []);

  const handleVote = async (candidateId: string) => {
    setVoting(candidateId); setError("");
    try {
      const res = await fetch("/api/votes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to vote");
      setHasVoted(true); setSuccess("Your vote has been recorded!");
      setCandidates((prev) => prev.map((c) => c._id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c));
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setVoting(null); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-3">election</p>
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Vote for President</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Choose the next CSKU president. Each member gets one vote.</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center max-w-md mx-auto">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm text-center max-w-md mx-auto animate-scale-in">✓ {success}</div>}
        <div className="grid md:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <div key={c._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : c.name.charAt(0)}
              </div>
              <div className="text-center flex-1">
                <h3 className="text-slate-800 font-semibold text-lg">{c.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{c.role}</p>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">{c.bio}</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="text-center"><span className="text-2xl font-bold text-slate-800">{c.voteCount}</span><span className="text-slate-400 text-sm ml-1">votes</span></div>
                <Button variant={hasVoted ? "ghost" : "primary"} size="md" className="w-full" disabled={hasVoted} loading={voting === c._id} onClick={() => handleVote(c._id)}>
                  {hasVoted ? "Voted" : "Vote"}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {hasVoted && <p className="text-center text-slate-400 text-sm mt-8">Thank you for voting! Results will be announced at the next meeting.</p>}
      </div>
    </div>
  );
}
