"use client";

import React, { useRef, useEffect, useState } from "react";

export interface TimelineItem {
  time: string;
  title: string;
  description?: string;
  type?: "talk" | "workshop" | "break" | "social";
}

export interface TimelineDay {
  day: string;
  date: string;
  items: TimelineItem[];
}

interface TimelineProps {
  days: TimelineDay[];
  accentColor?: string;
}

const typeColors: Record<string, string> = {
  talk:     "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  workshop: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  break:    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  social:   "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
};

/** One-shot scroll reveal — fires when element first enters the viewport. */
function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/** Desktop zigzag row — slides in from its natural side. */
function DesktopTimelineItem({
  item,
  itemIndex,
  accentColor,
}: {
  item: TimelineItem;
  itemIndex: number;
  accentColor: string;
}) {
  const { ref, visible } = useReveal(0.2);
  const isLeft = itemIndex % 2 === 0;
  const stagger = itemIndex * 80;

  const slideStyle = (fromSide: "left" | "right"): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : `translateX(${fromSide === "left" ? "-28px" : "28px"})`,
    transition: `opacity 0.45s ease-out ${stagger}ms, transform 0.45s cubic-bezier(0.25, 1, 0.5, 1) ${stagger}ms`,
  });

  const dotStyle: React.CSSProperties = {
    transform: visible ? "scale(1)" : "scale(0)",
    transition: `transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${stagger + 120}ms`,
  };

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr_auto_1fr] items-center group">
      {/* Left slot */}
      <div className={`pr-10 ${isLeft ? "" : "invisible"}`} style={slideStyle("left")}>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 flex-wrap mb-1">
            {item.type && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[item.type] || ""}`}>
                {item.type}
              </span>
            )}
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{item.time}</span>
          </div>
          <h4 className="text-slate-800 dark:text-white font-medium">{item.title}</h4>
          {item.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
          )}
        </div>
      </div>

      {/* Center dot — pops in slightly after content */}
      <div className="flex justify-center w-6" style={dotStyle}>
        <div
          className="w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 z-10 shrink-0 group-hover:scale-125 transition-transform duration-200"
          style={{ borderColor: accentColor }}
        />
      </div>

      {/* Right slot */}
      <div className={`pl-10 ${!isLeft ? "" : "invisible"}`} style={slideStyle("right")}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{item.time}</span>
          {item.type && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[item.type] || ""}`}>
              {item.type}
            </span>
          )}
        </div>
        <h4 className="text-slate-800 dark:text-white font-medium">{item.title}</h4>
        {item.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
        )}
      </div>
    </div>
  );
}

/** Mobile list item — slides in from the left with stagger. */
function MobileTimelineItem({
  item,
  itemIndex,
  dayIndex,
  accentColor,
}: {
  item: TimelineItem;
  itemIndex: number;
  dayIndex: number;
  accentColor: string;
}) {
  const { ref, visible } = useReveal(0.2);
  const stagger = itemIndex * 80;
  const isFirstEver = itemIndex === 0 && dayIndex === 0;

  return (
    <div
      ref={ref}
      className="relative group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-20px)",
        transition: `opacity 0.4s ease-out ${stagger}ms, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) ${stagger}ms`,
      }}
    >
      {/* Dot wrapper — pops in after row starts fading in */}
      <div
        className="absolute -left-[calc(2rem+6px)] top-1.5"
        style={{
          transform: visible ? "scale(1)" : "scale(0)",
          transition: `transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${stagger + 80}ms`,
        }}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full border-2 group-hover:scale-125 transition-transform duration-200 ${
            isFirstEver ? "" : "bg-white dark:bg-slate-900"
          }`}
          style={{
            borderColor: accentColor,
            ...(isFirstEver ? { backgroundColor: accentColor } : {}),
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono min-w-[60px] pt-0.5">
          {item.time}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-slate-800 dark:text-white font-medium">{item.title}</h4>
            {item.type && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[item.type] || ""}`}>
                {item.type}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Day section — manages header reveal and the growing spine. */
function DaySection({
  day,
  dayIndex,
  accentColor,
}: {
  day: TimelineDay;
  dayIndex: number;
  accentColor: string;
}) {
  const { ref: headerRef, visible: headerVisible } = useReveal(0.1);

  return (
    <div>
      {/* Day header — fades up */}
      <div
        ref={headerRef}
        className="flex items-center gap-4 mb-10"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{day.day}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{day.date}</p>
        </div>
      </div>

      {/* ── Desktop: centered zigzag ── */}
      <div className="hidden md:block relative">
        {/* Vertical spine — grows from top when header becomes visible */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5"
          style={{
            backgroundColor: accentColor + "33",
            transform: headerVisible ? "translateX(-50%) scaleY(1)" : "translateX(-50%) scaleY(0)",
            transformOrigin: "top",
            transition: "transform 1.4s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
        <div className="space-y-6">
          {day.items.map((item, ii) => (
            <DesktopTimelineItem key={ii} item={item} itemIndex={ii} accentColor={accentColor} />
          ))}
        </div>
      </div>

      {/* ── Mobile: left-aligned list ── */}
      <div className="md:hidden relative ml-1.5 pl-8 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
        {day.items.map((item, ii) => (
          <MobileTimelineItem key={ii} item={item} itemIndex={ii} dayIndex={dayIndex} accentColor={accentColor} />
        ))}
      </div>
    </div>
  );
}

export default function Timeline({ days, accentColor = "#2563eb" }: TimelineProps) {
  return (
    <div className="space-y-12">
      {days.map((day, di) => (
        <DaySection key={di} day={day} dayIndex={di} accentColor={accentColor} />
      ))}
    </div>
  );
}
