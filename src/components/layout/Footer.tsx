import React from "react";
import Link from "next/link";
import { site, navLinks, footer } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{site.shortName}</span>
              </div>
              <span className="text-slate-800 dark:text-white font-bold text-lg">{site.name}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md">
              {site.description}
            </p>
          </div>

          <div>
            <h4 className="text-slate-800 dark:text-white font-semibold text-sm mb-4">{footer.quickLinksHeading}</h4>
            <div className="flex flex-col gap-2">
              {navLinks.filter((link) => !link.adminOnly).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="min-h-[44px] flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-slate-800 dark:text-white font-semibold text-sm mb-4">{footer.connectHeading}</h4>
            <div className="flex flex-col gap-2">
              {footer.socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="min-h-[44px] flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  {link.label}
                  {link.external && (
                    <span className="sr-only"> (เปิดในแท็บใหม่)</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-10 pt-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
