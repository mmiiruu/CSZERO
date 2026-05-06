"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { helloWorldConfig } from "@/config/events/hello-world";
import { ForceTheme } from "@/components/providers/ForceTheme";

const { houses, reveal } = helloWorldConfig;

type HouseKey = "spongebob" | "conan" | "kungfupanda" | "zootopia" | "toystory";

/* ── House styles ────────────────────────────────────────────── */
const housePastel: Record<string, {
  bg: string; border: string; glow: string;
  badgeBg: string; badgeText: string;
  gradient: string; textColor: string;
  cardImgH: number; shuffleImgH: number; revealImgH: number; imgScale: number;
}> = {
  spongebob:   { bg: "#FEF08A", border: "#CA8A04", glow: "rgba(202,138,4,0.5)",   badgeBg: "bg-yellow-400", badgeText: "text-yellow-950", gradient: "linear-gradient(145deg,#FEF08A,#CA8A04)", textColor: "#713F12", cardImgH: 72, shuffleImgH: 130, revealImgH: 230, imgScale: 1    },
  conan:       { bg: "#BFDBFE", border: "#1D4ED8", glow: "rgba(29,78,216,0.45)",   badgeBg: "bg-blue-700",   badgeText: "text-white",       gradient: "linear-gradient(145deg,#DBEAFE,#1D4ED8)", textColor: "#1E3A8A", cardImgH: 72, shuffleImgH: 130, revealImgH: 230, imgScale: 1.4  },
  kungfupanda: { bg: "#BBF7D0", border: "#15803D", glow: "rgba(21,128,61,0.45)",   badgeBg: "bg-green-700",  badgeText: "text-white",       gradient: "linear-gradient(145deg,#DCFCE7,#15803D)", textColor: "#14532D", cardImgH: 72, shuffleImgH: 130, revealImgH: 230, imgScale: 1.55 },
  zootopia:    { bg: "#FED7AA", border: "#EA580C", glow: "rgba(234,88,12,0.5)",    badgeBg: "bg-orange-500", badgeText: "text-white",       gradient: "linear-gradient(145deg,#FFEDD5,#EA580C)", textColor: "#7C2D12", cardImgH: 72, shuffleImgH: 130, revealImgH: 230, imgScale: 1.4  },
  toystory:    { bg: "#BAE6FD", border: "#0284C7", glow: "rgba(2,132,199,0.5)",    badgeBg: "bg-sky-600",    badgeText: "text-white",       gradient: "linear-gradient(145deg,#E0F2FE,#0284C7)", textColor: "#075985", cardImgH: 72, shuffleImgH: 130, revealImgH: 230, imgScale: 1.4  },
};

/* ── Mystery card — shows house character image, face shown ─── */
function MysteryCard({ index = 0, delay = 0 }: { index?: number; delay?: number }) {
  const house = houses.items[index % houses.items.length];
  const hp = housePastel[house.key];
  return (
    <div
      className="w-20 h-28 rounded-2xl relative overflow-hidden"
      style={{
        background: hp.bg,
        border: `2px solid ${hp.border}`,
        boxShadow: `0 8px 24px ${hp.glow}`,
        animation: "tube-pulse 3.5s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Diagonal stripe pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${hp.border}25 0px, ${hp.border}25 4px, transparent 4px, transparent 14px)`,
      }} />
      {/* Character image */}
      <div className="absolute inset-0 flex items-end justify-center pb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={house.image}
          alt={house.name}
          style={{ height: hp.cardImgH, width: "auto", objectFit: "contain", mixBlendMode: "multiply", transform: `scale(${hp.imgScale})`, transformOrigin: "bottom center" }}
        />
      </div>
      {/* Corner dots */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full" style={{ background: hp.border }} />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: hp.border }} />
    </div>
  );
}

/* ── Floating bubble decoration ──────────────────────────────── */
function FloatBubble({ emoji, style }: { emoji: string; style?: React.CSSProperties }) {
  return (
    <div aria-hidden="true" className="absolute select-none pointer-events-none animate-[float-slow_6s_ease-in-out_infinite]" style={style}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        {emoji}
      </div>
    </div>
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
  const hp = revealedHouse ? (housePastel[revealedHouse] ?? housePastel.toystory) : null;
  const shuffleHouse = houses.items[shuffleIndex];

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div role="status" aria-label="กำลังโหลด..." className="min-h-screen flex items-center justify-center" style={{ background: "#FFFBF4" }}>
        <div aria-hidden="true" className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: "linear-gradient(145deg, #DBEFFE 0%, #FFFBEB 50%, #FFE8F4 100%)" }}
    >
      <ForceTheme theme="light" />

      {/* Ambient glows */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "rgba(186,230,253,0.55)" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: "rgba(253,230,138,0.45)" }} />
      </div>

      {/* Floating decorations */}
      <FloatBubble emoji="🎬" style={{ top: "8%",  left: "5%",  animationDelay: "0s" }} />
      <FloatBubble emoji="⭐" style={{ top: "15%", right: "8%", animationDelay: "1s" }} />
      <FloatBubble emoji="🎉" style={{ bottom: "15%", left: "8%", animationDelay: "2s" }} />
      <FloatBubble emoji="✨" style={{ bottom: "20%", right: "6%", animationDelay: "1.5s" }} />

      {/* Live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveAnnouncement}</div>

      {/* ── REVEALED ─────────────────────────────────────────────── */}
      {revealedHouse && houseData && hp && (
        <div className="text-center animate-fade-in max-w-sm w-full">

          {/* Card with character */}
          <div
            className="relative mx-auto mb-8 rounded-3xl overflow-hidden animate-deal-in"
            style={{
              width: 240, height: 320,
              background: hp.bg,
              border: `3px solid ${hp.border}`,
              boxShadow: `0 20px 60px ${hp.glow}, 0 8px 24px rgba(0,0,0,0.08)`,
            }}
          >
            {/* Gradient top band */}
            <div className="absolute top-0 left-0 right-0 h-16" style={{ background: hp.gradient, opacity: 0.7 }} />

            {/* Corner emoji pips */}
            <span aria-hidden="true" className="absolute top-3 left-4 text-2xl">{houseData.symbol}</span>
            <span aria-hidden="true" className="absolute top-3 right-4 text-2xl rotate-180">{houseData.symbol}</span>

            {/* Character image */}
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={houseData.revealImage}
                alt={`${houseData.name} character`}
                style={{
                  height: hp.revealImgH,
                  width: "auto",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
                  transform: `scale(${hp.imgScale})`,
                  transformOrigin: "bottom center",
                }}
              />
            </div>

            {/* Bottom label */}
            <div className="absolute bottom-0 left-0 right-0 py-3 text-center"
              style={{ background: `${hp.border}30`, backdropFilter: "blur(4px)" }}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${hp.badgeBg} ${hp.badgeText}`}>
                {houseData.symbol} บ้าน{houseData.name}
              </span>
            </div>
          </div>

          {/* Text */}
          <div style={{ animationDelay: "0.4s", animationFillMode: "both" }} className="animate-fade-in">
            <h1
              ref={revealHeadingRef}
              tabIndex={-1}
              className="text-4xl font-black mb-2 outline-none"
              style={{ color: "#1C1917" }}
            >
              บ้าน{houseData.name}!
            </h1>
            <p className="text-sm mb-8" style={{ color: "#78716C" }}>{reveal.revealedMessage}</p>

            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 border-2"
              style={{ background: "white", borderColor: hp.border, color: hp.textColor }}
            >
              {reveal.revealAgainButton}
            </button>
          </div>

        </div>
      )}

      {/* ── SHUFFLING ────────────────────────────────────────────── */}
      {isShuffling && !revealedHouse && (
        <div aria-busy="true" className="text-center">
          {/* Spinning mystery card with character image */}
          <div className="relative mx-auto mb-8 animate-shuffle"
            style={{ width: 130, height: 180 }}>
            {(() => {
              const sp = housePastel[shuffleHouse.key] ?? housePastel.toystory;
              return (
                <div className="w-full h-full rounded-2xl overflow-hidden relative"
                  style={{ background: sp.bg, border: `2px solid ${sp.border}`, boxShadow: `0 8px 32px ${sp.glow}` }}>
                  <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${sp.border}25 0px, ${sp.border}25 4px, transparent 4px, transparent 14px)` }} />
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shuffleHouse.image}
                      alt={shuffleHouse.name}
                      style={{ height: sp.shuffleImgH, width: "auto", objectFit: "contain", mixBlendMode: "multiply", transform: `scale(${sp.imgScale})`, transformOrigin: "bottom center" }}
                    />
                  </div>
                  <span className="absolute top-2 left-2.5 text-sm font-bold" style={{ color: sp.border }}>{shuffleHouse.symbol}</span>
                </div>
              );
            })()}
          </div>

          <h1 className="text-2xl font-black animate-flicker" style={{ color: "#1C1917" }}>{reveal.shufflingTitle}</h1>
          <p className="mt-2 text-sm" style={{ color: "#78716C" }}>{reveal.shufflingSubtitle}</p>

          {/* Small character row shuffling through */}
          <div className="mt-6 flex justify-center gap-3">
            {houses.items.map((h, i) => (
              <div
                key={h.key}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-150"
                style={{
                  background: (housePastel[h.key] ?? housePastel.toystory).bg,
                  border: `2px solid ${(housePastel[h.key] ?? housePastel.toystory).border}`,
                  transform: shuffleIndex === i ? "scale(1.4) translateY(-4px)" : "scale(1)",
                }}
              >
                {h.symbol}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── IDLE ─────────────────────────────────────────────────── */}
      {!isShuffling && !revealedHouse && (
        <div className="max-w-md w-full text-center animate-fade-in">

          {/* 5-card fan */}
          <div className="group flex items-end justify-center -space-x-4 mb-8 select-none">
            {[
              { rot: "-12deg", hover: "rotate-[-18deg] -translate-x-4 -translate-y-2", delay: 0 },
              { rot: "-6deg",  hover: "rotate-[-9deg] -translate-x-2 -translate-y-1", delay: 0.25 },
              { rot: "0deg",   hover: "rotate-[0deg] -translate-y-1",                 delay: 0.5 },
              { rot: "6deg",   hover: "rotate-[9deg] translate-x-2 -translate-y-1",   delay: 0.75 },
              { rot: "12deg",  hover: "rotate-[18deg] translate-x-4 -translate-y-2",  delay: 1.0 },
            ].map((card, i) => (
              <div
                key={i}
                className="relative origin-bottom transition-all duration-300 ease-out transform-gpu hover:!-translate-y-6 hover:z-10"
                style={{
                  transform: `rotate(${card.rot})`,
                  zIndex: i === 2 ? 3 : i === 1 || i === 3 ? 2 : 1,
                }}
              >
                <MysteryCard index={i} delay={card.delay} />
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-black mb-2" style={{ color: "#1C1917" }}>{reveal.title}</h1>
          <p className="text-sm mb-1" style={{ color: "#78716C" }}>
            เข้าสู่ระบบในชื่อ <span className="font-semibold" style={{ color: "#57534E" }}>{session?.user?.email}</span>
          </p>
          <p className="text-xs mb-8" style={{ color: "#A8A29E" }}>{reveal.description}</p>

          {/* CTA box */}
          <div className="rounded-3xl p-6 sm:p-8 border-2"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderColor: "rgba(245,158,11,0.3)", boxShadow: "0 8px 32px rgba(245,158,11,0.12)" }}>
            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                {error}
              </p>
            )}

            <button
              disabled={isLoading}
              onClick={handleReveal}
              className="w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl font-black text-base transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
                color: "#1C1917",
                boxShadow: "0 6px 24px rgba(245,158,11,0.38)",
              }}
            >
              {isLoading ? (
                <svg aria-hidden="true" className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {reveal.button}
            </button>
          </div>

          {/* House preview strip */}
          <div aria-hidden="true" className="mt-8 flex justify-center gap-3">
            {houses.items.map((h) => {
              const sp = housePastel[h.key] ?? housePastel.toystory;
              return (
                <div key={h.key}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl opacity-50 hover:opacity-100 transition-opacity cursor-default"
                  style={{ background: sp.bg, border: `2px solid ${sp.border}` }}>
                  {h.symbol}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </main>
  );
}
