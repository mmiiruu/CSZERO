"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { site, navLinks, navbar } from "@/config/site";
import { candidateRegistrationConfig } from "@/config/candidate";

export default function Navbar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, mounted, toggleTheme } = useTheme();
  const isAdmin = session?.user?.role === "admin";
  const canAccessAdmin = isAdmin || session?.user?.role === "staff";
  const visibleLinks = navLinks.filter((link) => {
    if (link.adminOnly && !canAccessAdmin) return false;
    if (link.candidateRegistration && !candidateRegistrationConfig.open && !canAccessAdmin) return false;
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Filled accent — kept literal; see globals.css note */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-sm">{site.shortName}</span>
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">
              {site.name}
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 text-sm text-secondary hover:text-primary rounded-lg hover:bg-primary-subtle transition-all duration-200 min-h-[44px] inline-flex items-center"
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-primary-subtle transition-all duration-200 cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === "dark" ? (
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="ml-2 flex items-center gap-3 border-l border-border pl-3">
              {session ? (
                <>
                  <Link
                    href={navbar.profileLink.href}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {navbar.profileLink.label}
                  </Link>
                  {canAccessAdmin && (
                    /* Pink — intentional role-coded color, not part of the semantic palette */
                    <Link
                      href={navbar.adminLink.href}
                      className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      {navbar.adminLink.label}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 text-sm bg-hover text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 font-medium cursor-pointer"
                  >
                    {navbar.signOut}
                  </button>
                </>
              ) : (
                /* Filled accent — kept literal; see globals.css note */
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
            className="md:hidden p-3 text-secondary hover:text-primary transition-colors cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
          >
            {!mounted ? (
              <div className="w-5 h-5" />
            ) : theme === "dark" ? (
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-secondary hover:text-primary transition-colors cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <svg
              aria-hidden="true"
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
          <div id="mobile-menu" className="md:hidden py-4 border-t border-border-subtle animate-fade-in">
            <div className="flex flex-col gap-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3.5 text-sm text-secondary hover:text-primary rounded-lg hover:bg-primary-subtle transition-colors min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 pt-2 border-t border-border-subtle px-4">
                {session ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href={navbar.profileLink.href}
                      onClick={() => setIsOpen(false)}
                      className="py-3.5 text-sm font-medium text-foreground hover:text-primary transition-colors text-center min-h-[44px] flex items-center justify-center"
                    >
                      {navbar.profileLink.label}
                    </Link>
                    {canAccessAdmin && (
                      /* Pink — intentional role-coded color */
                      <Link
                        href={navbar.adminLink.href}
                        onClick={() => setIsOpen(false)}
                        className="py-3.5 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors text-center min-h-[44px] flex items-center justify-center"
                      >
                        {navbar.adminLink.mobileLabel}
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full py-3 text-sm bg-hover text-foreground rounded-lg font-medium cursor-pointer min-h-[44px]"
                    >
                      {navbar.signOut}
                    </button>
                  </div>
                ) : (
                  /* Filled accent — kept literal */
                  <Link
                    href={navbar.signIn.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full py-3 text-sm bg-blue-600 text-white rounded-lg text-center font-medium min-h-[44px]"
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
