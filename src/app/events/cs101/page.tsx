import Link from "next/link";
import Timeline from "@/components/ui/Timeline";
import { cs101Config } from "@/config/events/cs101";

const { hero, features, schedule, cta } = cs101Config;

// Decorative code snippet — aria-hidden, desktop-only watermark
const CODE_LINES = [
  "// CS101 — Day 1",
  "const you = new Student();",
  "",
  'you.learn("variables");',
  'you.learn("functions");',
  'you.build("first project");',
  "",
  'console.log("Hello, CS! 🚀");',
];

export default function CS101Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="cs101-hero-heading"
        className="relative min-h-screen flex items-center pt-16 px-4 overflow-hidden bg-white dark:bg-slate-900 grid-pattern"
      >
        {/* Ghost code block — visual watermark, desktop only */}
        <pre
          aria-hidden="true"
          className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:block font-mono text-sm leading-[1.9] select-none pointer-events-none text-slate-900 dark:text-slate-100 opacity-[0.05] dark:opacity-[0.08]"
        >
          {CODE_LINES.join("\n")}
        </pre>

        {/* Corner bracket decorations */}
        <span aria-hidden="true" className="absolute left-6 top-[20%] font-mono font-black text-[5rem] leading-none select-none text-blue-600/[0.07] dark:text-blue-400/[0.09]">{"<"}</span>
        <span aria-hidden="true" className="absolute right-6 bottom-[20%] font-mono font-black text-[5rem] leading-none select-none text-blue-600/[0.07] dark:text-blue-400/[0.09]">{"/>"}</span>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-mono text-blue-600 dark:text-blue-400 mb-8">
            <span aria-hidden="true" className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            {hero.badge}
          </div>

          {/* Heading with inline bracket flanking */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span aria-hidden="true" className="font-mono font-bold text-3xl sm:text-4xl text-blue-500/35 dark:text-blue-400/35 leading-none select-none">
              &lt;
            </span>
            <h1
              id="cs101-hero-heading"
              className="text-6xl sm:text-8xl font-bold tracking-tighter text-slate-900 dark:text-white"
            >
              CS<span className="text-blue-600 dark:text-blue-400">101</span>
              {/* Blinking cursor */}
              <span
                aria-hidden="true"
                className="inline-block w-[4px] h-[0.82em] bg-blue-600 dark:bg-blue-400 ml-1.5 align-middle animate-cursor-blink"
              />
            </h1>
            <span aria-hidden="true" className="font-mono font-bold text-3xl sm:text-4xl text-blue-500/35 dark:text-blue-400/35 leading-none select-none">
              /&gt;
            </span>
          </div>

          <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href={hero.primaryButton.href}
              className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 text-sm text-center shadow-sm shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {hero.primaryButton.label}
            </Link>
            <a
              href={hero.secondaryButton.href}
              className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-colors duration-200 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {hero.secondaryButton.label}
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Join ─────────────────────────────────────────────────── */}
      <section aria-labelledby="cs101-features-heading" className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">

          <div className="mb-14">
            <p aria-hidden="true" className="font-mono text-xs text-blue-500/60 dark:text-blue-400/50 mb-2 tracking-[0.2em]">{"// features"}</p>
            <h2
              id="cs101-features-heading"
              className="text-3xl font-bold text-slate-900 dark:text-white"
            >
              {features.title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {features.cards.map((item, index) => (
              <div key={item.title} className="group">
                <span
                  aria-hidden="true"
                  className="block font-mono text-xs font-semibold text-blue-500/55 dark:text-blue-400/45 tracking-[0.25em] mb-3"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="border-l-2 border-blue-200 dark:border-blue-800 group-hover:border-blue-500 dark:group-hover:border-blue-500 pl-4 transition-[border-color] duration-300">
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schedule ─────────────────────────────────────────────────── */}
      <section id="schedule" aria-labelledby="cs101-schedule-heading" className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{schedule.eyebrow}</p>
            <h2 id="cs101-schedule-heading" className="text-3xl font-bold text-slate-900 dark:text-white">{schedule.title}</h2>
          </div>
          <Timeline days={schedule.days} accentColor={schedule.accentColor} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="cs101-cta-heading" className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="cs101-cta-heading" className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{cta.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{cta.description}</p>
          <Link
            href={cta.button.href}
            className="inline-flex px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 text-sm shadow-sm shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
          >
            {cta.button.label}
          </Link>
        </div>
      </section>

    </div>
  );
}
