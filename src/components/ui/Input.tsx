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

interface SelectFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  as: "select";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  id?: string;
}

type Props = InputProps | TextareaProps | SelectFieldProps;

export default function Input(props: Props) {
  const { label, error, helperText } = props;
  const reactId = React.useId();

  const baseStyles =
    "w-full bg-card border rounded-xl px-4 py-3 text-foreground placeholder:text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
  const errorStyles = error
    ? "border-red-300 dark:border-red-700 focus:ring-red-500/30 focus:border-red-500"
    : "border-border hover:border-slate-300 dark:hover:border-slate-500";

  if ("as" in props && props.as === "textarea") {
    const { label: _l, error: _e, helperText: _h, as: _a, className = "", id: passedId, ...rest } =
      props as TextareaProps;
    const inputId = passedId || reactId;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={`${baseStyles} ${errorStyles} min-h-[100px] resize-y ${className}`}
          {...rest}
        />
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-muted">{helperText}</p>
        )}
      </div>
    );
  }

  if ("as" in props && props.as === "select") {
    const { label: _l, error: _e, helperText: _h, as: _a, options, value, onChange, className = "", id: passedId } = props as SelectFieldProps;
    const inputId = passedId || reactId;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <Select
          id={inputId}
          value={value}
          onChange={onChange}
          options={options}
          error={!!error}
          className={className}
        />
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-muted">{helperText}</p>
        )}
      </div>
    );
  }

  const { label: _l, error: _e, helperText: _h, className = "", id: passedId, ...rest } =
    props as InputProps;
  const inputId = passedId || reactId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...rest}
      />
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-400 dark:text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
