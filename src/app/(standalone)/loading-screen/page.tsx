"use client";

import { useEffect, useState, useRef } from "react";

/* ── Constants ────────────────────────────────────────────────────── */
const TOTAL       = 41;
const START_DELAY = 400;
const SEGMENTS    = 7;
const EASE        = "cubic-bezier(0.22, 1, 0.36, 1)";

const MIN_MS = 20;
const MAX_MS = 130;

/* ── Page ─────────────────────────────────────────────────────────── */
export default function LoadingScreenPreview() {
  const [count,   setCount]   = useState(0);
  const [ready,   setReady]   = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(TOTAL);
      setReady(true);
      setVisible(true);
      return;
    }

    const fadeIn = setTimeout(() => setVisible(true), 80);

    const scheduleNext = (current: number) => {
      const progress = current / TOTAL;
      const delay    = Math.round(MIN_MS + (MAX_MS - MIN_MS) * progress * progress);
      timerRef.current = setTimeout(() => {
        const next = current + 1;
        setCount(next);
        if (next < TOTAL) {
          scheduleNext(next);
        } else {
          timerRef.current = setTimeout(() => setReady(true), 1500);
        }
      }, delay);
    };

    const startDelay = setTimeout(() => scheduleNext(0), START_DELAY);

    return () => {
      clearTimeout(fadeIn);
      clearTimeout(startDelay);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const pct         = Math.round((count / TOTAL) * 100);
  const litSegments = Math.ceil((count / TOTAL) * SEGMENTS);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 55%, #0d1b2e 0%, #080f1c 55%, #040a12 100%)",
        opacity:    visible ? 1 : 0,
        transition: `opacity 0.4s ${EASE}`,
      }}
    >
      {/* AT: single announcement on completion */}
      <div role="status" aria-live="polite" className="sr-only">
        {ready ? "Loading complete." : ""}
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

        {/* ── Main counter ─────────────────────────────────────── */}
        <div className="flex items-end">
          {/* Large italic gradient number */}
          <span
            className="font-display font-black italic tabular-nums leading-none"
            style={{
              fontSize: "clamp(72px, 14vw, 160px)",
              background: "linear-gradient(175deg, #b8ddf8 0%, #5aaae8 40%, #2e78c8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.04em",
              padding: "0.05em 0.2em",
            }}
          >
            {String(count).padStart(2, "0")}
          </span>
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
    </div>
  );
}
