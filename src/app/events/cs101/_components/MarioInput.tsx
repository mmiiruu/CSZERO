"use client";

import React, { useState } from "react";
import MarioSelect from "./MarioSelect";

/* ── Field icon by common field names ──────────────────────────────────── */
const FIELD_ICONS: Record<string, string> = {
  name: "👤", nickname: "🏷️", email: "📧", phone: "📱", type: "🏫",
  experienceLevel: "🎮", languages: "💻", projects: "🚀",
  problemSolving: "🧩", favoriteTopic: "⭐",
  whyCS101: "💡", whatToGain: "🍄", goals: "🏆", anythingElse: "🪙",
};

function getIcon(name?: string) {
  if (!name) return "❓";
  return FIELD_ICONS[name] ?? "🔹";
}

/* ── Shared styles ─────────────────────────────────────────────────────── */
const FIELD_BASE: React.CSSProperties = {
  width: "100%",
  background: "#FFF8E8",
  border: "3px solid #8B6914",
  borderRadius: "0.85rem",
  padding: "0.8rem 1rem",
  fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
  fontWeight: 600,
  fontSize: "0.95rem",
  color: "#1a1000",
  boxShadow: "0 4px 0 #5A3E00, inset 0 2px 0 rgba(255,255,255,0.6)",
  outline: "none",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease",
  resize: "vertical",
};

const FIELD_FOCUS: React.CSSProperties = {
  borderColor: "#FBD000",
  boxShadow: "0 4px 0 #C8950A, 0 0 0 3px rgba(251,208,0,0.38), inset 0 2px 0 rgba(255,255,255,0.6)",
  transform: "translateY(-2px)",
};

const FIELD_ERROR: React.CSSProperties = {
  borderColor: "#E52521",
  boxShadow: "0 4px 0 #8B0000, 0 0 0 3px rgba(229,37,33,0.30), inset 0 2px 0 rgba(255,255,255,0.6)",
};

/* ── Label component ───────────────────────────────────────────────────── */
function MarioLabel({ label, fieldName }: { label?: string; fieldName?: string }) {
  if (!label) return null;
  return (
    <label
      htmlFor={fieldName}
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
    </label>
  );
}

/* ── Error / helper text ───────────────────────────────────────────────── */
function SubText({ error, helperText }: { error?: string; helperText?: string }) {
  if (error) {
    return (
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
    );
  }
  if (helperText) {
    return (
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
    );
  }
  return null;
}

/* ── Prop types ──────────────────────────────────────────────────────── */
interface BaseProps {
  fieldName?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

interface InputProps extends BaseProps, React.InputHTMLAttributes<HTMLInputElement> {
  as?: never;
}

interface TextareaProps extends BaseProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: "textarea";
}

interface SelectProps extends BaseProps {
  as: "select";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

type Props = InputProps | TextareaProps | SelectProps;

/* ── Main export ─────────────────────────────────────────────────────── */
export default function MarioInput(props: Props) {
  const [focused, setFocused] = useState(false);
  const { fieldName, label, error, helperText } = props;

  const fieldStyle: React.CSSProperties = {
    ...FIELD_BASE,
    ...(focused && !error ? FIELD_FOCUS : {}),
    ...(error ? FIELD_ERROR : {}),
    ...(focused && error
      ? { transform: "translateY(-2px)" }
      : {}),
  };

  /* Select */
  if ("as" in props && props.as === "select") {
    const { as: _a, fieldName: _fn, label: _l, error: _e, helperText: _h, value, onChange, options } = props as SelectProps;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <MarioLabel label={label} fieldName={fieldName} />
        <MarioSelect id={fieldName} value={value} onChange={onChange} options={options} error={!!error} />
        <SubText error={error} helperText={helperText} />
      </div>
    );
  }

  /* Textarea */
  if ("as" in props && props.as === "textarea") {
    const { as: _a, fieldName: _fn, label: _l, error: _e, helperText: _h, className: _c, ...rest } = props as TextareaProps & { className?: string };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <MarioLabel label={label} fieldName={fieldName} />
        <textarea
          {...rest}
          id={fieldName}
          style={{ ...fieldStyle, minHeight: 104 }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={rest.placeholder}
        />
        <SubText error={error} helperText={helperText} />
      </div>
    );
  }

  /* Input */
  const { as: _a, fieldName: _fn, label: _l, error: _e, helperText: _h, className: _c, ...rest } = props as InputProps & { className?: string };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <MarioLabel label={label} fieldName={fieldName} />
      <input
        {...rest}
        id={fieldName}
        style={fieldStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <SubText error={error} helperText={helperText} />
    </div>
  );
}
