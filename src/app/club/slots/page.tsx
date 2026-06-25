"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  onBook: (id: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (slot.isMyBooking) {
    return (
      <div className="relative rounded-xl p-4 bg-teal-600 text-white border-2 border-teal-700 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-bold">จองแล้ว</span>
        </div>
        <p className="text-lg font-bold">{slot.startTime} - {slot.endTime}</p>
        <button onClick={onCancel} disabled={loading}
          className="mt-2 w-full py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition-colors cursor-pointer disabled:opacity-60">
          {loading ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
        </button>
      </div>
    );
  }

  if (slot.isBooked) {
    return (
      <div className="rounded-xl p-4 bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 opacity-60">
        <p className="text-sm text-stone-400 font-medium mb-1">จองแล้ว</p>
        <p className="text-lg font-bold text-stone-400">{slot.startTime} - {slot.endTime}</p>
      </div>
    );
  }

  return (
    <button onClick={() => onBook(slot._id)} disabled={loading}
      className="w-full text-left rounded-xl p-4 bg-white dark:bg-card border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors cursor-pointer disabled:opacity-60">
      <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-1">ว่าง</p>
      <p className="text-lg font-bold text-foreground">{slot.startTime} - {slot.endTime}</p>
    </button>
  );
}

/* ── Confirm modal ──────────────────────────────────────────────── */
function ConfirmModal({
  slot, onConfirm, onClose, loading,
}: {
  slot: Slot;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl shadow-2xl bg-card border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-2">ยืนยันจองรอบสัมภาษณ์</h3>
        <p className="text-sm text-secondary mb-1">วันที่: <strong>{formatDate(slot.date)}</strong></p>
        <p className="text-sm text-secondary mb-5">เวลา: <strong>{slot.startTime} - {slot.endTime}</strong></p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-secondary hover:bg-hover rounded-xl transition-colors cursor-pointer border border-border">
            ยกเลิก
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60">
            {loading ? "กำลังจอง..." : "ยืนยัน"}
          </button>
        </div>
      </div>
    </div>
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
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!applied) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-foreground mb-3">กรุณาสมัครชุมนุมก่อน</h1>
          <p className="text-secondary mb-6">คุณต้องสมัครชุมนุมก่อนถึงจะจองรอบสัมภาษณ์ได้</p>
          <Link href="/club/apply" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
            ไปหน้าสมัคร
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🕐</div>
          <h1 className="text-2xl font-bold text-foreground mb-3">ยังไม่เปิดจองรอบสัมภาษณ์</h1>
          <p className="text-secondary mb-6">กรุณารอประกาศจากชุมนุม ติดตามข่าวสารได้ที่ Instagram</p>
          <Link href="/" className="inline-block px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-hover transition-colors">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(slots);
  const mySlot = slots.find((s) => s.isMyBooking);

  return (
    <div className="min-h-screen py-20 px-4 bg-background">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-mono text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Interview Booking</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">จองรอบสัมภาษณ์</h1>
          <p className="text-secondary">เลือกรอบสัมภาษณ์ที่สะดวก (1 คนต่อ 1 รอบ)</p>
        </div>

        {/* My booking summary */}
        {mySlot && (
          <div className="mb-8 p-5 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="font-bold text-teal-700 dark:text-teal-300">คุณจองรอบสัมภาษณ์แล้ว</h2>
            </div>
            <p className="text-sm text-teal-600 dark:text-teal-400">
              {formatDate(mySlot.date)} เวลา {mySlot.startTime} - {mySlot.endTime}
            </p>
          </div>
        )}

        {/* Slot grid */}
        {grouped.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-muted">ยังไม่มีรอบสัมภาษณ์</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map((g) => (
              <section key={g.date}>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  {formatDate(g.date)}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {g.slots.map((s) => (
                    <SlotBlock
                      key={s._id}
                      slot={s}
                      onBook={(id) => setConfirmSlot(s)}
                      onCancel={handleCancel}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmSlot && (
        <ConfirmModal
          slot={confirmSlot}
          onConfirm={handleBook}
          onClose={() => setConfirmSlot(null)}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
