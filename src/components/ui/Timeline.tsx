import React from "react";

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

export default function Timeline({ days, accentColor = "#2563eb" }: TimelineProps) {
  return (
    <div className="space-y-12">
      {days.map((day, dayIndex) => (
        <div key={dayIndex}>
          {/* Day header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{day.day}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{day.date}</p>
            </div>
          </div>

          {/* ── Desktop: centered zigzag ── */}
          <div className="hidden md:block relative">
            {/* Center vertical line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
              style={{ backgroundColor: accentColor + "33" }}
            />

            <div className="space-y-6">
              {day.items.map((item, itemIndex) => {
                const isLeft = itemIndex % 2 === 0;
                return (
                  <div key={itemIndex} className="relative grid grid-cols-[1fr_auto_1fr] items-center group">

                    {/* Left slot */}
                    <div className={`pr-10 ${isLeft ? "" : "invisible"}`}>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap mb-1">
                          {item.type && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[item.type] || ""}`}>
                              {item.type}
                            </span>
                          )}
                          <span className="text-sm font-mono text-slate-400 dark:text-slate-500">{item.time}</span>
                        </div>
                        <h4 className="text-slate-800 dark:text-white font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="flex justify-center w-6">
                      <div
                        className="w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 z-10 group-hover:scale-125 transition-transform duration-200 shrink-0"
                        style={{ borderColor: accentColor }}
                      />
                    </div>

                    {/* Right slot */}
                    <div className={`pl-10 ${!isLeft ? "" : "invisible"}`}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-mono text-slate-400 dark:text-slate-500">{item.time}</span>
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
              })}
            </div>
          </div>

          {/* ── Mobile: original left-aligned ── */}
          <div className="md:hidden relative ml-1.5 pl-8 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
            {day.items.map((item, itemIndex) => (
              <div key={itemIndex} className="relative group">
                <div
                  className={`absolute -left-[calc(2rem+6px)] top-1.5 w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 group-hover:scale-125 ${
                    itemIndex === 0 && dayIndex === 0 ? "" : "bg-white dark:bg-slate-900"
                  }`}
                  style={{
                    borderColor: accentColor,
                    ...(itemIndex === 0 && dayIndex === 0 ? { backgroundColor: accentColor } : {}),
                  }}
                />
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <span className="text-sm text-slate-400 dark:text-slate-500 font-mono min-w-[60px] pt-0.5">
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
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}
