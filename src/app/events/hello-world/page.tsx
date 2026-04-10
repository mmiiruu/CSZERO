import Link from "next/link";
import Timeline from "@/components/ui/Timeline";
import { helloWorldConfig } from "@/config/events/hello-world";

const { hero, houses, schedule, cta } = helloWorldConfig;

export default function HelloWorldPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-200/20 dark:bg-cyan-900/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center -mt-32 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-full text-sm text-purple-600 dark:text-purple-400 mb-8">{hero.badge}</div>
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">Hello</span>
            <br /><span className="text-slate-800 dark:text-white">World</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {hero.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={hero.primaryButton.href} className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm text-center w-full sm:w-auto shadow-lg shadow-purple-500/20">{hero.primaryButton.label}</Link>
            <Link href={hero.secondaryButton.href} className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:shadow-md dark:hover:bg-slate-700 transition-all text-sm text-center w-full sm:w-auto">{hero.secondaryButton.label}</Link>
          </div>
        </div>
      </section>

      {/* Houses */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-3">{houses.eyebrow}</p>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">{houses.title}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {houses.items.map((house) => (
              <div key={house.name} className={`relative overflow-hidden ${house.cardBg} border rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 group`}>
                <div className="text-5xl mb-4">{house.symbol}</div>
                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">{house.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{house.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-pink-500 dark:text-pink-400 uppercase tracking-widest mb-3">{schedule.eyebrow}</p>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">{schedule.title}</h2>
          </div>
          <Timeline days={schedule.days} accentColor={schedule.accentColor} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">{cta.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{cta.description}</p>
          <Link href={cta.button.href} className="inline-flex px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm shadow-lg shadow-purple-500/20">{cta.button.label}</Link>
        </div>
      </section>
    </div>
  );
}
