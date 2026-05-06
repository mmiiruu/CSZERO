"use client";

import React, { useRef, useEffect, useState } from "react";
import type { TimelineDay, TimelineItem } from "@/components/ui/Timeline";

/* ── Type metadata ────────────────────────────────────────────────────── */
const TYPE_META: Record<
  string,
  { icon: string; nodeGrad: string; nodeBorder: string; nodeTextColor: string; tagBg: string; tagColor: string; label: string }
> = {
  talk: {
    icon: "⭐", label: "Talk",
    nodeGrad: "linear-gradient(135deg,#35C9F5 0%,#049CD8 100%)",
    nodeBorder: "#0275A0", nodeTextColor: "#E0F7FF",
    tagBg: "rgba(4,156,216,0.22)", tagColor: "#35C9F5",
  },
  workshop: {
    icon: "🍄", label: "Workshop",
    nodeGrad: "linear-gradient(135deg,#FF6B67 0%,#E52521 100%)",
    nodeBorder: "#8B0000", nodeTextColor: "#FFE8E8",
    tagBg: "rgba(229,37,33,0.22)", tagColor: "#FF8A87",
  },
  break: {
    icon: "🪙", label: "Break",
    nodeGrad: "linear-gradient(135deg,#FFE135 0%,#FBD000 100%)",
    nodeBorder: "#C8950A", nodeTextColor: "#1a1000",
    tagBg: "rgba(251,208,0,0.22)", tagColor: "#FBD000",
  },
  social: {
    icon: "🏰", label: "Social",
    nodeGrad: "linear-gradient(135deg,#C77DFF 0%,#9B4DCA 100%)",
    nodeBorder: "#6A1F9A", nodeTextColor: "#F5E6FF",
    tagBg: "rgba(155,77,202,0.22)", tagColor: "#C77DFF",
  },
};

const FALLBACK_META = TYPE_META.talk;

/* ── Scroll-reveal hook ───────────────────────────────────────────────── */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.45s ease-out ${delay}ms, transform 0.45s cubic-bezier(0.25,1,0.5,1) ${delay}ms`,
    } as React.CSSProperties,
  };
}

/* ── Dotted connector segment ─────────────────────────────────────────── */
function DottedPath({ grow = true }: { grow?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 6,
        ...(grow ? { flex: 1, minHeight: 20 } : { height: 20 }),
        background: "repeating-linear-gradient(180deg,#FBD000 0px,#FBD000 7px,transparent 7px,transparent 14px)",
        borderRadius: 3,
        flexShrink: 0,
      }}
    />
  );
}

/* ── Single timeline item ─────────────────────────────────────────────── */
function MarioItem({
  item,
  index,
  isFirst,
  isLast,
}: {
  item: TimelineItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const reveal = useReveal(index * 70);
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[item.type ?? ""] ?? FALLBACK_META;

  return (
    <div ref={reveal.ref} style={{ ...reveal.style, display: "flex", alignItems: "stretch", gap: 0 }}>
      {/* ── Left: path + node column ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 60,
          flexShrink: 0,
        }}
      >
        {/* Top connector */}
        {!isFirst ? <DottedPath grow={false} /> : <div style={{ height: 20 }} />}

        {/* Node */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: meta.nodeGrad,
            border: `3px solid ${meta.nodeBorder}`,
            boxShadow: hovered
              ? `0 8px 0 ${meta.nodeBorder}, 0 12px 24px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.35)`
              : `0 4px 0 ${meta.nodeBorder}, 0 6px 18px rgba(0,0,0,0.28), inset 0 3px 0 rgba(255,255,255,0.35)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
            transform: hovered ? "translateY(-5px) scale(1.12)" : "translateY(0) scale(1)",
            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
            cursor: "default",
            userSelect: "none",
            zIndex: 2,
            position: "relative",
          }}
          aria-hidden="true"
        >
          {meta.icon}
        </div>

        {/* Bottom connector */}
        {!isLast ? <DottedPath grow /> : null}
      </div>

      {/* ── Right: card ── */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          marginLeft: 16,
          marginBottom: isLast ? 0 : 8,
          marginTop: 0,
          alignSelf: "flex-start",
          paddingTop: 13,
          background: hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)",
          border: `2px solid ${hovered ? meta.nodeBorder + "80" : meta.nodeBorder + "30"}`,
          borderRadius: "1rem",
          padding: "0.9rem 1.25rem",
          transform: hovered ? "translateX(4px)" : "translateX(0)",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, border-color 0.2s ease",
          cursor: "default",
        }}
      >
        {/* Time + type tag row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span
            style={{
              fontFamily: "ui-monospace, 'Geist Mono', monospace",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.45)",
              minWidth: 44,
            }}
          >
            {item.time}
          </span>
          {item.type && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "2px 9px",
                borderRadius: 99,
                background: meta.tagBg,
                color: meta.tagColor,
                border: `1px solid ${meta.tagColor}50`,
                fontFamily: "var(--font-fredoka), sans-serif",
                textTransform: "uppercase",
              }}
            >
              {meta.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h4
          style={{
            fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {item.title}
        </h4>

        {/* Description */}
        {item.description && (
          <p
            style={{
              fontFamily: "var(--font-prompt), sans-serif",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.85)",
              marginTop: 4,
              lineHeight: 1.55,
            }}
          >
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Day/World header ─────────────────────────────────────────────────── */
function WorldHeader({ day, dayIndex }: { day: TimelineDay; dayIndex: number }) {
  const reveal = useReveal(0);

  return (
    <div ref={reveal.ref} style={{ ...reveal.style, marginBottom: 28 }}>
      {/* World banner */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(135deg,#12143A 0%,#1C1F52 100%)",
          border: "2px solid #FBD000",
          borderRadius: "0.75rem",
          padding: "8px 20px",
          boxShadow: "0 4px 0 #C8950A, 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
          marginBottom: 10,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 18 }}>🗺️</span>
        <span
          style={{
            fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#FBD000",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textShadow: "0 2px 0 #C8950A",
          }}
        >
          World {dayIndex + 1}
        </span>
        <span aria-hidden="true" style={{ fontSize: 14 }}>★</span>
      </div>

      {/* Day sub-header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, paddingLeft: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: "#FBD000",
            textShadow: "0 2px 0 #C8950A",
          }}
        >
          {day.day}
        </span>
        <span
          style={{
            fontFamily: "var(--font-prompt), sans-serif",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          — {day.date}
        </span>
      </div>
    </div>
  );
}

/* ── Legend ──────────────────────────────────────────────────────────── */
function MapLegend() {
  return (
    <div
      aria-label="map legend"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 20px",
        marginBottom: 32,
        padding: "12px 16px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "0.75rem",
      }}
    >
      {Object.entries(TYPE_META).map(([key, meta]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden="true">{meta.icon}</span>
          <span
            style={{
              fontFamily: "var(--font-fredoka), sans-serif",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: meta.tagColor,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {meta.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Root export ──────────────────────────────────────────────────────── */
export default function MarioTimeline({ days }: { days: TimelineDay[] }) {
  return (
    <div>
      <MapLegend />
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {days.map((day, di) => (
          <div key={di}>
            <WorldHeader day={day} dayIndex={di} />
            <div>
              {day.items.map((item, ii) => (
                <MarioItem
                  key={ii}
                  item={item}
                  index={ii}
                  isFirst={ii === 0}
                  isLast={ii === day.items.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
