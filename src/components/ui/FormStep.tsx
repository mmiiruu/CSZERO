"use client";

import React from "react";

interface FormStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSubmitting?: boolean;
}

export default function FormStep({
  title,
  description,
  children,
  onNext,
  onBack,
  isFirst = false,
  isLast = false,
  isSubmitting = false,
}: FormStepProps) {
  return (
    <div className="space-y-6 motion-safe:animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="text-secondary mt-1">{description}</p>
        )}
      </div>

      <div className="space-y-4">{children}</div>

      <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
        {!isFirst ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-secondary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            ย้อนกลับ
          </button>
        ) : (
          <div />
        )}
        <button
          type={isLast ? "submit" : "button"}
          onClick={onNext}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-full hover:bg-slate-700 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isLast ? "ส่งข้อมูล" : "ถัดไป"}
          {!isLast && !isSubmitting && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
