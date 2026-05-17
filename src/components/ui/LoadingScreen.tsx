"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* ── Constants ────────────────────────────────────────────────────── */
const SEGMENTS    = 7;
const DURATION_MS = 3000;
const TICK_MS     = 80;
const HOLD_MS     = 800;
const EXIT_MS     = 550;
const EASE        = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ── Component ────────────────────────────────────────────────────── */
interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible,  setVisible]  = useState(false);
  const [exiting,  setExiting]  = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    const fadeIn = setTimeout(() => setVisible(true), 60);

    const start    = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      const next    = Math.min(elapsed / DURATION_MS, 1);
      setProgress(next);
      if (next >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setExiting(true);
          setTimeout(onComplete, EXIT_MS);
        }, HOLD_MS);
      }
    }, TICK_MS);

    return () => {
      clearTimeout(fadeIn);
      clearInterval(interval);
    };
  }, [onComplete]);

  const pct         = Math.round(progress * 100);
  const litSegments = Math.ceil(progress * SEGMENTS);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 55%, #0d1b2e 0%, #080f1c 55%, #040a12 100%)",
        opacity:      exiting ? 0 : visible ? 1 : 0,
        pointerEvents: exiting ? "none" : "auto",
        transition:   `opacity ${exiting ? "0.5s" : "0.35s"} ${EASE}`,
      }}
    >
      {/* AT: single announcement on completion */}
      <div role="status" aria-live="polite" className="sr-only">
        {progress >= 1 ? "Loading complete." : ""}
      </div>

      <div aria-hidden="true" className="flex flex-col items-center" style={{ gap: "2rem" }}>

        {/* ── Top label ────────────────────────────────────────── */}
        <p
          className="font-mono text-xs uppercase"
          style={{
            letterSpacing: "0.55em",
            color: "#4d6a84",
          }}
        >
          C S · K U
        </p>

        {/* ── Logo mark ────────────────────────────────────────── */}
        <div
          className="flex items-center justify-center"
          style={{
            width:     "clamp(120px, 22vw, 220px)",
            height:    "clamp(120px, 22vw, 220px)",
            animation: "logo-breathe 2.6s ease-in-out infinite",
          }}
        >
          <Image
            src="/logo-white.png"
            alt="CSKU logo"
            width={220}
            height={220}
            priority
            className="w-full h-full object-contain"
          />
        </div>

        {/* ── Segmented pill progress bar ───────────────────────── */}
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading progress"
          className="flex"
          style={{ gap: "clamp(6px, 1.2vw, 12px)" }}
        >
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <div
              key={i}
              style={{
                width:        "clamp(44px, 8.5vw, 88px)",
                height:       "7px",
                borderRadius: "4px",
                background:   i < litSegments ? "#4a9de8" : "#12243a",
                boxShadow:    i < litSegments ? "0 0 8px rgba(74, 157, 232, 0.5)" : "none",
                transition:   "background 100ms linear, box-shadow 100ms linear",
              }}
            />
          ))}
        </div>

        {/* ── Bottom label ─────────────────────────────────────── */}
        <p
          className="font-display font-semibold"
          style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#4a9de8",
            letterSpacing: "0.02em",
          }}
        >
          Computer Science Kasetsart
        </p>

      </div>

      <style jsx>{`
        @keyframes logo-breathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
