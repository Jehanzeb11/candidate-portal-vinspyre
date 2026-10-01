"use client";

import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { UploadCloud, FileCheck2, FileText } from "lucide-react";
import { CandidateFormValues } from "./types";
import { FileUploadInput } from "./FileUploadInput";
import { FormField } from "./FormField";

interface ResumeSectionProps {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  setValue: UseFormSetValue<CandidateFormValues>;
}

const input =
  "w-full bg-[#fff] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#E9327C] focus:ring-4 focus:ring-[#E9327C]/10 outline-none transition-all duration-200";

export function ResumeSection({ register, errors, setValue }: ResumeSectionProps) {
  return (
    <div className="space-y-6">
      <div className="pt-2 pb-2">
        <FileUploadInput
          fieldName="cvFile"
          label="CV / Resume Document"
          required
          accept=".pdf"
          hint="PDF only (Max 5MB)"
          register={register}
          errors={errors}
          setValue={setValue}
        />
      </div>

      {/* Cover Letter */}
      <FormField
        label="Cover Letter"
        htmlFor="coverLetter"
        optional
        icon={<FileText className="w-4 h-4" />}
        error={errors.coverLetter?.message}
        hint="Optional — briefly introduce yourself and why you're a great fit."
      >
        <textarea
          id="coverLetter"
          rows={5}
          placeholder="Write a short cover letter…"
          {...register("coverLetter")}
          className={`${input} resize-y`}
        />
      </FormField>
    </div>
  );
}
