"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Registration = {
  _id: string;
  event: string;
  name: string;
  email: string;
  house?: string;
  answers: Record<string, string>;
  createdAt: string;
};

type ProfileData = {
  user: { name: string; email: string; image?: string };
  registrations: Registration[];
};

const houseStyles: Record<string, { symbol: string; name: string; gradient: string; bg: string; border: string; text: string }> = {
  spongebob:   { symbol: "🧽", name: "SpongeBob",    gradient: "from-yellow-400 to-amber-500",   bg: "bg-yellow-50 dark:bg-yellow-900/20",  border: "border-yellow-300 dark:border-yellow-600", text: "text-yellow-600 dark:text-yellow-400" },
  conan:       { symbol: "🔍", name: "Conan",         gradient: "from-red-600 to-red-900",         bg: "bg-red-50 dark:bg-red-900/20",         border: "border-red-300 dark:border-red-700",       text: "text-red-600 dark:text-red-400"       },
  kungfupanda: { symbol: "🐼", name: "Kung Fu Panda", gradient: "from-green-500 to-emerald-800",   bg: "bg-green-50 dark:bg-green-900/20",     border: "border-green-300 dark:border-green-700",   text: "text-green-600 dark:text-green-400"   },
  zootopia:    { symbol: "🦊", name: "Zootopia",      gradient: "from-orange-400 to-orange-600",   bg: "bg-orange-50 dark:bg-orange-900/20",   border: "border-orange-300 dark:border-orange-700", text: "text-orange-600 dark:text-orange-400" },
  toystory:    { symbol: "🚀", name: "Toy Story",     gradient: "from-blue-500 to-indigo-700",     bg: "bg-blue-50 dark:bg-blue-900/20",       border: "border-blue-300 dark:border-blue-700",     text: "text-blue-600 dark:text-blue-400"     },
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div role="status" aria-label="กำลังโหลด...">
          <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <p className="text-secondary">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    );
  }

  const { user, registrations } = data;
  const helloWorldReg = registrations.find((r) => r.event === "hello-world");
  const cs101Reg = registrations.find((r) => r.event === "cs101");

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-3xl mx-auto">

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-8 motion-safe:animate-fade-in">
          <div className="flex items-center gap-5">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-border shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <p className="text-secondary text-sm mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {registrations.length} กิจกรรมที่ลงทะเบียน
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Registered Events */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground motion-safe:animate-fade-in">กิจกรรมที่ลงทะเบียน</h2>

          {registrations.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center motion-safe:animate-fade-in">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-secondary mb-4">คุณยังไม่ได้ลงทะเบียนกิจกรรมใดเลย</p>
              <Link
                href="/events/cs101"
                className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                ดูกิจกรรม
              </Link>
            </div>
          ) : (
            registrations.map((reg) => (
              <div
                key={reg._id}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm motion-safe:animate-slide-up"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        reg.event === "cs101"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      }`}>
                        {reg.event === "cs101" ? "CS101" : "Hello World"}
                      </span>

                    </div>
                    <h3 className="text-base font-semibold text-foreground">{reg.name}</h3>
                    <p className="text-xs text-muted mt-1">
                      ลงทะเบียนเมื่อ {new Date(reg.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <Link
                    href={reg.event === "cs101" ? "/events/cs101" : "/events/hello-world"}
                    className="px-4 py-2 text-xs font-medium bg-hover text-secondary rounded-lg hover:bg-hover hover:opacity-80 transition-colors"
                  >
                    ดูกิจกรรม
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 motion-safe:animate-fade-in">
          {!cs101Reg && (
            <Link
              href="/events/cs101/register"
              className="group bg-card border border-border rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <p className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">สมัคร CS101</p>
              <p className="text-xs text-muted mt-1">เรียนรู้พื้นฐานวิทยาการคอมพิวเตอร์</p>
            </Link>
          )}
          {!helloWorldReg && (
            <Link
              href="/events/hello-world/register"
              className="group bg-card border border-border rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
            >
              <p className="text-sm font-medium text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">สมัคร Hello World</p>
              <p className="text-xs text-muted mt-1">ค้นพบบ้านและพบเพื่อนใหม่</p>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
