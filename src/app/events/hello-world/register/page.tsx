"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProgressBar from "@/components/ui/ProgressBar";
import FormStep from "@/components/ui/FormStep";
import Input from "@/components/ui/Input";

const STEP_LABELS = ["Basic Info", "Personality", "Motivation", "Expectations"];

const personalityTypes = [
  { value: "thinker", label: "🧠 Thinker", desc: "Analytical & logical" },
  { value: "action", label: "⚡ Action", desc: "Bold & decisive" },
  { value: "creative", label: "🎨 Creative", desc: "Imaginative & expressive" },
  { value: "team", label: "🤝 Team Player", desc: "Collaborative & supportive" },
];

const vibeOptions = [
  { value: "fun", label: "🎉 Fun & Chill", desc: "Games, laughter, and good vibes" },
  { value: "serious", label: "📚 Focused & Serious", desc: "Learning-oriented and structured" },
];

export default function HelloWorldRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "", email: "",
    personalityType: "", codingExperience: "", eventVibe: "",
    whyJoin: "", expectations: "",
  });

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
    if (step === 0) {
      if (!formData.name.trim()) e.name = "Name is required";
      if (!formData.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
    } else if (step === 1) {
      if (!formData.personalityType) e.personalityType = "Pick your personality type";
      if (!formData.codingExperience) e.codingExperience = "Select your experience";
      if (!formData.eventVibe) e.eventVibe = "Choose your vibe";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((p) => Math.min(p + 1, 3)); };
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Registration failed"); }
      router.push("/events/hello-world/register?success=true");
    } catch (err) { setErrors({ submit: err instanceof Error ? err.message : "Something went wrong" }); }
    finally { setIsSubmitting(false); }
  };

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="text-center animate-scale-in">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">You&apos;re in!</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">Welcome to Hello World! Your house will be revealed soon!</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/events/hello-world" className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">Back to Event</a>
              <a href="/events/hello-world/reveal" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity text-sm">Reveal Your House</a>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in text-center">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Hello World</span>{" "}
            <span className="text-slate-800 dark:text-white">Registration</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">4 quick steps to join the fun!</p>
        </div>

        <div className="mb-10"><ProgressBar currentStep={step} totalSteps={4} labels={STEP_LABELS} /></div>

        {errors.submit && (<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{errors.submit}</div>)}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm">
          {step === 0 && (
            <FormStep title="Basic Information" description="Tell us who you are" onNext={handleNext} isFirst>
              <Input label="Full Name" placeholder="Your name" value={formData.name} onChange={(e: any) => updateField("name", e.target.value)} error={errors.name} />
              <Input label="Email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e: any) => updateField("email", e.target.value)} error={errors.email} readOnly={!!session?.user?.email} className={session?.user?.email ? "opacity-60 cursor-not-allowed" : ""} />
            </FormStep>
          )}

          {step === 1 && (
            <FormStep title="Personality & Preferences" description="What makes you, you?" onNext={handleNext} onBack={handleBack}>
              {/* Personality Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Personality Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {personalityTypes.map((type) => (
                    <button key={type.value} type="button" onClick={() => updateField("personalityType", type.value)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        formData.personalityType === type.value
                          ? "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-slate-800 dark:text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}>
                      <div className="text-lg mb-1">{type.label}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{type.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.personalityType && <p className="text-sm text-red-500 dark:text-red-400">{errors.personalityType}</p>}
              </div>

              {/* Coding Experience */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Any coding experience?</label>
                <div className="flex gap-3">
                  {[{ value: "yes", label: "✅ Yes" }, { value: "no", label: "🙅 No" }].map((opt) => (
                    <button key={opt.value} type="button" onClick={() => updateField("codingExperience", opt.value)}
                      className={`flex-1 p-4 rounded-xl border text-center transition-all duration-200 ${
                        formData.codingExperience === opt.value
                          ? "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-slate-800 dark:text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}>{opt.label}</button>
                  ))}
                </div>
                {errors.codingExperience && <p className="text-sm text-red-500 dark:text-red-400">{errors.codingExperience}</p>}
              </div>

              {/* Event Vibe */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preferred event vibe</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vibeOptions.map((vibe) => (
                    <button key={vibe.value} type="button" onClick={() => updateField("eventVibe", vibe.value)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        formData.eventVibe === vibe.value
                          ? "bg-pink-50 dark:bg-pink-900/30 border-pink-300 dark:border-pink-600 text-slate-800 dark:text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}>
                      <div className="font-medium mb-1">{vibe.label}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{vibe.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.eventVibe && <p className="text-sm text-red-500 dark:text-red-400">{errors.eventVibe}</p>}
              </div>
            </FormStep>
          )}

          {step === 2 && (
            <FormStep title="Motivation" description="Why do you want to join?" onNext={handleNext} onBack={handleBack}>
              <Input as="textarea" label="Why do you want to join Hello World?" placeholder="Tell us what excites you about this event..." value={formData.whyJoin} onChange={(e: any) => updateField("whyJoin", e.target.value)} />
            </FormStep>
          )}

          {step === 3 && (
            <FormStep title="Expectations" description="Anything else?" onNext={handleSubmit} onBack={handleBack} isLast isSubmitting={isSubmitting}>
              <Input as="textarea" label="What do you expect from this event?" placeholder="Fun, learning, friends..." value={formData.expectations} onChange={(e: any) => updateField("expectations", e.target.value)} />
            </FormStep>
          )}
        </div>
      </div>
    </div>
  );
}
