"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ForceTheme } from "@/components/providers/ForceTheme";
import { helloWorldConfig } from "@/config/events/hello-world";
import type { TimelineItem, TimelineDay } from "@/components/ui/Timeline";

const { hero, houses, schedule, cta } = helloWorldConfig;

/* ── Casino palette ─────────────────────────────────────────── */
const GOLD   = "#f5c842";
const NEON_G = "#00e87a";
const NEON_R = "#ff2d55";

/* ── House accent map ────────────────────────────────────────── */
const houseNeon: Record<string, { neon: string; glow: string; border: string; badge: string }> = {
  spade:   { neon: "#e2e8f0", glow: "rgba(226,232,240,0.35)", border: "border-slate-300/40",  badge: "bg-slate-700/60 text-slate-200"     },
  heart:   { neon: NEON_R,   glow: "rgba(255,45,85,0.40)",   border: "border-rose-400/40",    badge: "bg-rose-900/60 text-rose-300"        },
  diamond: { neon: "#38bdf8", glow: "rgba(56,189,248,0.40)", border: "border-sky-400/40",     badge: "bg-sky-900/60 text-sky-300"          },
  club:    { neon: NEON_G,   glow: "rgba(0,232,122,0.40)",   border: "border-emerald-400/40", badge: "bg-emerald-900/60 text-emerald-300"  },
};

/* ── Timeline type config ────────────────────────────────────── */
const typeConfig: Record<string, { label: string; badge: string; nodeColor: string; glowColor: string }> = {
  talk:     { label: "talk",     badge: "bg-amber-900/50 text-amber-300 border-amber-600/40",     nodeColor: GOLD,    glowColor: `${GOLD}80`    },
  workshop: { label: "workshop", badge: "bg-emerald-900/50 text-emerald-300 border-emerald-600/40", nodeColor: NEON_G,  glowColor: `${NEON_G}80`  },
  break:    { label: "break",    badge: "bg-slate-700/50 text-slate-300 border-slate-500/40",      nodeColor: "#94a3b8", glowColor: "#94a3b880"  },
  social:   { label: "social",   badge: "bg-rose-900/50 text-rose-300 border-rose-600/40",         nodeColor: NEON_R,  glowColor: `${NEON_R}80`  },
};

/* ═══════════════════════════════════════════════════════════════
   SVG Nodes
═══════════════════════════════════════════════════════════════ */

/** Dice node — for "talk" entries */
function DiceNode({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 36" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="32" height="32" rx="7"
        fill="#080b10" stroke={color} strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
      <circle cx="11" cy="11" r="2.5" fill={color} />
      <circle cx="25" cy="11" r="2.5" fill={color} />
      <circle cx="18" cy="18" r="2.5" fill={color} />
      <circle cx="11" cy="25" r="2.5" fill={color} />
      <circle cx="25" cy="25" r="2.5" fill={color} />
    </svg>
  );
}

/** Roulette wheel — for "workshop" entries */
function RouletteNode({ color }: { color: string }) {
  const segments = 8;
  const r = 15;
  const cx = 18, cy = 18;
  const wedges = Array.from({ length: segments }, (_, i) => {
    const a1 = (i / segments) * 2 * Math.PI - Math.PI / 2;
    const a2 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`, alt: i % 2 === 0 };
  });
  return (
    <svg viewBox="0 0 36 36" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "roulette 3s linear infinite", filter: `drop-shadow(0 0 5px ${color})` }}>
      {wedges.map((w, i) => (
        <path key={i} d={w.d} fill={w.alt ? color : "#1e2830"} fillOpacity={w.alt ? 0.9 : 0.6} stroke="#080b10" strokeWidth="0.5" />
      ))}
      <circle cx="18" cy="18" r="4" fill="#080b10" stroke={color} strokeWidth="1" />
      <circle cx="18" cy="18" r="1.5" fill={color} />
    </svg>
  );
}

/** Stacked chip node — for "break" entries */
function ChipNode({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 40" width="36" height="40" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
      {/* 3 stacked chips from bottom */}
      {[30, 22, 14].map((cy, i) => (
        <g key={i}>
          <ellipse cx="18" cy={cy + 2} rx="14" ry="4" fill="#060910" />
          <ellipse cx="18" cy={cy} rx="14" ry="6" fill={i === 0 ? "#1a1f2e" : i === 1 ? "#141820" : "#0f1218"} stroke={color} strokeWidth="1" strokeOpacity={0.6 + i * 0.15} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return <rect key={deg} x={18 + 11 * Math.cos(rad) - 1.5} y={cy + 5 * Math.sin(rad) - 2} width="3" height="4" rx="1" fill={color} fillOpacity={0.5 + i * 0.15} transform={`rotate(${deg} 18 ${cy})`} />;
          })}
        </g>
      ))}
      <ellipse cx="18" cy="14" rx="7" ry="3" fill={color} fillOpacity="0.25" />
    </svg>
  );
}

/** Playing card mini — for "social" entries */
function CardNode({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 28 38" width="28" height="38" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
      <rect x="1" y="1" width="26" height="36" rx="4" fill="#080b10" stroke={color} strokeWidth="1.5" />
      <text x="5" y="13" fill={color} fontSize="8" fontFamily="serif" fontWeight="bold">A</text>
      <text x="9" y="24" fill={color} fontSize="14" fontFamily="serif" textAnchor="middle">♥</text>
      <text x="23" y="35" fill={color} fontSize="8" fontFamily="serif" fontWeight="bold" textAnchor="end" transform="rotate(180 23 35)">A</text>
    </svg>
  );
}

function TimelineNode({ type }: { type?: string }) {
  const cfg = typeConfig[type ?? "social"];
  switch (type) {
    case "talk":     return <DiceNode   color={cfg.nodeColor} />;
    case "workshop": return <RouletteNode color={cfg.nodeColor} />;
    case "break":    return <ChipNode   color={cfg.nodeColor} />;
    default:         return <CardNode   color={cfg.nodeColor} />;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Slot-machine text reveal (IntersectionObserver triggered)
═══════════════════════════════════════════════════════════════ */
function SlotReveal({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} className={`inline-block overflow-hidden align-bottom ${className}`}>
      <span
        style={{
          display: "inline-block",
          animation: visible ? `slot-reveal 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` : "none",
          opacity: visible ? 1 : 0,
        }}
      >
        {text}
      </span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Flying card suit that animates across an entry
═══════════════════════════════════════════════════════════════ */
function FlyingSuit({ suit, delay, color }: { suit: string; delay: number; color: string }) {
  return (
    <span
      className="absolute pointer-events-none select-none text-sm font-bold"
      style={{
        top: `${20 + Math.random() * 40}%`,
        left: "5%",
        color,
        opacity: 0,
        animation: `card-fly 1.2s ease-in-out ${delay}ms forwards`,
      }}
    >
      {suit}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Entry card (glass, with slot reveal + flying suits)
═══════════════════════════════════════════════════════════════ */
function EntryCard({ item, entryDelay }: { item: TimelineItem; entryDelay: number }) {
  const cfg = typeConfig[item.type ?? "social"];
  const suits = ["♠", "♥", "♦", "♣"];
  const randomSuit = suits[Math.floor(Math.random() * suits.length)];
  const isRed = randomSuit === "♥" || randomSuit === "♦";

  return (
    <div
      className="relative rounded-xl p-4 border backdrop-blur-md overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: `${cfg.nodeColor}30`,
        boxShadow: `0 0 20px ${cfg.glowColor}20`,
        transition: "box-shadow 0.3s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 28px ${cfg.glowColor}50, inset 0 0 20px ${cfg.glowColor}08`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${cfg.glowColor}20`; }}
    >
      {/* Flying suit — replays on hover via group */}
      <FlyingSuit
        suit={randomSuit}
        delay={entryDelay + 100}
        color={isRed ? NEON_R : "#e2e8f0"}
      />

      {/* Top meta row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-mono tabular-nums" style={{ color: cfg.nodeColor }}>
          {item.time}
        </span>
        {item.type && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
            {item.type}
          </span>
        )}
      </div>

      {/* Slot-machine title */}
      <h4 className="font-bold text-white text-sm leading-snug mb-1 overflow-hidden">
        {item.title.split(" ").map((word, wi) => (
          <SlotReveal key={wi} text={word + "\u00a0"} delay={entryDelay + wi * 60} />
        ))}
      </h4>

      {item.description && (
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
          {item.description}
        </p>
      )}

      {/* Corner glow on hover */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: cfg.glowColor, transform: "translate(30%, -30%)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CASINO TIMELINE
═══════════════════════════════════════════════════════════════ */
function CasinoTimeline({ days }: { days: TimelineDay[] }) {
  return (
    <div className="space-y-16">
      {days.map((day, di) => (
        <div key={di}>
          {/* Day header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-4 h-4 rounded-full shrink-0" style={{ background: GOLD, boxShadow: `0 0 12px ${GOLD}, 0 0 30px ${GOLD}60` }} />
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}80, transparent)` }} />
            <div className="text-center px-4">
              <p className="text-base font-black text-white">{day.day}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{day.date}</p>
            </div>
            <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${GOLD}80, transparent)` }} />
            <div className="w-4 h-4 rounded-full shrink-0" style={{ background: GOLD, boxShadow: `0 0 12px ${GOLD}, 0 0 30px ${GOLD}60` }} />
          </div>

          {/* ── Desktop: two-column with neon tube ── */}
          <div className="hidden md:block relative">

            {/* Neon tube — layered glow effect */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex flex-col items-center w-6 pointer-events-none z-10">
              {/* Outer blur */}
              <div className="absolute inset-x-0 top-0 bottom-0 rounded-full"
                style={{
                  background: NEON_G,
                  width: "12px",
                  margin: "0 auto",
                  filter: "blur(6px)",
                  opacity: 0.25,
                  animation: "tube-pulse 2.5s ease-in-out infinite",
                }} />
              {/* Mid glow */}
              <div className="absolute top-0 bottom-0 rounded-full"
                style={{ background: NEON_G, width: "4px", margin: "0 auto", opacity: 0.5, filter: "blur(2px)" }} />
              {/* Core line */}
              <div className="absolute top-0 bottom-0 rounded-full"
                style={{ background: NEON_G, width: "2px", margin: "0 auto", opacity: 0.9 }} />
            </div>

            {/* Items */}
            <div className="space-y-8">
              {day.items.map((item, ii) => {
                const isLeft = ii % 2 === 0;
                const entryDelay = ii * 80;
                return (
                  <div key={ii} className="relative grid grid-cols-[1fr_72px_1fr] items-center">

                    {/* Left card */}
                    <div className={`pr-6 ${isLeft ? "" : "invisible"}`}>
                      <EntryCard item={item} entryDelay={entryDelay} />
                    </div>

                    {/* Central node */}
                    <div className="flex justify-center items-center z-20 relative"
                      style={{ animation: `node-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${entryDelay}ms both` }}>
                      <TimelineNode type={item.type} />
                    </div>

                    {/* Right card */}
                    <div className={`pl-6 ${!isLeft ? "" : "invisible"}`}>
                      <EntryCard item={item} entryDelay={entryDelay} />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mobile: left-rail layout ── */}
          <div className="md:hidden relative">

            {/* Left neon rail */}
            <div className="absolute left-[18px] top-0 bottom-0 w-6 pointer-events-none">
              <div className="absolute inset-x-0 top-0 bottom-0 rounded-full"
                style={{ background: NEON_G, width: "8px", margin: "0 auto", filter: "blur(5px)", opacity: 0.2 }} />
              <div className="absolute top-0 bottom-0 rounded-full"
                style={{ background: NEON_G, width: "2px", margin: "0 auto", opacity: 0.7 }} />
            </div>

            <div className="pl-14 space-y-6">
              {day.items.map((item, ii) => {
                const cfg = typeConfig[item.type ?? "social"];
                const entryDelay = ii * 80;
                return (
                  <div key={ii} className="relative">
                    {/* Node on rail */}
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 z-20"
                      style={{ animation: `node-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${entryDelay}ms both` }}>
                      <TimelineNode type={item.type} />
                    </div>
                    <EntryCard item={item} entryDelay={entryDelay} />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Shared decorative components (hero)
═══════════════════════════════════════════════════════════════ */
function FloatingCard({ suit, size, style, animClass }: { suit: string; size: string; style?: React.CSSProperties; animClass: string }) {
  const isRed = suit === "♥" || suit === "♦";
  return (
    <div className={`absolute select-none pointer-events-none ${animClass} opacity-20`} style={style}>
      <div className={`${size} rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg`}>
        <span className={`font-bold ${isRed ? "text-rose-400" : "text-slate-200"}`} style={{ fontSize: "inherit" }}>{suit}</span>
      </div>
    </div>
  );
}

function Dice({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="32" cy="16" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="24" cy="24" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="16" cy="32" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="32" cy="32" r="3" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

function Chip({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="20" fill={color} fillOpacity="0.15" stroke={color} strokeOpacity="0.4" strokeWidth="2" />
      <circle cx="24" cy="24" r="14" fill={color} fillOpacity="0.1" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="24" cy="24" r="8" fill={color} fillOpacity="0.2" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <rect key={deg} x="22" y="4" width="4" height="6" rx="1" fill={color} fillOpacity="0.5" transform={`rotate(${deg} 24 24)`} />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function HelloWorldPage() {
  return (
    <div className="min-h-screen bg-[#080b10] text-white overflow-x-hidden">

      {/* Force dark mode on navbar & footer while on this route */}
      <ForceTheme theme="dark" />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a0e] via-[#080b10] to-[#0e0810]" />

        {/* Radial glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]"
            style={{ background: `radial-gradient(ellipse, ${NEON_G}18 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full blur-[100px]"
            style={{ background: `radial-gradient(ellipse, ${NEON_R}12 0%, transparent 70%)` }} />
          <div className="absolute top-10 right-10 w-80 h-80 rounded-full blur-[90px]"
            style={{ background: `radial-gradient(ellipse, ${GOLD}14 0%, transparent 70%)` }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Floating cards */}
        <FloatingCard suit="♠" size="w-14 h-20 text-2xl" animClass="animate-[float-slow_8s_ease-in-out_infinite]" style={{ top: "12%", left: "6%" }} />
        <FloatingCard suit="♥" size="w-16 h-24 text-3xl" animClass="animate-[float-mid_6s_ease-in-out_infinite]"  style={{ top: "8%", right: "8%", animationDelay: "1s" }} />
        <FloatingCard suit="♦" size="w-12 h-18 text-xl"  animClass="animate-[float-fast_4s_ease-in-out_infinite]" style={{ bottom: "20%", left: "12%", animationDelay: "2s" }} />
        <FloatingCard suit="♣" size="w-14 h-20 text-2xl" animClass="animate-[float-slow_7s_ease-in-out_infinite]" style={{ bottom: "15%", right: "6%", animationDelay: "1.5s" }} />
        <FloatingCard suit="♠" size="w-10 h-14 text-lg"  animClass="animate-[float-mid_5s_ease-in-out_infinite]"  style={{ top: "55%", left: "3%", animationDelay: "0.5s" }} />
        <FloatingCard suit="♥" size="w-12 h-16 text-xl"  animClass="animate-[float-fast_4.5s_ease-in-out_infinite]" style={{ top: "40%", right: "4%", animationDelay: "3s" }} />

        {/* Chips */}
        <div className="absolute top-[18%] left-[22%] w-12 h-12 opacity-30 animate-[float-fast_5s_ease-in-out_infinite]" style={{ animationDelay: "0.8s" }}><Chip color={GOLD} className="w-full h-full" /></div>
        <div className="absolute bottom-[25%] right-[20%] w-10 h-10 opacity-25 animate-[float-slow_9s_ease-in-out_infinite]" style={{ animationDelay: "2.2s" }}><Chip color={NEON_G} className="w-full h-full" /></div>
        <div className="absolute top-[60%] right-[18%] w-10 h-10 opacity-20 animate-[float-mid_7s_ease-in-out_infinite]" style={{ animationDelay: "1.2s" }}><Chip color={NEON_R} className="w-full h-full" /></div>

        {/* Dice */}
        <div className="absolute top-[30%] right-[22%] w-10 h-10 opacity-25 animate-[float-slow_8s_ease-in-out_infinite]" style={{ animationDelay: "1.7s" }}><Dice className="w-full h-full" /></div>
        <div className="absolute bottom-[30%] left-[20%] w-9 h-9 opacity-20 animate-[float-mid_6s_ease-in-out_infinite]" style={{ animationDelay: "0.3s" }}><Dice className="w-full h-full" /></div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center -mt-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-10 border"
            style={{ background: `${GOLD}18`, borderColor: `${GOLD}50`, color: GOLD }}>
            <span className="animate-[flicker_3s_ease-in-out_infinite]">♦</span>
            {hero.badge}
            <span className="animate-[flicker_3s_ease-in-out_infinite]" style={{ animationDelay: "0.5s" }}>♦</span>
          </div>

          <h1 className="text-7xl sm:text-[8rem] font-black tracking-tight leading-none mb-2">
            <span className="block" style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #fff8dc 40%, ${GOLD} 60%, #b8860b 100%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
              filter: `drop-shadow(0 0 30px ${GOLD}60)`,
            }}>Hello</span>
            <span className="block text-white" style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}>World</span>
          </h1>

          <div className="flex items-center justify-center gap-6 my-6 text-3xl">
            {["♠","♥","♦","♣"].map((s) => (
              <span key={s} className="opacity-70 hover:opacity-100 hover:scale-125 transition-all duration-300 cursor-default"
                style={{ color: s === "♥" || s === "♦" ? NEON_R : "#e2e8f0" }}>{s}</span>
            ))}
          </div>

          <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
            {hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={hero.primaryButton.href}
              className="group relative px-8 py-4 rounded-xl font-bold text-sm overflow-hidden w-full sm:w-auto text-center transition-all duration-300 hover:scale-105"
              style={{ background: `linear-gradient(135deg, #b8860b, ${GOLD}, #fffacd, ${GOLD}, #b8860b)`, backgroundSize: "300% auto", color: "#1a0a00" }}>
              <span className="relative z-10 tracking-wide">{hero.primaryButton.label}</span>
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </Link>
            <Link href={hero.secondaryButton.href}
              className="group px-8 py-4 rounded-xl font-bold text-sm w-full sm:w-auto text-center transition-all duration-300 hover:scale-105 border backdrop-blur-sm"
              style={{ borderColor: `${NEON_G}60`, background: `${NEON_G}12`, color: NEON_G, boxShadow: `0 0 20px ${NEON_G}20` }}>
              {hero.secondaryButton.label}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)` }} />
      </section>

      {/* ══════════════════════ HOUSES ══════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#080b10 0%,#0a0e14 100%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 blur-[80px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${GOLD}20, transparent 70%)` }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>— {houses.eyebrow} —</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">{houses.title}</h2>
            <div className="mt-4 mx-auto w-24 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {houses.items.map((house) => {
              const hs = houseNeon[house.key] ?? houseNeon.club;
              return (
                <div key={house.key}
                  className={`group relative overflow-hidden rounded-2xl p-7 text-center border ${hs.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 cursor-default`}
                  style={{ background: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px 4px ${hs.glow}, 0 20px 40px rgba(0,0,0,0.4)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                >
                  <span className="absolute top-3 left-3 text-xs font-bold opacity-40" style={{ color: hs.neon }}>{house.symbol}</span>
                  <span className="absolute bottom-3 right-3 text-xs font-bold opacity-40 rotate-180" style={{ color: hs.neon }}>{house.symbol}</span>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-24 h-24 rounded-full blur-2xl" style={{ background: hs.glow }} />
                  </div>
                  <div className="text-6xl mb-5 relative z-10 transition-all duration-300 group-hover:scale-110"
                    style={{ filter: `drop-shadow(0 0 12px ${hs.neon}80)` }}>{house.symbol}</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${hs.badge}`}>{house.name}</span>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{house.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ SCHEDULE ══════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#0a0e14 0%,#060c09 50%,#0a0e14 100%)" }}>
        {/* Felt dot texture */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: `radial-gradient(${NEON_G} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <p className="text-xs font-mono uppercase tracking-[0.3em] mb-3" style={{ color: NEON_G }}>— {schedule.eyebrow} —</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">{schedule.title}</h2>
            <div className="mt-4 mx-auto w-24 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${NEON_G}, transparent)` }} />
          </div>

          <CasinoTimeline days={schedule.days} />
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="py-28 px-4 relative overflow-hidden" style={{ background: "#080b10" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full blur-[120px]"
            style={{ background: `radial-gradient(ellipse, ${GOLD}22, transparent 70%)` }} />
        </div>

        <div className="absolute top-8 left-8 text-6xl opacity-10 select-none text-white">♠</div>
        <div className="absolute top-8 right-8 text-6xl opacity-10 select-none" style={{ color: NEON_R }}>♥</div>
        <div className="absolute bottom-8 left-8 text-6xl opacity-10 select-none" style={{ color: NEON_R }}>♦</div>
        <div className="absolute bottom-8 right-8 text-6xl opacity-10 select-none text-white">♣</div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60)` }} />
            <span className="text-xl" style={{ color: GOLD }}>♦</span>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${GOLD}60, transparent)` }} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white" style={{ textShadow: "0 0 30px rgba(255,255,255,0.1)" }}>
            {cta.title}
          </h2>
          <p className="mb-10 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{cta.description}</p>
          <Link href={cta.button.href}
            className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-base tracking-wide overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #7c5c00, ${GOLD}, #fffacd, ${GOLD}, #7c5c00)`,
              backgroundSize: "300% auto", color: "#1a0800",
              boxShadow: `0 0 30px ${GOLD}40, 0 10px 30px rgba(0,0,0,0.5)`,
              animation: "shimmer 3s linear infinite",
            }}>
            <span className="text-lg">🃏</span>
            {cta.button.label}
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </Link>
          <p className="mt-6 text-xs" style={{ color: `${GOLD}70` }}>♠ ♥ ♦ ♣ — ค้นพบบ้านของคุณ</p>
        </div>
      </section>

    </div>
  );
}
