"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function isLineInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Line\//i.test(navigator.userAgent);
}

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loading, setLoading] = React.useState(false);
  const [isLine, setIsLine] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setIsLine(isLineInAppBrowser());
  }, []);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    const { signIn } = await import("next-auth/react");
    await signIn("google", { callbackUrl });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLine) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl">CS</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">เปิดใน Browser ก่อนนะ</h1>
            <p className="text-secondary text-sm">Google ไม่อนุญาตให้ล็อกอินใน LINE Browser กรุณาเปิดลิงก์นี้ใน Safari หรือ Chrome</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-2 bg-hover rounded-xl px-4 py-3 text-xs text-secondary break-all">
              {window.location.href}
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors duration-200"
            >
              {copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}
            </button>
            <p className="text-center text-muted text-xs">
              แล้วเปิด Safari / Chrome วางลิงก์ในแถบที่อยู่
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full motion-safe:animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">CS</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">เข้าสู่ระบบ CSKU</h1>
          <p className="text-secondary text-sm">ใช้บัญชี Google เพื่อดำเนินการต่อ</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-card border border-border rounded-xl text-sm font-medium text-secondary hover:bg-hover hover:border-border-subtle hover:shadow-sm transition-[colors,shadow] duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}
          </button>
        </div>

        <p className="text-center text-muted text-xs mt-6">
          การเข้าสู่ระบบถือว่าคุณยอมรับ<a href="/terms" className="underline underline-offset-2 hover:text-secondary transition-colors">เงื่อนไขการใช้งาน</a>ของเรา
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div role="status" aria-label="กำลังโหลด...">
            <div aria-hidden="true" className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
