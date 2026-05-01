"use client";

import React, { useState, useRef, useEffect, useId } from "react";

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
}

export default function MarioSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "เลือก...",
  error = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const listboxId = `${uid}lb`;
  const optId = (i: number) => `${uid}o${i}`;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex] ?? null;

  /* ── Close on outside pointer ───────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  /* ── Scroll focused option into view ────────────────────────────────── */
  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    document.getElementById(optId(focusedIndex))?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const openAt = (idx: number) => {
    setFocusedIndex(idx);
    setOpen(true);
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    setFocusedIndex(-1);
    if (returnFocus) triggerRef.current?.focus();
  };

  const selectAt = (idx: number) => {
    onChange(options[idx].value);
    close(true);
  };

  /* ── Keyboard handler (focus stays on trigger throughout) ───────────── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          openAt(selectedIndex >= 0 ? selectedIndex : 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          openAt(options.length - 1);
          break;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) selectAt(focusedIndex);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  const borderColor = error ? "#E52521" : open ? "#FBD000" : "#8B6914";
  const glowColor = error ? "rgba(229,37,33,0.35)" : "rgba(251,208,0,0.35)";
  const activeDescendant = open && focusedIndex >= 0 ? optId(focusedIndex) : undefined;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <style>{`
        @keyframes mario-select-drop {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);     }
        }
      `}</style>

      {/* Trigger — focus never leaves this button while dropdown is open */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? close(true) : openAt(selectedIndex >= 0 ? selectedIndex : 0))}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#FFF8E8",
          border: `3px solid ${borderColor}`,
          borderRadius: "0.85rem",
          padding: "0.8rem 1rem",
          fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
          fontWeight: 600,
          fontSize: "0.95rem",
          color: selected ? "#1a1000" : "#9a7840",
          cursor: "pointer",
          textAlign: "left",
          boxShadow: open
            ? `0 4px 0 ${error ? "#8B0000" : "#C8950A"}, 0 0 0 3px ${glowColor}, inset 0 2px 0 rgba(255,255,255,0.6)`
            : `0 4px 0 ${error ? "#8B0000" : "#5A3E00"}, inset 0 2px 0 rgba(255,255,255,0.6)`,
          transition: "box-shadow 0.18s ease, border-color 0.18s ease, transform 0.15s ease",
          transform: open ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8B6914"
          strokeWidth="2.5"
          aria-hidden="true"
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Listbox — rendered in DOM when open; focus stays on trigger via aria-activedescendant */}
      {open && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 50,
            width: "100%",
            marginTop: 6,
            background: "#FFF8E8",
            border: "3px solid #C8950A",
            borderRadius: "0.85rem",
            boxShadow: "0 8px 0 #5A3E00, 0 12px 32px rgba(0,0,0,0.25)",
            overflowY: "auto",
            maxHeight: 240,
            animation: "mario-select-drop 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isFocused = i === focusedIndex;
            return (
              <div
                key={opt.value}
                id={optId(i)}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectAt(i)}
                onMouseEnter={() => setFocusedIndex(i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.7rem 1rem",
                  fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: "0.95rem",
                  color: isSelected ? "#1a1000" : "#5A3E00",
                  background: isFocused
                    ? "rgba(251,208,0,0.35)"
                    : isSelected
                    ? "rgba(251,208,0,0.18)"
                    : "transparent",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background 0.1s ease",
                  outline: isFocused ? "2px solid #C8950A" : "none",
                  outlineOffset: "-2px",
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C8950A"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
