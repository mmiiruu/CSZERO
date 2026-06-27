import type { Countdown } from "@/lib/registration";
import { AMBER, TEXT_D } from "./theme";

export function CountdownBlocks({ countdown }: { countdown: Countdown }) {
  const cells: Array<[string, number]> = [
    ["วัน", countdown.days],
    ["ชั่วโมง", countdown.hours],
    ["นาที", countdown.minutes],
    ["วินาที", countdown.seconds],
  ];
  return (
    <div role="timer" aria-live="polite" className="grid grid-cols-4 gap-2 mb-6">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl py-3 px-1 text-center"
          style={{
            background: "#FFFFFF",
            border: "2px solid rgba(202,138,4,0.35)",
            boxShadow: "0 4px 14px rgba(202,138,4,0.18)",
          }}
        >
          <div
            className="font-display font-black"
            style={{
              fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
              color: TEXT_D,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: AMBER }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
