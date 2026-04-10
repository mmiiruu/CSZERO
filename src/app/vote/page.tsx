"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";

interface Candidate {
  _id: string; name: string; role: string; image: string; bio: string; voteCount: number;
}

export default function VotePage() {
  const { data: session, status } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/votes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.candidates)) setCandidates(data.candidates);
        setHasVoted(data.hasVoted || false);
      })
      .catch(() => setError("Failed to load candidates. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (candidateId: string) => {
    if (!session?.user) {
      setError("You must be signed in to vote.");
      return;
    }
    setVoting(candidateId);
    setError("");
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to vote");
      setHasVoted(true);
      setSuccess("Your vote has been recorded!");
      setCandidates((prev) =>
        prev.map((c) =>
          c._id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setVoting(null);
    }
  };

  if (loading || status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  // Client-side auth gate — layout already redirects server-side, this covers
  // edge cases where the session hasn't resolved yet.
  if (status === "unauthenticated") return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Sign in to vote</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">You need to be logged in to cast your vote.</p>
        <Link href="/auth/signin?callbackUrl=/vote" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
          Sign In
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">election</p>
          <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-4">Vote for President</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Choose the next CSKU president. Each member gets one vote.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center max-w-md mx-auto">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm text-center max-w-md mx-auto animate-scale-in">
            ✓ {success}
          </div>
        )}

        {candidates.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">No candidates available yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {candidates.map((c) => (
              <div key={c._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 flex flex-col">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : c.name.charAt(0)}
                </div>
                <div className="text-center flex-1">
                  <h3 className="text-slate-800 dark:text-white font-semibold text-lg">{c.name}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{c.role}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">{c.bio}</p>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{c.voteCount}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm ml-1">votes</span>
                  </div>
                  <Button
                    variant={hasVoted ? "ghost" : "primary"}
                    size="md"
                    className="w-full"
                    disabled={hasVoted}
                    loading={voting === c._id}
                    onClick={() => handleVote(c._id)}
                  >
                    {hasVoted ? "Voted" : "Vote"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasVoted && (
          <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-8">
            Thank you for voting! Results will be announced at the next meeting.
          </p>
        )}
      </div>
    </div>
  );
}
