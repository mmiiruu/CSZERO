import Link from "next/link";
import Timeline, { TimelineDay } from "@/components/ui/Timeline";

const schedule: TimelineDay[] = [
  {
    day: "Day 1",
    date: "Introduction to Computer Science",
    items: [
      { time: "09:00", title: "Opening Ceremony & Welcome", type: "talk", description: "Meet the team and fellow participants" },
      { time: "09:30", title: "What is Computer Science?", type: "talk", description: "An overview of CS and its real-world applications" },
      { time: "10:30", title: "Break", type: "break" },
      { time: "10:45", title: "Thinking Like a Programmer", type: "workshop", description: "Logic, patterns, and problem decomposition" },
      { time: "12:00", title: "Lunch Break", type: "break" },
      { time: "13:00", title: "Hands-on: Your First Program", type: "workshop", description: "Write your first lines of code with guidance" },
      { time: "15:00", title: "Break", type: "break" },
      { time: "15:15", title: "Mini Challenge", type: "workshop", description: "Solve beginner-friendly coding puzzles in teams" },
      { time: "16:30", title: "Day 1 Wrap-up & Social", type: "social" },
    ],
  },
  {
    day: "Day 2",
    date: "Building & Problem Solving",
    items: [
      { time: "09:00", title: "Day 1 Recap", type: "talk" },
      { time: "09:30", title: "Data Structures 101", type: "talk", description: "Arrays, lists, and how data is organized" },
      { time: "10:30", title: "Break", type: "break" },
      { time: "10:45", title: "Algorithms & Efficiency", type: "workshop", description: "Sorting, searching, and thinking about speed" },
      { time: "12:00", title: "Lunch Break", type: "break" },
      { time: "13:00", title: "Build Your Own Project", type: "workshop", description: "Apply everything you learned in a guided project" },
      { time: "15:30", title: "Project Presentations", type: "talk", description: "Show off what you built!" },
      { time: "16:30", title: "Closing Ceremony & Certificates", type: "social" },
    ],
  },
];

export default function CS101Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono text-blue-600 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            2-DAY PROGRAM
          </div>

          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-slate-800">
            CS<span className="text-blue-600">101</span>
          </h1>

          <p className="mt-6 text-lg text-slate-500 max-w-2xl leading-relaxed">
            Your gateway into the world of Computer Science. A comprehensive
            2-day program designed for absolute beginners — learn programming
            fundamentals, computational thinking, and build your first project.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/events/cs101/register" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm text-center shadow-sm shadow-blue-500/20">
              Register Now
            </Link>
            <a href="#schedule" className="px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200 text-sm text-center">
              View Schedule
            </a>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-12 text-center">Why CS101?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🧠", title: "Zero to Hero", desc: "No prior experience needed. We start from the very basics." },
              { icon: "🛠️", title: "Hands-On Learning", desc: "80% practice, 20% theory. Build real things from day one." },
              { icon: "👥", title: "Community", desc: "Join a supportive group of learners and experienced mentors." },
              { icon: "🏆", title: "Certificate", desc: "Earn a certificate of completion after the program." },
              { icon: "💡", title: "Problem Solving", desc: "Develop computational thinking skills that apply everywhere." },
              { icon: "🚀", title: "Kickstart Your Journey", desc: "Get the foundation to continue learning CS on your own." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-slate-800 font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-3">agenda</p>
            <h2 className="text-3xl font-bold text-slate-800">Schedule</h2>
          </div>
          <Timeline days={schedule} accentColor="#2563eb" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Ready to start your CS journey?</h2>
          <p className="text-slate-500 mb-8">Limited spots available. Register now to secure your place.</p>
          <Link href="/events/cs101/register" className="inline-flex px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-sm shadow-sm shadow-blue-500/20">
            Register for CS101
          </Link>
        </div>
      </section>
    </div>
  );
}
