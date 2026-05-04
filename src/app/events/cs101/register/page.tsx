"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Fredoka } from "next/font/google";
import MarioProgressBar from "../_components/MarioProgressBar";
import MarioFormStep    from "../_components/MarioFormStep";
import MarioInput       from "../_components/MarioInput";
import MarioCheckboxGroup from "../_components/MarioCheckboxGroup";
import { cs101FormConfig, type FormField } from "@/config/forms/cs101-register";
import { useFormDraft } from "@/lib/useFormDraft";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-fredoka",
});

const config = cs101FormConfig;

/* ── Small decorative floating coin ─────────────────────────────────── */
function FloatCoin({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        pointerEvents: "none",
        userSelect: "none",
        fontSize: 22,
        animation: "mario-coin-float 3s ease-in-out infinite",
        ...style,
      }}
    >
      🪙
    </div>
  );
}

/* ── Auth gate (Mario themed) ───────────────────────────────────────── */
function AuthGate({ fredokaVar }: { fredokaVar: string }) {
  const callbackUrl = encodeURIComponent("/events/cs101/register");
  return (
    <div
      className={fredokaVar}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "linear-gradient(180deg,#12143A 0%,#1C1F52 55%,#0E1030 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes mario-coin-float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-16px) rotate(-8deg); }
        }
        @keyframes mario-gate-pop {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden="true"], [aria-hidden="true"] * { animation: none !important; }
        }
      `}</style>

      <FloatCoin style={{ top: "12%", left: "10%", animationDelay: "0s" }} />
      <FloatCoin style={{ top: "20%", right: "12%", animationDelay: "1.2s" }} />
      <FloatCoin style={{ bottom: "18%", left: "14%", animationDelay: "0.6s" }} />
      <FloatCoin style={{ bottom: "22%", right: "10%", animationDelay: "1.8s" }} />

      <div style={{ textAlign: "center", maxWidth: 460, animation: "mario-gate-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <div aria-hidden="true" style={{ fontSize: 72, marginBottom: 12, filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.4))" }}>🔒</div>
        <h1
          style={{
            fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.6rem,5vw,2.2rem)",
            color: "#FBD000",
            textShadow: "0 3px 0 #C8950A, 0 5px 0 #8B6914, 2px 2px 0 #E52521",
            marginBottom: "0.85rem",
            lineHeight: 1.2,
          }}
        >
          {config.authGate.title}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "1.75rem",
            lineHeight: 1.65,
          }}
        >
          {config.authGate.description}
        </p>
        <Link
          href={`/auth/signin?callbackUrl=${callbackUrl}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-fredoka), sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1a0800",
            background: "linear-gradient(180deg,#FFE135 0%,#FBD000 100%)",
            border: "3px solid #C8950A",
            borderRadius: "0.85rem",
            padding: "0.85rem 1.75rem",
            boxShadow: "0 6px 0 #8B6914, 0 8px 20px rgba(200,149,10,0.4)",
            textDecoration: "none",
            transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.04)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 0 #8B6914, 0 12px 28px rgba(200,149,10,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 0 #8B6914, 0 8px 20px rgba(200,149,10,0.4)";
          }}
        >
          <span aria-hidden="true">🍄</span>
          {config.authGate.signInLabel}
        </Link>
      </div>
    </div>
  );
}

/* ── Loading screen ─────────────────────────────────────────────────── */
function MarioLoading({ fredokaVar }: { fredokaVar: string }) {
  return (
    <div
      className={fredokaVar}
      role="status"
      aria-label="กำลังโหลด..."
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#12143A 0%,#1C1F52 55%,#0E1030 100%)",
      }}
    >
      <div aria-hidden="true" style={{ fontSize: 56, animation: "mario-coin-float 1.2s ease-in-out infinite" }}>🪙</div>
      <style>{`
        @keyframes mario-coin-float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-12px) rotate(-10deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Success screen ─────────────────────────────────────────────────── */
function SuccessScreen({ fredokaVar }: { fredokaVar: string }) {
  return (
    <div
      className={fredokaVar}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "linear-gradient(180deg,#0FA3D4 0%,#3EC3F0 50%,#8BE0F7 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes mario-success-pop {
          0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(3deg);  opacity: 1; }
          100% { transform: scale(1) rotate(0deg);     opacity: 1; }
        }
        @keyframes mario-success-star-spin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.2); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes mario-coin-float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-16px) rotate(-8deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden="true"],
          [aria-hidden="true"] * { animation: none !important; }
        }
      `}</style>

      <FloatCoin style={{ top: "15%", left: "8%",  animationDelay: "0s"   }} />
      <FloatCoin style={{ top: "25%", right: "10%", animationDelay: "1.2s" }} />
      <FloatCoin style={{ bottom: "20%", left: "12%", animationDelay: "0.6s" }} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mario-star.png" alt="" aria-hidden="true"
        style={{ position: "absolute", top: "5%", right: "5%", width: 80, animation: "mario-success-star-spin 4s linear infinite", opacity: 0.75, pointerEvents: "none" }}
      />

      <div
        style={{
          textAlign: "center",
          animation: "mario-success-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
          maxWidth: 440,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mario-star.png" alt="" aria-hidden="true"
          style={{ width: 100, height: "auto", margin: "0 auto 1.5rem", display: "block", filter: "drop-shadow(0 8px 20px rgba(251,208,0,0.65))", animation: "mario-success-star-spin 3s linear infinite" }}
        />

        <h1
          style={{
            fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2rem,7vw,2.8rem)",
            color: "#FBD000",
            textShadow: "0 4px 0 #C8950A, 0 6px 0 #8B6914, 3px 3px 0 #E52521",
            marginBottom: "1rem",
            lineHeight: 1.1,
          }}
        >
          {config.success.title}
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            border: "2px solid rgba(255,255,255,0.35)",
            borderRadius: "1.5rem",
            padding: "1.5rem 2rem",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.95)",
              textShadow: "0 1px 3px rgba(0,0,0,0.2)",
              lineHeight: 1.65,
            }}
          >
            {config.success.message}
          </p>
        </div>

        <a
          href={config.success.button.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-fredoka), sans-serif",
            fontWeight: 700,
            fontSize: "1.05rem",
            color: "#1a1000",
            background: "linear-gradient(180deg,#FFE135 0%,#FBD000 100%)",
            border: "3px solid #C8950A",
            borderRadius: "0.85rem",
            padding: "0.85rem 1.75rem",
            boxShadow: "0 6px 0 #8B6914, 0 8px 20px rgba(200,149,10,0.4)",
            textDecoration: "none",
            transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.05)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 0 #8B6914, 0 12px 28px rgba(200,149,10,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 0 #8B6914, 0 8px 20px rgba(200,149,10,0.4)";
          }}
        >
          <span aria-hidden="true">🍄</span>
          {config.success.button.label}
        </a>
      </div>
    </div>
  );
}

/* ── Main register page ─────────────────────────────────────────────── */
export default function CS101RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialData = Object.fromEntries(
    config.steps.flatMap((s) => s.fields.map((f) => [f.name, ""]))
  );
  // Bumped key to "v2" — old drafts had a different field set and would
  // pollute the new schema with stale keys.
  const [formData, setField, clearDraft, draftRestored] = useFormDraft("cs101-draft-v2", initialData);

  /* Conditional visibility: a field is visible unless its showIf evaluates false. */
  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.showIf) return true;
      const cond = field.showIf;
      const v = formData[cond.field] || "";
      if ("equals" in cond) return v === cond.equals;
      if ("in" in cond) return cond.in.includes(v);
      if ("contains" in cond) return v.split(",").filter(Boolean).includes(cond.contains);
      return true;
    },
    [formData]
  );

  const updateField = (field: string, value: string) => {
    setField(field, value);
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    const currentStep = config.steps[step];
    for (const field of currentStep.fields) {
      if (!isFieldVisible(field)) continue;
      if (field.required && !formData[field.name]?.trim()) {
        e[field.name] = `กรุณากรอก${field.label}`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((p) => Math.min(p + 1, config.steps.length - 1)); };
  const handleBack = () => setStep((p) => Math.max(p - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!session?.user?.email) {
      setErrors({ submit: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "cs101",
          name: formData.name,
          // Email comes from the authenticated session — server re-validates and overrides.
          email: session.user.email,
          answers: formData,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "การสมัครไม่สำเร็จ");
      }
      clearDraft();
      router.push("/events/cs101/register?success=true");
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "เกิดข้อผิดพลาดบางอย่าง" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Gate order: success → loading → unauthenticated → form ───────── */
  if (searchParams.get("success") === "true") {
    return <SuccessScreen fredokaVar={fredoka.variable} />;
  }
  if (status === "loading") {
    return <MarioLoading fredokaVar={fredoka.variable} />;
  }
  if (status === "unauthenticated") {
    return <AuthGate fredokaVar={fredoka.variable} />;
  }

  const currentStepCfg = config.steps[step];
  const isLast = step === config.steps.length - 1;

  return (
    <div
      className={fredoka.variable}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#12143A 0%,#1C1F52 55%,#0E1030 100%)",
        padding: "5rem 1rem 3rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes mario-coin-float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-16px) rotate(-8deg); }
        }
        @keyframes mario-reg-star-spin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.15); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes mario-reg-fade {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Placeholder color for Mario inputs */
        .mario-register-page input::placeholder,
        .mario-register-page textarea::placeholder {
          color: #B8954A;
          font-family: var(--font-prompt), sans-serif;
          font-weight: 400;
        }
        .mario-register-page input,
        .mario-register-page textarea {
          font-family: var(--font-fredoka), var(--font-prompt), sans-serif !important;
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden="true"],
          [aria-hidden="true"] * { animation: none !important; }
        }
      `}</style>

      {/* ── Background decorations ── */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <FloatCoin style={{ top: "10%", left: "3%",   animationDelay: "0s",   opacity: 0.5 }} />
        <FloatCoin style={{ top: "30%", right: "4%",  animationDelay: "1.5s", opacity: 0.4 }} />
        <FloatCoin style={{ top: "60%", left: "6%",   animationDelay: "0.8s", opacity: 0.35 }} />
        <FloatCoin style={{ top: "75%", right: "7%",  animationDelay: "2.2s", opacity: 0.4 }} />

        {[
          { top: "18%", left: "15%",  size: 22, delay: "0.3s"  },
          { top: "45%", right: "12%", size: 18, delay: "1.8s"  },
          { top: "80%", left: "20%",  size: 20, delay: "0.9s"  },
          { top: "65%", right: "18%", size: 24, delay: "2.5s"  },
        ].map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src="/mario-star.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{
              position: "absolute",
              top: s.top,
              ...((s as { left?: string }).left ? { left: (s as { left: string }).left } : {}),
              ...((s as { right?: string }).right ? { right: (s as { right: string }).right } : {}),
              width: s.size,
              height: s.size,
              objectFit: "contain",
              opacity: 0.32,
              animation: `mario-reg-star-spin 4s linear infinite`,
              animationDelay: s.delay,
              pointerEvents: "none",
            }}
          />
        ))}

        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: "linear-gradient(180deg,#43B047,#1A8B2E,#43B047,#1A8B2E)", opacity: 0.6 }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 8, background: "linear-gradient(180deg,#43B047,#1A8B2E,#43B047,#1A8B2E)", opacity: 0.6 }} />
      </div>

      <div
        className="mario-register-page"
        style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1, animation: "mario-reg-fade 0.5s ease-out both" }}
      >
        {/* ── Page header ── */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mario-pixel.png"
            alt=""
            aria-hidden="true"
            style={{ width: 72, height: "auto", imageRendering: "pixelated", margin: "0 auto 12px", display: "block", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))", animation: "mario-coin-float 3s ease-in-out infinite" }}
          />
          <h1
            style={{
              fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem,6vw,2.5rem)",
              color: "#FBD000",
              textShadow: "0 3px 0 #C8950A, 0 5px 0 #8B6914, 3px 3px 0 #E52521",
              marginBottom: 6,
            }}
          >
            {config.pageTitle}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              fontSize: "1rem",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            {config.pageSubtitle}
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom: 20 }}>
          <MarioProgressBar
            currentStep={step}
            totalSteps={config.steps.length}
            labels={config.stepLabels}
          />
        </div>

        {/* Locked email notice — visible on every step so users know what address gets recorded */}
        {session?.user?.email && (
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              fontSize: "0.85rem",
              color: "#5DD863",
              background: "rgba(67,176,71,0.15)",
              border: "1.5px solid rgba(67,176,71,0.35)",
              borderRadius: "0.75rem",
              padding: "0.6rem 1rem",
              wordBreak: "break-all",
            }}
          >
            <span aria-hidden="true">✉️</span>
            <span>
              {config.emailLockedNotice}: <strong style={{ fontWeight: 700 }}>{session.user.email}</strong>
            </span>
          </div>
        )}

        {/* Draft restored notice */}
        {draftRestored && (
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              fontSize: "0.85rem",
              color: "#FBD000",
              background: "rgba(251,208,0,0.12)",
              border: "1.5px solid rgba(251,208,0,0.35)",
              borderRadius: "0.75rem",
              padding: "0.6rem 1rem",
            }}
          >
            <span aria-hidden="true">🍄</span> กู้คืนฉบับร่างแล้ว
          </div>
        )}

        {/* Submit error */}
        {errors.submit && (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-fredoka), var(--font-prompt), sans-serif",
              fontSize: "0.9rem",
              color: "#FF8A87",
              background: "rgba(229,37,33,0.18)",
              border: "2px solid rgba(229,37,33,0.4)",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
            }}
          >
            <span aria-hidden="true">⚠️</span> {errors.submit}
          </div>
        )}

        {/* ── Form card ── */}
        <div
          style={{
            background: "linear-gradient(135deg,#FFF8E8 0%,#FFFDE7 100%)",
            border: "3px solid #C8950A",
            borderRadius: "1.5rem",
            padding: "2rem 1.5rem",
            boxShadow: "0 8px 0 #5A3E00, 0 12px 40px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.6)",
          }}
        >
          <MarioFormStep
            title={currentStepCfg.title}
            description={currentStepCfg.description}
            stepIndex={step}
            onNext={isLast ? handleSubmit : handleNext}
            onBack={step > 0 ? handleBack : undefined}
            isFirst={step === 0}
            isLast={isLast}
            isSubmitting={isSubmitting}
          >
            {currentStepCfg.fields.map((field) => {
              if (!isFieldVisible(field)) return null;

              if (field.type === "checkbox-group") {
                return (
                  <MarioCheckboxGroup
                    key={field.name}
                    fieldName={field.name}
                    label={field.label}
                    options={field.checkboxOptions || []}
                    value={formData[field.name]}
                    onChange={(v: string) => updateField(field.name, v)}
                    error={errors[field.name]}
                    helperText={field.helperText}
                  />
                );
              }
              if (field.type === "textarea") {
                return (
                  <MarioInput
                    key={field.name}
                    as="textarea"
                    fieldName={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField(field.name, e.target.value)}
                    error={errors[field.name]}
                    helperText={field.helperText}
                  />
                );
              }
              if (field.type === "select") {
                return (
                  <MarioInput
                    key={field.name}
                    as="select"
                    fieldName={field.name}
                    label={field.label}
                    value={formData[field.name]}
                    onChange={(v: string) => updateField(field.name, v)}
                    error={errors[field.name]}
                    options={field.options!}
                  />
                );
              }
              return (
                <MarioInput
                  key={field.name}
                  fieldName={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  value={formData[field.name]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(field.name, e.target.value)}
                  error={errors[field.name]}
                />
              );
            })}
          </MarioFormStep>
        </div>

        {/* Step counter */}
        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontFamily: "var(--font-fredoka), sans-serif",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Step {step + 1} / {config.steps.length}
        </p>
      </div>
    </div>
  );
}
