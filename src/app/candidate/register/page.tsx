"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { upload } from "@vercel/blob/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { candidateRegistrationConfig as cfg } from "@/config/candidate";

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setErrMsg("ไฟล์ต้องไม่เกิน 8 MB"); setStatus("error"); return; }
    setStatus("uploading"); setErrMsg("");
    try {
      const result = await upload(`candidates/${file.name}`, file, { access: "public", handleUploadUrl: "/api/upload" });
      onChange(result.url);
      setStatus("idle");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setErrMsg(/size|too large|exceed|limit/i.test(raw) ? "ไฟล์ต้องไม่เกิน 8 MB" : (raw || "อัปโหลดไม่สำเร็จ"));
      setStatus("error");
    }
  };

  return (
    <div>
      <p className="block text-sm font-medium text-foreground mb-2">{cfg.fields.image.label}</p>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="preview" className="w-24 h-24 rounded-full object-cover border-2 border-border shadow-sm" />
              <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden" disabled={status === "uploading"} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              </label>
              <button type="button" onClick={() => onChange("")} aria-label="ลบรูป" className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors cursor-pointer">
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
                  <span className="text-[10px] text-muted leading-tight text-center">อัปโหลด<br/>รูป</span>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden" disabled={status === "uploading"} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <div className="text-xs text-muted space-y-1">
          <p>JPG / PNG / WebP · สูงสุด 8 MB</p>
          {errMsg && <p className="text-red-500">{errMsg}</p>}
          {!value && !errMsg && <p className="text-muted">ไม่มีรูปจะใช้อักษรย่อแทน</p>}
        </div>
      </div>
    </div>
  );
}

const TITLES = ["นาย", "นาง", "นางสาว"] as const;
type Title = (typeof TITLES)[number] | "";

type FormState = {
  title: Title;
  name: string;
  nickname: string;
  section: "ปกติ" | "พิเศษ" | "";
  image: string;
  motto: string;
  videoUrl: string;
  dutyAnswer: string;
  visionAnswer: string;
  strengthWeaknessAnswer: string;
};

const INITIAL_FORM: FormState = {
  title: "", name: "", nickname: "", section: "", image: "", motto: "",
  videoUrl: "", dutyAnswer: "", visionAnswer: "", strengthWeaknessAnswer: "",
};

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div role="status" aria-label="กำลังโหลด...">
        <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">{cfg.comingSoon.title}</h2>
        <p className="text-secondary mb-6 text-sm leading-relaxed">{cfg.comingSoon.message}</p>
        <Link href={cfg.comingSoon.backButton.href}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
          {cfg.comingSoon.backButton.label}
        </Link>
      </div>
    </div>
  );
}

function AuthGate() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-3">ต้องเข้าสู่ระบบก่อน</h2>
        <p className="text-secondary mb-6 text-sm">เข้าสู่ระบบเพื่อสมัครเป็นประธานรุ่น</p>
        <Link href="/auth/signin?callbackUrl=/candidate/register"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md motion-safe:animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">{cfg.successTitle}</h2>
        <p className="text-secondary mb-6 text-sm leading-relaxed">{cfg.successMessage}</p>
        <Link href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
            i < current ? "bg-blue-600 text-white" :
            i === current ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50" :
            "bg-card border border-border text-muted"
          }`}>
            {i < current ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 max-w-12 h-0.5 transition-colors ${i < current ? "bg-blue-600" : "bg-border"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CandidateRegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdminOrStaff = role === "admin" || role === "staff";

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "submit", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showComingSoon = status === "authenticated" && !cfg.open && !isAdminOrStaff;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validateStep = (s: number): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (s === 0) {
      if (!form.title) e.title = "กรุณาเลือกคำนำหน้า";
      if (!form.name.trim()) e.name = "กรุณากรอกชื่อจริง–นามสกุล";
      if (!form.nickname.trim()) e.nickname = "กรุณากรอกชื่อเล่น";
      if (!form.section) e.section = "กรุณาเลือกภาค";
      if (!form.motto.trim()) e.motto = "กรุณากรอกคติประจำใจ";
    } else if (s === 1) {
      if (!form.videoUrl.trim()) e.videoUrl = "กรุณากรอกลิงก์วิดีโอ";
      else if (!/youtu(be\.com|\.be)\//i.test(form.videoUrl)) e.videoUrl = "กรุณากรอกลิงก์ YouTube ที่ถูกต้อง";
    } else if (s === 2) {
      if (!form.dutyAnswer.trim()) e.dutyAnswer = "กรุณาตอบคำถามนี้";
      if (!form.visionAnswer.trim()) e.visionAnswer = "กรุณาตอบคำถามนี้";
      if (!form.strengthWeaknessAnswer.trim()) e.strengthWeaknessAnswer = "กรุณาตอบคำถามนี้";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep(2)) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/candidate-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ส่งใบสมัครไม่สำเร็จ");
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return <Loading />;
  if (status === "unauthenticated") return <AuthGate />;
  if (showComingSoon) return <ComingSoon />;
  if (submitted) return <SuccessScreen />;

  const stepMeta = cfg.steps[step];

  return (
    <div className="min-h-screen py-20 px-4 bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 motion-safe:animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">{cfg.pageTitle}</h1>
          <p className="text-secondary text-sm max-w-lg mx-auto">{cfg.pageSubtitle}</p>
          {!cfg.open && isAdminOrStaff && (
            <p className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ปิดสำหรับนิสิตทั่วไป (แอดมินทดสอบฟอร์มได้)
            </p>
          )}
        </div>

        <StepIndicator current={step} total={3} />

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Step header */}
          <div className="mb-6 pb-5 border-b border-border-subtle">
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
              ขั้นตอนที่ {step + 1} / {cfg.steps.length}
            </p>
            <h2 className="text-xl font-bold text-foreground">{stepMeta.title}</h2>
            <p className="text-sm text-secondary mt-0.5">{stepMeta.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── Step 1: ข้อมูลส่วนตัว ── */}
            {step === 0 && (
              <div className="space-y-5">
                {session?.user?.email && (
                  <div className="flex items-center gap-2 text-xs text-secondary bg-hover border border-border rounded-lg px-3 py-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="break-all">
                      {cfg.fields.email.lockedNotice}: <strong className="font-medium text-secondary">{session.user.email}</strong>
                    </span>
                  </div>
                )}
                <div>
                  <p className="block text-sm font-medium text-foreground mb-2">คำนำหน้า</p>
                  <div className="flex gap-2">
                    {TITLES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => update("title", t)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${form.title === t ? "bg-blue-600 text-white shadow-sm" : "bg-card border border-border text-secondary hover:bg-hover"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
                </div>
                <Input
                  label={cfg.fields.name.label}
                  placeholder={cfg.fields.name.placeholder}
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("name", e.target.value)}
                  error={errors.name}
                  autoComplete="off"
                />
                <Input
                  label={cfg.fields.nickname.label}
                  placeholder={cfg.fields.nickname.placeholder}
                  value={form.nickname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("nickname", e.target.value)}
                  error={errors.nickname}
                />
                <div>
                  <p className="block text-sm font-medium text-foreground mb-2">ภาค</p>
                  <div className="flex gap-2">
                    {(["ปกติ", "พิเศษ"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update("section", s)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${form.section === s ? "bg-blue-600 text-white shadow-sm" : "bg-card border border-border text-secondary hover:bg-hover"}`}
                      >
                        ภาค{s}
                      </button>
                    ))}
                  </div>
                  {errors.section && <p className="mt-1.5 text-xs text-red-500">{errors.section}</p>}
                </div>
                <ImageUpload value={form.image} onChange={(url) => update("image", url)} />
                <Input
                  label={cfg.fields.motto.label}
                  placeholder={cfg.fields.motto.placeholder}
                  value={form.motto}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("motto", e.target.value)}
                  error={errors.motto}
                />
              </div>
            )}

            {/* ── Step 2: คลิปวิดีโอ ── */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Video questions guide */}
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                    ในคลิปวิดีโอ ควรตอบคำถามดังนี้
                  </p>
                  <ol className="space-y-2">
                    {cfg.fields.videoQuestions.map((q, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-blue-700 dark:text-blue-300">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <Input
                  label={cfg.fields.videoUrl.label}
                  placeholder={cfg.fields.videoUrl.placeholder}
                  helperText={cfg.fields.videoUrl.helper}
                  value={form.videoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("videoUrl", e.target.value)}
                  error={errors.videoUrl}
                />
              </div>
            )}

            {/* ── Step 3: คำถามเขียน ── */}
            {step === 2 && (
              <div className="space-y-6">
                <Input
                  as="textarea"
                  label={cfg.fields.dutyAnswer.label}
                  placeholder={cfg.fields.dutyAnswer.placeholder}
                  value={form.dutyAnswer}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("dutyAnswer", e.target.value)}
                  error={errors.dutyAnswer}
                  rows={4}
                />
                <Input
                  as="textarea"
                  label={cfg.fields.visionAnswer.label}
                  placeholder={cfg.fields.visionAnswer.placeholder}
                  value={form.visionAnswer}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("visionAnswer", e.target.value)}
                  error={errors.visionAnswer}
                  rows={4}
                />
                <Input
                  as="textarea"
                  label={cfg.fields.strengthWeaknessAnswer.label}
                  placeholder={cfg.fields.strengthWeaknessAnswer.placeholder}
                  value={form.strengthWeaknessAnswer}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("strengthWeaknessAnswer", e.target.value)}
                  error={errors.strengthWeaknessAnswer}
                  rows={4}
                />

                {errors.submit && (
                  <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {errors.submit}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-border-subtle">
              {step === 0 ? (
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-sm text-muted hover:text-secondary transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
              ) : (
                <Button type="button" variant="secondary" onClick={handleBack}>
                  ย้อนกลับ
                </Button>
              )}

              {step < 2 ? (
                <Button type="button" variant="primary" onClick={handleNext}>
                  ถัดไป
                </Button>
              ) : (
                <Button type="submit" variant="primary" loading={submitting}>
                  {cfg.submitLabel}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
