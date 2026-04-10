import Link from "next/link";
import Timeline from "@/components/ui/Timeline";
import { cs101Config } from "@/config/events/cs101";

const { hero, features, schedule, cta } = cs101Config;

export default function CS101Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto -mt-32 animate-fade-in ">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-mono text-blue-600 dark:text-blue-400 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            {hero.badge}
          </div>

          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-slate-800 dark:text-white ">
            CS<span className="text-blue-600 dark:text-blue-400">101</span>
          </h1>

          <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href={hero.primaryButton.href} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm text-center shadow-sm shadow-blue-500/20">
              {hero.primaryButton.label}
            </Link>
            <a href={hero.secondaryButton.href} className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-sm text-center">
              {hero.secondaryButton.label}
            </a>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-12 text-center">{features.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.cards.map((item) => (
              <div key={item.title} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-slate-800 dark:text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{schedule.eyebrow}</p>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{schedule.title}</h2>
          </div>
          <Timeline days={schedule.days} accentColor={schedule.accentColor} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">{cta.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{cta.description}</p>
          <Link href={cta.button.href} className="inline-flex px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm shadow-sm shadow-blue-500/20">
            {cta.button.label}
          </Link>
        </div>
      </section>
    </div>
  );
}
