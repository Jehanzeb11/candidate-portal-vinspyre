"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Briefcase, Building, UserCheck } from "lucide-react";
import { CandidateFormValues } from "./types";
import { FormField } from "./FormField";

interface EmploymentSectionProps {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
}

export const EmploymentSection: React.FC<EmploymentSectionProps> = ({
  register,
  errors,
}) => {
  const inputStyles =
    "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10 shadow-sm outline-none transition-all duration-200";

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#d81b60]" />
          Employment Record
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your most recent work experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Organization Name"
          htmlFor="employmentHistory.0.organizationName"
          required
          icon={<Building className="w-4 h-4" />}
          error={errors.employmentHistory?.[0]?.organizationName?.message}
        >
          <input
            type="text"
            id="employmentHistory.0.organizationName"
            placeholder="e.g. Systems Limited, Arbitesoft"
            {...register("employmentHistory.0.organizationName", {
              required: "Organization name is required",
            })}
            className={inputStyles}
          />
        </FormField>

        <FormField
          label="Position / Designation"
          htmlFor="employmentHistory.0.position"
          required
          icon={<UserCheck className="w-4 h-4" />}
          error={errors.employmentHistory?.[0]?.position?.message}
        >
          <input
            type="text"
            id="employmentHistory.0.position"
            placeholder="e.g. Senior Frontend Developer"
            {...register("employmentHistory.0.position", {
              required: "Position title is required",
            })}
            className={inputStyles}
          />
        </FormField>
      </div>
    </div>
  );
};
