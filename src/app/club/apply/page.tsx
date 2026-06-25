"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { clubApplyFormConfig, type ClubFormField } from "@/config/forms/club-apply";
import type { ChoiceField, ImageField } from "@/config/forms/hello-world-register";
import { upload } from "@vercel/blob/client";
import { useFormDraft } from "@/lib/useFormDraft";

const config = clubApplyFormConfig;

const ACCENT = "#2563EB";

function isChoiceField(field: ClubFormField): field is ChoiceField {
  return field.type === "choice";
}

function isImageField(field: ClubFormField): field is ImageField {
  return field.type === "image";
}

/* ── Step dots ──────────────────────────────────────────────────── */
function StepDots({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-start justify-center mb-8 px-2">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-colors duration-300 border-[2.5px] ${
                i < current
                  ? "bg-blue-600 border-blue-600 text-white"
                  : i === current
                  ? "bg-blue-100 dark:bg-blue-900/40 border-blue-600 text-blue-800 dark:text-blue-200 shadow-md shadow-blue-500/30"
                  : "bg-white/50 dark:bg-slate-700/50 border-white/40 dark:border-slate-600 text-stone-400 dark:text-slate-500"
              }`}
            >
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block leading-tight text-center max-w-[72px] ${
              i <= current ? "text-foreground" : "text-stone-400 dark:text-slate-500"
            }`}>
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div className="flex-1 mx-1.5 mt-[18px]">
              <div className="h-0.5 rounded-full overflow-hidden bg-white/40 dark:bg-slate-700">
                <div className="h-full rounded-full transition-[width] duration-500"
                  style={{ background: ACCENT, width: i < current ? "100%" : "0%" }} />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Choice buttons ─────────────────────────────────────────────── */
function ChoiceButtons({
  field, value, onChange, error,
}: {
  field: ChoiceField; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="block text-sm font-bold text-foreground">{field.label}</legend>
      <div className={field.layout === "grid2" ? "grid grid-cols-2 gap-3" : "flex gap-3"}>
        {field.options.map((opt) => {
          const active = value === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 cursor-pointer ${
                active
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "border-border bg-card text-secondary hover:border-blue-300 dark:hover:border-blue-700"
              }`}>
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </fieldset>
  );
}

/* ── Image upload ───────────────────────────────────────────────── */
function ImageUpload({
  field, value, onChange, error,
}: {
  field: ImageField; value: string; onChange: (url: string) => void; error?: string;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setErrMsg("ต้องอัปโหลดน้อยกว่า 8 MB"); setStatus("error"); return; }
    setStatus("uploading"); setErrMsg("");
    try {
      const result = await upload(`club-apply/${field.name}/${file.name}`, file, { access: "public", handleUploadUrl: "/api/upload" });
      onChange(result.url);
      setStatus("idle");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setErrMsg(/size|too large|exceed|limit/i.test(raw) ? "ต้องอัปโหลดน้อยกว่า 8 MB" : (raw || "อัปโหลดไม่สำเร็จ"));
      setStatus("error");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-foreground">{field.label}</label>
      {field.helperText && !value && <p className="text-xs text-muted">{field.helperText}</p>}
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-32 h-32 rounded-xl object-cover border-2 border-blue-200 dark:border-blue-800" />
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow cursor-pointer hover:bg-red-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          status === "uploading"
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-border bg-hover hover:border-blue-400 dark:hover:border-blue-600"
        }`}>
          {status === "uploading" ? (
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-muted">คลิกเพื่ออัปโหลดรูป</span>
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden"
            disabled={status === "uploading"}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </label>
      )}
      {(errMsg || error) && <p className="text-xs text-red-500">{errMsg || error}</p>}
    </div>
  );
}

/* ── Success screen ─────────────────────────────────────────────── */
function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center motion-safe:animate-fade-in">
        <div className="text-6xl mb-6">{config.success.emoji}</div>
        <h1 className="text-3xl font-extrabold mb-3 text-foreground">{config.success.title}</h1>
        <p className="text-secondary mb-8 leading-relaxed">{config.success.message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={config.success.slotsButton.href}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            {config.success.slotsButton.label}
          </Link>
          <Link href={config.success.backButton.href}
            className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-hover transition-colors">
            {config.success.backButton.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ClubApplyPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const formRef = useRef<HTMLDivElement>(null);

  const allFields = config.steps.flatMap((s) => s.fields);
  const initialData: Record<string, string> = {};
  for (const f of allFields) initialData[f.name] = "";

  const [formData, setField, clearDraft, draftRestored] = useFormDraft("club-apply-draft", initialData);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (draftRestored) setShowDraftBanner(true);
  }, [draftRestored]);

  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setField("email", session.user.email);
    }
  }, [session, formData.email, setField]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/club/apply")
      .then((r) => r.json())
      .then((d) => {
        if (d.applied && !isSuccess) router.replace("/club/apply?success=true");
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [authStatus, router, isSuccess]);

  if (authStatus === "loading" || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isSuccess) return <SuccessScreen />;

  const currentStep = config.steps[step];
  const isLast = step === config.steps.length - 1;

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    for (const field of currentStep.fields) {
      if (!field.required) continue;
      const val = formData[field.name]?.trim();
      if (!val) {
        errs[field.name] = "จำเป็นต้องกรอก";
      } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errs[field.name] = "อีเมลไม่ถูกต้อง";
      } else if (field.type === "tel" && !/^[\d\-+]{9,15}$/.test(val.replace(/\s/g, ""))) {
        errs[field.name] = "เบอร์โทรไม่ถูกต้อง";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError("");

    const topLevel = ["name", "surname", "nickname", "email", "phone", "contactChannel", "photo", "educationType"];
    const answers: Record<string, string> = {};
    for (const [k, v] of Object.entries(formData)) {
      if (!topLevel.includes(k) && v) answers[k] = v;
    }

    try {
      const res = await fetch("/api/club/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          nickname: formData.nickname,
          phone: formData.phone,
          contactChannel: formData.contactChannel,
          photo: formData.photo,
          educationType: formData.educationType,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      clearDraft();
      router.push("/club/apply?success=true");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="max-w-lg mx-auto" ref={formRef}>

        {/* Hero */}
        <div className="text-center mb-10 motion-safe:animate-fade-in">
          <div className="text-5xl mb-4">{config.hero.emoji}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">
            {config.hero.title} <span className="text-blue-600 dark:text-blue-400">{config.hero.titleAccent}</span>
          </h1>
          <p className="text-secondary">{config.hero.subtitle}</p>
        </div>

        {/* Draft banner */}
        {showDraftBanner && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">พบข้อมูลที่กรอกค้างไว้ จะกรอกต่อไหม?</p>
            <button onClick={() => { clearDraft(); window.location.reload(); }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap">
              เริ่มใหม่
            </button>
          </div>
        )}

        <StepDots current={step} total={config.steps.length} labels={config.stepLabels} />

        {/* Form card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-1 text-foreground">{currentStep.title}</h2>
          <p className="text-sm text-muted mb-6">{currentStep.description}</p>

          <div className="space-y-5">
            {currentStep.fields.map((field) => {
              if (isChoiceField(field)) {
                return <ChoiceButtons key={field.name} field={field} value={formData[field.name] || ""} onChange={(v) => setField(field.name, v)} error={errors[field.name]} />;
              }
              if (isImageField(field)) {
                return <ImageUpload key={field.name} field={field} value={formData[field.name] || ""} onChange={(url) => setField(field.name, url)} error={errors[field.name]} />;
              }
              return (
                <Input
                  key={field.name}
                  label={field.label}
                  type={field.type === "textarea" ? undefined : field.type}
                  as={field.type === "textarea" ? "textarea" : undefined}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setField(field.name, e.target.value)}
                  error={errors[field.name]}
                  readOnly={field.name === "email"}
                />
              );
            })}
          </div>

          {submitError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button type="button" onClick={handleBack}
                className="flex-1 py-3 rounded-xl font-semibold text-secondary bg-hover hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                ย้อนกลับ
              </button>
            )}
            {isLast ? (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer">
                {submitting ? "กำลังส่ง..." : "ส่งใบสมัคร"}
              </button>
            ) : (
              <button type="button" onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer">
                ถัดไป
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
