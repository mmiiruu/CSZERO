import Link from "next/link";
import { ForceTheme } from "@/components/providers/ForceTheme";
import { helloWorldConfig } from "@/config/events/hello-world";
import type { Countdown } from "@/lib/registration";
import { CountdownBlocks } from "./CountdownBlocks";
import { AMBER, TEXT_D, TEXT_M, BG } from "./theme";

export function ComingSoonScreen({ countdown }: { countdown: Countdown | null }) {
  const { title, message, backButton } = helloWorldConfig.registration.comingSoon;
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: BG }}>
      <ForceTheme theme="light" />

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: "rgba(254,240,138,0.6)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(186,230,253,0.5)" }} />
      </div>

      <div className="relative z-10 text-center max-w-md w-full motion-safe:animate-fade-in">
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{ background: "#FFFFFF", border: "3px solid rgba(202,138,4,0.35)", boxShadow: "0 24px 64px rgba(202,138,4,0.18), 0 4px 16px rgba(0,0,0,0.06)" }}
        >
          <div aria-hidden="true" className="flex justify-center gap-2 mb-5 text-3xl">
            <span>🚧</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl mb-3" style={{ color: TEXT_D }}>
            {title}
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: TEXT_M }}>
            {message}
          </p>

          {countdown && <CountdownBlocks countdown={countdown} />}

          <Link
            href={backButton.href}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-[shadow,transform] duration-200 motion-safe:hover:scale-105 hover:shadow-xl"
            style={{ background: AMBER, color: "#FFFFFF", boxShadow: "0 6px 20px rgba(217,119,6,0.4)" }}
          >
            {backButton.label}
          </Link>

          <div aria-hidden="true" className="mt-6 flex justify-center gap-2 opacity-60">
            {["🧽", "🔍", "🐼", "🦊", "🚀"].map((e) => <span key={e}>{e}</span>)}
          </div>
        </div>
      </div>
    </main>
  );
}
