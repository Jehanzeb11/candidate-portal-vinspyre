import React from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  optional,
  error,
  hint,
  children,
  icon,
}) => {
  return (
    <div className="space-y-1.5 flex flex-col">
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
        >
          {icon && <span className="text-slate-400">{icon}</span>}
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
        </label>
        {optional && (
          <span className="text-[11px] font-medium text-slate-400 capitalize">
            Optional
          </span>
        )}
      </div>

      <div className="relative rounded-xl">{children}</div>

      {hint && !error && (
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 fill-current shrink-0"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
