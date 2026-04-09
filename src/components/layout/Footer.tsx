import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="text-slate-800 font-bold text-lg">CSKU</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              Computer Science Student Organization at Kasetsart University.
              Building community, sharing knowledge, and creating opportunities
              for CS students.
            </p>
          </div>

          <div>
            <h4 className="text-slate-800 font-semibold text-sm mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/events/cs101" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">CS101</Link>
              <Link href="/events/hello-world" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Hello World</Link>
              <Link href="/team" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Team</Link>
              <Link href="/vote" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Vote</Link>
            </div>
          </div>

          <div>
            <h4 className="text-slate-800 font-semibold text-sm mb-4">Connect</h4>
            <div className="flex flex-col gap-2">
              <a href="https://github.com/csku" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">GitHub</a>
              <a href="https://instagram.com/csku" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Instagram</a>
              <a href="mailto:contact@csku.org" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">contact@csku.org</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-6">
          <p className="text-slate-400 text-sm text-center">
            © {new Date().getFullYear()} CSKU. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
