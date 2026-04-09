"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Navbar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/events/cs101", label: "CS101" },
    { href: "/events/hello-world", label: "Hello World" },
    { href: "/team", label: "Team" },
    { href: "/vote", label: "Vote" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="text-slate-800 font-bold text-lg tracking-tight">
              CSKU
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-3">
              {session ? (
                <>
                  {session?.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm shadow-blue-500/20"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 pt-2 border-t border-slate-100 px-4">
                {session ? (
                  <div className="flex flex-col gap-2">
                    {session?.user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="py-3 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors text-center"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full py-2.5 text-sm bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2.5 text-sm bg-blue-600 text-white rounded-lg text-center font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
