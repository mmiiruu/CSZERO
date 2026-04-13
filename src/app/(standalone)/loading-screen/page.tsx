"use client";

import { useEffect, useState, useRef } from "react";

/* ── Constants ────────────────────────────────────────────────────── */
const TOTAL       = 41;   // count ceiling
const INTERVAL_MS = 50;   // ms per increment → ~2 s total
const START_DELAY = 500;  // brief pause before counting begins

const NEON    = "#39ff14";
const NEON_RGB = "57, 255, 20";

/* ── Neon shadow presets ──────────────────────────────────────────── */
const numberShadow = [
  `0 0   7px  #39ff14`,
  `0 0  14px  #39ff14`,
  `0 0  28px  rgba(${NEON_RGB}, 0.85)`,
  `0 0  56px  rgba(${NEON_RGB}, 0.55)`,
  `0 0 110px  rgba(${NEON_RGB}, 0.30)`,
  `0 0 200px  rgba(${NEON_RGB}, 0.12)`,
].join(", ");

const labelShadow = [
  `0 0  6px  #39ff14`,
  `0 0 16px  rgba(${NEON_RGB}, 0.5)`,
].join(", ");

const barGlow = [
  `0 0  6px  #39ff14`,
  `0 0 16px  #39ff14`,
  `0 0 32px  rgba(${NEON_RGB}, 0.55)`,
  `0 0 64px  rgba(${NEON_RGB}, 0.25)`,
].join(", ");

/* ── Corner bracket ───────────────────────────────────────────────── */
type CornerPos = "tl" | "tr" | "bl" | "br";

const CORNER_POS: Record<CornerPos, string> = {
  tl: "top-8 left-8",
  tr: "top-8 right-8",
  bl: "bottom-8 left-8",
  br: "bottom-8 right-8",
};

const CORNER_BORDER: Record<CornerPos, React.CSSProperties> = {
  tl: { borderTopWidth: "2px", borderLeftWidth:   "2px" },
  tr: { borderTopWidth: "2px", borderRightWidth:  "2px" },
  bl: { borderBottomWidth: "2px", borderLeftWidth:  "2px" },
  br: { borderBottomWidth: "2px", borderRightWidth: "2px" },
};

function Corner({ pos }: { pos: CornerPos }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute w-7 h-7 ${CORNER_POS[pos]}`}
      style={{
        ...CORNER_BORDER[pos],
        borderColor: NEON,
        boxShadow: `0 0 8px rgba(${NEON_RGB}, 0.4)`,
        opacity: 0.5,
      }}
    />
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function LoadingScreen() {
  const [count,   setCount]   = useState(0);
  const [ready,   setReady]   = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fadeIn = setTimeout(() => setVisible(true), 80);

    const delay = setTimeout(() => {
      timerRef.current = setInterval(() => {
        setCount((prev) => {
          const next = prev + 1;
          if (next >= TOTAL) {
            clearInterval(timerRef.current!);
            setTimeout(() => setReady(true), 180);
            return TOTAL;
          }
          return next;
        });
      }, INTERVAL_MS);
    }, START_DELAY);

    return () => {
      clearTimeout(fadeIn);
      clearTimeout(delay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pct = Math.round((count / TOTAL) * 100);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: "#040a04",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >

      {/* ── Ambient radial glow ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 50%,
            rgba(${NEON_RGB}, 0.07) 0%,
            transparent 65%)`,
        }}
      />

      {/* ── Dot grid ────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(${NEON_RGB}, 0.18) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.22,
        }}
      />

      {/* ── Scanlines ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent         0px,
            transparent         3px,
            rgba(0, 0, 0, 0.18) 3px,
            rgba(0, 0, 0, 0.18) 4px
          )`,
        }}
      />

      {/* ── Corner brackets ─────────────────────────────────────── */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center w-full px-6">

        {/* Top label */}
        <p
          className="font-mono text-xs tracking-[0.45em] uppercase mb-10"
          style={{ color: NEON, textShadow: labelShadow, opacity: 0.6 }}
        >
          SYSTEM&nbsp;INITIALIZING
        </p>

        {/* ── Counter ───────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center mb-3">
          {/* Bloom halo */}
          <div
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none animate-pulse-slow"
            style={{
              width:  "clamp(280px, 50vw, 580px)",
              height: "clamp(150px, 28vw, 320px)",
              background: `radial-gradient(ellipse at center,
                rgba(${NEON_RGB}, 0.11) 0%,
                rgba(${NEON_RGB}, 0.04) 40%,
                transparent 70%)`,
              filter: "blur(22px)",
            }}
          />

          {/* Digits */}
          <span
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Count: ${count}`}
            className="font-mono font-bold tabular-nums animate-flicker"
            style={{
              fontSize: "clamp(110px, 22vw, 300px)",
              lineHeight: 1,
              color: NEON,
              textShadow: numberShadow,
              letterSpacing: "-0.02em",
            }}
          >
            {String(count).padStart(2, "0")}
          </span>
        </div>

        {/* Tick marks ruler */}
        <div
          aria-hidden="true"
          className="flex items-end gap-[3px] mb-5"
          style={{ width: "clamp(260px, 46vw, 560px)" }}
        >
          {Array.from({ length: TOTAL + 1 }, (_, i) => {
            const lit = i <= count;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: i % 5 === 0 ? "10px" : "5px",
                  borderRadius: "1px",
                  background: lit ? NEON : `rgba(${NEON_RGB}, 0.10)`,
                  boxShadow: lit ? `0 0 5px ${NEON}` : "none",
                  transition: "background 60ms linear, box-shadow 60ms linear",
                }}
              />
            );
          })}
        </div>

        {/* ── Progress bar ──────────────────────────────────────── */}
        <div
          className="flex flex-col items-center gap-3"
          style={{ width: "clamp(260px, 46vw, 560px)" }}
        >
          {/* Track */}
          <div
            className="relative w-full rounded-full overflow-hidden"
            style={{
              height: "6px",
              background: `rgba(${NEON_RGB}, 0.07)`,
              border:  `1px solid rgba(${NEON_RGB}, 0.18)`,
              boxShadow: `inset 0 0 10px rgba(${NEON_RGB}, 0.04)`,
            }}
          >
            {/* Fill */}
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg,
                  rgba(${NEON_RGB}, 0.45) 0%,
                  ${NEON} 100%)`,
                boxShadow: barGlow,
                transition: `width ${INTERVAL_MS}ms linear`,
              }}
            />
          </div>

          {/* Percentage readout */}
          <div className="flex w-full justify-between items-center">
            <span
              className="font-mono text-[10px] tracking-widest"
              style={{ color: NEON, textShadow: labelShadow, opacity: 0.4 }}
            >
              0
            </span>

            <span
              aria-live="polite"
              aria-atomic="true"
              aria-label={`${pct} percent complete`}
              className="font-mono text-sm font-semibold tracking-[0.25em]"
              style={{ color: NEON, textShadow: labelShadow }}
            >
              {pct}%
            </span>

            <span
              className="font-mono text-[10px] tracking-widest"
              style={{ color: NEON, textShadow: labelShadow, opacity: 0.4 }}
            >
              100
            </span>
          </div>
        </div>

        {/* ── Ready ─────────────────────────────────────────────── */}
        <div
          className="mt-10 font-mono text-xs tracking-[0.5em] uppercase"
          style={{
            color: NEON,
            textShadow: `${labelShadow}, 0 0 40px rgba(${NEON_RGB}, 0.5)`,
            opacity: ready ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          ▪&nbsp;READY&nbsp;▪
        </div>

      </div>

      {/* ── Version tag ─────────────────────────────────────────── */}
      <p
        className="absolute bottom-6 right-8 font-mono text-[10px] tracking-widest"
        style={{ color: NEON, opacity: 0.22 }}
      >
        v4.1.0
      </p>

    </div>
  );
}
