"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ForceTheme } from "@/components/providers/ForceTheme";
import { helloWorldConfig } from "@/config/events/hello-world";
import type { TimelineItem, TimelineDay } from "@/components/ui/Timeline";

const { hero, houses, schedule, cta } = helloWorldConfig;

/* ── Cartoon palette ─────────────────────────────────────────── */
const STAR_YELLOW    = "#FACC15";
const CARTOON_GREEN  = "#4ADE80";
const CARTOON_ORANGE = "#FB923C";
const CARTOON_BLUE   = "#60A5FA";
const CARTOON_RED    = "#EF4444";

/* ── House accent map ────────────────────────────────────────── */
const houseNeon: Record<string, { neon: string; glow: string; border: string; badge: string }> = {
  spongebob:   { neon: "#FCD34D", glow: "rgba(252,211,77,0.40)",  border: "border-yellow-400/40",  badge: "bg-yellow-900/60 text-yellow-300"  },
  conan:       { neon: "#EF4444", glow: "rgba(239,68,68,0.40)",   border: "border-red-400/40",     badge: "bg-red-900/60 text-red-300"        },
  kungfupanda: { neon: "#4ADE80", glow: "rgba(74,222,128,0.40)",  border: "border-green-400/40",   badge: "bg-green-900/60 text-green-300"    },
  zootopia:    { neon: "#FB923C", glow: "rgba(251,146,60,0.40)",  border: "border-orange-400/40",  badge: "bg-orange-900/60 text-orange-300"  },
  toystory:    { neon: "#60A5FA", glow: "rgba(96,165,250,0.40)",  border: "border-blue-400/40",    badge: "bg-blue-900/60 text-blue-300"      },
};

/* ── Timeline type config ────────────────────────────────────── */
const typeConfig: Record<string, { label: string; badge: string; nodeColor: string; glowColor: string }> = {
  talk:     { label: "talk",     badge: "bg-yellow-900/50 text-yellow-300 border-yellow-600/40",    nodeColor: STAR_YELLOW,    glowColor: `${STAR_YELLOW}80`    },
  workshop: { label: "workshop", badge: "bg-green-900/50 text-green-300 border-green-600/40",        nodeColor: CARTOON_GREEN,  glowColor: `${CARTOON_GREEN}80`  },
  break:    { label: "break",    badge: "bg-blue-900/50 text-blue-300 border-blue-600/40",            nodeColor: CARTOON_BLUE,   glowColor: `${CARTOON_BLUE}80`   },
  social:   { label: "social",   badge: "bg-orange-900/50 text-orange-300 border-orange-600/40",     nodeColor: CARTOON_ORANGE, glowColor: `${CARTOON_ORANGE}80` },
};

/* ═══════════════════════════════════════════════════════════════
   Cartoon timeline node — emoji in a glowing circle
═══════════════════════════════════════════════════════════════ */
const TYPE_EMOJI: Record<string, string> = { talk: "🎬", workshop: "🎨", break: "🍿", social: "✨" };

function CartoonNode({ type }: { type?: string }) {
  const cfg = typeConfig[type ?? "social"] ?? typeConfig.social;
  const emoji = TYPE_EMOJI[type ?? "social"] ?? "✨";
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: `radial-gradient(circle, ${cfg.nodeColor}25 0%, ${cfg.nodeColor}08 100%)`,
      border: `2px solid ${cfg.nodeColor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18,
      filter: `drop-shadow(0 0 8px ${cfg.nodeColor}80)`,
    }}>
      {emoji}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Slot-machine text reveal (IntersectionObserver triggered)
═══════════════════════════════════════════════════════════════ */
function SlotReveal({ text, delay = 0, className = "", triggered }: { text: string; delay?: number; className?: string; triggered: boolean }) {
  return (
    <span className={`inline-block overflow-hidden align-bottom ${className}`}>
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

/* ═══════════════════════════════════════════════════════════════
   Flying cartoon emoji on entry card hover
═══════════════════════════════════════════════════════════════ */
const CARTOON_EMOJIS = ["🧽", "🔍", "🐼", "🦊", "🚀"];

function FlyingEmoji({ emoji, delay, top }: { emoji: string; delay: number; top: number }) {
  return (
    <span
      className="absolute pointer-events-none select-none text-base"
      style={{ top: `${top}%`, left: "5%", opacity: 0, animation: `card-fly 1.2s ease-in-out ${delay}ms forwards` }}
    >
      {emoji}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Entry card (with slot reveal + flying emoji)
═══════════════════════════════════════════════════════════════ */
function EntryCard({ item, entryDelay, index }: { item: TimelineItem; entryDelay: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cfg = typeConfig[item.type ?? "social"] ?? typeConfig.social;
  const emoji = CARTOON_EMOJIS[index % CARTOON_EMOJIS.length];
  const flyingTop = 20 + ((index * 17) % 41);

  return (
    <div
      ref={ref}
      className="relative rounded-xl p-4 border overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: `${cfg.nodeColor}30`,
        boxShadow: `0 0 20px ${cfg.glowColor}20`,
        transition: "box-shadow 0.3s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 28px ${cfg.glowColor}50, inset 0 0 20px ${cfg.glowColor}08`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${cfg.glowColor}20`; }}
    >
      <FlyingEmoji emoji={emoji} delay={entryDelay + 100} top={flyingTop} />

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-mono tabular-nums" style={{ color: cfg.nodeColor }}>{item.time}</span>
        {item.type && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>{item.type}</span>
        )}
      </div>

      <h4 className="font-display font-bold text-white text-sm leading-snug mb-1 overflow-hidden">
        {item.title.split(" ").map((word, wi) => (
          <SlotReveal key={wi} text={word + " "} delay={entryDelay + wi * 60} triggered={triggered} />
        ))}
      </h4>

      {item.description && (
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{item.description}</p>
      )}

      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: cfg.glowColor, transform: "translate(30%, -30%)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CARTOON TIMELINE
═══════════════════════════════════════════════════════════════ */
function CartoonTimeline({ days }: { days: TimelineDay[] }) {
  return (
    <div className="space-y-16">
      {days.map((day, di) => (
        <div key={di}>
          {/* Day header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-4 h-4 rounded-full shrink-0"
              style={{ background: STAR_YELLOW, boxShadow: `0 0 12px ${STAR_YELLOW}, 0 0 30px ${STAR_YELLOW}60` }} />
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${STAR_YELLOW}80, transparent)` }} />
            <div className="text-center px-4">
              <p className="text-base font-black text-white">{day.day}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{day.date}</p>
            </div>
            <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${STAR_YELLOW}80, transparent)` }} />
            <div className="w-4 h-4 rounded-full shrink-0"
              style={{ background: STAR_YELLOW, boxShadow: `0 0 12px ${STAR_YELLOW}, 0 0 30px ${STAR_YELLOW}60` }} />
          </div>

          {/* Desktop: two-column with glow rail */}
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex flex-col items-center w-6 pointer-events-none z-10">
              <div className="absolute inset-x-0 top-0 bottom-0 rounded-full"
                style={{ background: STAR_YELLOW, width: "12px", margin: "0 auto", filter: "blur(6px)", opacity: 0.25, animation: "tube-pulse 2.5s ease-in-out infinite" }} />
              <div className="absolute top-0 bottom-0 rounded-full"
                style={{ background: STAR_YELLOW, width: "4px", margin: "0 auto", opacity: 0.5, filter: "blur(2px)" }} />
              <div className="absolute top-0 bottom-0 rounded-full"
                style={{ background: STAR_YELLOW, width: "2px", margin: "0 auto", opacity: 0.9 }} />
            </div>

            <div className="space-y-8">
              {day.items.map((item, ii) => {
                const isLeft = ii % 2 === 0;
                const entryDelay = ii * 80;
                return (
                  <div key={ii} className="relative grid grid-cols-[1fr_72px_1fr] items-center">
                    <div className={`pr-6 ${isLeft ? "" : "invisible"}`}>
                      <EntryCard item={item} entryDelay={entryDelay} index={ii} />
                    </div>
                    <div className="flex justify-center items-center z-20 relative"
                      style={{ animation: `node-pop 0.4s cubic-bezier(0.22,1,0.36,1) ${entryDelay}ms both` }}>
                      <CartoonNode type={item.type} />
                    </div>
                    <div className={`pl-6 ${!isLeft ? "" : "invisible"}`}>
                      <EntryCard item={item} entryDelay={entryDelay} index={ii} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: left-rail layout */}
          <div className="md:hidden relative">
            <div className="absolute left-[18px] top-0 bottom-0 w-6 pointer-events-none">
              <div className="absolute inset-x-0 top-0 bottom-0 rounded-full"
                style={{ background: STAR_YELLOW, width: "8px", margin: "0 auto", filter: "blur(5px)", opacity: 0.2 }} />
              <div className="absolute top-0 bottom-0 rounded-full"
                style={{ background: STAR_YELLOW, width: "2px", margin: "0 auto", opacity: 0.7 }} />
            </div>
            <div className="pl-14 space-y-6">
              {day.items.map((item, ii) => {
                const entryDelay = ii * 80;
                return (
                  <div key={ii} className="relative">
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 z-20"
                      style={{ animation: `node-pop 0.4s cubic-bezier(0.22,1,0.36,1) ${entryDelay}ms both` }}>
                      <CartoonNode type={item.type} />
                    </div>
                    <EntryCard item={item} entryDelay={entryDelay} index={ii} />
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
   Floating cartoon emoji bubble (hero decoration)
═══════════════════════════════════════════════════════════════ */
function FloatingEmoji({ emoji, size, style, animClass }: { emoji: string; size: string; style?: React.CSSProperties; animClass: string }) {
  return (
    <div aria-hidden="true" className={`absolute select-none pointer-events-none ${animClass} opacity-20`} style={style}>
      <div className={`${size} rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg`}>
        <span>{emoji}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reduced-motion hook
═══════════════════════════════════════════════════════════════ */
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
    <div className="min-h-screen bg-[#07050f] text-white overflow-x-hidden">
      <ForceTheme theme="dark" />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section aria-labelledby="hw-hero-heading" className="relative min-h-screen flex items-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e0620] via-[#07050f] to-[#05080f]" />

        {/* Ambient glows — one per cartoon */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
            style={{ background: `radial-gradient(ellipse, ${STAR_YELLOW}18 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full blur-[100px]"
            style={{ background: `radial-gradient(ellipse, ${CARTOON_ORANGE}12 0%, transparent 70%)` }} />
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full blur-[90px]"
            style={{ background: `radial-gradient(ellipse, ${CARTOON_BLUE}12 0%, transparent 70%)` }} />
          <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full blur-[80px]"
            style={{ background: `radial-gradient(ellipse, ${CARTOON_GREEN}10 0%, transparent 70%)` }} />
          <div className="absolute top-20 left-16 w-56 h-56 rounded-full blur-[80px]"
            style={{ background: `radial-gradient(ellipse, ${CARTOON_RED}10 0%, transparent 70%)` }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Floating cartoon bubbles — skipped under prefers-reduced-motion */}
        {!reducedMotion && (
          <>
            <FloatingEmoji emoji="🧽" size="w-14 h-14 text-3xl" animClass="animate-[float-slow_8s_ease-in-out_infinite]"   style={{ top: "12%", left: "6%" }} />
            <FloatingEmoji emoji="🔍" size="w-16 h-16 text-3xl" animClass="animate-[float-mid_6s_ease-in-out_infinite]"    style={{ top: "8%", right: "8%", animationDelay: "1s" }} />
            <FloatingEmoji emoji="🐼" size="w-12 h-12 text-2xl" animClass="animate-[float-fast_4s_ease-in-out_infinite]"   style={{ bottom: "20%", left: "12%", animationDelay: "2s" }} />
            <FloatingEmoji emoji="🦊" size="w-14 h-14 text-3xl" animClass="animate-[float-slow_7s_ease-in-out_infinite]"   style={{ bottom: "15%", right: "6%", animationDelay: "1.5s" }} />
            <FloatingEmoji emoji="🚀" size="w-10 h-10 text-xl"  animClass="animate-[float-mid_5s_ease-in-out_infinite]"    style={{ top: "55%", left: "3%", animationDelay: "0.5s" }} />
            <FloatingEmoji emoji="⭐" size="w-10 h-10 text-xl"  animClass="animate-[float-fast_4.5s_ease-in-out_infinite]" style={{ top: "40%", right: "4%", animationDelay: "3s" }} />
            <FloatingEmoji emoji="🎬" size="w-12 h-12 text-2xl" animClass="animate-[float-slow_9s_ease-in-out_infinite]"   style={{ top: "18%", left: "22%", animationDelay: "0.8s" }} />
            <FloatingEmoji emoji="🎭" size="w-10 h-10 text-xl"  animClass="animate-[float-mid_7s_ease-in-out_infinite]"    style={{ bottom: "25%", right: "20%", animationDelay: "2.2s" }} />
          </>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center -mt-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-10 border"
            style={{ background: `${STAR_YELLOW}18`, borderColor: `${STAR_YELLOW}50`, color: STAR_YELLOW }}>
            <span aria-hidden="true" className="animate-[flicker_3s_ease-in-out_infinite]">🎬</span>
            {hero.badge}
            <span aria-hidden="true" className="animate-[flicker_3s_ease-in-out_infinite]" style={{ animationDelay: "0.5s" }}>🎬</span>
          </div>

          <h1 id="hw-hero-heading" className="font-display text-7xl sm:text-[8rem] font-black tracking-tight leading-none mb-2">
            <span className="block" style={{
              color: STAR_YELLOW,
              textShadow: `0 0 18px ${STAR_YELLOW}90, 0 0 50px ${STAR_YELLOW}50, 0 0 90px ${STAR_YELLOW}25`,
            }}>Hello</span>
            <span className="block text-white" style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}>World</span>
          </h1>

          {/* 5 cartoon emojis row */}
          <div aria-hidden="true" className="flex items-center justify-center gap-5 my-6 text-4xl">
            {["🧽", "🔍", "🐼", "🦊", "🚀"].map((e) => (
              <span key={e} className="opacity-70 hover:opacity-100 hover:scale-125 transition-all duration-300 cursor-default">{e}</span>
            ))}
          </div>

          <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
            {hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={hero.primaryButton.href}
              className="group relative px-8 py-4 rounded-xl font-bold text-sm overflow-hidden w-full sm:w-auto text-center transition-all duration-300 hover:scale-105"
              style={{ background: `linear-gradient(135deg, #b8860b, ${STAR_YELLOW}, #fffacd, ${STAR_YELLOW}, #b8860b)`, color: "#1a0a00" }}>
              <span className="relative z-10 tracking-wide">{hero.primaryButton.label}</span>
              <span aria-hidden="true" className="absolute inset-y-0 w-1/2 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation: "shimmer-slide 2.5s linear infinite" }} />
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </Link>
            <Link href={hero.secondaryButton.href}
              className="group px-8 py-4 rounded-xl font-bold text-sm w-full sm:w-auto text-center transition-all duration-300 hover:scale-105 border backdrop-blur-sm"
              style={{ borderColor: `${CARTOON_BLUE}60`, background: `${CARTOON_BLUE}12`, color: CARTOON_BLUE, boxShadow: `0 0 20px ${CARTOON_BLUE}20` }}>
              {hero.secondaryButton.label}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${STAR_YELLOW}60, transparent)` }} />
      </section>

      {/* ══════════════════════ HOUSES ══════════════════════ */}
      <section aria-labelledby="hw-houses-heading" className="py-24 px-4 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#07050f 0%,#090714 100%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 blur-[80px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${STAR_YELLOW}20, transparent 70%)` }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.3em] mb-3" style={{ color: STAR_YELLOW }}>— {houses.eyebrow} —</p>
            <h2 id="hw-houses-heading" className="font-display text-4xl sm:text-5xl font-black text-white">{houses.title}</h2>
            <div className="mt-4 mx-auto w-24 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${STAR_YELLOW}, transparent)` }} />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {houses.items.map((house) => {
              const hs = houseNeon[house.key] ?? houseNeon.toystory;
              const isZootopia = house.key === "zootopia";
              return (
                <div key={house.key}
                  className={`group relative overflow-hidden rounded-2xl p-7 text-center border ${hs.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 cursor-default`}
                  style={{ background: "rgba(255,255,255,0.04)", minHeight: 200 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px 4px ${hs.glow}, 0 20px 40px rgba(0,0,0,0.4)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                >
                  {/* Zootopia character illustration */}
                  {isZootopia && (
                    <div aria-hidden="true" className="absolute bottom-0 right-0 w-full overflow-hidden rounded-b-2xl" style={{ height: 96 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/zootopia_couple.png"
                        alt=""
                        className="absolute bottom-0 right-1 object-contain"
                        style={{ height: 88, width: "auto", opacity: 0.35 }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(9,7,20,0.9) 0%, transparent 50%)" }} />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-24 h-24 rounded-full blur-2xl" style={{ background: hs.glow }} />
                  </div>
                  <div className="text-6xl mb-5 relative z-10 transition-all duration-300 group-hover:scale-110"
                    style={{ filter: `drop-shadow(0 0 12px ${hs.neon}80)` }}>{house.symbol}</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${hs.badge}`}>{house.name}</span>
                  <p className="text-sm mt-1 relative z-10" style={{ color: "rgba(255,255,255,0.6)" }}>{house.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ SCHEDULE ══════════════════════ */}
      <section aria-labelledby="hw-schedule-heading" className="py-24 px-4 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#090714 0%,#050810 50%,#090714 100%)" }}>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: `radial-gradient(${STAR_YELLOW} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <p className="text-xs font-mono uppercase tracking-[0.3em] mb-3" style={{ color: STAR_YELLOW }}>— {schedule.eyebrow} —</p>
            <h2 id="hw-schedule-heading" className="font-display text-4xl sm:text-5xl font-black text-white">{schedule.title}</h2>
            <div className="mt-4 mx-auto w-24 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${STAR_YELLOW}, transparent)` }} />
          </div>

          <CartoonTimeline days={schedule.days} />
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section aria-labelledby="hw-cta-heading" className="py-28 px-4 relative overflow-hidden" style={{ background: "#07050f" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full blur-[120px]"
            style={{ background: `radial-gradient(ellipse, ${STAR_YELLOW}22, transparent 70%)` }} />
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${STAR_YELLOW}60)` }} />
            <span aria-hidden="true" className="text-xl">✨</span>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${STAR_YELLOW}60, transparent)` }} />
          </div>
          <h2 id="hw-cta-heading" className="font-display text-4xl sm:text-5xl font-black mb-4 text-white" style={{ textShadow: "0 0 30px rgba(255,255,255,0.1)" }}>
            {cta.title}
          </h2>
          <p className="mb-10 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{cta.description}</p>
          <Link href={cta.button.href}
            className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-base tracking-wide overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #7c5c00, ${STAR_YELLOW}, #fffacd, ${STAR_YELLOW})`,
              color: "#1a0800",
              boxShadow: `0 0 30px ${STAR_YELLOW}40, 0 10px 30px rgba(0,0,0,0.5)`,
            }}>
            <span className="text-lg">🎬</span>
            {cta.button.label}
            <span aria-hidden="true" className="absolute inset-y-0 w-1/2 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation: "shimmer-slide 2.5s linear infinite" }} />
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </Link>
          <p className="mt-6 text-xs" style={{ color: `${STAR_YELLOW}70` }}>🧽 🔍 🐼 🦊 🚀 — ค้นพบบ้านของคุณ</p>
        </div>
      </section>

    </div>
  );
}
