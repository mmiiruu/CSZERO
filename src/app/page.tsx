import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 grid-pattern">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-600 mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow" />
            Now accepting registrations
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="gradient-text">CSKU</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Computer Science Student Organization at Kasetsart University.
            <br className="hidden sm:block" />
            Building community. Sharing knowledge. Creating opportunities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events/cs101"
              className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm shadow-blue-500/20"
            >
              Explore CS101
            </Link>
            <Link
              href="/events/hello-world"
              className="px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 hover:border-blue-200 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm"
            >
              Hello World Event
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <p className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-3">upcoming</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800">Events</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/events/cs101" className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-2xl p-8 h-full hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-blue-100 rounded-full text-xs font-mono text-blue-600 mb-4">2-DAY PROGRAM</div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-3">CS101</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    A comprehensive 2-day workshop designed for beginners. Learn programming fundamentals, problem-solving, and computational thinking.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/events/hello-world" className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border border-slate-200 rounded-2xl p-8 h-full hover:shadow-lg hover:border-purple-200 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-xs font-mono text-purple-600 mb-4">1-DAY EVENT</div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-3">Hello World</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    A fun, colorful welcome event for all new students. Get sorted into houses, meet your peers, and kickstart your CS journey!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-purple-600 transition-colors">
                    <span>Learn more</span>
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
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-3">the people</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800">Our Team</h2>
            <p className="text-slate-500 mt-4 max-w-lg mx-auto">Passionate students building the CS community at KU.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Alex Chen", role: "President" },
              { name: "Sari W.", role: "Vice President" },
              { name: "Mike T.", role: "Tech Lead" },
              { name: "Ploy K.", role: "Events Lead" },
            ].map((member, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-slate-800 font-semibold text-sm">{member.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/team" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors">
              View all members
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Ready to join?</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Whether you&apos;re a beginner or experienced, there&apos;s a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events/cs101/register" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm shadow-blue-500/20">
              Register for CS101
            </Link>
            <Link href="/events/hello-world/register" className="px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200 text-sm w-full sm:w-auto text-center shadow-sm">
              Join Hello World
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
