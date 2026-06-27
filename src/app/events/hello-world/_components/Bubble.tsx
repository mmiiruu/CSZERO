import React from "react";

export function Bubble({
  emoji, bg, style, delay = "0s",
}: {
  emoji: string; bg: string; style: React.CSSProperties; delay?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute select-none pointer-events-none animate-[float-slow_8s_ease-in-out_infinite]"
      style={{ ...style, animationDelay: delay }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{ background: bg, border: "2px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        {emoji}
      </div>
    </div>
  );
}
