"use client";

import { useState, useRef } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { upload } from "@vercel/blob/client";

interface Props {
  value: string;
  onChange: (url: string) => void;
  prefix?: string;
  label?: string;
}

async function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const size = Math.min(crop.width * scaleX, 1200);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, size, size
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error("Canvas empty")); },
      "image/jpeg", 0.92
    );
  });
}

export default function ImageUploadWithCrop({
  value,
  onChange,
  prefix = "candidates",
  label = "รูปตนเอง",
}: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const openCrop = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setErrMsg("ไฟล์ต้องไม่เกิน 20 MB");
      return;
    }
    setErrMsg("");
    const reader = new FileReader();
    reader.onload = () => setSrcUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 1, width, height), width, height));
  };

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    setStatus("uploading");
    const src = srcUrl;
    setSrcUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop);
      const filename = `crop-${Date.now()}.jpg`;
      const result = await upload(`${prefix}/${filename}`, blob, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange(result.url);
      setStatus("idle");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setErrMsg(/size|too large|exceed|limit/i.test(raw) ? "ไฟล์ใหญ่เกินไป" : (raw || "อัปโหลดไม่สำเร็จ"));
      setStatus("error");
    } finally {
      if (src) URL.revokeObjectURL(src);
    }
  };

  const handleCancel = () => {
    setSrcUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const fileInput = (disabled: boolean) => (
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp,image/heic"
      className="hidden"
      disabled={disabled}
      onChange={(e) => { const f = e.target.files?.[0]; if (f) openCrop(f); e.target.value = ""; }}
    />
  );

  return (
    <div>
      <p className="block text-sm font-medium text-foreground mb-2">{label}</p>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="preview" className="w-24 h-24 rounded-full object-cover object-center border-2 border-border shadow-sm" />
              <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {fileInput(status === "uploading")}
              </label>
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="ลบรูป"
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <label className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed transition-colors ${status === "uploading" ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-border bg-hover hover:border-blue-400"}`}>
              {status === "uploading" ? (
                <svg aria-hidden="true" className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg aria-hidden="true" className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] text-muted leading-tight text-center">อัปโหลด<br />รูป</span>
                </>
              )}
              {fileInput(status === "uploading")}
            </label>
          )}
        </div>
        <div className="text-xs text-muted space-y-1">
          <p>JPG / PNG / WebP · สูงสุด 20 MB</p>
          <p className="text-muted/70">จะมีหน้าต่างให้ตัดรูปก่อนอัปโหลด</p>
          {errMsg && <p className="text-red-500">{errMsg}</p>}
          {!value && !errMsg && status === "idle" && <p className="text-muted">ไม่มีรูปจะใช้อักษรย่อแทน</p>}
        </div>
      </div>

      {/* Crop modal */}
      {srcUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 pt-6 pb-4 border-b border-border-subtle">
              <h3 className="font-semibold text-foreground">ปรับตำแหน่งรูปภาพ</h3>
              <p className="text-xs text-muted mt-0.5">ลากขอบเพื่อเลือกส่วนที่ต้องการ</p>
            </div>
            <div className="flex justify-center px-6 py-5 max-h-[60vh] overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={50}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={srcUrl}
                  alt="crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[55vh] max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 text-sm font-medium border border-border text-secondary hover:bg-hover rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!completedCrop?.width}
                className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
              >
                ตัดรูปและอัปโหลด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
