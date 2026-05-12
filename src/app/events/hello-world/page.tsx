"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ForceTheme } from "@/components/providers/ForceTheme";
import { helloWorldConfig } from "@/config/events/hello-world";
import type { TimelineItem, TimelineDay } from "@/components/ui/Timeline";

const { hero, houses, schedule, cta } = helloWorldConfig;

/* ── Cartoon-faithful palette ────────────────────────────────── */
const AMBER  = "#D97706";   // amber-600 — throughline accent
const TEXT_D = "#1C1917";
const TEXT_M = "#57534E";

/* ── House color map — design-spec faithful ──────────────────── */
const houseColor: Record<string, {
  bg: string; border: string; textColor: string;
  badgeColor: string; badgeText: string; shadow: string; imgBg: string;
  imgW: number; imgH: number;
}> = {
  // SpongeBob — yellow body + pink accent
  spongebob:   { bg: "#FEF9C3", border: "#EC4899", textColor: "#831843", badgeColor: "#EC4899", badgeText: "#ffffff", shadow: "rgba(236,72,153,0.38)", imgBg: "#ffffff", imgW: 395, imgH: 632 },
  // Conan — blue suit + red bowtie
  conan:       { bg: "#DBEAFE", border: "#DC2626", textColor: "#7F1D1D", badgeColor: "#DC2626", badgeText: "#ffffff", shadow: "rgba(220,38,38,0.38)",  imgBg: "#ffffff", imgW: 535, imgH: 466 },
  // Kung Fu Panda — green dragon + gold accents
  kungfupanda: { bg: "#DCFCE7", border: "#CA8A04", textColor: "#14532D", badgeColor: "#CA8A04", badgeText: "#ffffff", shadow: "rgba(202,138,4,0.38)",  imgBg: "#ffffff", imgW: 432, imgH: 578 },
  // Zootopia — Judy's gray + Nick's orange
  zootopia:    { bg: "#F3F4F6", border: "#F97316", textColor: "#7C2D12", badgeColor: "#F97316", badgeText: "#ffffff", shadow: "rgba(249,115,22,0.38)", imgBg: "#ffffff", imgW: 400, imgH: 588 },
  // Toy Story — Buzz purple + white
  toystory:    { bg: "#F5F3FF", border: "#9333EA", textColor: "#4C1D95", badgeColor: "#9333EA", badgeText: "#ffffff", shadow: "rgba(147,51,234,0.38)", imgBg: "#ffffff", imgW: 577, imgH: 433 },
};

/* ── Timeline type config ────────────────────────────────────── */
const typeConfig: Record<string, { badge: string; nodeColor: string; nodeBg: string }> = {
  talk:     { badge: "bg-amber-100 text-amber-800 border-amber-300",   nodeColor: "#D97706", nodeBg: "#FEF3C7" },
  workshop: { badge: "bg-green-100 text-green-800 border-green-300",   nodeColor: "#15803D", nodeBg: "#DCFCE7" },
  break:    { badge: "bg-sky-100 text-sky-800 border-sky-300",         nodeColor: "#0284C7", nodeBg: "#E0F2FE" },
  social:   { badge: "bg-orange-100 text-orange-800 border-orange-300",nodeColor: "#EA580C", nodeBg: "#FFEDD5" },
};
const TYPE_EMOJI: Record<string, string> = { talk: "🎬", workshop: "🎨", break: "🍿", social: "✨" };

function CartoonNode({ type }: { type?: string }) {
  const cfg = typeConfig[type ?? "social"] ?? typeConfig.social;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      background: cfg.nodeBg, border: `2.5px solid ${cfg.nodeColor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, boxShadow: `0 4px 14px ${cfg.nodeColor}55`, flexShrink: 0,
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
const EntryCard = React.memo(function EntryCard({ item, entryDelay }: { item: TimelineItem; entryDelay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } }, { threshold: 0.25 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  const cfg = typeConfig[item.type ?? "social"] ?? typeConfig.social;
  return (
    <div ref={ref} className="rounded-2xl p-4 border-2 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: `${cfg.nodeColor}40`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-mono tabular-nums font-bold" style={{ color: cfg.nodeColor }}>{item.time}</span>
        {item.type && <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.badge}`}>{item.type}</span>}
      </div>
      <h3 className="font-bold text-sm leading-snug mb-1 overflow-hidden" style={{ color: TEXT_D }}>
        {item.title.split(" ").map((word, wi) => (
          <SlotReveal key={wi} text={word + " "} delay={entryDelay + wi * 60} triggered={triggered} />
        ))}
      </h3>
      {item.description && <p className="text-xs leading-relaxed" style={{ color: TEXT_M }}>{item.description}</p>}
    </div>
  );
});

/* ── Timeline ────────────────────────────────────────────────── */
function CartoonTimeline({ days }: { days: TimelineDay[] }) {
  return (
    <div className="space-y-16">
      {days.map((day, di) => (
        <div key={di}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: AMBER, boxShadow: `0 0 10px ${AMBER}90` }} />
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${AMBER}80, transparent)` }} />
            <div className="text-center px-4">
              <p className="text-base font-black" style={{ color: TEXT_D }}>{day.day}</p>
              <p className="text-xs mt-0.5" style={{ color: TEXT_M }}>{day.date}</p>
            </div>
            <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${AMBER}80, transparent)` }} />
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: AMBER, boxShadow: `0 0 10px ${AMBER}90` }} />
          </div>
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px"
              style={{ background: `linear-gradient(180deg, transparent, ${AMBER}60 8%, ${AMBER}60 92%, transparent)` }} />
            <div className="space-y-6">
              {day.items.map((item, ii) => {
                const isLeft = ii % 2 === 0;
                return (
                  <div key={ii} className="relative grid grid-cols-[1fr_80px_1fr] items-center">
                    {isLeft  ? <div className="pr-6"><EntryCard item={item} entryDelay={ii * 80} /></div> : <div />}
                    <div className="flex justify-center z-20"><CartoonNode type={item.type} /></div>
                    {!isLeft ? <div className="pl-6"><EntryCard item={item} entryDelay={ii * 80} /></div> : <div />}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="md:hidden relative">
            <div className="absolute left-[21px] top-0 bottom-0 w-px rounded-full" style={{ background: `${AMBER}60` }} />
            <div className="pl-14 space-y-5">
              {day.items.map((item, ii) => (
                <div key={ii} className="relative">
                  <div className="absolute -left-9 top-1/2 -translate-y-1/2 z-20"><CartoonNode type={item.type} /></div>
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

/* ── Floating cartoon bubble ─────────────────────────────────── */
function CartoonBubble({ emoji, bg, style, animClass, className = "" }: { emoji: string; bg: string; style?: React.CSSProperties; animClass: string; className?: string }) {
  return (
    <div aria-hidden="true" className={`absolute select-none pointer-events-none ${animClass} ${className}`} style={style}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: bg, border: "2px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
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
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FFFFFF", color: TEXT_D }}>
      <ForceTheme theme="light" />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section
        aria-labelledby="hw-hero-heading"
        className="relative min-h-screen flex items-center px-4 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #BAE6FD 0%, #FEF08A 48%, #FED7AA 100%)" }}
      >
        {/* Ambient glows — one per cartoon house */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-10 w-96 h-96 rounded-full blur-[110px]" style={{ background: "rgba(254,240,138,0.75)" }} />
          <div className="absolute top-10 right-0 w-80 h-80 rounded-full blur-[100px]"  style={{ background: "rgba(186,230,253,0.65)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[90px]"  style={{ background: "rgba(187,247,208,0.55)" }} />
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full blur-[90px]" style={{ background: "rgba(254,215,170,0.65)" }} />
        </div>

        {/* Floating house-colored bubbles */}
        {!reducedMotion && (
          <>
            <CartoonBubble emoji="🧽" bg="#FDE047" animClass="animate-[float-slow_8s_ease-in-out_infinite]"   style={{ top: "14%", left: "4%" }} />
            <CartoonBubble emoji="🔍" bg="#93C5FD" animClass="animate-[float-mid_6s_ease-in-out_infinite]"    style={{ top: "20%", left: "18%", animationDelay: "1.2s" }} className="hidden sm:block" />
            <CartoonBubble emoji="🐼" bg="#86EFAC" animClass="animate-[float-fast_4.5s_ease-in-out_infinite]" style={{ bottom: "28%", left: "6%", animationDelay: "2s" }} />
            <CartoonBubble emoji="🚀" bg="#C4B5FD" animClass="animate-[float-slow_7s_ease-in-out_infinite]"   style={{ bottom: "18%", left: "22%", animationDelay: "0.5s" }} className="hidden sm:block" />
            <CartoonBubble emoji="🦊" bg="#D1D5DB" animClass="animate-[float-mid_5.5s_ease-in-out_infinite]"  style={{ top: "55%", left: "2%", animationDelay: "1.5s" }} />
            <CartoonBubble emoji="⭐" bg="#FDE047" animClass="animate-[float-fast_4s_ease-in-out_infinite]"   style={{ top: "8%", left: "42%", animationDelay: "0.8s" }} className="hidden sm:block" />
          </>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-6 py-24">

          {/* ── Text side ── */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
              style={{ background: "rgba(255,255,255,0.85)", border: "2px solid #CA8A04", color: "#713F12" }}>
              <span aria-hidden="true">🎬</span> {hero.badge}
            </div>

            <h1 id="hw-hero-heading" className="font-display font-black tracking-tight leading-[0.9] mb-5">
              <span className="block" style={{
                fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
                color: "#92400E",
                textShadow: `3px 3px 0 rgba(202,138,4,0.25), 0 8px 28px rgba(202,138,4,0.2)`,
              }}>Hello</span>
              <span className="block" style={{
                fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
                color: TEXT_D,
                textShadow: `2px 2px 0 rgba(0,0,0,0.08)`,
              }}>World</span>
            </h1>

            {/* House emoji strip — colored dots */}
            <div aria-hidden="true" className="flex items-center justify-center lg:justify-start gap-2 my-5">
              {[
                { e: "🧽", bg: "#FDE047" },
                { e: "🔍", bg: "#93C5FD" },
                { e: "🐼", bg: "#86EFAC" },
                { e: "🦊", bg: "#D1D5DB" },
                { e: "🚀", bg: "#C4B5FD" },
              ].map(({ e, bg }) => (
                <span key={e}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl hover:scale-125 transition-transform duration-200 cursor-default"
                  style={{ background: bg, boxShadow: `0 4px 12px ${bg}90` }}>
                  {e}
                </span>
              ))}
            </div>

            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: TEXT_M }}>
              {hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href={hero.primaryButton.href}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm w-full sm:w-auto text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ background: "#D97706", color: "#FFFFFF", boxShadow: "0 6px 24px rgba(217,119,6,0.45)" }}
              >
                {hero.primaryButton.label}
              </Link>
              <Link
                href={hero.secondaryButton.href}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm w-full sm:w-auto text-center transition-all duration-300 hover:scale-105 border-2"
                style={{ background: "rgba(255,255,255,0.85)", borderColor: "#0284C7", color: "#075985" }}
              >
                {hero.secondaryButton.label}
              </Link>
            </div>
          </div>

          {/* ── Hero characters image ── */}
          <div className="flex-shrink-0 flex items-end justify-center w-full lg:w-auto relative">
            <div aria-hidden="true" className="absolute rounded-full pointer-events-none"
              style={{ width: 400, height: 300, background: "radial-gradient(circle, rgba(253,215,170,0.7) 0%, transparent 70%)", right: "0%", bottom: "0%" }} />
            <Image
              src="/herosectionimage.png"
              alt="Po, SpongeBob, Woody, Conan, Nick and Judy — all five houses"
              width={677}
              height={369}
              loading="eager"
              preload
              sizes="(max-width: 1024px) 90vw, 540px"
              className="relative z-10"
              style={{
                width: "clamp(280px, 48vw, 540px)", height: "auto", objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.14))",
              }}
            />
          </div>
        </div>

        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #FFFFFF)" }} />
      </section>

      {/* ══════════════════════ HOUSES ══════════════════════ */}
      <section aria-labelledby="hw-houses-heading" className="py-24 px-4" style={{ background: "#FFFBF4" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-3" style={{ color: AMBER }}>
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
              const hc = houseColor[house.key] ?? houseColor.toystory;
              return (
                <Link
                  key={house.key}
                  href="/events/hello-world/reveal"
                  aria-label={`บ้าน${house.name} — กดเพื่อเปิดเผยบ้านของคุณ`}
                  className="group relative overflow-hidden rounded-3xl border-[3px] transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
                  style={{ background: hc.bg, borderColor: hc.border, boxShadow: `0 6px 24px ${hc.shadow}`, "--tw-ring-color": hc.border } as React.CSSProperties}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 18px 44px ${hc.shadow}, 0 4px 12px rgba(0,0,0,0.08)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 24px ${hc.shadow}`; }}
                >
                  {/* Character image area */}
                  <div className="relative flex items-end justify-center overflow-hidden"
                    style={{ height: 190, background: hc.imgBg }}>
                    <Image
                      src={house.image}
                      alt=""
                      width={hc.imgW}
                      height={hc.imgH}
                      loading="lazy"
                      sizes="200px"
                      className="transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2"
                      style={{ height: 175, width: "auto", objectFit: "contain", mixBlendMode: "multiply", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.18))" }}
                    />
                  </div>
                  {/* Info */}
                  <div className="p-4 text-center">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                      style={{ background: hc.badgeColor, color: hc.badgeText }}
                    >
                      {house.symbol} {house.name}
                    </span>
                    <p className="text-xs leading-relaxed font-medium" style={{ color: hc.textColor }}>{house.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ SCHEDULE ══════════════════════ */}
      <section aria-labelledby="hw-schedule-heading" className="py-24 px-4" style={{ background: "#F0F9FF" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-3" style={{ color: AMBER }}>
              — {schedule.eyebrow} —
            </p>
            <h2 id="hw-schedule-heading" className="font-display text-4xl sm:text-5xl font-black" style={{ color: TEXT_D }}>
              {schedule.title}
            </h2>
            <div className="mt-4 mx-auto w-20 h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)` }} />
          </div>
          <CartoonTimeline days={schedule.days} />
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section
        aria-labelledby="hw-cta-heading"
        className="py-28 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FEF08A 0%, #FED7AA 50%, #BAE6FD 100%)" }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: "rgba(2,132,199,0.25)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[100px]"  style={{ background: "rgba(234,88,12,0.25)" }} />
        </div>

        {/* Corner characters */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 pointer-events-none select-none" style={{ opacity: 0.35 }}>
          <Image
            src="/toystory_friend1.png"
            alt=""
            width={482}
            height={517}
            loading="lazy"
            sizes="260px"
            style={{ height: "clamp(160px, 30vw, 260px)", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }}
          />
        </div>
        <div aria-hidden="true" className="absolute bottom-0 right-0 pointer-events-none select-none" style={{ opacity: 0.35 }}>
          <Image
            src="/toystory_friend2.png"
            alt=""
            width={490}
            height={509}
            loading="lazy"
            sizes="260px"
            style={{ height: "clamp(160px, 30vw, 260px)", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }}
          />
        </div>
        <div aria-hidden="true" className="absolute top-0 right-0 pointer-events-none select-none" style={{ opacity: 0.35 }}>
          <Image
            src="/toystory_friend3.png"
            alt=""
            width={523}
            height={477}
            loading="lazy"
            sizes="220px"
            style={{ height: "clamp(130px, 26vw, 220px)", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }}
          />
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 id="hw-cta-heading" className="font-display text-4xl sm:text-5xl font-black mb-4" style={{ color: TEXT_D }}>
            {cta.title}
          </h2>
          <p className="mb-10 text-base leading-relaxed" style={{ color: TEXT_M }}>
            {cta.description}
          </p>
          <Link
            href={cta.button.href}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300 hover:scale-105"
            style={{ background: "#D97706", color: "#FFFFFF", boxShadow: "0 8px 32px rgba(217,119,6,0.45)" }}
          >
            <span aria-hidden="true">🎉</span> {cta.button.label}
          </Link>
          <div aria-hidden="true" className="mt-8 flex justify-center gap-3">
            {[
              { e: "🧽", bg: "#FDE047" }, { e: "🔍", bg: "#93C5FD" }, { e: "🐼", bg: "#86EFAC" },
              { e: "🦊", bg: "#D1D5DB" }, { e: "🚀", bg: "#C4B5FD" },
            ].map(({ e, bg }) => (
              <span key={e} className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                style={{ background: bg, boxShadow: `0 3px 10px ${bg}90` }}>{e}</span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
