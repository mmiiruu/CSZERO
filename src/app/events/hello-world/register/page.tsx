"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProgressBar from "@/components/ui/ProgressBar";
import FormStep from "@/components/ui/FormStep";
import Input from "@/components/ui/Input";
import { helloWorldFormConfig, type HWFormField, type ChoiceField } from "@/config/forms/hello-world-register";

const config = helloWorldFormConfig;

function isChoiceField(field: HWFormField): field is ChoiceField {
  return field.type === "choice";
}

function ChoiceButtons({
  field,
  value,
  onChange,
  error,
}: {
  field: ChoiceField;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const activeClass = (theme: "purple" | "pink") =>
    theme === "purple"
      ? "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-slate-800 dark:text-white shadow-sm"
      : "bg-pink-50 dark:bg-pink-900/30 border-pink-300 dark:border-pink-600 text-slate-800 dark:text-white shadow-sm";
  const inactiveClass =
    "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
      <div className={field.layout === "grid2" ? "grid grid-cols-2 gap-3" : "flex gap-3"}>
        {field.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`${field.layout === "flex" ? "flex-1" : ""} p-4 rounded-xl border text-left transition-all duration-200 ${
              value === opt.value ? activeClass(field.theme) : inactiveClass
            }`}
          >
            <div className={field.layout === "flex" ? "text-center" : "text-lg mb-1"}>{opt.label}</div>
            {opt.desc && <div className="text-xs text-slate-400 dark:text-slate-500">{opt.desc}</div>}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function HelloWorldRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      config.steps.flatMap((s) => s.fields.map((f) => [f.name, ""]))
    )
  );

  useEffect(() => {
    if (session?.user?.email) {
      setFormData((prev) => ({ ...prev, email: session.user!.email! }));
    }
  }, [session]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) { setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; }); }
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    const currentStep = config.steps[step];
    for (const field of currentStep.fields) {
      if (field.required && !formData[field.name]?.trim()) {
        e[field.name] = isChoiceField(field) ? `กรุณาเลือก${field.label}` : `กรุณากรอก${field.label}`;
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((p) => Math.min(p + 1, config.steps.length - 1)); };
  const handleBack = () => setStep((p) => Math.max(p - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "hello-world", name: formData.name, email: formData.email,
          answers: { personalityType: formData.personalityType, codingExperience: formData.codingExperience, eventVibe: formData.eventVibe, whyJoin: formData.whyJoin, expectations: formData.expectations },
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "การสมัครไม่สำเร็จ"); }
      router.push("/events/hello-world/register?success=true");
    } catch (err) { setErrors({ submit: err instanceof Error ? err.message : "เกิดข้อผิดพลาดบางอย่าง" }); }
    finally { setIsSubmitting(false); }
  };

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const { success } = config;
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="text-center animate-scale-in">
            <div className="text-6xl mb-6">{success.emoji}</div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">{success.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">{success.message}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={success.backButton.href} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">{success.backButton.label}</a>
              <a href={success.revealButton.href} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity text-sm">{success.revealButton.label}</a>
            </div>
          </div>
        </div>
      );
    }
  }

  const currentStep = config.steps[step];
  const isLast = step === config.steps.length - 1;

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in text-center">
          <div className="text-4xl mb-4">{config.hero.emoji}</div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{config.hero.titleAccent}</span>{" "}
            <span className="text-slate-800 dark:text-white">ลงทะเบียน</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{config.hero.subtitle}</p>
        </div>

        <div className="mb-10"><ProgressBar currentStep={step} totalSteps={config.steps.length} labels={config.stepLabels} /></div>

        {errors.submit && (<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{errors.submit}</div>)}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm">
          <FormStep
            title={currentStep.title}
            description={currentStep.description}
            onNext={isLast ? handleSubmit : handleNext}
            onBack={step > 0 ? handleBack : undefined}
            isFirst={step === 0}
            isLast={isLast}
            isSubmitting={isSubmitting}
          >
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
                    onChange={(e: any) => updateField(field.name, e.target.value)}
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
                  onChange={(e: any) => updateField(field.name, e.target.value)}
                  error={errors[field.name]}
                  readOnly={field.name === "email" && !!session?.user?.email}
                  className={field.name === "email" && session?.user?.email ? "opacity-60 cursor-not-allowed" : ""}
                />
              );
            })}
          </FormStep>
        </div>
      </div>
    </div>
  );
}
