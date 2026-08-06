"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { UploadCloud, FileCheck2 } from "lucide-react";
import { CandidateFormValues } from "./types";
import { FileUploadInput } from "./FileUploadInput";

interface DropCvSectionProps {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  setValue: UseFormSetValue<CandidateFormValues>;
}

export const DropCvSection: React.FC<DropCvSectionProps> = ({
  register,
  errors,
  setValue,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-[#d81b60]" />
          Drop Your CV
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload your latest resume or CV to kickstart your application.
        </p>
      </div>

      <div className="p-6 bg-[#f8f9fa] border border-slate-200/90 rounded-2xl space-y-6 ">
        <div className="flex items-center space-x-3 text-slate-700">
          <div className="p-2.5 bg-rose-50 text-[#d81b60] rounded-xl shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Upload Resume / CV</h4>
            <p className="text-xs text-slate-500">
              Please attach your document in PDF format only (Max 5MB).
            </p>
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
    </div>
  );
};
