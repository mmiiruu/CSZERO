"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
  className?: string;
  id?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error = false,
  className = "",
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between bg-card border rounded-xl px-4 py-3 text-left text-sm transition-[colors,shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 ${
          error
            ? "border-red-300 dark:border-red-700 focus-visible:ring-red-500/30 focus-visible:border-red-500"
            : open
            ? "border-blue-500 ring-2 ring-blue-500/30"
            : "border-border hover:border-border-subtle"
        }`}
      >
        <span className={selected ? "text-foreground" : "text-muted"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-card border border-border rounded-xl shadow-lg overflow-hidden motion-safe:animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                opt.value === value
                  ? "bg-hover text-foreground font-medium"
                  : "text-secondary hover:bg-hover hover:text-foreground"
              }`}
            >
              {opt.label}
              {opt.value === value && (
                <svg
                  className="w-3.5 h-3.5 text-muted shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
