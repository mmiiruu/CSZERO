"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { site, navLinks, navbar } from "@/config/site";

export default function Navbar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, mounted, toggleTheme } = useTheme();
  const isAdmin = session?.user?.role === "admin";
  const visibleLinks = navLinks.filter((link) => !link.adminOnly || isAdmin);


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-sm">{site.shortName}</span>
            </div>
            <span className="text-slate-800 dark:text-white font-bold text-lg tracking-tight">
              {site.name}
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 cursor-pointer"
            >
              {/* Placeholder keeps button size stable before mount; avoids hydration mismatch */}
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="ml-2 flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-3">
              {session ? (
                <>
                  {session?.user?.role === "admin" && (
                    <Link
                      href={navbar.adminLink.href}
                      className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      {navbar.adminLink.label}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium cursor-pointer"
                  >
                    {navbar.signOut}
                  </button>
                </>
              ) : (
                <Link
                  href={navbar.signIn.href}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm shadow-blue-500/20"
                >
                  {navbar.signIn.label}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {!mounted ? (
              <div className="w-5 h-5" />
            ) : theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
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
          <div className="md:hidden py-4 border-t border-slate-100 dark:border-slate-700 animate-fade-in">
            <div className="flex flex-col gap-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 px-4">
                {session ? (
                  <div className="flex flex-col gap-2">
                    {session?.user?.role === "admin" && (
                      <Link
                        href={navbar.adminLink.href}
                        onClick={() => setIsOpen(false)}
                        className="py-3 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors text-center"
                      >
                        {navbar.adminLink.mobileLabel}
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium cursor-pointer"
                    >
                      {navbar.signOut}
                    </button>
                  </div>
                ) : (
                  <Link
                    href={navbar.signIn.href}
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2.5 text-sm bg-blue-600 text-white rounded-lg text-center font-medium"
                  >
                    {navbar.signIn.label}
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
