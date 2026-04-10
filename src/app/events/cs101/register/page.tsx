"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ui/ProgressBar";
import FormStep from "@/components/ui/FormStep";
import Input from "@/components/ui/Input";
import { cs101FormConfig } from "@/config/forms/cs101-register";

const config = cs101FormConfig;

export default function CS101RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      config.steps.flatMap((s) => s.fields.map((f) => [f.name, ""]))
    )
  );

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) { setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; }); }
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    const currentStep = config.steps[step];
    for (const field of currentStep.fields) {
      if (field.required && !formData[field.name]?.trim()) {
        e[field.name] = `กรุณากรอก${field.label}`;
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
        body: JSON.stringify({ event: "cs101", name: formData.name, email: formData.email, answers: formData }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "การสมัครไม่สำเร็จ"); }
      router.push("/events/cs101/register?success=true");
    } catch (err) { setErrors({ submit: err instanceof Error ? err.message : "เกิดข้อผิดพลาดบางอย่าง" }); }
    finally { setIsSubmitting(false); }
  };

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">{config.success.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">{config.success.message}</p>
            <a href={config.success.button.href} className="px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium">{config.success.button.label}</a>
          </div>
        </div>
      );
    }
  }

  const currentStep = config.steps[step];
  const isLast = step === config.steps.length - 1;

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{config.pageTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400">{config.pageSubtitle}</p>
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
              if (field.type === "textarea") {
                return (
                  <Input
                    key={field.name}
                    as="textarea"
                    label={field.label}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e: any) => updateField(field.name, e.target.value)}
                    error={errors[field.name]}
                  />
                );
              }
              if (field.type === "select") {
                return (
                  <Input
                    key={field.name}
                    as="select"
                    label={field.label}
                    value={formData[field.name]}
                    onChange={(v: string) => updateField(field.name, v)}
                    error={errors[field.name]}
                    options={field.options!}
                  />
                );
              }
              return (
                <Input
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  value={formData[field.name]}
                  onChange={(e: any) => updateField(field.name, e.target.value)}
                  error={errors[field.name]}
                />
              );
            })}
          </FormStep>
        </div>
      </div>
    </div>
  );
}
