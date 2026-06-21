"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import { voteConfig } from "@/config/vote";
import { getMemberColor } from "@/config/team";

interface Candidate {
  _id: string;
  name: string;
  nickname: string;
  image: string;
  motto: string;
  section: string;
  voteCount: number;
}

export default function VotePage() {
  const { data: session, status } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedSection, setSelectedSection] = useState<"ปกติ" | "พิเศษ" | null>(null);

  useEffect(() => {
    fetch("/api/votes")
      .then((r) => r.json())
      .then((data) => {
        setVotingOpen(data.votingOpen ?? false);
        if (Array.isArray(data.candidates)) setCandidates(data.candidates);
        setHasVoted(data.hasVoted || false);
      })
      .catch(() => setError(voteConfig.messages.failedToLoad))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (candidateId: string) => {
    if (!session?.user) { setError(voteConfig.messages.mustBeSignedIn); return; }
    setVoting(candidateId);
    setError("");
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || voteConfig.messages.failedToVote);
      setHasVoted(true);
      setSuccess(voteConfig.messages.voteSuccess);
      setCandidates((prev) => prev.map((c) => c._id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : voteConfig.messages.somethingWentWrong);
    } finally {
      setVoting(null);
    }
  };

  if (loading || status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <div role="status" aria-label="กำลังโหลด...">
        <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
      </div>
    </div>
  );

  if (status === "unauthenticated") return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">{voteConfig.authGate.title}</h2>
        <p className="text-secondary mb-6 text-sm">{voteConfig.authGate.description}</p>
        <Link href="/auth/signin?callbackUrl=/vote" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
          {voteConfig.authGate.signInLabel}
        </Link>
      </div>
    </div>
  );

  if (!votingOpen) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">ยังไม่เปิดโหวต</h2>
        <p className="text-secondary text-sm">รอประกาศจากทีมงานเพื่อเริ่มการเลือกตั้ง</p>
      </div>
    </div>
  );

  const visibleCandidates = selectedSection
    ? candidates.filter((c) => c.section === selectedSection)
    : [];

  // Section picker screen
  if (!selectedSection) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-sm w-full">
          <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{voteConfig.eyebrow}</p>
          <h1 className="text-3xl font-bold text-foreground mb-2">{voteConfig.title}</h1>
          <p className="text-secondary text-sm mb-10">คุณเรียนอยู่ภาคอะไร?</p>
          <div className="flex flex-col gap-4">
            {(["ปกติ", "พิเศษ"] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className="w-full py-5 rounded-2xl border-2 border-border bg-card hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-[colors,border-color] duration-200 cursor-pointer group"
              >
                <p className="text-xl font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  ภาค{sec}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 motion-safe:animate-fade-in">
          <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{voteConfig.eyebrow}</p>
          <h1 className="text-5xl font-bold text-foreground mb-4">{voteConfig.title}</h1>
          <p className="text-secondary max-w-lg mx-auto">{voteConfig.description}</p>
          <button
            onClick={() => setSelectedSection(null)}
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-secondary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            เปลี่ยนภาค (ภาค{selectedSection})
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center max-w-md mx-auto">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm text-center max-w-md mx-auto motion-safe:animate-scale-in">
            ✓ {success}
          </div>
        )}

        {visibleCandidates.length === 0 ? (
          <p className="text-center text-secondary">{voteConfig.messages.noCandidates}</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {visibleCandidates.map((c) => (
              <div key={c._id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-[colors,shadow] duration-300 flex flex-col">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white overflow-hidden shrink-0"
                  style={{ backgroundColor: getMemberColor(c.name) }}>
                  {c.image
                    ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    : (c.nickname || c.name).charAt(0)
                  }
                </div>
                <div className="text-center flex-1">
                  <h3 className="text-foreground font-semibold text-lg">{c.name}</h3>
                  {c.nickname && <p className="text-muted text-sm">({c.nickname})</p>}
                  {c.motto && <p className="text-secondary text-sm mt-3 leading-relaxed italic">&ldquo;{c.motto}&rdquo;</p>}
                </div>
                <div className="mt-6 space-y-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">{c.voteCount}</span>
                    <span className="text-muted text-sm ml-1">{voteConfig.labels.votes}</span>
                  </div>
                  <Button
                    variant={hasVoted ? "ghost" : "primary"}
                    size="md"
                    className="w-full"
                    disabled={hasVoted}
                    loading={voting === c._id}
                    onClick={() => handleVote(c._id)}
                  >
                    {hasVoted ? voteConfig.labels.voted : voteConfig.labels.vote}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasVoted && (
          <p className="text-center text-muted text-sm mt-8">{voteConfig.messages.thankYou}</p>
        )}
      </div>
    </div>
  );
}
