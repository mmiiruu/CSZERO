"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { helloWorldConfig } from "@/config/events/hello-world";

const { houses, reveal } = helloWorldConfig;

// Matches the gold used throughout the Hello World event
const GOLD = "#f5c842";

type HouseKey = "spade" | "heart" | "diamond" | "club";

/**
 * Face-down playing card — one card in the idle-state fan.
 * delay  : animationDelay in seconds — staggers the tube-pulse glow per card
 * index  : used to generate a unique SVG pattern id (avoids duplicate-id issues)
 */
function MysteryCard({ delay = 0, index = 0 }: { delay?: number; index?: number }) {
  const patternId = `hw-card-back-${index}`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 112"
      className="w-20 h-28"
      fill="none"
      style={{
        animation: "tube-pulse 3.5s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    >
      <defs>
        {/* Repeating diamond tile — classic card back pattern */}
        <pattern id={patternId} x="0" y="0" width="11" height="11" patternUnits="userSpaceOnUse">
          <path d="M5.5 0 L11 5.5 L5.5 11 L0 5.5 Z"
            fill={GOLD} fillOpacity="0.09"
            stroke={GOLD} strokeOpacity="0.22" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Card body */}
      <rect x="2" y="2" width="76" height="108" rx="8"
        fill="#080b10" stroke={GOLD} strokeWidth="1.5" strokeOpacity="0.9" />

      {/* Inset border */}
      <rect x="7" y="7" width="66" height="98" rx="5"
        fill="none" stroke={GOLD} strokeWidth="0.75" strokeOpacity="0.3" />

      {/* Diamond-tile back fill */}
      <rect x="8" y="8" width="64" height="96" rx="4" fill={`url(#${patternId})`} />

      {/* Centre focal diamond */}
      <path d="M40 36 L57 56 L40 76 L23 56 Z"
        fill={GOLD} fillOpacity="0.80"
        stroke={GOLD} strokeWidth="0.75" strokeOpacity="0.6" />

      {/* Corner accent diamonds */}
      <path d="M14 15 L18 19 L14 23 L10 19 Z" fill={GOLD} fillOpacity="0.65" />
      <path d="M66 89 L70 93 L66 97 L62 93 Z" fill={GOLD} fillOpacity="0.65" />
    </svg>
  );
}

export default function RevealPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealedHouse, setRevealedHouse] = useState<HouseKey | null>(null);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Programmatic focus target — the reveal heading receives focus when house is set
  const revealHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/events/hello-world/reveal");
    }
  }, [status, router]);

  const shuffleAnimation = useCallback(() => {
    setShuffleIndex((prev) => (prev + 1) % houses.items.length);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isShuffling) { interval = setInterval(shuffleAnimation, 150); }
    return () => clearInterval(interval);
  }, [isShuffling, shuffleAnimation]);

  // Move focus to the revealed heading so screen readers announce it immediately
  useEffect(() => {
    if (revealedHouse && revealHeadingRef.current) {
      revealHeadingRef.current.focus();
    }
  }, [revealedHouse]);

  const handleReveal = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/house-reveal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to find house");
      const house = data.house as HouseKey;
      const houseItem = houses.items.find((h) => h.key === house);
      setIsLoading(false);
      setIsShuffling(true);
      setLiveAnnouncement(reveal.shufflingTitle);
      setTimeout(() => {
        setIsShuffling(false);
        setRevealedHouse(house);
        setLiveAnnouncement(`บ้านของคุณคือบ้าน ${houseItem?.name ?? house}`);
      }, 3000);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleReset = () => {
    setRevealedHouse(null);
    setLiveAnnouncement("");
  };

  const houseData = revealedHouse ? houses.items.find((h) => h.key === revealedHouse) : null;
  const shuffleHouse = houses.items[shuffleIndex];

  // Auth loading / redirect — separate early return, not part of the main interaction
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div
        role="status"
        aria-label="กำลังโหลด..."
        className="min-h-screen flex items-center justify-center"
      >
        <div
          aria-hidden="true"
          className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-amber-50 to-white dark:from-[#080b10] dark:via-amber-950/20 dark:to-[#080b10]">

      {/* Persistent live region — survives across all state transitions */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* ── Revealed ─────────────────────────────────────────────────── */}
      {revealedHouse && houseData && (
        <div className="text-center">

          {/* Playing card — dealt face-up with gold glow */}
          <div
            className="relative inline-block mb-10"
            style={{ filter: `drop-shadow(0 0 20px ${GOLD}55) drop-shadow(0 0 52px ${GOLD}22)` }}
          >
            <div
              className={`relative flex items-center justify-center w-44 h-60 rounded-2xl bg-gradient-to-br ${houseData.revealGradient} animate-deal-in`}
              style={{
                border: `2px solid ${GOLD}75`,
                boxShadow: `inset 0 0 48px rgba(0,0,0,0.28)`,
              }}
            >
              {/* Inset card border — classic playing card detail */}
              <div aria-hidden="true" className="absolute inset-3 rounded-xl border border-white/15 pointer-events-none" />
              {/* Corner pip — top-left */}
              <span aria-hidden="true" className="absolute top-3 left-3.5 text-sm text-white/75 font-bold leading-none">{houseData.symbol}</span>
              {/* Corner pip — bottom-right (rotated 180°) */}
              <span aria-hidden="true" className="absolute bottom-3 right-3.5 text-sm text-white/75 font-bold leading-none rotate-180">{houseData.symbol}</span>
              {/* Hero suit symbol */}
              <span aria-hidden="true" className="text-8xl text-white drop-shadow-lg">{houseData.symbol}</span>
            </div>
          </div>

          {/* Text — fades in after the card lands */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <h1
              ref={revealHeadingRef}
              tabIndex={-1}
              className="text-4xl font-bold text-white mb-2 outline-none"
            >
              บ้าน{houseData.name}
            </h1>
            <p className="text-slate-400 mb-8">{reveal.revealedMessage}</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 active:bg-slate-600 transition-colors duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b10]"
            >
              {reveal.revealAgainButton}
            </button>
          </div>

        </div>
      )}

      {/* ── Shuffling ────────────────────────────────────────────────── */}
      {isShuffling && !revealedHouse && (
        <div aria-busy="true" className="text-center">

          {/* Playing card — portrait, smaller than revealed, spinning face-down */}
          <div
            className={`relative inline-flex items-center justify-center w-28 h-40 rounded-xl bg-gradient-to-br ${shuffleHouse.revealGradient} mb-8 animate-shuffle`}
            style={{
              border: `1.5px solid ${GOLD}45`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.55)`,
            }}
          >
            {/* Inset border */}
            <div aria-hidden="true" className="absolute inset-2.5 rounded-lg border border-white/12 pointer-events-none" />
            {/* Corner pip — top-left */}
            <span aria-hidden="true" className="absolute top-2 left-2.5 text-xs text-white/65 font-bold leading-none">{shuffleHouse.symbol}</span>
            {/* Corner pip — bottom-right */}
            <span aria-hidden="true" className="absolute bottom-2 right-2.5 text-xs text-white/65 font-bold leading-none rotate-180">{shuffleHouse.symbol}</span>
            {/* Centre suit */}
            <span aria-hidden="true" className="text-5xl text-white">{shuffleHouse.symbol}</span>
          </div>

          <h1 className="text-2xl font-bold text-white animate-flicker">{reveal.shufflingTitle}</h1>
          <p className="text-slate-400 mt-2">{reveal.shufflingSubtitle}</p>
        </div>
      )}

      {/* ── Idle ─────────────────────────────────────────────────────── */}
      {!isShuffling && !revealedHouse && (
        <div className="max-w-md w-full text-center animate-fade-in">
          {/* 4-card fan — spreads on group hover, individual cards pop on direct hover.
              origin-bottom rotates from the base so cards fan like a held hand.
              hover:!-translate-y-6 uses !important to beat the group-hover translate. */}
          <div className="group flex items-end justify-center -space-x-4 mb-6 select-none">

            {/* Card 1 — leftmost */}
            <div className="relative origin-bottom transition-all duration-300 ease-out z-[1] transform-gpu
              drop-shadow-[0_0_15px_rgba(245,200,66,0.5)]
              -rotate-[8deg]
              group-hover:-rotate-[14deg] group-hover:-translate-x-3 group-hover:-translate-y-2
              hover:!-translate-y-6 hover:z-10">
              <MysteryCard index={0} delay={0} />
            </div>

            {/* Card 2 */}
            <div className="relative origin-bottom transition-all duration-300 ease-out z-[2] transform-gpu
              drop-shadow-[0_0_15px_rgba(245,200,66,0.5)]
              -rotate-[3deg]
              group-hover:-rotate-[5deg] group-hover:-translate-x-1 group-hover:-translate-y-1
              hover:!-translate-y-6 hover:z-10">
              <MysteryCard index={1} delay={0.35} />
            </div>

            {/* Card 3 */}
            <div className="relative origin-bottom transition-all duration-300 ease-out z-[3] transform-gpu
              drop-shadow-[0_0_15px_rgba(245,200,66,0.5)]
              rotate-[3deg]
              group-hover:rotate-[5deg] group-hover:translate-x-1 group-hover:-translate-y-1
              hover:!-translate-y-6 hover:z-10">
              <MysteryCard index={2} delay={0.7} />
            </div>

            {/* Card 4 — rightmost */}
            <div className="relative origin-bottom transition-all duration-300 ease-out z-[4] transform-gpu
              drop-shadow-[0_0_15px_rgba(245,200,66,0.5)]
              rotate-[8deg]
              group-hover:rotate-[14deg] group-hover:translate-x-3 group-hover:-translate-y-2
              hover:!-translate-y-6 hover:z-10">
              <MysteryCard index={3} delay={1.05} />
            </div>

          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{reveal.title}</h1>
          <p className="text-slate-400 mb-2">
            เข้าสู่ระบบในชื่อ{" "}
            <span className="font-medium text-slate-300">{session?.user?.email}</span>
          </p>
          <p className="text-slate-500 text-sm mb-8">{reveal.description}</p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            {error && (
              <p role="alert" className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
            {/* Gold CTA — styled directly to match the Hello World event palette */}
            <button
              disabled={isLoading}
              onClick={handleReveal}
              className="w-full inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-base transition-[filter] duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:brightness-110 active:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
              style={{ background: GOLD, color: "#1a0800", boxShadow: `0 4px 20px ${GOLD}40` }}
            >
              {isLoading && (
                <svg aria-hidden="true" className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {reveal.button}
            </button>
          </div>

          <div aria-hidden="true" className="mt-10 flex justify-center gap-8">
            {houses.items.map((h) => (
              <span key={h.name} className={`text-3xl opacity-30 ${h.revealTextColor}`}>{h.symbol}</span>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
