"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Slot = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isMyBooking: boolean;
};

type GroupedSlots = { date: string; slots: Slot[] };

function groupByDate(slots: Slot[]): GroupedSlots[] {
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

/* ── Slot block ─────────────────────────────────────────────────── */
function SlotBlock({
  slot, onBook, onCancel, loading,
}: {
  slot: Slot;
  onBook: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (slot.isMyBooking) {
    return (
      <div className="rounded-xl px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" role="status" aria-label={`คุณจองเวลา ${slot.startTime} ถึง ${slot.endTime} แล้ว`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 tabular-nums">{slot.startTime} - {slot.endTime}</p>
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <button onClick={onCancel} disabled={loading}
          aria-label={`ยกเลิกการจองเวลา ${slot.startTime} ถึง ${slot.endTime}`}
          className="mt-2 w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors cursor-pointer disabled:opacity-60">
          {loading ? "กำลังยกเลิก..." : "ยกเลิก"}
        </button>
      </div>
    );
  }

  if (slot.isBooked) {
    return (
      <div className="rounded-xl px-4 py-3 bg-hover border border-border-subtle" role="status" aria-label={`เวลา ${slot.startTime} ถึง ${slot.endTime} ถูกจองแล้ว`} aria-disabled="true">
        <p className="text-sm font-semibold text-muted tabular-nums line-through decoration-1">{slot.startTime} - {slot.endTime}</p>
        <p className="text-xs text-muted mt-1">จองแล้ว</p>
      </div>
    );
  }

  return (
    <button onClick={onBook} disabled={loading}
      aria-label={`จองเวลา ${slot.startTime} ถึง ${slot.endTime}`}
      className="w-full text-left rounded-xl px-4 py-3 bg-card border border-border hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-150 cursor-pointer disabled:opacity-60">
      <p className="text-sm font-semibold text-foreground tabular-nums">{slot.startTime} - {slot.endTime}</p>
      <p className="text-xs text-muted mt-1">ว่าง</p>
    </button>
  );
}

/* ── Dialog (shared) ────────────────────────────────────────────── */
function Dialog({
  children, onClose, loading,
}: {
  children: React.ReactNode;
  onClose: () => void;
  loading: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => { trigger?.focus(); };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) { onClose(); return; }
      if (e.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose, loading]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl shadow-2xl bg-card border border-border p-6">
        <button ref={closeRef} className="sr-only" aria-label="Focus anchor" />
        {children}
      </div>
    </div>
  );
}

/* ── Confirm book modal ─────────────────────────────────────────── */
function ConfirmModal({
  slot, onConfirm, onClose, loading,
}: {
  slot: Slot;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <Dialog onClose={onClose} loading={loading}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 id="dialog-title" className="text-lg font-bold text-foreground">ยืนยันจองรอบสัมภาษณ์</h3>
      </div>
      <div className="bg-hover rounded-xl px-4 py-3 mb-5 space-y-1">
        <p className="text-sm text-secondary">วันที่: <strong className="text-foreground">{formatDate(slot.date)}</strong></p>
        <p className="text-sm text-secondary">เวลา: <strong className="text-foreground">{slot.startTime} - {slot.endTime}</strong></p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-secondary hover:bg-hover rounded-xl transition-colors cursor-pointer border border-border">
          ยกเลิก
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60">
          {loading ? "กำลังจอง..." : "ยืนยัน"}
        </button>
      </div>
    </Dialog>
  );
}

/* ── Confirm cancel modal ───────────────────────────────────────── */
function CancelModal({
  slot, onConfirm, onClose, loading,
}: {
  slot: Slot;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <Dialog onClose={onClose} loading={loading}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 id="dialog-title" className="text-lg font-bold text-foreground">ยกเลิกการจอง?</h3>
      </div>
      <div className="bg-hover rounded-xl px-4 py-3 mb-5 space-y-1">
        <p className="text-sm text-secondary">วันที่: <strong className="text-foreground">{formatDate(slot.date)}</strong></p>
        <p className="text-sm text-secondary">เวลา: <strong className="text-foreground">{slot.startTime} - {slot.endTime}</strong></p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-secondary hover:bg-hover rounded-xl transition-colors cursor-pointer border border-border">
          ไม่ยกเลิก
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60">
          {loading ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
        </button>
      </div>
    </Dialog>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ClubSlotsPage() {
  const { status: authStatus } = useSession();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<boolean | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);
  const [cancelSlot, setCancelSlot] = useState<Slot | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/club/slots");
      const data = await res.json();
      setBookingOpen(data.bookingOpen ?? false);
      setSlots(data.slots ?? []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/club/apply")
      .then((r) => r.json())
      .then((d) => setApplied(d.applied))
      .catch(() => setApplied(false));
    fetchSlots();
  }, [authStatus, fetchSlots]);

  const handleBook = async () => {
    if (!confirmSlot) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/club/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: confirmSlot._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("จองสำเร็จ!", true);
      setConfirmSlot(null);
      await fetchSlots();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/club/slots", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("ยกเลิกการจองแล้ว", true);
      setCancelSlot(null);
      await fetchSlots();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", false);
    } finally {
      setActionLoading(false);
    }
  };

  if (authStatus === "loading" || loading || applied === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div role="status" aria-label="กำลังโหลด...">
          <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!applied) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">กรุณาสมัครชุมนุมก่อน</h2>
          <p className="text-secondary mb-6 text-sm">คุณต้องสมัครชุมนุมก่อนถึงจะจองรอบสัมภาษณ์ได้</p>
          <Link href="/club/apply" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
            ไปหน้าสมัคร
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">ยังไม่เปิดจองรอบสัมภาษณ์</h2>
          <p className="text-secondary mb-6 text-sm leading-relaxed">กรุณารอประกาศจากชุมนุม ติดตามข่าวสารได้ที่ Instagram</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(slots);
  const mySlot = slots.find((s) => s.isMyBooking);
  const totalSlots = slots.length;
  const bookedSlots = slots.filter((s) => s.isBooked).length;

  return (
    <div className="min-h-screen py-20 px-4 bg-background">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 motion-safe:animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">จองรอบสัมภาษณ์</h1>
          <p className="text-secondary text-sm max-w-lg mx-auto">เลือกรอบสัมภาษณ์ที่สะดวก (1 คนต่อ 1 รอบ)</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-8 text-sm">
          <span>
            <strong className="font-semibold text-foreground">{totalSlots}</strong>
            <span className="ml-1.5 text-muted">รอบทั้งหมด</span>
          </span>
          <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
          <span>
            <strong className="font-semibold text-blue-600 dark:text-blue-400">{totalSlots - bookedSlots}</strong>
            <span className="ml-1.5 text-muted">ว่าง</span>
          </span>
          <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-border" />
          <span>
            <strong className="font-semibold text-secondary">{bookedSlots}</strong>
            <span className="ml-1.5 text-muted">จองแล้ว</span>
          </span>
        </div>

        {/* My booking summary */}
        {mySlot && (
          <div className="mb-8 bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">คุณจองรอบสัมภาษณ์แล้ว</h2>
                <p className="text-sm text-secondary">
                  {formatDate(mySlot.date)} เวลา {mySlot.startTime} - {mySlot.endTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Slot grid */}
        {grouped.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-muted">ยังไม่มีรอบสัมภาษณ์</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((g) => (
              <section key={g.date} className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm" aria-labelledby={`date-${g.date}`}>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-subtle">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 id={`date-${g.date}`} className="text-base font-bold text-foreground">{formatDate(g.date)}</h2>
                    <p className="text-xs text-muted">{g.slots.filter((s) => !s.isBooked).length} / {g.slots.length} ว่าง</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {g.slots.map((s) => (
                    <SlotBlock
                      key={s._id}
                      slot={s}
                      onBook={() => setConfirmSlot(s)}
                      onCancel={() => setCancelSlot(s)}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Confirm book modal */}
      {confirmSlot && (
        <ConfirmModal
          slot={confirmSlot}
          onConfirm={handleBook}
          onClose={() => setConfirmSlot(null)}
          loading={actionLoading}
        />
      )}

      {/* Confirm cancel modal */}
      {cancelSlot && (
        <CancelModal
          slot={cancelSlot}
          onConfirm={handleCancel}
          onClose={() => setCancelSlot(null)}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
