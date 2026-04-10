"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  labels,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < currentStep
                    ? "bg-blue-600 text-white"
                    : i === currentStep
                    ? "bg-blue-100 text-blue-600 border-2 border-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500"
                    : "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                }`}
              >
                {i < currentStep ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {labels && labels[i] && (
                <span
                  className={`text-xs mt-1.5 text-center max-w-[80px] leading-tight hidden sm:block ${
                    i <= currentStep
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {labels[i]}
                </span>
              )}
            </div>
            {i < totalSteps - 1 && (
              <div className="flex-1 mx-2">
                <div className="h-[2px] bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-blue-600 transition-all duration-500 ${
                      i < currentStep ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {labels && labels[currentStep] && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4 sm:hidden">
          Step {currentStep + 1}: {labels[currentStep]}
        </p>
      )}
    </div>
  );
}
