"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/ui/Input";
import { ForceTheme } from "@/components/providers/ForceTheme";
import { helloWorldFormConfig, type HWFormField, type ChoiceField, type ImageField } from "@/config/forms/hello-world-register";
import { helloWorldConfig } from "@/config/events/hello-world";
import { useFormDraft } from "@/lib/useFormDraft";
import { useRegistrationStatus } from "@/lib/useRegistrationStatus";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { StepDots } from "../_components/StepDots";
import { ChoiceButtons } from "../_components/ChoiceButtons";
import { ImageUpload } from "../_components/ImageUpload";
import { SurveyModal } from "../_components/SurveyModal";
import { Bubble } from "../_components/Bubble";
import { ComingSoonScreen } from "../_components/ComingSoonScreen";
import { AMBER, TEXT_D, TEXT_M, BG } from "../_components/theme";

const config = helloWorldFormConfig;
const eventConfig = helloWorldConfig;

function isChoiceField(field: HWFormField): field is ChoiceField {
  return field.type === "choice";
}

function isImageField(field: HWFormField): field is ImageField {
  return field.type === "image";
}

/* ════════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════════ */
export default function HelloWorldRegisterPage() {
  const { isOpen, countdown } = useRegistrationStatus(eventConfig.registration);
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canBypassGate = role === "admin" || role === "staff";
  if (!isOpen && !canBypassGate) {
    return <ComingSoonScreen countdown={countdown} />;
  }
  return <HelloWorldRegisterForm />;
}

function HelloWorldRegisterForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  useEffect(() => {
    if (status !== "loading") {
      setShowSurveyModal(true);
    }
  }, [status]);

  const closeSurveyModal = () => {
    setShowSurveyModal(false);
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}>
        <ForceTheme theme="light" />
        <div className="text-sm font-semibold" style={{ color: TEXT_M }}>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</div>
      </main>
    );
  }

  if (!session?.user?.email) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: BG }}>
        <ForceTheme theme="light" />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: "rgba(254,240,138,0.6)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(186,230,253,0.5)" }} />
        </div>
        <div className="relative z-10 text-center max-w-md w-full motion-safe:animate-fade-in">
          <div className="rounded-3xl p-8 sm:p-10"
            style={{ background: "#FFFFFF", border: "3px solid rgba(202,138,4,0.35)", boxShadow: "0 24px 64px rgba(202,138,4,0.18), 0 4px 16px rgba(0,0,0,0.06)" }}>
            <div aria-hidden="true" className="text-4xl mb-4">🔒</div>
            <h1 className="font-display font-black text-2xl sm:text-3xl mb-3" style={{ color: TEXT_D }}>
              ต้องเข้าสู่ระบบก่อน
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: TEXT_M }}>
              กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อสมัครและอัปโหลดเอกสาร
            </p>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/events/hello-world/register" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-[shadow,transform] duration-200 motion-safe:hover:scale-105 hover:shadow-xl cursor-pointer"
              style={{ background: AMBER, color: "#FFFFFF", boxShadow: "0 6px 20px rgba(217,119,6,0.4)" }}
            >
              เข้าสู่ระบบด้วย Google
            </button>
          </div>
        </div>
      </main>
    );
  }

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
      if (field.required && !formData[field.name]?.trim()) {
        if (isChoiceField(field))      e[field.name] = `กรุณาเลือก${field.label}`;
        else if (isImageField(field))  e[field.name] = `กรุณาอัปโหลด${field.label}`;
        else                           e[field.name] = `กรุณากรอก${field.label}`;
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "รูปแบบอีเมลไม่ถูกต้อง";
    if (formData.phone && !/^[0-9+\-\s()]{6,20}$/.test(formData.phone))
      e.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    if (formData.emergencyPhone && !/^[0-9+\-\s()]{6,20}$/.test(formData.emergencyPhone))
      e.emergencyPhone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((p) => Math.min(p + 1, config.steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleBack = () => {
    setStep((p) => Math.max(p - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!session?.user?.email) {
      signIn("google", { callbackUrl: "/events/hello-world/register" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "hello-world",
          name: formData.name,
          answers: {
            nickname:       formData.nickname,
            contactChannel: formData.contactChannel,
            phone:          formData.phone,
            emergencyPhone: formData.emergencyPhone,
            educationType:  formData.educationType,
            tcasImage:      formData.tcasImage,
            selfImage:      formData.selfImage,
            introduction:   formData.introduction,
            motivation:     formData.motivation,
            expectations:   formData.expectations,
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

        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: "rgba(254,240,138,0.6)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(186,230,253,0.5)" }} />
        </div>

        <div className="relative z-10 text-center max-w-md w-full motion-safe:animate-fade-in">
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
                className="px-6 py-3 rounded-2xl text-sm font-semibold border-2 transition-transform duration-200 motion-safe:hover:scale-105"
                style={{ borderColor: "#E5E7EB", color: TEXT_M, background: "#FAFAFA" }}
              >
                {config.success.backButton.label}
              </Link>
              <Link
                href={config.success.revealButton.href}
                className="px-6 py-3 rounded-2xl text-sm font-black transition-[shadow,transform] duration-200 motion-safe:hover:scale-105 hover:shadow-xl"
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
      {showSurveyModal && <SurveyModal onClose={closeSurveyModal} />}
      <ForceTheme theme="light" />

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-0 w-96 h-96 rounded-full blur-[110px]" style={{ background: "rgba(254,240,138,0.7)" }} />
        <div className="absolute top-10 right-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: "rgba(186,230,253,0.6)" }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(254,215,170,0.55)" }} />
      </div>

      {!reducedMotion && (
        <>
          <Bubble emoji="🧽" bg="#FDE047" style={{ top: "8%",  left: "3%" }} />
          <Bubble emoji="🐼" bg="#86EFAC" style={{ bottom: "20%", left: "4%" }} delay="1.8s" />
          <Bubble emoji="🦊" bg="#D1D5DB" style={{ top: "12%", right: "4%" }} delay="1s" />
          <Bubble emoji="🚀" bg="#C4B5FD" style={{ bottom: "25%", right: "3%" }} delay="2.4s" />
        </>
      )}

      <div className="relative z-10 max-w-lg mx-auto">

        <div className="text-center mb-8 motion-safe:animate-fade-in">
          <Link href="/events/hello-world"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black mb-6 transition-transform duration-200 motion-safe:hover:scale-105 motion-safe:hover:-translate-y-0.5"
            style={{
              background: "#FFFFFF",
              border: `2px solid ${AMBER}`,
              color: AMBER,
              boxShadow: "0 4px 14px rgba(217,119,6,0.18)",
            }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปหน้า Hello World
          </Link>

          <h1 className="font-display font-black tracking-tight" style={{ fontSize: "clamp(2rem, 6vw, 3rem)", color: TEXT_D }}>
            สมัคร Hello World
          </h1>
          <p className="mt-2 text-sm" style={{ color: TEXT_M }}>{config.hero.subtitle}</p>
        </div>

        <StepDots current={step} total={config.steps.length} labels={config.stepLabels} />

        {draftRestored && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium motion-safe:animate-fade-in"
            style={{ color: "#15803D" }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            กู้คืนฉบับร่างแล้ว
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div role="alert" className="mb-5 px-4 py-3 rounded-2xl text-sm border-2 motion-safe:animate-fade-in"
            style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              พบข้อผิดพลาด
            </div>
            {errors.submit || "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง (ตรวจสอบช่องที่มีข้อความสีแดงด้านล่าง)"}
          </div>
        )}

        <div
          key={step}
          className="rounded-3xl p-6 sm:p-8 motion-safe:animate-fade-in"
          style={{
            background: "#FFFFFF",
            border: "3px solid rgba(202,138,4,0.25)",
            boxShadow: "0 20px 56px rgba(202,138,4,0.14), 0 4px 16px rgba(0,0,0,0.05)",
          }}
        >
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

          <div className="mb-6 h-px" style={{ background: `linear-gradient(90deg, ${AMBER}60, transparent)` }} />

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
              if (isImageField(field)) {
                return (
                  <ImageUpload
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

          <div className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: "1.5px solid #F3F4F6" }}>
            {!isFirst ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70 cursor-pointer"
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
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-sm transition-[shadow,transform] duration-200 motion-safe:hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
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

        <div aria-hidden="true" className="mt-8 flex justify-center gap-3">
          {[
            { e: "🧽", bg: "#FDE047" }, { e: "🔍", bg: "#93C5FD" }, { e: "🐼", bg: "#86EFAC" },
            { e: "🦊", bg: "#D1D5DB" }, { e: "🚀", bg: "#C4B5FD" },
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
