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

export default function Timeline({
  days,
  accentColor = "#2563eb",
}: TimelineProps) {
  const typeColors: Record<string, string> = {
    talk: "bg-blue-50 text-blue-600 border-blue-200",
    workshop: "bg-emerald-50 text-emerald-600 border-emerald-200",
    break: "bg-amber-50 text-amber-600 border-amber-200",
    social: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className="space-y-12">
      {days.map((day, dayIndex) => (
        <div key={dayIndex}>
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <div>
              <h3 className="text-xl font-bold text-slate-800">{day.day}</h3>
              <p className="text-sm text-slate-500">{day.date}</p>
            </div>
          </div>

          <div className="relative ml-1.5 pl-8 border-l-2 border-slate-200 space-y-6">
            {day.items.map((item, itemIndex) => (
              <div key={itemIndex} className="relative group">
                <div
                  className="absolute -left-[calc(2rem+6px)] top-1.5 w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 group-hover:scale-125"
                  style={{
                    borderColor: accentColor,
                    backgroundColor:
                      itemIndex === 0 && dayIndex === 0
                        ? accentColor
                        : "white",
                  }}
                />

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <span className="text-sm text-slate-400 font-mono min-w-[60px] pt-0.5">
                    {item.time}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-slate-800 font-medium">{item.title}</h4>
                      {item.type && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            typeColors[item.type] || ""
                          }`}
                        >
                          {item.type}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-500 mt-1">
                        {item.description}
                      </p>
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
