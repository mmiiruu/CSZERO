"use client";

import { useState } from "react";
import { AMBER, TEXT_D, TEXT_M } from "./theme";

export function SurveyModal({ onClose }: { onClose: () => void }) {
  const [clicked, setClicked] = useState(false);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="survey-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="rounded-3xl"
        style={{
          maxWidth: 420,
          width: "100%",
          background: "#FFFFFF",
          border: `3px solid rgba(202,138,4,0.45)`,
          padding: "2rem 1.75rem",
          boxShadow: "0 24px 64px rgba(202,138,4,0.22), 0 4px 16px rgba(0,0,0,0.08)",
          animation: "hw-survey-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <style>{`
          @keyframes hw-survey-pop {
            from { opacity: 0; transform: scale(0.85) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div aria-hidden="true" style={{ fontSize: 44, textAlign: "center", marginBottom: "0.75rem" }}>📋</div>

        <h2
          id="survey-modal-title"
          className="font-display font-black text-xl text-center mb-3"
          style={{ color: TEXT_D, lineHeight: 1.4 }}
        >
          แบบสำรวจจากภาควิชา
        </h2>

        <p className="text-sm text-center leading-relaxed mb-5" style={{ color: TEXT_M }}>
          ก่อนลงทะเบียนกิจกรรม รบกวนน้องๆกรอกแบบสำรวจให้ทางภาควิชาหน่อยนะ 🙏
        </p>

        <a
          href="https://forms.gle/e7m6YhZXmwzh2b3M7"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setClicked(true)}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl font-black text-sm mb-3 transition-[shadow,transform] duration-200 motion-safe:hover:scale-[1.02] hover:shadow-xl"
          style={{
            background: AMBER,
            color: "#FFFFFF",
            boxShadow: "0 6px 20px rgba(217,119,6,0.38)",
            textDecoration: "none",
          }}
        >
          <span aria-hidden="true">📝</span>
          กรอกแบบสำรวจ
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>

        {!clicked && (
          <p className="text-xs text-center mb-2" style={{ color: AMBER }}>
            กรุณากดลิงก์แบบสำรวจก่อนนะ 🙏
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={!clicked}
          className="w-full py-2.5 rounded-2xl text-sm font-semibold border-2 transition-colors duration-200"
          style={{
            borderColor: clicked ? "#E5E7EB" : "#F3F4F6",
            color: clicked ? TEXT_M : "#D1D5DB",
            cursor: clicked ? "pointer" : "not-allowed",
            opacity: clicked ? 1 : 0.5,
          }}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
