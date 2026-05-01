"use client";

import React from "react";

const STEP_ICONS = ["👤", "🎮", "🧩", "💡", "🏆", "🪙"];

interface Props {
  title: string;
  description?: string;
  stepIndex?: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSubmitting?: boolean;
}

export default function MarioFormStep({
  title,
  description,
  stepIndex = 0,
  children,
  onNext,
  onBack,
  isFirst = false,
  isLast = false,
  isSubmitting = false,
}: Props) {
  const icon = STEP_ICONS[stepIndex] ?? "❓";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "mario-step-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      <style>{`
        @keyframes mario-step-in {
          from { opacity:0; transform: translateY(16px) scale(0.98); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
        @keyframes mario-spin-anim {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .mario-spin { animation: mario-spin-anim 1s linear infinite; }
        .mario-form-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-fredoka), var(--font-prompt), sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.03em;
          border-radius: 0.85rem;
          cursor: pointer;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, opacity 0.15s;
          border: none;
          user-select: none;
        }
        .mario-form-btn:hover:not(:disabled) { transform: translateY(-4px) scale(1.05); }
        .mario-form-btn:active:not(:disabled) { transform: translateY(2px) scale(0.96); transition-duration:0.08s; }
        .mario-form-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .mario-next-btn {
          padding: 0.85rem 1.75rem;
          background: linear-gradient(180deg,#35C9F5 0%,#049CD8 100%);
          color: #fff;
          border: 3px solid #0275A0;
          box-shadow: 0 6px 0 #0275A0, 0 8px 20px rgba(4,156,216,0.38);
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .mario-next-btn:hover:not(:disabled) {
          box-shadow: 0 10px 0 #0275A0, 0 12px 28px rgba(4,156,216,0.48);
        }
        .mario-next-btn:active:not(:disabled) {
          box-shadow: 0 3px 0 #0275A0, 0 4px 10px rgba(4,156,216,0.28);
        }
        .mario-submit-btn {
          padding: 0.85rem 1.75rem;
          background: linear-gradient(180deg,#FF6B67 0%,#E52521 100%);
          color: #fff;
          border: 3px solid #8B0000;
          box-shadow: 0 6px 0 #8B0000, 0 8px 20px rgba(229,37,33,0.38);
          text-shadow: 0 1px 2px rgba(0,0,0,0.25);
        }
        .mario-submit-btn:hover:not(:disabled) {
          box-shadow: 0 10px 0 #8B0000, 0 12px 28px rgba(229,37,33,0.48);
        }
        .mario-submit-btn:active:not(:disabled) {
          box-shadow: 0 3px 0 #8B0000, 0 4px 10px rgba(229,37,33,0.28);
        }
        .mario-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-fredoka), var(--font-prompt), sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.55);
          background: transparent;
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 0.75rem;
          padding: 0.75rem 1.1rem;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s, transform 0.15s;
        }
        .mario-back-btn:hover {
          color: rgba(255,255,255,0.85);
          border-color: rgba(255,255,255,0.35);
          transform: translateX(-3px);
        }
      `}</style>

      {/* Step header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#FFE135,#FBD000)",
            border: "3px solid #C8950A",
            boxShadow: "0 3px 0 #8B6914, inset 0 2px 0 rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              fontWeight: 700,
              fontSize: "1.35rem",
              color: "#1a1000",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h2>
          {description && (
            <p
              style={{
                fontFamily: "var(--font-prompt), sans-serif",
                fontSize: "0.88rem",
                color: "#7A5C20",
                marginTop: 3,
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 20,
          borderTop: "2px dashed #C8950A40",
          marginTop: 4,
        }}
      >
        {!isFirst ? (
          <button type="button" onClick={onBack} className="mario-back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}

        {isLast ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="mario-form-btn mario-submit-btn"
          >
            {isSubmitting ? (
              <svg className="mario-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span aria-hidden="true">⭐</span>
            )}
            {isSubmitting ? "กำลังส่ง..." : "Let's-a Go!"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="mario-form-btn mario-next-btn"
          >
            ต่อไป
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
