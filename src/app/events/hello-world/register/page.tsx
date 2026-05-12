"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/ui/Input";
import { ForceTheme } from "@/components/providers/ForceTheme";
import { helloWorldFormConfig, type HWFormField, type ChoiceField } from "@/config/forms/hello-world-register";
import { helloWorldConfig } from "@/config/events/hello-world";
import { useFormDraft } from "@/lib/useFormDraft";
import { useRegistrationStatus } from "@/lib/useRegistrationStatus";
import type { Countdown } from "@/lib/registration";

const config = helloWorldFormConfig;
const eventConfig = helloWorldConfig;

const AMBER    = "#D97706";
const AMBER_LT = "#FEF08A";
const TEXT_D   = "#1C1917";
const TEXT_M   = "#57534E";
const BG       = "linear-gradient(145deg, #BAE6FD 0%, #FEF08A 48%, #FED7AA 100%)";

/* ── Helpers ─────────────────────────────────────────────────────── */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function isChoiceField(field: HWFormField): field is ChoiceField {
  return field.type === "choice";
}

/* ── Step progress dots ──────────────────────────────────────────── */
function StepDots({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-start justify-center mb-8 px-2">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300"
              style={{
                background: i < current ? AMBER : i === current ? AMBER_LT : "rgba(255,255,255,0.55)",
                border: `2.5px solid ${i <= current ? AMBER : "rgba(255,255,255,0.45)"}`,
                color: i < current ? "#FFFFFF" : i === current ? "#713F12" : "#A8A29E",
                boxShadow: i === current ? `0 4px 14px rgba(217,119,6,0.38)` : "none",
              }}
            >
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className="text-xs font-semibold hidden sm:block leading-tight text-center max-w-[72px]"
              style={{ color: i <= current ? TEXT_D : "#A8A29E" }}>
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div className="flex-1 mx-1.5 mt-[18px]">
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.4)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ background: AMBER, width: i < current ? "100%" : "0%" }} />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Choice button group ─────────────────────────────────────────── */
function ChoiceButtons({
  field, value, onChange, error,
}: {
  field: ChoiceField; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="block text-sm font-bold" style={{ color: TEXT_D }}>{field.label}</legend>
      <div className={field.layout === "grid2" ? "grid grid-cols-2 gap-3" : "flex gap-3"}>
        {field.options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`${field.layout === "flex" ? "flex-1" : ""} p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400`}
              style={{
                background: active ? AMBER_LT : "#FFFFFF",
                borderColor: active ? "#CA8A04" : "#E5E7EB",
                boxShadow: active ? `0 4px 16px rgba(202,138,4,0.28)` : "0 1px 4px rgba(0,0,0,0.05)",
                color: active ? "#713F12" : "#6B7280",
              }}
            >
              <div className={`font-bold ${field.layout === "flex" ? "text-center text-base" : "text-xl mb-1"}`}>
                {opt.label}
              </div>
              {opt.desc && (
                <div className="text-xs mt-0.5" style={{ color: active ? "#92400E" : "#9CA3AF" }}>
                  {opt.desc}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="text-xs text-red-600 mt-1">{error}</p>}
    </fieldset>
  );
}

/* ── Floating bubble ─────────────────────────────────────────────── */
function Bubble({ emoji, bg, style, delay = "0s" }: { emoji: string; bg: string; style: React.CSSProperties; delay?: string }) {
  return (
    <div aria-hidden="true"
      className="absolute select-none pointer-events-none animate-[float-slow_8s_ease-in-out_infinite]"
      style={{ ...style, animationDelay: delay }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{ background: bg, border: "2px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {emoji}
      </div>
    </div>
  );
}

/* ── Countdown blocks ────────────────────────────────────────────── */
function CountdownBlocks({ countdown }: { countdown: Countdown }) {
  const cells: Array<[string, number]> = [
    ["วัน", countdown.days],
    ["ชั่วโมง", countdown.hours],
    ["นาที", countdown.minutes],
    ["วินาที", countdown.seconds],
  ];
  return (
    <div role="timer" aria-live="polite" className="grid grid-cols-4 gap-2 mb-6">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl py-3 px-1 text-center"
          style={{
            background: "#FFFFFF",
            border: "2px solid rgba(202,138,4,0.35)",
            boxShadow: "0 4px 14px rgba(202,138,4,0.18)",
          }}
        >
          <div
            className="font-display font-black"
            style={{
              fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
              color: TEXT_D,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(value).padStart(2, "0")}
          </div>
          <div
            className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider"
            style={{ color: AMBER }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Coming Soon screen ──────────────────────────────────────────── */
function ComingSoonScreen({ countdown }: { countdown: Countdown | null }) {
  const { title, message, backButton } = eventConfig.registration.comingSoon;
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: BG }}>
      <ForceTheme theme="light" />

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: "rgba(254,240,138,0.6)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(186,230,253,0.5)" }} />
      </div>

      <div className="relative z-10 text-center max-w-md w-full animate-fade-in">
        <div className="rounded-3xl p-8 sm:p-10"
          style={{ background: "#FFFFFF", border: "3px solid rgba(202,138,4,0.35)", boxShadow: "0 24px 64px rgba(202,138,4,0.18), 0 4px 16px rgba(0,0,0,0.06)" }}>

          <div aria-hidden="true" className="flex justify-center gap-2 mb-5 text-3xl">
            <span>🚧</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl mb-3" style={{ color: TEXT_D }}>
            {title}
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: TEXT_M }}>
            {message}
          </p>

          {countdown && <CountdownBlocks countdown={countdown} />}

          <Link
            href={backButton.href}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ background: AMBER, color: "#FFFFFF", boxShadow: "0 6px 20px rgba(217,119,6,0.4)" }}
          >
            {backButton.label}
          </Link>

          <div aria-hidden="true" className="mt-6 flex justify-center gap-2 opacity-60">
            {["🧽","🔍","🐼","🦊","🚀"].map((e) => <span key={e}>{e}</span>)}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════════ */
export default function HelloWorldRegisterPage() {
  const { isOpen, countdown } = useRegistrationStatus(eventConfig.registration);
  if (!isOpen) {
    return <ComingSoonScreen countdown={countdown} />;
  }
  return <HelloWorldRegisterForm />;
}

function HelloWorldRegisterForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialData = Object.fromEntries(
    config.steps.flatMap((s) => s.fields.map((f) => [f.name, ""]))
  );
  const [formData, setField, clearDraft, draftRestored] = useFormDraft("hello-world-draft", initialData);

  useEffect(() => {
    if (session?.user?.email) setField("email", session.user!.email!);
  }, [session, setField]);

  const updateField = (field: string, value: string) => {
    setField(field, value);
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    for (const field of config.steps[step].fields) {
      if (field.required && !formData[field.name]?.trim())
        e[field.name] = isChoiceField(field) ? `กรุณาเลือก${field.label}` : `กรุณากรอก${field.label}`;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "รูปแบบอีเมลไม่ถูกต้อง";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((p) => Math.min(p + 1, config.steps.length - 1)); };
  const handleBack = () => setStep((p) => Math.max(p - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!session?.user?.email) {
      signIn("google", { callbackUrl: "/events/hello-world/register" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "hello-world", name: formData.name,
          answers: {
            personalityType: formData.personalityType, codingExperience: formData.codingExperience,
            eventVibe: formData.eventVibe, whyJoin: formData.whyJoin, expectations: formData.expectations,
          },
        }),
      });
      if (res.status === 401) {
        signIn("google", { callbackUrl: "/events/hello-world/register" });
        return;
      }
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "การสมัครไม่สำเร็จ"); }
      clearDraft();
      router.push("/events/hello-world/register?success=true");
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "เกิดข้อผิดพลาดบางอย่าง" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success screen ─────────────────────────────────────────── */
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "true") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: BG }}>
        <ForceTheme theme="light" />

        {/* Ambient glows */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: "rgba(254,240,138,0.6)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(186,230,253,0.5)" }} />
        </div>

        <div className="relative z-10 text-center max-w-md w-full animate-fade-in">
          {/* SpongeBob & Patrick celebrate */}
          <div className="flex justify-center mb-6">
            <Image
              src="/spongebob_patrick.png"
              alt=""
              aria-hidden="true"
              width={395}
              height={632}
              loading="eager"
              sizes="200px"
              style={{ height: "clamp(140px, 26vw, 200px)", width: "auto", objectFit: "contain", mixBlendMode: "multiply", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.12))" }}
            />
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8 sm:p-10"
            style={{ background: "#FFFFFF", border: "3px solid rgba(202,138,4,0.35)", boxShadow: "0 24px 64px rgba(202,138,4,0.18), 0 4px 16px rgba(0,0,0,0.06)" }}>

            <div aria-hidden="true" className="flex justify-center gap-2 mb-5 text-2xl">
              {["🧽","🔍","🐼","🦊","🚀"].map((e) => <span key={e}>{e}</span>)}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl mb-3" style={{ color: TEXT_D }}>
              {config.success.title}
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: TEXT_M }}>
              {config.success.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={config.success.backButton.href}
                className="px-6 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: "#E5E7EB", color: TEXT_M, background: "#FAFAFA" }}
              >
                {config.success.backButton.label}
              </Link>
              <Link
                href={config.success.revealButton.href}
                className="px-6 py-3 rounded-2xl text-sm font-black transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{ background: AMBER, color: "#FFFFFF", boxShadow: "0 6px 20px rgba(217,119,6,0.4)" }}
              >
                {config.success.revealButton.label} 🎬
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Main form ──────────────────────────────────────────────── */
  const currentStep = config.steps[step];
  const isLast = step === config.steps.length - 1;
  const isFirst = step === 0;

  return (
    <main className="min-h-screen py-16 px-4 relative overflow-x-hidden" style={{ background: BG }}>
      <ForceTheme theme="light" />

      {/* Ambient glows */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-0 w-96 h-96 rounded-full blur-[110px]" style={{ background: "rgba(254,240,138,0.7)" }} />
        <div className="absolute top-10 right-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: "rgba(186,230,253,0.6)" }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(254,215,170,0.55)" }} />
      </div>

      {/* Floating bubbles */}
      {!reducedMotion && (
        <>
          <Bubble emoji="🧽" bg="#FDE047" style={{ top: "8%",  left: "3%" }} />
          <Bubble emoji="🐼" bg="#86EFAC" style={{ bottom: "20%", left: "4%" }} delay="1.8s" />
          <Bubble emoji="🦊" bg="#FDBA74" style={{ top: "12%", right: "4%" }} delay="1s" />
          <Bubble emoji="🚀" bg="#7DD3FC" style={{ bottom: "25%", right: "3%" }} delay="2.4s" />
        </>
      )}

      <div className="relative z-10 max-w-lg mx-auto">

        {/* Page header */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/events/hello-world"
            className="inline-flex items-center gap-1.5 text-xs font-semibold mb-5 transition-opacity hover:opacity-70"
            style={{ color: TEXT_M }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Hello World
          </Link>

          <h1 className="font-display font-black tracking-tight" style={{ fontSize: "clamp(2rem, 6vw, 3rem)", color: TEXT_D }}>
            สมัคร Hello World
          </h1>
          <p className="mt-2 text-sm" style={{ color: TEXT_M }}>{config.hero.subtitle}</p>
        </div>

        {/* Progress */}
        <StepDots current={step} total={config.steps.length} labels={config.stepLabels} />

        {/* Draft restored notice */}
        {draftRestored && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium animate-fade-in"
            style={{ color: "#15803D" }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            กู้คืนฉบับร่างแล้ว
          </div>
        )}

        {/* Submit error */}
        {errors.submit && (
          <div role="alert" className="mb-5 px-4 py-3 rounded-2xl text-sm border-2"
            style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}>
            {errors.submit}
          </div>
        )}

        {/* Form card */}
        <div
          key={step}
          className="rounded-3xl p-6 sm:p-8 animate-fade-in"
          style={{
            background: "#FFFFFF",
            border: "3px solid rgba(202,138,4,0.25)",
            boxShadow: "0 20px 56px rgba(202,138,4,0.14), 0 4px 16px rgba(0,0,0,0.05)",
          }}
        >
          {/* Step header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: AMBER }}>
                ขั้นตอนที่ {step + 1}/{config.steps.length}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl" style={{ color: TEXT_D }}>
              {currentStep.title}
            </h2>
            {currentStep.description && (
              <p className="text-sm mt-1" style={{ color: TEXT_M }}>{currentStep.description}</p>
            )}
          </div>

          {/* Divider */}
          <div className="mb-6 h-px" style={{ background: `linear-gradient(90deg, ${AMBER}60, transparent)` }} />

          {/* Fields */}
          <div className="space-y-5">
            {currentStep.fields.map((field) => {
              if (isChoiceField(field)) {
                return (
                  <ChoiceButtons
                    key={field.name}
                    field={field}
                    value={formData[field.name]}
                    onChange={(v) => updateField(field.name, v)}
                    error={errors[field.name]}
                  />
                );
              }
              if (field.type === "textarea") {
                return (
                  <Input
                    key={field.name}
                    as="textarea"
                    label={field.label}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField(field.name, e.target.value)}
                    error={errors[field.name]}
                  />
                );
              }
              return (
                <Input
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(field.name, e.target.value)}
                  error={errors[field.name]}
                  readOnly={field.name === "email" && !!session?.user?.email}
                  className={field.name === "email" && session?.user?.email ? "opacity-60 cursor-not-allowed" : ""}
                />
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: "1.5px solid #F3F4F6" }}>
            {!isFirst ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:opacity-70 cursor-pointer"
                style={{ color: TEXT_M }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                ย้อนกลับ
              </button>
            ) : <div />}

            <button
              type={isLast ? "submit" : "button"}
              onClick={isLast ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-sm transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
              style={{
                background: AMBER,
                color: "#FFFFFF",
                boxShadow: "0 6px 22px rgba(217,119,6,0.38)",
              }}
            >
              {isSubmitting && (
                <svg aria-hidden="true" className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLast ? "ยืนยันการสมัคร 🎉" : "ถัดไป"}
              {!isLast && !isSubmitting && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* House strip footer */}
        <div aria-hidden="true" className="mt-8 flex justify-center gap-3">
          {[
            { e: "🧽", bg: "#FDE047" }, { e: "🔍", bg: "#93C5FD" }, { e: "🐼", bg: "#86EFAC" },
            { e: "🦊", bg: "#FDBA74" }, { e: "🚀", bg: "#7DD3FC" },
          ].map(({ e, bg }) => (
            <span key={e} className="w-9 h-9 rounded-full flex items-center justify-center text-base opacity-60"
              style={{ background: bg }}>
              {e}
            </span>
          ))}
        </div>

      </div>
    </main>
  );
}
