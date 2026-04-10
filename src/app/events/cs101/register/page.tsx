"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ui/ProgressBar";
import FormStep from "@/components/ui/FormStep";
import Input from "@/components/ui/Input";

const STEP_LABELS = ["Personal", "Background", "Skills", "Motivation", "Learning", "Expectations"];

interface FormData {
  name: string; email: string; phone: string; university: string;
  languages: string; experienceLevel: string; projects: string;
  problemSolving: string; favoriteTopic: string;
  whyCS101: string; whatToGain: string;
  learningStyle: string; collaboration: string;
  goals: string; anythingElse: string;
}

export default function CS101RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", phone: "", university: "",
    languages: "", experienceLevel: "", projects: "",
    problemSolving: "", favoriteTopic: "",
    whyCS101: "", whatToGain: "",
    learningStyle: "", collaboration: "",
    goals: "", anythingElse: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) { setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; }); }
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!formData.name.trim()) e.name = "Name is required";
      if (!formData.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
      if (!formData.university.trim()) e.university = "University is required";
    } else if (step === 1) { if (!formData.experienceLevel) e.experienceLevel = "Please select your experience level"; }
    else if (step === 2) { if (!formData.problemSolving.trim()) e.problemSolving = "Please describe your approach"; }
    else if (step === 3) { if (!formData.whyCS101.trim()) e.whyCS101 = "Please tell us why you want to join"; }
    else if (step === 4) { if (!formData.learningStyle) e.learningStyle = "Please select"; if (!formData.collaboration) e.collaboration = "Please select"; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((p) => Math.min(p + 1, 5)); };
  const handleBack = () => setStep((p) => Math.max(p - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "cs101", name: formData.name, email: formData.email, answers: formData }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Registration failed"); }
      router.push("/events/cs101/register?success=true");
    } catch (err) { setErrors({ submit: err instanceof Error ? err.message : "Something went wrong" }); }
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Registration Complete!</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">Thank you for registering for CS101. We&apos;ll send you a confirmation email with all the details.</p>
            <a href="/events/cs101" className="px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium">Back to CS101</a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Register for CS101</h1>
          <p className="text-slate-500 dark:text-slate-400">Fill out the form below to secure your spot.</p>
        </div>
        <div className="mb-10"><ProgressBar currentStep={step} totalSteps={6} labels={STEP_LABELS} /></div>
        {errors.submit && (<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{errors.submit}</div>)}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm">
          {step === 0 && (
            <FormStep title="Personal Information" description="Tell us about yourself" onNext={handleNext} isFirst>
              <Input label="Full Name" placeholder="Enter your full name" value={formData.name} onChange={(e: any) => updateField("name", e.target.value)} error={errors.name} />
              <Input label="Email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e: any) => updateField("email", e.target.value)} error={errors.email} />
              <Input label="Phone (optional)" type="tel" placeholder="0xx-xxx-xxxx" value={formData.phone} onChange={(e: any) => updateField("phone", e.target.value)} />
              <Input label="University" placeholder="e.g., Kasetsart University" value={formData.university} onChange={(e: any) => updateField("university", e.target.value)} error={errors.university} />
            </FormStep>
          )}
          {step === 1 && (
            <FormStep title="Programming Background" description="What's your coding experience?" onNext={handleNext} onBack={handleBack}>
              <Input as="select" label="Experience Level" value={formData.experienceLevel} onChange={(v: string) => updateField("experienceLevel", v)} error={errors.experienceLevel} options={[{ value: "none", label: "No experience" },{ value: "beginner", label: "Beginner (< 6 months)" },{ value: "intermediate", label: "Intermediate (6mo - 2yrs)" },{ value: "advanced", label: "Advanced (2+ years)" }]} />
              <Input label="Languages Known (if any)" placeholder="e.g., Python, JavaScript, C++" value={formData.languages} onChange={(e: any) => updateField("languages", e.target.value)} helperText="Separate with commas" />
              <Input as="textarea" label="Any projects you've worked on? (optional)" placeholder="Describe any coding projects..." value={formData.projects} onChange={(e: any) => updateField("projects", e.target.value)} />
            </FormStep>
          )}
          {step === 2 && (
            <FormStep title="Skills & Thinking" description="How do you approach problems?" onNext={handleNext} onBack={handleBack}>
              <Input as="textarea" label="How do you approach solving a new problem?" placeholder="Describe your problem-solving process..." value={formData.problemSolving} onChange={(e: any) => updateField("problemSolving", e.target.value)} error={errors.problemSolving} />
              <Input label="Favorite CS / tech topic (if any)" placeholder="e.g., AI, web development, cybersecurity" value={formData.favoriteTopic} onChange={(e: any) => updateField("favoriteTopic", e.target.value)} />
            </FormStep>
          )}
          {step === 3 && (
            <FormStep title="Motivation" description="Why do you want to join CS101?" onNext={handleNext} onBack={handleBack}>
              <Input as="textarea" label="Why do you want to join CS101?" placeholder="Tell us your motivation..." value={formData.whyCS101} onChange={(e: any) => updateField("whyCS101", e.target.value)} error={errors.whyCS101} />
              <Input as="textarea" label="What do you hope to gain?" placeholder="Skills, knowledge, connections..." value={formData.whatToGain} onChange={(e: any) => updateField("whatToGain", e.target.value)} />
            </FormStep>
          )}
          {step === 4 && (
            <FormStep title="Learning Preferences" description="How do you learn best?" onNext={handleNext} onBack={handleBack}>
              <Input as="select" label="Preferred Learning Style" value={formData.learningStyle} onChange={(v: string) => updateField("learningStyle", v)} error={errors.learningStyle} options={[{ value: "lecture", label: "Lectures & Theory" },{ value: "hands-on", label: "Hands-on Practice" },{ value: "mixed", label: "Mix of Both" }]} />
              <Input as="select" label="Do you prefer working solo or in groups?" value={formData.collaboration} onChange={(v: string) => updateField("collaboration", v)} error={errors.collaboration} options={[{ value: "solo", label: "Solo" },{ value: "group", label: "Group" },{ value: "both", label: "Both are fine" }]} />
            </FormStep>
          )}
          {step === 5 && (
            <FormStep title="Expectations" description="Anything else we should know?" onNext={handleSubmit} onBack={handleBack} isLast isSubmitting={isSubmitting}>
              <Input as="textarea" label="Your goals for this program" placeholder="What do you want to achieve..." value={formData.goals} onChange={(e: any) => updateField("goals", e.target.value)} />
              <Input as="textarea" label="Anything else? (optional)" placeholder="Questions, dietary restrictions, accessibility needs..." value={formData.anythingElse} onChange={(e: any) => updateField("anythingElse", e.target.value)} />
            </FormStep>
          )}
        </div>
      </div>
    </div>
  );
}
