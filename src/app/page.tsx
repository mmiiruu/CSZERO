import Link from "next/link";
import { homePage } from "@/config/site";
import { cs101Config } from "@/config/events/cs101";
import { helloWorldConfig } from "@/config/events/hello-world";

const { hero, eventsSection, teamSection, cta } = homePage;
const cs101Card = cs101Config.homeCard;
const hwCard = helloWorldConfig.homeCard;

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 grid-pattern">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-100/40 dark:bg-blue-800/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full text-sm text-blue-600 dark:text-blue-400 mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow" />
            {hero.badge}
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="gradient-text">{hero.title}</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
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
              className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm shadow-blue-500/20"
            >
              {hero.primaryButton.label}
            </Link>
            <Link
              href={hero.secondaryButton.href}
              className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm"
            >
              {hero.secondaryButton.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{eventsSection.eyebrow}</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white">{eventsSection.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href={cs101Card.href} className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 h-full hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 dark:bg-blue-800/30 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full text-xs font-mono text-blue-600 dark:text-blue-400 mb-4">{cs101Card.badge}</div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">{cs101Card.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{cs101Card.shortDescription}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span>{eventsSection.learnMoreLabel}</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={hwCard.href} className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 h-full hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 dark:bg-purple-800/30 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800 rounded-full text-xs font-mono text-purple-600 dark:text-purple-400 mb-4">{hwCard.badge}</div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">{hwCard.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{hwCard.shortDescription}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <span>{eventsSection.learnMoreLabel}</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">{teamSection.eyebrow}</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white">{teamSection.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-lg mx-auto">{teamSection.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamSection.preview.map((member, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{member.name}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/team" className="inline-flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {teamSection.viewAllLabel}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">{cta.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">{cta.description}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={cta.primaryButton.href} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm shadow-blue-500/20">
              {cta.primaryButton.label}
            </Link>
            <Link href={cta.secondaryButton.href} className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm">
              {cta.secondaryButton.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
