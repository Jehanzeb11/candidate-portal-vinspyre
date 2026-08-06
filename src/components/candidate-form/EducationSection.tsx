"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { GraduationCap, Award } from "lucide-react";
import { CandidateFormValues } from "./types";
import { FormField } from "./FormField";

interface EducationSectionProps {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  register,
  errors,
}) => {
  const inputStyles =
    "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10 shadow-sm outline-none transition-all duration-200";

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#d81b60]" />
          Educational Record
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your highest degree or certificate.
        </p>
      </div>

      <FormField
        label="Degree / Certificate"
        htmlFor="educationHistory.0.degreeTitle"
        required
        icon={<Award className="w-4 h-4" />}
        error={errors.educationHistory?.[0]?.degreeTitle?.message}
      >
        <input
          type="text"
          id="educationHistory.0.degreeTitle"
          placeholder="e.g. BS Computer Science, FSc Pre-Engineering, MBA..."
          {...register("educationHistory.0.degreeTitle", {
            required: "Degree / certificate title is required",
          })}
          className={inputStyles}
        />
      </FormField>
    </div>
  );
};
