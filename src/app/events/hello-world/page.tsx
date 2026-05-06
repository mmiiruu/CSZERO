"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ForceTheme } from "@/components/providers/ForceTheme";
import { helloWorldConfig } from "@/config/events/hello-world";
import type { TimelineItem, TimelineDay } from "@/components/ui/Timeline";

const { hero, houses, schedule, cta } = helloWorldConfig;

/* ── Pastel palette ───────────────────────────────────────────── */
const AMBER  = "#F59E0B";
const SKY    = "#38BDF8";
const CORAL  = "#FB923C";
const SAGE   = "#22C55E";
const TEXT_D = "#1C1917";
const TEXT_M = "#78716C";

/* ── House pastel map ────────────────────────────────────────── */
const housePastel: Record<string, {
  bg: string; border: string; textColor: string;
  badgeBg: string; badgeText: string; shadow: string; imgBg: string;
}> = {
  spongebob:   { bg: "#FEFCE8", border: "#FCD34D", textColor: "#92400E", badgeBg: "bg-yellow-100", badgeText: "text-yellow-800", shadow: "rgba(252,211,77,0.45)",  imgBg: "rgba(253,230,138,0.4)"  },
  conan:       { bg: "#FFF1F2", border: "#FCA5A5", textColor: "#991B1B", badgeBg: "bg-red-100",    badgeText: "text-red-800",    shadow: "rgba(252,165,165,0.45)", imgBg: "rgba(254,202,202,0.35)" },
  kungfupanda: { bg: "#F0FDF4", border: "#86EFAC", textColor: "#166534", badgeBg: "bg-green-100",  badgeText: "text-green-800",  shadow: "rgba(134,239,172,0.45)", imgBg: "rgba(187,247,208,0.35)" },
  zootopia:    { bg: "#FFF7ED", border: "#FDBA74", textColor: "#9A3412", badgeBg: "bg-orange-100", badgeText: "text-orange-800", shadow: "rgba(253,186,116,0.45)", imgBg: "rgba(253,224,178,0.35)" },
  toystory:    { bg: "#EFF6FF", border: "#93C5FD", textColor: "#1E40AF", badgeBg: "bg-blue-100",   badgeText: "text-blue-800",   shadow: "rgba(147,197,253,0.45)", imgBg: "rgba(191,219,254,0.35)" },
};

/* ── Timeline type config ────────────────────────────────────── */
const typeConfig: Record<string, { label: string; badge: string; nodeColor: string; nodeBg: string }> = {
  talk:     { label: "talk",     badge: "bg-amber-100 text-amber-700 border-amber-200",    nodeColor: AMBER, nodeBg: "#FFFBEB" },
  workshop: { label: "workshop", badge: "bg-green-100 text-green-700 border-green-200",    nodeColor: SAGE,  nodeBg: "#F0FDF4" },
  break:    { label: "break",    badge: "bg-sky-100 text-sky-700 border-sky-200",          nodeColor: SKY,   nodeBg: "#F0F9FF" },
  social:   { label: "social",   badge: "bg-orange-100 text-orange-700 border-orange-200", nodeColor: CORAL, nodeBg: "#FFF7ED" },
};

const TYPE_EMOJI: Record<string, string> = { talk: "🎬", workshop: "🎨", break: "🍿", social: "✨" };

function CartoonNode({ type }: { type?: string }) {
  const cfg = typeConfig[type ?? "social"] ?? typeConfig.social;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      background: cfg.nodeBg, border: `2.5px solid ${cfg.nodeColor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, boxShadow: `0 4px 14px ${cfg.nodeColor}50`, flexShrink: 0,
    }}>
      {TYPE_EMOJI[type ?? "social"] ?? "✨"}
    </div>
  );
}

/* ── Slot-machine text reveal ────────────────────────────────── */
function SlotReveal({ text, delay = 0, triggered }: { text: string; delay?: number; triggered: boolean }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <span style={{
        display: "inline-block",
        animation: triggered ? `slot-reveal 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` : "none",
        opacity: triggered ? 1 : 0,
      }}>
        {text}
      </span>
    </span>
  );
}

/* ── Timeline entry card ─────────────────────────────────────── */
function EntryCard({ item, entryDelay }: { item: TimelineItem; entryDelay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cfg = typeConfig[item.type ?? "social"] ?? typeConfig.social;
  return (
    <div
      ref={ref}
      className="rounded-2xl p-4 border-2 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: `${cfg.nodeColor}50`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-mono tabular-nums font-bold" style={{ color: cfg.nodeColor }}>{item.time}</span>
        {item.type && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.badge}`}>{item.type}</span>
        )}
      </div>
      <h4 className="font-bold text-sm leading-snug mb-1 overflow-hidden" style={{ color: TEXT_D }}>
        {item.title.split(" ").map((word, wi) => (
          <SlotReveal key={wi} text={word + " "} delay={entryDelay + wi * 60} triggered={triggered} />
        ))}
      </h4>
      {item.description && (
        <p className="text-xs leading-relaxed" style={{ color: TEXT_M }}>{item.description}</p>
      )}
    </div>
  );
}

/* ── Pastel timeline ─────────────────────────────────────────── */
function PastelTimeline({ days }: { days: TimelineDay[] }) {
  return (
    <div className="space-y-16">
      {days.map((day, di) => (
        <div key={di}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: AMBER, boxShadow: `0 0 10px ${AMBER}80` }} />
            <div className="h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${AMBER}60, transparent)` }} />
            <div className="text-center px-4">
              <p className="text-base font-black" style={{ color: TEXT_D }}>{day.day}</p>
              <p className="text-xs mt-0.5" style={{ color: TEXT_M }}>{day.date}</p>
            </div>
            <div className="h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(270deg, ${AMBER}60, transparent)` }} />
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: AMBER, boxShadow: `0 0 10px ${AMBER}80` }} />
          </div>

          {/* Desktop: two-column */}
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px"
              style={{ background: `linear-gradient(180deg, transparent, ${AMBER}50 8%, ${AMBER}50 92%, transparent)` }} />
            <div className="space-y-6">
              {day.items.map((item, ii) => {
                const isLeft = ii % 2 === 0;
                const d = ii * 80;
                return (
                  <div key={ii} className="relative grid grid-cols-[1fr_80px_1fr] items-center">
                    <div className={`pr-6 ${isLeft ? "" : "invisible"}`}><EntryCard item={item} entryDelay={d} /></div>
                    <div className="flex justify-center z-20"><CartoonNode type={item.type} /></div>
                    <div className={`pl-6 ${!isLeft ? "" : "invisible"}`}><EntryCard item={item} entryDelay={d} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: left-rail */}
          <div className="md:hidden relative">
            <div className="absolute left-[21px] top-0 bottom-0 w-0.5 rounded-full" style={{ background: `${AMBER}40` }} />
            <div className="pl-14 space-y-5">
              {day.items.map((item, ii) => (
                <div key={ii} className="relative">
                  <div className="absolute -left-9 top-1/2 -translate-y-1/2 z-20">
                    <CartoonNode type={item.type} />
                  </div>
                  <EntryCard item={item} entryDelay={ii * 80} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Floating pastel bubble ──────────────────────────────────── */
function PastelBubble({ emoji, style, animClass }: { emoji: string; style?: React.CSSProperties; animClass: string }) {
  return (
    <div aria-hidden="true" className={`absolute select-none pointer-events-none ${animClass}`} style={style}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        {emoji}
      </div>
    </div>
  );
}

/* ── Reduced-motion hook ─────────────────────────────────────── */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function HelloWorldPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FFFBF4", color: TEXT_D }}>
      <ForceTheme theme="light" />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section
        aria-labelledby="hw-hero-heading"
        className="relative min-h-screen flex items-center px-4 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #DBEFFE 0%, #FFFBEB 50%, #FFE8F4 100%)" }}
      >
        {/* Ambient glows */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: "rgba(186,230,253,0.55)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: "rgba(253,230,138,0.45)" }} />
          <div className="absolute bottom-10 left-0 w-[300px] h-[300px] rounded-full blur-[80px]"
            style={{ background: "rgba(253,186,116,0.35)" }} />
        </div>

        {/* Floating cartoon bubbles */}
        {!reducedMotion && (
          <>
            <PastelBubble emoji="🧽" animClass="animate-[float-slow_8s_ease-in-out_infinite] opacity-90"   style={{ top: "14%", left: "4%" }} />
            <PastelBubble emoji="🔍" animClass="animate-[float-mid_6s_ease-in-out_infinite] opacity-90"    style={{ top: "22%", left: "18%", animationDelay: "1.2s" }} />
            <PastelBubble emoji="🐼" animClass="animate-[float-fast_4.5s_ease-in-out_infinite] opacity-90" style={{ bottom: "28%", left: "6%", animationDelay: "2s" }} />
            <PastelBubble emoji="🚀" animClass="animate-[float-slow_7s_ease-in-out_infinite] opacity-90"   style={{ bottom: "16%", left: "22%", animationDelay: "0.5s" }} />
            <PastelBubble emoji="⭐" animClass="animate-[float-mid_5.5s_ease-in-out_infinite] opacity-80"  style={{ top: "55%", left: "2%", animationDelay: "1.5s" }} />
            <PastelBubble emoji="🎬" animClass="animate-[float-fast_4s_ease-in-out_infinite] opacity-80"   style={{ top: "8%", left: "38%", animationDelay: "0.8s" }} />
          </>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-6 py-24">

          {/* ── Text side ── */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border"
              style={{ background: "rgba(255,255,255,0.8)", borderColor: `${AMBER}70`, color: "#B45309" }}>
              🎬 {hero.badge}
            </div>

            <h1 id="hw-hero-heading" className="font-display font-black tracking-tight leading-[0.9] mb-5">
              <span className="block" style={{
                fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
                color: AMBER,
                textShadow: `3px 3px 0 rgba(180,83,9,0.2), 0 8px 28px rgba(245,158,11,0.18)`,
              }}>Hello</span>
              <span className="block" style={{
                fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
                color: TEXT_D,
                textShadow: `2px 2px 0 rgba(0,0,0,0.07)`,
              }}>World</span>
            </h1>

            <div aria-hidden="true" className="flex items-center justify-center lg:justify-start gap-3 my-5 text-[2rem]">
              {["🧽","🔍","🐼","🦊","🚀"].map((e) => (
                <span key={e} className="hover:scale-125 transition-transform duration-200 cursor-default"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.12))" }}>{e}</span>
              ))}
            </div>

            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: TEXT_M }}>
              {hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href={hero.primaryButton.href}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm w-full sm:w-auto text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
                  color: "#1C1917",
                  boxShadow: "0 6px 24px rgba(245,158,11,0.35)",
                }}
              >
                {hero.primaryButton.label}
              </Link>
              <Link
                href={hero.secondaryButton.href}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm w-full sm:w-auto text-center transition-all duration-300 hover:scale-105 border-2 bg-white/80 backdrop-blur-sm"
                style={{ borderColor: SKY, color: "#0369A1" }}
              >
                {hero.secondaryButton.label}
              </Link>
            </div>
          </div>

          {/* ── Zootopia image side ── */}
          <div className="flex-shrink-0 flex items-end justify-center w-full lg:w-auto">
            <div aria-hidden="true" className="absolute rounded-full pointer-events-none"
              style={{
                width: 320, height: 320,
                background: "radial-gradient(circle, rgba(253,186,116,0.5) 0%, transparent 70%)",
                right: "5%", bottom: "5%",
              }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zootopia_couple.png"
              alt="Nick Wilde and Judy Hopps from Zootopia"
              className="relative z-10"
              style={{
                height: "clamp(260px, 44vh, 460px)",
                width: "auto",
                objectFit: "contain",
                mixBlendMode: "multiply",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12))",
              }}
            />
          </div>

        </div>

        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #FFFBF4)" }} />
      </section>

      {/* ══════════════════════ HOUSES ══════════════════════ */}
      <section aria-labelledby="hw-houses-heading" className="py-24 px-4" style={{ background: "#FFFBF4" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: AMBER }}>
              — {houses.eyebrow} —
            </p>
            <h2 id="hw-houses-heading" className="font-display text-4xl sm:text-5xl font-black" style={{ color: TEXT_D }}>
              {houses.title}
            </h2>
            <div className="mt-4 mx-auto w-20 h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)` }} />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {houses.items.map((house) => {
              const hp = housePastel[house.key] ?? housePastel.toystory;
              return (
                <div
                  key={house.key}
                  className="group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 hover:scale-[1.04] hover:-translate-y-2 cursor-default"
                  style={{
                    background: hp.bg,
                    borderColor: hp.border,
                    boxShadow: `0 4px 20px ${hp.shadow}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${hp.shadow}, 0 4px 12px rgba(0,0,0,0.07)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${hp.shadow}`;
                  }}
                >
                  {/* Character image area */}
                  <div
                    className="relative flex items-end justify-center overflow-hidden"
                    style={{ height: 160, background: hp.imgBg }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={house.image}
                      alt={`${house.name} character`}
                      className="transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
                      style={{
                        height: 145,
                        width: "auto",
                        objectFit: "contain",
                        mixBlendMode: "multiply",
                        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.12))",
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${hp.badgeBg} ${hp.badgeText}`}>
                      {house.symbol} {house.name}
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: hp.textColor }}>{house.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ SCHEDULE ══════════════════════ */}
      <section aria-labelledby="hw-schedule-heading" className="py-24 px-4" style={{ background: "#F0FBF7" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: AMBER }}>
              — {schedule.eyebrow} —
            </p>
            <h2 id="hw-schedule-heading" className="font-display text-4xl sm:text-5xl font-black" style={{ color: TEXT_D }}>
              {schedule.title}
            </h2>
            <div className="mt-4 mx-auto w-20 h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)` }} />
          </div>
          <PastelTimeline days={schedule.days} />
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section
        aria-labelledby="hw-cta-heading"
        className="py-28 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FFEDD5 100%)" }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[90px]"
            style={{ background: "rgba(253,186,116,0.4)" }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[90px]"
            style={{ background: "rgba(186,230,253,0.4)" }} />
        </div>

        {/* Cartoon characters peeking at bottom */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 flex justify-around items-end px-8 pointer-events-none overflow-hidden">
          {["/spongebob.png", "/conan_stand.png", "/toystory_woody.png"].map((src, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={src}
              src={src}
              alt=""
              className="opacity-20"
              style={{
                height: 120,
                width: "auto",
                objectFit: "contain",
                mixBlendMode: "multiply",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="text-5xl mb-6 animate-[float-slow_4s_ease-in-out_infinite]">🎬</div>
          <h2 id="hw-cta-heading" className="font-display text-4xl sm:text-5xl font-black mb-4" style={{ color: TEXT_D }}>
            {cta.title}
          </h2>
          <p className="mb-10 text-base leading-relaxed" style={{ color: TEXT_M }}>
            {cta.description}
          </p>
          <Link
            href={cta.button.href}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)",
              color: "#1C1917",
              boxShadow: "0 8px 32px rgba(245,158,11,0.38)",
            }}
          >
            🎉 {cta.button.label}
          </Link>
          <p className="mt-6 text-sm" style={{ color: TEXT_M }}>
            🧽 🔍 🐼 🦊 🚀 — ค้นพบบ้านของคุณ
          </p>
        </div>
      </section>

    </div>
  );
}
