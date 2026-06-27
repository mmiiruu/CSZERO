import type { ChoiceField } from "@/config/forms/hello-world-register";
import { AMBER_LT, TEXT_D } from "./theme";

export function ChoiceButtons({
  field, value, onChange, error,
}: {
  field: ChoiceField; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="block text-sm font-bold" style={{ color: TEXT_D }}>{field.label}</legend>
      <div className={field.layout === "grid2" ? "grid grid-cols-2 gap-3" : "flex gap-3"}>
        {field.options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`${field.layout === "flex" ? "flex-1" : ""} p-4 rounded-2xl border-2 text-left transition-transform duration-200 motion-safe:hover:scale-[1.02] motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400`}
              style={{
                background: active ? AMBER_LT : "#FFFFFF",
                borderColor: active ? "#CA8A04" : "#E5E7EB",
                boxShadow: active ? `0 4px 16px rgba(202,138,4,0.28)` : "0 1px 4px rgba(0,0,0,0.05)",
                color: active ? "#713F12" : "#6B7280",
              }}
            >
              <div className={`font-bold ${field.layout === "flex" ? "text-center text-base" : "text-xl mb-1"}`}>
                {opt.label}
              </div>
              {opt.desc && (
                <div className="text-xs mt-0.5" style={{ color: active ? "#92400E" : "#9CA3AF" }}>
                  {opt.desc}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="text-xs text-red-600 mt-1">{error}</p>}
    </fieldset>
  );
}
