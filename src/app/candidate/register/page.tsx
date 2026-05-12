"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { candidateRegistrationConfig as cfg } from "@/config/candidate";

type FormState = {
  name: string;
  studentId: string;
  year: string;
  role: string;
  bio: string;
  motivation: string;
  image: string;
};

const initialForm: FormState = {
  name: "",
  studentId: "",
  year: "",
  role: "",
  bio: "",
  motivation: "",
  image: "",
};

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div role="status" aria-label="กำลังโหลด...">
        <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{cfg.comingSoon.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">{cfg.comingSoon.message}</p>
        <Link
          href={cfg.comingSoon.backButton.href}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          {cfg.comingSoon.backButton.label}
        </Link>
      </div>
    </div>
  );
}

function AuthGate() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">ต้องเข้าสู่ระบบก่อน</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">เข้าสู่ระบบเพื่อสมัครเป็นผู้สมัคร</p>
        <Link
          href="/auth/signin?callbackUrl=/candidate/register"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{cfg.successTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">{cfg.successMessage}</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

export default function CandidateRegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdminOrStaff = role === "admin" || role === "staff";

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "submit", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill name from session
  useEffect(() => {
    if (session?.user?.name && !form.name) setForm((f) => ({ ...f, name: session.user!.name! }));
  }, [session, form.name]);

  const showComingSoon = useMemo(() => {
    if (status !== "authenticated") return false;
    return !cfg.open && !isAdminOrStaff;
  }, [status, isAdminOrStaff]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = `กรุณากรอก${cfg.fields.name.label}`;
    if (!form.studentId.trim()) e.studentId = `กรุณากรอก${cfg.fields.studentId.label}`;
    if (!form.year.trim()) e.year = `กรุณาเลือก${cfg.fields.year.label}`;
    if (!form.role.trim()) e.role = `กรุณากรอก${cfg.fields.role.label}`;
    if (!form.bio.trim()) e.bio = `กรุณากรอก${cfg.fields.bio.label}`;
    if (!form.motivation.trim()) e.motivation = `กรุณากรอก${cfg.fields.motivation.label}`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
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

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">{cfg.pageTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            {cfg.pageSubtitle}
          </p>
          {!cfg.open && isAdminOrStaff && (
            <p className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ปิดสำหรับนิสิตทั่วไป (แอดมินทดสอบฟอร์มได้)
            </p>
          )}
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          {/* Email locked */}
          {session?.user?.email && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span className="break-all">
                {cfg.fields.email.lockedNotice}: <strong className="font-medium text-slate-700 dark:text-slate-300">{session.user.email}</strong>
              </span>
            </div>
          )}

          <Input
            label={cfg.fields.name.label}
            placeholder={cfg.fields.name.placeholder}
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("name", e.target.value)}
            error={errors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label={cfg.fields.studentId.label}
              placeholder={cfg.fields.studentId.placeholder}
              value={form.studentId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("studentId", e.target.value)}
              error={errors.studentId}
            />
            <Input
              as="select"
              label={cfg.fields.year.label}
              value={form.year}
              onChange={(v: string) => update("year", v)}
              options={cfg.fields.year.options}
              error={errors.year}
            />
          </div>

          <Input
            label={cfg.fields.role.label}
            placeholder={cfg.fields.role.placeholder}
            value={form.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("role", e.target.value)}
            error={errors.role}
          />

          <Input
            as="textarea"
            label={cfg.fields.bio.label}
            placeholder={cfg.fields.bio.placeholder}
            value={form.bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("bio", e.target.value)}
            error={errors.bio}
            rows={3}
          />

          <Input
            as="textarea"
            label={cfg.fields.motivation.label}
            placeholder={cfg.fields.motivation.placeholder}
            value={form.motivation}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("motivation", e.target.value)}
            error={errors.motivation}
            rows={5}
          />

          <Input
            label={cfg.fields.image.label}
            placeholder={cfg.fields.image.placeholder}
            helperText={cfg.fields.image.helper}
            value={form.image}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("image", e.target.value)}
          />

          {errors.submit && (
            <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              ยกเลิก
            </button>
            <Button type="submit" variant="primary" loading={submitting}>
              {cfg.submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
