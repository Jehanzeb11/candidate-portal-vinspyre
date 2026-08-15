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
  "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10 outline-none transition-all duration-200";

export function ResumeSection({ register, errors, setValue }: ResumeSectionProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-[#d81b60]" />
          Resume / CV
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload your latest resume in PDF format.
        </p>
      </div>

      <div className="p-6 bg-[#f8f9fa] border border-slate-200/90 rounded-2xl space-y-6">
        <div className="flex items-center space-x-3 text-slate-700">
          <div className="p-2.5 bg-rose-50 text-[#d81b60] rounded-xl shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Upload Resume / CV</h4>
            <p className="text-xs text-slate-500">PDF format only · Max 5 MB</p>
          </div>
        </div>

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
