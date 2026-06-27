import React from "react";
import { AMBER, AMBER_LT, TEXT_D } from "./theme";

export function StepDots({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-start justify-center mb-8 px-2">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-colors duration-300"
              style={{
                background: i < current ? AMBER : i === current ? AMBER_LT : "rgba(255,255,255,0.55)",
                border: `2.5px solid ${i <= current ? AMBER : "rgba(255,255,255,0.45)"}`,
                color: i < current ? "#FFFFFF" : i === current ? "#713F12" : "#A8A29E",
                boxShadow: i === current ? `0 4px 14px rgba(217,119,6,0.38)` : "none",
              }}
            >
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span
              className="text-xs font-semibold hidden sm:block leading-tight text-center max-w-[72px]"
              style={{ color: i <= current ? TEXT_D : "#A8A29E" }}
            >
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div className="flex-1 mx-1.5 mt-[18px]">
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.4)" }}>
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ background: AMBER, width: i < current ? "100%" : "0%" }}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
