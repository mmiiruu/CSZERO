import Link from "next/link";
import Timeline, { TimelineDay } from "@/components/ui/Timeline";

const schedule: TimelineDay[] = [
  {
    day: "Event Day",
    date: "Hello World — Welcome to CS!",
    items: [
      { time: "08:30", title: "Check-in & Welcome", type: "social", description: "Get your badge and meet people" },
      { time: "09:00", title: "Opening Ceremony", type: "talk" },
      { time: "09:30", title: "House Sorting Ceremony", type: "social", description: "Find your house: ♠ ♥ ♦ ♣" },
      { time: "10:00", title: "Ice Breakers & Team Games", type: "social" },
      { time: "11:00", title: "CS Lightning Talks", type: "talk" },
      { time: "12:00", title: "Lunch & Networking", type: "break" },
      { time: "13:00", title: "Workshop: Build Your First App", type: "workshop", description: "Guided hands-on session" },
      { time: "15:00", title: "House Competition", type: "workshop", description: "Compete for your house!" },
      { time: "16:00", title: "Awards & Closing", type: "social" },
    ],
  },
];

const houses = [
  { name: "Spade", symbol: "♠", color: "from-slate-500 to-slate-700", bg: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600", desc: "Strategic & Analytical" },
  { name: "Heart", symbol: "♥", color: "from-red-400 to-pink-500", bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800", desc: "Passionate & Creative" },
  { name: "Diamond", symbol: "♦", color: "from-blue-400 to-cyan-500", bg: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800", desc: "Brilliant & Innovative" },
  { name: "Club", symbol: "♣", color: "from-green-400 to-emerald-500", bg: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800", desc: "Collaborative & Resilient" },
];

export default function HelloWorldPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-200/20 dark:bg-cyan-900/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-full text-sm text-purple-600 dark:text-purple-400 mb-8">✨ 1-DAY EVENT</div>
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">Hello</span>
            <br /><span className="text-slate-800 dark:text-white">World</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Your first day in the CS community! Get sorted into a house, meet amazing people, play games, and discover what Computer Science is all about.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events/hello-world/register" className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm text-center w-full sm:w-auto shadow-lg shadow-purple-500/20">Register Now 🎉</Link>
            <Link href="/events/hello-world/reveal" className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:shadow-md dark:hover:bg-slate-700 transition-all text-sm text-center w-full sm:w-auto">Reveal Your House 🎴</Link>
          </div>
        </div>
      </section>

      {/* Houses */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-3">four houses</p>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">Which house will you join?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {houses.map((house) => (
              <div key={house.name} className={`relative overflow-hidden ${house.bg} border rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 group`}>
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-pink-500 dark:text-pink-400 uppercase tracking-widest mb-3">schedule</p>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">Event Timeline</h2>
          </div>
          <Timeline days={schedule} accentColor="#a855f7" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Don&apos;t miss out! 🎉</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Spots are limited. Register now and find out which house you belong to.</p>
          <Link href="/events/hello-world/register" className="inline-flex px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm shadow-lg shadow-purple-500/20">Register for Hello World</Link>
        </div>
      </section>
    </div>
  );
}
