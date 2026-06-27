"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import type { ImageField } from "@/config/forms/hello-world-register";
import { AMBER, AMBER_LT, TEXT_D, TEXT_M } from "./theme";

export function ImageUpload({
  field, value, onChange, error,
}: {
  field: ImageField; value: string; onChange: (v: string) => void; error?: string;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setLocalError("ต้องอัปโหลดน้อยกว่า 8 MB");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setLocalError(null);
    try {
      const result = await upload(`hello-world/${field.name}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange(result.url);
      setStatus("idle");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const tooLarge = /size|too large|exceed|limit/i.test(raw);
      setLocalError(tooLarge ? "ต้องอัปโหลดน้อยกว่า 8 MB" : (raw || "อัปโหลดไม่สำเร็จ"));
      setStatus("error");
    }
  };

  const inputId = `image-${field.name}`;
  const shown = error || localError;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-bold" style={{ color: TEXT_D }}>
        {field.label}
      </label>
      {field.helperText && (
        <p className="text-xs" style={{ color: TEXT_M }}>{field.helperText}</p>
      )}

      {value ? (
        <div
          className="relative rounded-2xl overflow-hidden border-2"
          style={{ borderColor: "#CA8A04", boxShadow: "0 4px 14px rgba(202,138,4,0.18)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={field.label} className="w-full h-44 object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-transform motion-safe:hover:scale-105"
            style={{ background: "rgba(255,255,255,0.95)", color: "#B91C1C", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            ลบ / เปลี่ยน
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl p-6 cursor-pointer border-2 border-dashed transition-transform motion-safe:hover:scale-[1.01]"
          style={{
            borderColor: status === "uploading" ? AMBER : "#E5E7EB",
            background: status === "uploading" ? AMBER_LT : "#FAFAFA",
            color: TEXT_M,
          }}
        >
          {status === "uploading" ? (
            <>
              <svg aria-hidden="true" className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold">กำลังอัปโหลด...</span>
            </>
          ) : (
            <>
              <svg aria-hidden="true" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
              </svg>
              <span className="text-sm font-semibold">แตะเพื่อเลือกรูป</span>
              <span className="text-[11px]" style={{ color: "#9CA3AF" }}>JPG / PNG / WebP / HEIC · สูงสุด 8 MB</span>
            </>
          )}
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        disabled={status === "uploading"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {shown && <p role="alert" className="text-xs text-red-600">{shown}</p>}
    </div>
  );
}
