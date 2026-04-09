"use client";

import React from "react";
import Select from "@/components/ui/Select";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  as: "textarea";
}

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  as: "select";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

type Props = InputProps | TextareaProps | SelectProps;

export default function Input(props: Props) {
  const { label, error, helperText } = props;

  const baseStyles =
    "w-full bg-white border rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";
  const errorStyles = error
    ? "border-red-300 focus:ring-red-500/30 focus:border-red-500"
    : "border-slate-200 hover:border-slate-300";

  if ("as" in props && props.as === "textarea") {
    const { label: _l, error: _e, helperText: _h, as: _a, className = "", ...rest } =
      props as TextareaProps;
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          className={`${baseStyles} ${errorStyles} min-h-[100px] resize-y ${className}`}
          {...rest}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }

  if ("as" in props && props.as === "select") {
    const { label: _l, error: _e, helperText: _h, as: _a, options, value, onChange, className = "" } = props as SelectProps;
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <Select
          value={value}
          onChange={onChange}
          options={options}
          error={!!error}
          className={className}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }

  const { label: _l, error: _e, helperText: _h, className = "", ...rest } =
    props as InputProps;
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...rest}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
