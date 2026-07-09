"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { clubApplyFormConfig, type ClubFormField } from "@/config/forms/club-apply";
import type { ChoiceField, ImageField } from "@/config/forms/hello-world-register";
import { upload } from "@vercel/blob/client";
import { useFormDraft } from "@/lib/useFormDraft";
import { APPLICANT_DEPARTMENTS } from "@/config/team";

function departmentLabel(key: string): string {
  return APPLICANT_DEPARTMENTS.find((d) => d.key === key)?.label ?? "ฝ่ายนี้";
}

const config = clubApplyFormConfig;

const ACCENT = "#2563EB";

type Slot = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isFull: boolean;
};

type BookedSlot = { date: string; startTime: string; endTime: string };

function isChoiceField(field: ClubFormField): field is ChoiceField {
  return field.type === "choice";
}

function isImageField(field: ClubFormField): field is ImageField {
  return field.type === "image";
}

function groupByDate(slots: Slot[]): { date: string; slots: Slot[] }[] {
  const map = new Map<string, Slot[]>();
  for (const s of slots) {
    if (!map.has(s.date)) map.set(s.date, []);
    map.get(s.date)!.push(s);
  }
  return Array.from(map.entries()).map(([date, slots]) => ({ date, slots }));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
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

/* ── Slot picker ────────────────────────────────────────────────── */
function SlotPicker({
  slots, selectedId, onSelect,
}: {
  slots: Slot[]; selectedId: string; onSelect: (id: string) => void;
}) {
  const grouped = groupByDate(slots);
  const anyAvailable = slots.some((s) => !s.isFull);

  if (!anyAvailable) {
    return (
      <div className="rounded-xl border border-border bg-hover p-8 text-center">
        <p className="text-sm text-secondary">ยังไม่มีรอบสัมภาษณ์เปิดให้เลือกในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map((g) => (
        <div key={g.date}>
          <h3 className="text-sm font-bold text-foreground mb-3">{formatDate(g.date)}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {g.slots.map((s) => {
              const active = selectedId === s._id;
              const remaining = s.capacity - s.bookedCount;
              if (s.isFull) {
                return (
                  <div key={s._id} className="rounded-xl px-4 py-3 bg-hover border border-border-subtle" aria-disabled="true">
                    <p className="text-sm font-semibold text-muted tabular-nums line-through decoration-1">{s.startTime} - {s.endTime}</p>
                    <p className="text-xs text-muted mt-1">เต็มแล้ว</p>
                  </div>
                );
              }
              return (
                <button key={s._id} type="button" onClick={() => onSelect(s._id)}
                  aria-pressed={active}
                  className={`text-left rounded-xl px-4 py-3 border-2 transition-all cursor-pointer ${
                    active
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                      : "border-border bg-card hover:border-blue-300 dark:hover:border-blue-700"
                  }`}>
                  <p className={`text-sm font-semibold tabular-nums ${active ? "text-blue-700 dark:text-blue-300" : "text-foreground"}`}>
                    {s.startTime} - {s.endTime}
                  </p>
                  <p className="text-xs text-muted mt-1">เหลือ {remaining}/{s.capacity} ที่</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Success screen ─────────────────────────────────────────────── */
function SuccessScreen({ slot }: { slot: BookedSlot | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center motion-safe:animate-fade-in">
        <div className="text-6xl mb-6">{config.success.emoji}</div>
        <h1 className="text-3xl font-extrabold mb-3 text-foreground">{config.success.title}</h1>
        <p className="text-secondary mb-6 leading-relaxed">{config.success.message}</p>
        {slot && (
          <div className="mb-8 bg-card border border-border rounded-2xl p-5 shadow-sm text-left">
            <p className="text-xs font-semibold text-muted mb-1">รอบสัมภาษณ์ของคุณ</p>
            <p className="text-sm font-semibold text-foreground">{formatDate(slot.date)}</p>
            <p className="text-sm text-secondary">{slot.startTime} - {slot.endTime}</p>
          </div>
        )}
        <div className="flex justify-center">
          <Link href={config.success.backButton.href}
            className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-hover transition-colors">
            {config.success.backButton.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Closed screen ──────────────────────────────────────────────── */
function ApplicationClosed() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">ยังไม่เปิดรับสมัครชุมนุมในขณะนี้</h2>
        <p className="text-secondary mb-6 text-sm leading-relaxed">กรุณารอประกาศจากชุมนุม ติดตามข่าวสารได้ที่ Instagram</p>
        <Link href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
          กลับหน้าหลัก
        </Link>
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
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [bookedSlot, setBookedSlot] = useState<BookedSlot | null>(null);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdminOrStaff = role === "admin" || role === "staff";

  useEffect(() => {
    if (draftRestored) setShowDraftBanner(true);
  }, [draftRestored]);

  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setField("email", session.user.email);
    }
  }, [session, formData.email, setField]);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/club/slots");
      const data = await res.json();
      setApplicationOpen(data.applicationOpen ?? false);
      setSlots(data.slots ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    Promise.all([
      fetch("/api/club/apply").then((r) => r.json()),
      fetchSlots(),
    ])
      .then(([d]) => {
        if (d.applied) {
          setBookedSlot(d.slot ?? null);
          if (!isSuccess) router.replace("/club/apply?success=true");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [authStatus, router, isSuccess, fetchSlots]);

  if (authStatus === "loading" || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isSuccess) return <SuccessScreen slot={bookedSlot} />;

  if (!applicationOpen && !isAdminOrStaff) return <ApplicationClosed />;

  const totalSteps = config.steps.length + 1;
  const isSlotStep = step === config.steps.length;
  const currentStep = isSlotStep ? null : config.steps[step];
  const isLast = isSlotStep;

  const validateStep = (): boolean => {
    if (isSlotStep) {
      if (!selectedSlotId) {
        setSubmitError("กรุณาเลือกเวลาสัมภาษณ์");
        return false;
      }
      return true;
    }
    const errs: Record<string, string> = {};
    for (const field of currentStep!.fields) {
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

    const topLevel = ["name", "nickname", "studentId", "email", "phone", "contactChannel", "photo", "educationType", "preferredDepartment1", "preferredDepartment2"];
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
          nickname: formData.nickname,
          studentId: formData.studentId,
          phone: formData.phone,
          contactChannel: formData.contactChannel,
          photo: formData.photo,
          educationType: formData.educationType,
          preferredDepartment1: formData.preferredDepartment1,
          preferredDepartment2: formData.preferredDepartment2,
          answers,
          slotId: selectedSlotId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.error?.includes("เต็มแล้ว")) {
          setSelectedSlotId("");
          await fetchSlots();
        }
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
      clearDraft();
      setBookedSlot(slots.find((s) => s._id === selectedSlotId)
        ? { date: slots.find((s) => s._id === selectedSlotId)!.date, startTime: slots.find((s) => s._id === selectedSlotId)!.startTime, endTime: slots.find((s) => s._id === selectedSlotId)!.endTime }
        : null);
      router.push("/club/apply?success=true");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmitSlotStep = !isSlotStep || slots.some((s) => !s.isFull);

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

        <StepDots current={step} total={totalSteps} labels={config.stepLabels} />

        {/* Form card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
          {isSlotStep ? (
            <>
              <h2 className="text-xl font-bold mb-1 text-foreground">เลือกเวลาสัมภาษณ์</h2>
              <p className="text-sm text-muted mb-6">เลือกรอบที่สะดวก แล้วกดส่งใบสมัคร</p>
              <SlotPicker slots={slots} selectedId={selectedSlotId} onSelect={(id) => { setSelectedSlotId(id); setSubmitError(""); }} />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1 text-foreground">{currentStep!.title}</h2>
              <p className="text-sm text-muted mb-6">{currentStep!.description}</p>
              <div className="space-y-5">
                {currentStep!.fields.map((field) => {
                  if (isChoiceField(field)) {
                    const isRankedDepartment = field.name === "preferredDepartment1" || field.name === "preferredDepartment2";
                    const displayField = field.name === "preferredDepartment2"
                      ? { ...field, options: field.options.filter((o) => o.value !== formData.preferredDepartment1) }
                      : field;
                    return (
                      <ChoiceButtons
                        key={field.name}
                        field={displayField}
                        value={formData[field.name] || ""}
                        onChange={(v) => {
                          setField(field.name, v);
                          if (isRankedDepartment && field.name === "preferredDepartment1" && v === formData.preferredDepartment2) {
                            setField("preferredDepartment2", "");
                          }
                        }}
                        error={errors[field.name]}
                      />
                    );
                  }
                  if (isImageField(field)) {
                    return <ImageUpload key={field.name} field={field} value={formData[field.name] || ""} onChange={(url) => setField(field.name, url)} error={errors[field.name]} />;
                  }
                  let label = field.label;
                  if (field.name === "departmentReason1") {
                    label = `ทำไมถึงเลือกฝ่าย ${departmentLabel(formData.preferredDepartment1)} เป็นอันดับ 1 เพราะอะไร`;
                  } else if (field.name === "departmentReason2") {
                    label = `ทำไมถึงเลือกฝ่าย ${departmentLabel(formData.preferredDepartment2)} เป็นอันดับ 2 เพราะอะไร`;
                  }
                  return (
                    <Input
                      key={field.name}
                      label={label}
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
            </>
          )}

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
              <button type="button" onClick={handleSubmit} disabled={submitting || !canSubmitSlotStep}
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
