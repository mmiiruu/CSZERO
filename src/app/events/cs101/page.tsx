import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Fredoka } from "next/font/google";
import MarioTimeline from "./_components/MarioTimeline";
import { cs101Config } from "@/config/events/cs101";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-fredoka",
});

const { hero, features, schedule, cta } = cs101Config;

function Cloud({
  className,
  scale = 1,
  opacity = 0.9,
}: {
  className?: string;
  scale?: number;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: `scale(${scale})`, opacity }}
    >
      <div
        style={{
          position: "relative",
          width: 120,
          height: 56,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))",
        }}
      >
        <div style={{ position: "absolute", bottom: 0, left: 16, width: 80, height: 32, background: "white", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 16, left: 0, width: 48, height: 40, background: "white", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 16, left: 24, width: 72, height: 52, background: "white", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 20, left: 64, width: 56, height: 44, background: "white", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 0, left: 80, width: 40, height: 28, background: "white", borderRadius: "50%" }} />
      </div>
    </div>
  );
}

function StarDecor({ className, size = 24, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#FBD000"
      style={style}
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

export default function CS101Page() {
  return (
    <div className={fredoka.variable} style={{ minHeight: "100vh" }}>
      {/* ── Mario-specific CSS ───────────────────────────────────────── */}
      <style>{`
        :root {
          --mario-red:   #E52521;
          --mario-blue:  #049CD8;
          --mario-gold:  #FBD000;
          --mario-green: #43B047;
          --mario-dark-green: #1A8B2E;
          --mario-brown: #8B4513;
        }

        @keyframes mario-star-spin {
          0%   { transform: rotate(0deg)   scale(1);    }
          25%  { transform: rotate(90deg)  scale(1.15); }
          50%  { transform: rotate(180deg) scale(1);    }
          75%  { transform: rotate(270deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1);    }
        }
        @keyframes mario-cloud-drift-a {
          0%, 100% { transform: translateX(0px);  }
          50%       { transform: translateX(22px); }
        }
        @keyframes mario-cloud-drift-b {
          0%, 100% { transform: translateX(0px);   }
          50%       { transform: translateX(-18px); }
        }
        @keyframes mario-float-hero {
          0%, 100% { transform: translateY(0px)   rotate(-2deg); }
          33%       { transform: translateY(-22px) rotate(3deg);  }
          66%       { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes mario-mushroom-bob {
          0%, 100% { transform: translateY(0px)   rotate(0deg);  }
          50%       { transform: translateY(-12px) rotate(-5deg); }
        }
        @keyframes mario-block-pulse {
          0%, 100% { box-shadow: 0 8px 0 #C8950A, 0 10px 30px rgba(251,208,0,0.35); }
          50%       { box-shadow: 0 8px 0 #C8950A, 0 10px 50px rgba(251,208,0,0.60); }
        }
        @keyframes mario-ground-shimmer {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 100% 50%; }
        }
        @keyframes mario-hero-fade {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes mario-qblock-hover {
          0%, 100% { transform: translateY(0);   }
          50%       { transform: translateY(-6px); }
        }

        .mario-star-spin    { animation: mario-star-spin    5s linear infinite; }
        .mario-cloud-a      { animation: mario-cloud-drift-a 9s  ease-in-out infinite; }
        .mario-cloud-b      { animation: mario-cloud-drift-b 13s ease-in-out infinite; }
        .mario-cloud-c      { animation: mario-cloud-drift-a 11s ease-in-out infinite 2s; }
        .mario-float        { animation: mario-float-hero   4s  ease-in-out infinite; }
        .mario-mushroom-bob { animation: mario-mushroom-bob 3.5s ease-in-out infinite; }
        .mario-hero-content { animation: mario-hero-fade    0.7s ease-out both; }
        .mario-hero-content-delay { animation: mario-hero-fade 0.7s ease-out 0.15s both; }

        /* Mario Block Button */
        .mario-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-fredoka), 'Fredoka', sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.02em;
          cursor: pointer;
          border-radius: 0.85rem;
          padding: 0.9rem 2rem;
          text-decoration: none;
          transition:
            transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.18s ease;
          user-select: none;
          -webkit-user-select: none;
        }
        .mario-btn:hover  { transform: translateY(-5px) scale(1.06); }
        .mario-btn:active { transform: translateY(2px)  scale(0.96); transition-duration: 0.08s; }

        .mario-btn-primary {
          background: linear-gradient(180deg, #FF4D4D 0%, var(--mario-red) 100%);
          color: white;
          border: 3px solid #8B0000;
          box-shadow: 0 7px 0 #8B0000, 0 10px 28px rgba(229,37,33,0.38);
          text-shadow: 0 1px 2px rgba(0,0,0,0.25);
        }
        .mario-btn-primary:hover {
          box-shadow: 0 12px 0 #8B0000, 0 14px 36px rgba(229,37,33,0.48);
        }
        .mario-btn-primary:active {
          box-shadow: 0 3px 0 #8B0000, 0 5px 12px rgba(229,37,33,0.28);
        }

        .mario-btn-secondary {
          background: linear-gradient(180deg, #FFE135 0%, var(--mario-gold) 100%);
          color: #1a1000;
          border: 3px solid #C8950A;
          box-shadow: 0 7px 0 #C8950A, 0 10px 28px rgba(251,208,0,0.42);
        }
        .mario-btn-secondary:hover {
          box-shadow: 0 12px 0 #C8950A, 0 14px 36px rgba(251,208,0,0.55);
        }
        .mario-btn-secondary:active {
          box-shadow: 0 3px 0 #C8950A, 0 5px 12px rgba(251,208,0,0.30);
        }

        /* Question Block cards */
        .qblock-card {
          background: linear-gradient(135deg, #FFE135 0%, #FBD000 60%, #E8B800 100%);
          border: 3px solid #C8950A;
          border-radius: 1rem;
          box-shadow:
            inset 0  3px 0 rgba(255,255,255,0.45),
            inset 0 -3px 0 rgba(0,0,0,0.18),
            0 7px 0 #8B6914,
            0 10px 24px rgba(200,149,10,0.30);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          cursor: default;
        }
        .qblock-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow:
            inset 0  3px 0 rgba(255,255,255,0.45),
            inset 0 -3px 0 rgba(0,0,0,0.18),
            0 13px 0 #8B6914,
            0 16px 36px rgba(200,149,10,0.40);
        }

        /* Pipe-style glass card */
        .glass-card {
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 2px solid rgba(255,255,255,0.32);
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }

        /* Schedule card */
        .schedule-item-card {
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(67,176,71,0.40);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .schedule-item-card:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(67,176,71,0.70);
          transform: translateX(4px);
        }

        /* Pipe separator */
        .pipe-cap {
          height: 20px;
          background: linear-gradient(180deg, #5DD863 0%, #43B047 50%, #2D7D32 100%);
          border-left: 3px solid #1A8B2E;
          border-right: 3px solid #1A8B2E;
          border-radius: 4px 4px 0 0;
          box-shadow: inset 0 3px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.15);
        }

        @media (prefers-reduced-motion: reduce) {
          [aria-hidden="true"],
          [aria-hidden="true"] * { animation: none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          HERO — Sky world
      ══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="cs101-hero-heading"
        className="relative min-h-screen flex items-center justify-center pt-16 px-4 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0FA3D4 0%, #3EC3F0 45%, #8BE0F7 72%, #B8EEFC 100%)",
        }}
      >
        {/* Clouds layer */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[4%]  mario-cloud-a"><Cloud scale={1.2} /></div>
          <div className="absolute top-[18%] left-[28%] mario-cloud-b"><Cloud scale={0.8} opacity={0.75} /></div>
          <div className="absolute top-[8%]  right-[8%] mario-cloud-c"><Cloud scale={1.0} /></div>
          <div className="absolute top-[30%] right-[22%] mario-cloud-a" style={{ animationDelay: "3s" }}><Cloud scale={0.65} opacity={0.65} /></div>
          <div className="absolute top-[42%] left-[12%] mario-cloud-b" style={{ animationDelay: "5s" }}><Cloud scale={0.9} opacity={0.7} /></div>
        </div>

        {/* Star sparkles */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <StarDecor className="absolute top-[15%] left-[18%] mario-star-spin opacity-60" size={18} />
          <StarDecor className="absolute top-[55%] left-[8%]  mario-star-spin opacity-50" size={14} style={{ animationDelay: "1.5s" } as React.CSSProperties} />
          <StarDecor className="absolute top-[25%] right-[15%] mario-star-spin opacity-55" size={22} style={{ animationDelay: "0.8s" } as React.CSSProperties} />
          <StarDecor className="absolute bottom-[32%] right-[10%] mario-star-spin opacity-45" size={16} style={{ animationDelay: "2.2s" } as React.CSSProperties} />
        </div>

        {/* Mario pixel character — left floating */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mario-pixel.png"
          alt=""
          aria-hidden="true"
          className="mario-float absolute hidden xl:block pointer-events-none select-none"
          style={{
            left: "4%",
            bottom: "18%",
            width: 160,
            height: "auto",
            imageRendering: "pixelated",
            filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.35))",
            zIndex: 5,
          }}
        />

        {/* Super Star — top right spinning */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mario-star.png"
          alt=""
          aria-hidden="true"
          className="mario-star-spin absolute hidden lg:block pointer-events-none select-none"
          style={{
            top: "10%",
            right: "5%",
            width: 100,
            height: "auto",
            filter: "drop-shadow(0 8px 20px rgba(251,208,0,0.60))",
            zIndex: 5,
          }}
        />

        {/* Lucky Block — floating upper left, bobbing */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mario-lucky-block.png"
          alt=""
          aria-hidden="true"
          className="mario-mushroom-bob absolute hidden lg:block pointer-events-none select-none"
          style={{
            top: "18%",
            left: "7%",
            width: 80,
            height: "auto",
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.30))",
            zIndex: 5,
          }}
        />

        {/* Goomba enemy — bottom right, floating */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mario-enemy.png"
          alt=""
          aria-hidden="true"
          className="mario-float absolute hidden xl:block pointer-events-none select-none"
          style={{
            right: "4%",
            bottom: "18%",
            width: 130,
            height: "auto",
            filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.30))",
            zIndex: 5,
            animationDelay: "0.9s",
          }}
        />

        {/* ── Central glass panel ─────────────────────────────────── */}
        <div
          className="glass-card mario-hero-content relative z-10 max-w-2xl w-full mx-auto px-8 py-12 text-center"
        >
          {/* Badge */}
          <div
            className="mario-hero-content inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{
              background: "rgba(255,255,255,0.85)",
              color: "#1a1000",
              border: "2px solid #FBD000",
              fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
              boxShadow: "0 2px 12px rgba(251,208,0,0.3)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mario-star.png" alt="" aria-hidden="true" width={20} height={20} style={{ objectFit: "contain" }} />
            {hero.badge}
          </div>

          {/* Heading */}
          <h1
            id="cs101-hero-heading"
            className="mario-hero-content-delay"
            style={{
              fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
              fontSize: "clamp(4rem, 14vw, 7rem)",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#FBD000",
              textShadow:
                "0 4px 0 #C8950A, 0 7px 0 #8B6914, 4px 4px 0 #E52521, -1px -1px 0 rgba(0,0,0,0.15)",
              marginBottom: "0.25rem",
            }}
          >
            CS<span style={{ color: "#fff", textShadow: "0 4px 0 #049CD8, 0 7px 0 #0275A0, 4px 4px 0 #E52521" }}>101</span>
          </h1>

          {/* Subtitle line */}
          <p
            className="mario-hero-content-delay"
            style={{
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              fontSize: "1.05rem",
              color: "rgba(0, 0, 0, 1)",
              textShadow: "0 1px 4px rgba(0,0,0,0.25)",
              marginTop: "1.25rem",
              marginBottom: "0.5rem",
              lineHeight: 1.65,
              maxWidth: 480,
              margin: "1.25rem auto 0",
            }}
          >
            {hero.description}
          </p>

          {/* CTA buttons */}
          <div
            className="mario-hero-content-delay flex flex-col sm:flex-row gap-4 justify-center"
            style={{ marginTop: "2rem" }}
          >
            <Link href={hero.primaryButton.href} className="mario-btn mario-btn-primary">
              {hero.primaryButton.label}
            </Link>
            <a href={hero.secondaryButton.href} className="mario-btn mario-btn-secondary">
              {hero.secondaryButton.label}
            </a>
          </div>
        </div>

        {/* ── Ground strip ──────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ zIndex: 4 }}
        >
          {/* Grass top */}
          <div
            style={{
              height: 28,
              background: "linear-gradient(180deg, #5DD863 0%, #43B047 100%)",
              borderTop: "3px solid #6FE875",
              boxShadow: "inset 0 4px 0 rgba(255,255,255,0.25), 0 -2px 0 #2D7D32",
            }}
          />
          {/* Earth below */}
          <div
            style={{
              height: 28,
              background: "linear-gradient(180deg, #8B5E3C 0%, #6B3A1F 100%)",
              borderTop: "3px solid #A0714B",
            }}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WHY JOIN — Underground world (dark navy + gold blocks)
      ══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="cs101-features-heading"
        className="relative py-24 lg:py-32 px-4 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #12143A 0%, #1C1F52 50%, #0E1030 100%)",
        }}
      >

        {/* Floating stars bg */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { top: "15%", left: "5%",  size: 12, delay: "0s",   opacity: 0.25 },
            { top: "70%", left: "2%",  size: 8,  delay: "1.2s", opacity: 0.20 },
            { top: "35%", right: "4%", size: 10, delay: "0.6s", opacity: 0.22 },
            { top: "80%", right: "7%", size: 14, delay: "2.1s", opacity: 0.18 },
            { top: "50%", left: "50%", size: 8,  delay: "1.8s", opacity: 0.15 },
          ].map((s, i) => (
            <StarDecor
              key={i}
              className="absolute mario-star-spin"
              size={s.size}
              style={{ top: s.top, left: (s as { left?: string }).left, right: (s as { right?: string }).right, opacity: s.opacity, animationDelay: s.delay } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mario-lucky-block.png" alt="" aria-hidden="true" width={38} height={38} loading="lazy" style={{ objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(251,208,0,0.65))" }} />
              <h2
                id="cs101-features-heading"
                style={{
                  fontFamily: "var(--font-fredoka), 'Fredoka', var(--font-prompt), sans-serif",
                  fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                  fontWeight: 700,
                  color: "#FBD000",
                  textShadow: "0 3px 0 #C8950A, 0 5px 0 #8B6914",
                }}
              >
                {features.title}
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mario-lucky-block.png" alt="" aria-hidden="true" width={38} height={38} loading="lazy" style={{ objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(251,208,0,0.65))" }} />
            </div>
          </div>

          {/* Feature cards — Question block style */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.cards.map((item, index) => (
              <div key={item.title} className="qblock-card p-4 sm:p-5 relative overflow-hidden flex flex-col justify-center min-h-[140px] sm:min-h-[160px]">
                {/* Corner question mark watermark */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 10,
                    fontSize: 36,
                    fontWeight: 700,
                    fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
                    color: "rgba(200,149,10,0.25)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  ?
                </span>

                {/* Number badge */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "#E52521",
                    border: "2px solid #8B0000",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.5rem",
                    boxShadow: "0 2px 0 #5A0000",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      color: "#FBD000",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-fredoka), 'Fredoka', var(--font-prompt), sans-serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#1a1000",
                    marginBottom: "0.25rem",
                  }}
                >
                  {item.icon} {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-prompt), sans-serif",
                    fontSize: "0.85rem",
                    color: "#5A3E00",
                    lineHeight: 1.45,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SCHEDULE — Overworld green
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="schedule"
        aria-labelledby="cs101-schedule-heading"
        className="relative py-24 px-4 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #49a34fff 0%, #1A8B2E 50%, #156621 100%)",
        }}
      >
        {/* Pipe decorations on sides */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Left pipe */}
          <div style={{ position: "absolute", left: 24, top: 0, width: 40, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <div style={{ width: 48, height: 20, background: "linear-gradient(90deg,#5DD863,#43B047,#2D7D32)", borderRadius: "6px 6px 0 0", border: "2px solid #1A8B2E", boxShadow: "inset 0 3px 0 rgba(255,255,255,0.3)" }} />
            <div style={{ flex: 1, width: 36, background: "linear-gradient(90deg,#3DA840,#2D8B33,#236620)", border: "2px solid #1A8B2E", boxShadow: "inset 2px 0 4px rgba(0,0,0,0.2)" }} />
          </div>
          {/* Right pipe */}
          <div style={{ position: "absolute", right: 24, top: 0, width: 40, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <div style={{ width: 48, height: 20, background: "linear-gradient(90deg,#5DD863,#43B047,#2D7D32)", borderRadius: "6px 6px 0 0", border: "2px solid #1A8B2E", boxShadow: "inset 0 3px 0 rgba(255,255,255,0.3)" }} />
            <div style={{ flex: 1, width: 36, background: "linear-gradient(90deg,#3DA840,#2D8B33,#236620)", border: "2px solid #1A8B2E", boxShadow: "inset 2px 0 4px rgba(0,0,0,0.2)" }} />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p
              style={{
                fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
                fontSize: "0.9rem",
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.9)",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              {schedule.eyebrow}
            </p>
            <h2
              id="cs101-schedule-heading"
              style={{
                fontFamily: "var(--font-fredoka), 'Fredoka', var(--font-prompt), sans-serif",
                fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                fontWeight: 700,
                color: "#FBD000",
                textShadow: "0 3px 0 #C8950A, 0 5px 0 rgba(0,0,0,0.25)",
              }}
            >
              {schedule.title}
            </h2>
          </div>

          <MarioTimeline days={schedule.days} />
        </div>
      </section>

      {/* ── Brick wall divider: Schedule → CTA ───────────────────── */}
      <div
        aria-hidden="true"
        style={{
          height: 72,
          backgroundImage: "url('/mario-brick.png')",
          backgroundRepeat: "repeat-x",
          backgroundSize: "72px 72px",
          backgroundPosition: "left top",
          borderTop: "4px solid #3D1C00",
          borderBottom: "4px solid #3D1C00",
          boxShadow: "0 -4px 0 #2A1200 inset, 0 4px 0 #2A1200 inset",
        }}
      />

      {/* ══════════════════════════════════════════════════════════════
          CTA — Mario red world
      ══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="cs101-cta-heading"
        className="relative py-24 lg:py-32 px-4 min-h-[60vh] flex flex-col justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #C01E1B 0%, #E52521 40%, #FF4D4D 100%)",
        }}
      >
        {/* Decorative large stars */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/mario-star.png"
            alt=""
            aria-hidden="true"
            width={260}
            height={260}
            className="absolute mario-star-spin"
            style={{ left: "-4%", top: "-10%", opacity: 0.18, pointerEvents: "none" }}
          />
          <Image
            src="/mario-star.png"
            alt=""
            aria-hidden="true"
            width={200}
            height={200}
            className="absolute mario-star-spin"
            style={{ right: "-2%", bottom: "-8%", opacity: 0.12, pointerEvents: "none", animationDirection: "reverse" }}
          />

          {/* Floating small stars */}
          {[
            { top: "20%", left: "10%",  size: 20, delay: "0s"   },
            { top: "60%", left: "15%",  size: 14, delay: "1.4s" },
            { top: "30%", right: "12%", size: 16, delay: "0.7s" },
            { top: "75%", right: "18%", size: 10, delay: "2.0s" },
            { top: "50%", left: "45%",  size: 12, delay: "1.1s" },
          ].map((s, i) => (
            <StarDecor
              key={i}
              className="absolute mario-star-spin"
              size={s.size}
              style={{
                top: s.top,
                left: (s as { left?: string }).left,
                right: (s as { right?: string }).right,
                opacity: 0.35,
                animationDelay: s.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Pixel Mario above CTA */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mario-pixel.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="mario-float mx-auto mb-4 pointer-events-none select-none"
            style={{ width: 100, height: "auto", imageRendering: "pixelated", filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.45))" }}
          />

          <h2
            id="cs101-cta-heading"
            style={{
              fontFamily: "var(--font-fredoka), 'Fredoka', var(--font-prompt), sans-serif",
              fontSize: "clamp(1.75rem, 5vw, 2.4rem)",
              fontWeight: 700,
              color: "#FBD000",
              textShadow: "0 3px 0 #C8950A, 0 5px 0 rgba(0,0,0,0.2)",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            {cta.title}
          </h2>

          <p
            style={{
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              color: "#fff",
              fontSize: "1.05rem",
              marginBottom: "2rem",
              lineHeight: 1.6,
              textShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            {cta.description}
          </p>

          <Link href={cta.button.href} className="mario-btn mario-btn-secondary">
            {cta.button.label}
          </Link>
        </div>
      </section>
    </div>
  );
}
