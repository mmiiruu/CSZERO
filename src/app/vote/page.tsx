"use client";

import React, { useEffect, useRef, useState } from "react";
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
  videoUrl: string;
  dutyAnswer: string;
  visionAnswer: string;
  strengthWeaknessAnswer: string;
  voteCount?: number;
}

const WRITTEN_QA = [
  { key: "dutyAnswer" as const,             q: "คิดว่าหน้าที่ของประธานรุ่นคืออะไร" },
  { key: "visionAnswer" as const,           q: "มีแนวคิดหรือกิจกรรมอะไรที่อยากผลักดัน" },
  { key: "strengthWeaknessAnswer" as const, q: "จุดแข็งและจุดอ่อนของตัวเอง" },
];

/* ─── Candidate detail modal ────────────────────────────────────── */
function CandidateModal({
  candidate,
  hasVoted,
  voting,
  onVote,
  onClose,
  isAdmin,
}: {
  candidate: Candidate;
  hasVoted: boolean;
  voting: string | null;
  onVote: (id: string) => void;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const c = candidate;

  // Move focus in on open; restore to trigger on close
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => { trigger?.focus(); };
  }, []);

  // Escape + Tab trap
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
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-candidate-name"
        className="relative w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-5 border-b border-border">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-xl font-bold text-white"
              style={{ backgroundColor: getMemberColor(c.name) }}
            >
              {c.image
                ? <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover object-center" />
                : (c.nickname || c.name).charAt(0)
              }
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h2 id="modal-candidate-name" className="text-lg font-bold text-foreground leading-tight">{c.name}</h2>
                {c.nickname && <span className="text-sm text-muted">({c.nickname})</span>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {c.section && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    ภาค{c.section}
                  </span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                    <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                    </svg>
                    {c.voteCount ?? 0} โหวต
                  </span>
                )}
              </div>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="ปิด"
              className="shrink-0 p-3 -mr-1 -mt-1 text-muted hover:text-secondary rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {c.motto && (
            <p className="mt-4 text-sm text-secondary italic leading-relaxed">
              &ldquo;{c.motto}&rdquo;
            </p>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Video link */}
          {c.videoUrl && (
            <a
              href={c.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
            >
              <span aria-hidden="true" className="shrink-0 w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </span>
              <span className="flex-1 text-sm font-medium text-red-700 dark:text-red-400 group-hover:text-red-800 dark:group-hover:text-red-300">
                ดูวิดีโอแนะนำตัว
              </span>
              <svg aria-hidden="true" className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Written answers */}
          {WRITTEN_QA.map(({ key, q }) => {
            const answer = c[key];
            if (!answer) return null;
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{q}</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{answer}</p>
              </div>
            );
          })}
        </div>

        {/* Footer — vote button */}
        <div className="shrink-0 px-6 py-4 border-t border-border bg-card">
          <Button
            variant={hasVoted ? "ghost" : "primary"}
            size="md"
            className="w-full"
            disabled={hasVoted}
            loading={voting === c._id}
            onClick={() => onVote(c._id)}
          >
            {hasVoted ? voteConfig.labels.voted : voteConfig.labels.vote}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Candidate card ────────────────────────────────────────────── */
function CandidateCard({
  candidate,
  hasVoted,
  onClick,
  isAdmin,
}: {
  candidate: Candidate;
  hasVoted: boolean;
  onClick: () => void;
  isAdmin: boolean;
}) {
  const c = candidate;
  return (
    <button
      onClick={onClick}
      aria-label={c.name}
      className="w-full text-left bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-[box-shadow,border-color] duration-300 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
    >
      {/* Photo banner */}
      <div
        aria-hidden="true"
        className="h-56 flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden"
        style={{ backgroundColor: getMemberColor(c.name) }}
      >
        {c.image
          ? <img src={c.image} alt="" loading="lazy" className="w-full h-full object-cover object-center" />
          : <span>{(c.nickname || c.name).charAt(0)}</span>
        }
        {/* Opacity-based overlay — avoids background-color paint on every frame */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full">ดูโปรไฟล์</span>
        </div>
      </div>

      {/* Info — visible to screen readers via aria-label on the button */}
      <div aria-hidden="true" className="px-4 py-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{c.name}</p>
            {c.nickname && <p className="text-sm text-muted">({c.nickname})</p>}
          </div>
          <div className="shrink-0 mt-0.5 flex flex-col items-end gap-1">
            {hasVoted && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">โหวตแล้ว</span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                {c.voteCount ?? 0} โหวต
              </span>
            )}
          </div>
        </div>
        {c.motto && (
          <p className="text-xs text-secondary mt-2 line-clamp-2 leading-relaxed italic">&ldquo;{c.motto}&rdquo;</p>
        )}
        {c.videoUrl && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs">
              <svg aria-hidden="true" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              วิดีโอ
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

function isKuEmail(email?: string | null) {
  return !!email && email.toLowerCase().endsWith("@ku.th");
}

/* ─── Pre-vote verification modal ──────────────────────────────── */
function VerifyModal({
  email,
  section,
  onConfirm,
  onClose,
  loading,
}: {
  email: string;
  section: "ปกติ" | "พิเศษ";
  onConfirm: (studentId: string, voterName: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [studentId, setStudentId] = useState("");
  const [voterName, setVoterName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const idPrefix = section === "ปกติ" ? "691040" : "691045";
  const idRe = section === "ปกติ" ? /^691040\d{4}$/ : /^691045\d{4}$/;
  const emailOk = isKuEmail(email);
  const idOk = idRe.test(studentId.trim());
  const nameOk = voterName.trim().length > 0;
  const canSubmit = emailOk && idOk && nameOk && !loading;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="verify-title" className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6">
        <h2 id="verify-title" className="text-lg font-bold text-foreground mb-1">ยืนยันตัวตนก่อนโหวต</h2>
        <p className="text-sm text-secondary mb-5">ใช้ได้เฉพาะนิสิต CS KU รุ่น 68 ภาค{section} เท่านั้น</p>

        {/* Email check */}
        <div className={`flex items-start gap-3 p-3.5 rounded-xl mb-4 ${emailOk ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
          <svg aria-hidden="true" className={`w-5 h-5 mt-0.5 shrink-0 ${emailOk ? "text-green-600 dark:text-green-400" : "text-red-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {emailOk
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            }
          </svg>
          <div className="min-w-0">
            <p className={`text-xs font-semibold mb-0.5 ${emailOk ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}`}>
              {emailOk ? "อีเมล @ku.th ✓" : "ต้องใช้อีเมล @ku.th เท่านั้น"}
            </p>
            <p className="text-xs text-secondary break-all">{email}</p>
          </div>
        </div>

        {/* Full name input */}
        <div className="mb-4">
          <label htmlFor="voter-name" className="block text-sm font-medium text-foreground mb-1.5">
            ชื่อจริง นามสกุล (ภาษาไทย)
          </label>
          <input
            ref={inputRef}
            id="voter-name"
            type="text"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="ชื่อจริง นามสกุล"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-[colors,shadow]"
          />
        </div>

        {/* Student ID input */}
        <div className="mb-5">
          <label htmlFor="student-id" className="block text-sm font-medium text-foreground mb-1.5">
            รหัสนิสิต
          </label>
          <input
            id="student-id"
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
            placeholder={`${idPrefix}xxxx`}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-[colors,shadow]"
          />
          {studentId.length > 0 && !idOk && (
            <p className="mt-1.5 text-xs text-red-500">รหัสนิสิตต้องขึ้นต้นด้วย {idPrefix} (10 หลัก)</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-secondary hover:bg-hover rounded-xl transition-colors cursor-pointer border border-border"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onConfirm(studentId.trim(), voterName.trim())}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors cursor-pointer bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังโหวต..." : "ยืนยันโหวต"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function VotePage() {
  const { data: session, status } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedSection, setSelectedSection] = useState<"ปกติ" | "พิเศษ" | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [pendingVoteId, setPendingVoteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/votes")
      .then((r) => r.json())
      .then((data) => {
        setVotingOpen(data.votingOpen ?? false);
        if (Array.isArray(data.candidates)) setCandidates(data.candidates);
        setHasVoted(data.hasVoted || false);
        setIsAdmin(data.isAdmin ?? false);
      })
      .catch(() => setError(voteConfig.messages.failedToLoad))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = (candidateId: string) => {
    if (!session?.user) { setError(voteConfig.messages.mustBeSignedIn); return; }
    setPendingVoteId(candidateId);
  };

  const handleConfirmedVote = async (studentId: string, voterName: string) => {
    if (!pendingVoteId) return;
    setVoting(pendingVoteId);
    setError("");
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: pendingVoteId, studentId, voterName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || voteConfig.messages.failedToVote);
      setHasVoted(true);
      setSuccess(voteConfig.messages.voteSuccess);
      setActiveCandidate(null);
      setPendingVoteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : voteConfig.messages.somethingWentWrong);
      setPendingVoteId(null);
    } finally {
      setVoting(null);
    }
  };

  /* ── Loading ── */
  if (loading || status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <div role="status" aria-label="กำลังโหลด...">
        <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
      </div>
    </div>
  );

  /* ── Auth gate ── */
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

  /* ── Voting closed ── */
  if (!votingOpen) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
          <svg aria-hidden="true" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">ยังไม่เปิดโหวต</h2>
        <p className="text-secondary text-sm">รอประกาศจากทีมงานเพื่อเริ่มการเลือกตั้ง</p>
      </div>
    </div>
  );

  /* ── Section picker ── */
  if (!selectedSection) return (
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
              className="w-full py-6 rounded-2xl border-2 border-border bg-card hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-[colors,border-color] duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
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

  /* ── Candidate list ── */
  const visibleCandidates = candidates.filter((c) => c.section === selectedSection);

  return (
    <div className="min-h-screen py-20 px-4 bg-background">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => setSelectedSection(null)}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-secondary transition-colors cursor-pointer mb-6 min-h-[44px] py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-lg"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            เปลี่ยนภาค
          </button>
          <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-2">{voteConfig.eyebrow} · ภาค{selectedSection}</p>
          <h1 className="text-4xl font-bold text-foreground mb-2">{voteConfig.title}</h1>
          <p className="text-secondary text-sm">{voteConfig.description}</p>
        </div>

        {/* Alerts */}
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div role="alert" className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
            ✓ {success}
          </div>
        )}
        {hasVoted && !success && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 text-sm">
            {voteConfig.messages.thankYou}
          </div>
        )}

        {/* Grid */}
        {visibleCandidates.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <p className="text-muted">{voteConfig.messages.noCandidates}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {visibleCandidates.map((c) => (
              <CandidateCard
                key={c._id}
                candidate={c}
                hasVoted={hasVoted}
                onClick={() => setActiveCandidate(c)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {activeCandidate && (
        <CandidateModal
          candidate={activeCandidate}
          hasVoted={hasVoted}
          voting={voting}
          onVote={handleVote}
          onClose={() => setActiveCandidate(null)}
          isAdmin={isAdmin}
        />
      )}

      {/* Verify modal */}
      {pendingVoteId && (
        <VerifyModal
          email={session?.user?.email ?? ""}
          section={selectedSection!}
          onConfirm={(sid, name) => handleConfirmedVote(sid, name)}
          onClose={() => setPendingVoteId(null)}
          loading={!!voting}
        />
      )}
    </div>
  );
}
