import Link from "next/link";
import { homePage } from "@/config/site";
import { cs101Config } from "@/config/events/cs101";
import { helloWorldConfig } from "@/config/events/hello-world";
import { getMemberColor, DOT_PATTERN } from "@/config/team";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const { hero, eventsSection, teamSection, cta } = homePage;
const cs101Card = cs101Config.homeCard;
const hwCard = helloWorldConfig.homeCard;

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 grid-pattern">
        {/* Code bracket ghosts — technical identity without decorative noise */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 font-mono font-black leading-none select-none pointer-events-none text-blue-600/[0.06] dark:text-blue-500/[0.08]"
          style={{ fontSize: "clamp(160px, 18vw, 300px)" }}
        >{"{"}</span>
        <span
          aria-hidden="true"
          className="absolute right-0 top-1/2 -translate-y-1/2 font-mono font-black leading-none select-none pointer-events-none text-blue-600/[0.06] dark:text-blue-500/[0.08]"
          style={{ fontSize: "clamp(160px, 18vw, 300px)" }}
        >{"}"}</span>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full text-sm text-blue-600 dark:text-blue-400 mb-8">
            <span aria-hidden="true" className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow" />
            {hero.badge}
          </div>

          {/* Font-black + tracking-tighter gives the brand mark commanding weight without decoration */}
          <h1 id="hero-heading" className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white">
            {hero.title}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {hero.tagline.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br className="hidden sm:block" />}
                {line}
              </span>
            ))}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={hero.primaryButton.href}
              className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm shadow-blue-500/20"
            >
              {hero.primaryButton.label}
            </Link>
            <Link
              href={hero.secondaryButton.href}
              className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-700 active:scale-[0.98] transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm"
            >
              {hero.secondaryButton.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section aria-labelledby="events-heading" className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{eventsSection.eyebrow}</p>
            <h2 id="events-heading" className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">{eventsSection.title}</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href={cs101Card.href} className="group rounded-2xl active:scale-[0.995] transition-transform duration-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 h-full hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 dark:bg-blue-800/30 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500 will-change-transform" />
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full text-xs font-mono text-blue-600 dark:text-blue-400 mb-4">{cs101Card.badge}</div>
                  <h3 className="font-display text-3xl font-bold text-slate-800 dark:text-white mb-3">{cs101Card.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{cs101Card.shortDescription}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span>{eventsSection.learnMoreLabel}</span>
                    <svg aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={hwCard.href} className="group rounded-2xl active:scale-[0.995] transition-transform duration-100">
              {/* Always dark — the event forces its own world even on the homepage */}
              <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-8 h-full hover:shadow-xl hover:shadow-black/40 hover:border-amber-500/30 transition-all duration-300">
                {/* Spade watermark — single clear casino tell */}
                <div aria-hidden="true" className="absolute top-3 right-5 font-serif text-[6rem] leading-none text-amber-400/[0.15] select-none pointer-events-none">♠</div>
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono text-amber-400 mb-4">{hwCard.badge}</div>
                  <h3 className="font-display text-3xl font-bold text-white mb-3">{hwCard.title}</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">{hwCard.shortDescription}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-amber-400 transition-colors duration-200">
                    <span>{eventsSection.learnMoreLabel}</span>
                    <svg aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section aria-labelledby="team-heading" className="py-20 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{teamSection.eyebrow}</p>
            <h2 id="team-heading" className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">{teamSection.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-lg mx-auto">{teamSection.description}</p>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamSection.preview.map((member, i) => (
              <Link key={i} href="/team" className="group rounded-2xl active:scale-[0.98] transition-transform duration-100">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 h-full">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: getMemberColor(member.name), ...DOT_PATTERN }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{member.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{member.role}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/team"
              className="group inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[44px]"
            >
              {teamSection.viewAllLabel}
              <svg aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section — extra vertical space lets this closing beat breathe */}
      <section aria-labelledby="cta-heading" className="pt-24 pb-32 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="cta-heading" className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-6">{cta.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto text-lg leading-relaxed">{cta.description}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={cta.primaryButton.href} className="px-10 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 text-base w-full sm:w-auto text-center shadow-lg shadow-blue-500/30">
              {cta.primaryButton.label}
            </Link>
            <Link href={cta.secondaryButton.href} className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 text-base w-full sm:w-auto text-center shadow-md">
              {cta.secondaryButton.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
