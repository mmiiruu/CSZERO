"use client";

import React from "react";

const FIELD_ICONS: Record<string, string> = {
  languages: "💻",
};

function getIcon(name?: string) {
  if (!name) return "🔹";
  return FIELD_ICONS[name] ?? "🔹";
}

interface Props {
  fieldName?: string;
  label?: string;
  options: { value: string; label: string }[];
  /** Comma-separated string of selected values, e.g. "python,java" */
  value: string;
  onChange: (next: string) => void;
  error?: string;
  helperText?: string;
}

export default function MarioCheckboxGroup({
  fieldName,
  label,
  options,
  value,
  onChange,
  error,
  helperText,
}: Props) {
  const selected = value ? value.split(",").filter(Boolean) : [];

  const toggle = (v: string) => {
    const next = selected.includes(v)
      ? selected.filter((s) => s !== v)
      : [...selected, v];
    onChange(next.join(","));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
            fontWeight: 700,
            fontSize: "0.92rem",
            color: "#2a1800",
            marginBottom: 2,
            userSelect: "none",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 15 }}>{getIcon(fieldName)}</span>
          {label}
        </span>
      )}

      <div role="group" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => {
          const isChecked = selected.includes(opt.value);
          const borderColor = error ? "#E52521" : isChecked ? "#FBD000" : "#8B6914";
          const shadowColor = error ? "#8B0000" : isChecked ? "#C8950A" : "#5A3E00";
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => toggle(opt.value)}
              style={{
                width: "100%",
                background: isChecked ? "#FFEFA0" : "#FFF8E8",
                border: `3px solid ${borderColor}`,
                borderRadius: "0.85rem",
                padding: "0.7rem 1rem",
                fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#1a1000",
                boxShadow: `0 4px 0 ${shadowColor}, inset 0 2px 0 rgba(255,255,255,0.6)`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
                minHeight: 44,
                transition: "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isChecked) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 22,
                  height: 22,
                  minWidth: 22,
                  borderRadius: 6,
                  border: "3px solid #8B6914",
                  background: isChecked ? "#43B047" : "#FFFDE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1,
                  flexShrink: 0,
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4)",
                  transition: "background 0.15s ease",
                }}
              >
                {isChecked && "✓"}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
            fontSize: "0.8rem",
            color: "#E52521",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 2,
          }}
        >
          <span aria-hidden="true">⚠️</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p
          style={{
            fontFamily: "var(--font-prompt), sans-serif",
            fontSize: "0.78rem",
            color: "#8B6914",
            marginTop: 2,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
