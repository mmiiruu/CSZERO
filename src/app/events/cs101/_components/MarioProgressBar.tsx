"use client";

import React from "react";

interface Props {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

/* Coin SVG — completed steps */
function Coin({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="url(#cg)" stroke="#C8950A" strokeWidth="2" />
      <circle cx="14" cy="12" r="13" fill="url(#cgt)" stroke="#C8950A" strokeWidth="2" />
      <defs>
        <radialGradient id="cg" cx="40%" cy="35%" r="60%">
          <stop offset="0%"  stopColor="#FFE135" />
          <stop offset="100%" stopColor="#FBD000" />
        </radialGradient>
        <radialGradient id="cgt" cx="40%" cy="35%" r="60%">
          <stop offset="0%"  stopColor="#FFE135" />
          <stop offset="100%" stopColor="#FBD000" />
        </radialGradient>
      </defs>
      {/* ✓ mark */}
      <path d="M9 14l3.5 3.5L19 10" stroke="#C8950A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* Question block SVG — future steps */
function QuestionBlock({ size = 28, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <rect x="1.5" y="1.5" width="25" height="25" rx="5" fill={active ? "#FBD000" : "#5A4A1A"} stroke={active ? "#C8950A" : "#3A2E0A"} strokeWidth="2" />
      {active && (
        <rect x="1.5" y="1.5" width="25" height="5" rx="4" fill="rgba(255,255,255,0.25)" />
      )}
      <text
        x="14" y="19"
        textAnchor="middle"
        fontSize="15"
        fontWeight="bold"
        fontFamily="'Fredoka', sans-serif"
        fill={active ? "#1a1000" : "#8B7840"}
      >
        ?
      </text>
    </svg>
  );
}

export default function MarioProgressBar({ currentStep, totalSteps, labels }: Props) {
  return (
    <div>
      <style>{`
        @keyframes mario-pb-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        .mario-pb-active { animation: mario-pb-bounce 0.9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mario-pb-active { animation: none !important; }
        }
      `}</style>

      {/* Nodes row */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 0 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < totalSteps - 1 ? 1 : "none" }}>
            {/* Node */}
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
              className={i === currentStep ? "mario-pb-active" : ""}
            >
              {i < currentStep ? (
                <Coin size={30} />
              ) : (
                <QuestionBlock size={30} active={i === currentStep} />
              )}
              {labels?.[i] && (
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
                    fontWeight: 700,
                    color: i <= currentStep ? "#FBD000" : "rgba(255,255,255,0.3)",
                    textAlign: "center",
                    maxWidth: 64,
                    lineHeight: 1.2,
                    display: "none",
                  }}
                  className="sm:block"
                >
                  {labels[i]}
                </span>
              )}
            </div>

            {/* Connector dashes */}
            {i < totalSteps - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 4,
                  marginBottom: labels ? 20 : 0,
                  marginInline: 4,
                  background:
                    i < currentStep
                      ? "repeating-linear-gradient(90deg,#FBD000 0px,#FBD000 8px,transparent 8px,transparent 16px)"
                      : "repeating-linear-gradient(90deg,rgba(255,255,255,0.15) 0px,rgba(255,255,255,0.15) 8px,transparent 8px,transparent 16px)",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile current label */}
      {labels?.[currentStep] && (
        <p
          style={{
            fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            marginTop: 10,
          }}
          className="sm:hidden"
        >
          Step {currentStep + 1}: {labels[currentStep]}
        </p>
      )}
    </div>
  );
}
