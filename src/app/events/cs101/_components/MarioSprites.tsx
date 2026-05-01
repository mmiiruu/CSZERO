import React from "react";

/* ────────────────────────────────────────────────────────────────────────
   Self-contained SVG sprites — never depend on external URLs.
   All viewBox="0 0 100 100" so sizing is controlled by width/height props.
──────────────────────────────────────────────────────────────────────── */

interface SpriteProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}

/* ── Super Star ────────────────────────────────────────────────────────
   Classic 5-pointed star with face, gold gradient, and sheen highlight.
──────────────────────────────────────────────────────────────────────── */
export function SuperStar({ width = 80, height = 80, className, style, ...rest }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      {...rest}
    >
      <defs>
        <radialGradient id="star-grad" cx="42%" cy="38%" r="62%">
          <stop offset="0%"   stopColor="#FFE135" />
          <stop offset="55%"  stopColor="#FBD000" />
          <stop offset="100%" stopColor="#E8A900" />
        </radialGradient>
        <filter id="star-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#C8950A" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Body — 5-pointed star polygon */}
      <polygon
        points="50,6 60.58,35.44 91.85,36.40 67.12,55.56 75.86,85.60 50,68 24.14,85.60 32.88,55.56 8.15,36.40 39.42,35.44"
        fill="url(#star-grad)"
        stroke="#C8950A"
        strokeWidth="3"
        strokeLinejoin="round"
        filter="url(#star-shadow)"
      />

      {/* Sheen highlight on upper-left */}
      <polygon
        points="50,6 60.58,35.44 91.85,36.40 67.12,55.56 75.86,85.60 50,68 24.14,85.60 32.88,55.56 8.15,36.40 39.42,35.44"
        fill="rgba(255,255,255,0.18)"
        strokeWidth="0"
        clipPath="polygon(0 0, 50% 0, 20% 60%, 0 100%)"
      />

      {/* Eyes */}
      <ellipse cx="38" cy="50" rx="5" ry="6" fill="#1a1000" />
      <ellipse cx="62" cy="50" rx="5" ry="6" fill="#1a1000" />

      {/* Eye shines */}
      <circle cx="40" cy="47" r="2.2" fill="white" />
      <circle cx="64" cy="47" r="2.2" fill="white" />

      {/* Highlight arc on top of star body */}
      <path
        d="M 34,30 Q 50,22 66,30"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Question Block ────────────────────────────────────────────────────
   Classic gold ? block with 3-D bevel shading and interior highlight.
──────────────────────────────────────────────────────────────────────── */
export function QuestionBlock({ width = 80, height = 80, className, style, ...rest }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      {...rest}
    >
      <defs>
        <linearGradient id="qb-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#FFE135" />
          <stop offset="100%" stopColor="#E8A900" />
        </linearGradient>
      </defs>

      {/* Outer shadow block */}
      <rect x="4" y="10" width="92" height="86" rx="7" fill="#5A3E00" />

      {/* Main block */}
      <rect x="4" y="4" width="92" height="86" rx="7" fill="url(#qb-grad)" />

      {/* Dark border */}
      <rect x="4" y="4" width="92" height="86" rx="7" fill="none" stroke="#8B6914" strokeWidth="4" />

      {/* Top highlight */}
      <rect x="10" y="10" width="80" height="9" rx="4" fill="rgba(255,255,255,0.50)" />

      {/* Left highlight */}
      <rect x="10" y="10" width="9" height="68" rx="4" fill="rgba(255,255,255,0.28)" />

      {/* Bottom shadow strip */}
      <rect x="10" y="72" width="80" height="9" rx="4" fill="rgba(0,0,0,0.14)" />

      {/* ? character */}
      <text
        x="50" y="72"
        textAnchor="middle"
        fontFamily="'Arial Black','Impact',sans-serif"
        fontSize="52"
        fontWeight="900"
        fill="#5A3E00"
      >
        ?
      </text>
    </svg>
  );
}

/* ── Super Mushroom ────────────────────────────────────────────────────
   Classic power-up mushroom: red dome with white spots, white body, face.
──────────────────────────────────────────────────────────────────────── */
export function SuperMushroom({ width = 80, height = 80, className, style, ...rest }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 100 110"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      {...rest}
    >
      <defs>
        <radialGradient id="cap-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#FF6060" />
          <stop offset="100%" stopColor="#C01E1B" />
        </radialGradient>
        <radialGradient id="body-grad" cx="40%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </radialGradient>
        <radialGradient id="spot-grad" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D8D8D8" />
        </radialGradient>
      </defs>

      {/* Body (white trapezoid) */}
      <path
        d="M22,58 Q18,90 20,100 Q50,108 80,100 Q82,90 78,58 Z"
        fill="url(#body-grad)"
        stroke="#BBBBBB"
        strokeWidth="2"
      />

      {/* Cap dome */}
      <path
        d="M8,58 Q6,20 50,10 Q94,20 92,58 Z"
        fill="url(#cap-grad)"
        stroke="#8B0000"
        strokeWidth="3"
      />

      {/* Cap sheen highlight */}
      <path
        d="M22,42 Q30,20 50,14"
        stroke="rgba(255,255,255,0.40)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* White spots on cap */}
      <circle cx="33" cy="38" r="10" fill="url(#spot-grad)" stroke="#C8C8C8" strokeWidth="1.5" />
      <circle cx="67" cy="38" r="10" fill="url(#spot-grad)" stroke="#C8C8C8" strokeWidth="1.5" />
      <circle cx="50" cy="24" r="7"  fill="url(#spot-grad)" stroke="#C8C8C8" strokeWidth="1.5" />

      {/* Eyes */}
      <ellipse cx="37" cy="68" rx="7" ry="8" fill="#1a1000" />
      <ellipse cx="63" cy="68" rx="7" ry="8" fill="#1a1000" />

      {/* Eye shines */}
      <circle cx="40" cy="64" r="2.8" fill="white" />
      <circle cx="66" cy="64" r="2.8" fill="white" />

      {/* Feet */}
      <ellipse cx="29" cy="104" rx="14" ry="7" fill="#E8D5B0" stroke="#C0A070" strokeWidth="2" />
      <ellipse cx="71" cy="104" rx="14" ry="7" fill="#E8D5B0" stroke="#C0A070" strokeWidth="2" />
    </svg>
  );
}
