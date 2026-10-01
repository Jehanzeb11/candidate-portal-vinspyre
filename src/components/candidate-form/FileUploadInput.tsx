"use client";

import React, { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { UploadCloud, FileText, X, CheckCircle } from "lucide-react";
import { CandidateFormValues } from "./types";

interface FileUploadInputProps {
  fieldName: "cvFile";
  label: string;
  required?: boolean;
  optional?: boolean;
  accept?: string;
  hint?: string;
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  setValue: (name: "cvFile", value: FileList | null, options?: any) => void;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  fieldName,
  label,
  required = false,
  optional = false,
  accept = ".pdf",
  hint = "PDF only (Max 5MB)",
  register,
  errors,
  setValue,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const errorObj = errors[fieldName];

  const isPdfFile = (file: File) =>
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  const setValidFile = (file: File | null) => {
    if (!file || !isPdfFile(file)) {
      setSelectedFile(null);
      setValue(fieldName, null, { shouldValidate: true, shouldDirty: true });
      return;
    }

    setSelectedFile(file);
    const fileList = new DataTransfer();
    fileList.items.add(file);
    setValue(fieldName, fileList.files, { shouldValidate: true, shouldDirty: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setValidFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setValidFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    setValue(fieldName, null, { shouldValidate: true, shouldDirty: true });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-1.5 w-full">
      {/* Label intentionally removed for the exact visual match in the new step 3 design */}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[24px] py-14 px-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? "border-[#E9327C] bg-rose-50/60 scale-[1.01]"
              : errorObj
              ? "border-rose-400 bg-rose-50/40 hover:border-rose-500"
              : "border-indigo-200/60 bg-[#FAFAFC] hover:border-[#E9327C]/50 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <input
            type="file"
            accept={accept}
            id={fieldName}
            {...register(fieldName, {
              required: required ? `Please upload your ${label}` : false,
              validate: (files) => {
                if (!files || files.length === 0) {
                  return required ? `Please upload your ${label}` : true;
                }

                return isPdfFile(files[0]) || "Only PDF files are allowed";
              },
              onChange: handleFileChange,
            })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          <div className="w-14 h-14 bg-[#FCE7F3] rounded-2xl flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-[#E9327C]" />
          </div>
          
          <h4 className="text-lg font-bold text-slate-900 mb-1">Upload Resume</h4>
          <p className="text-sm text-slate-600 mb-4">
            Drag &amp; drop your PDF here <br className="sm:hidden" />
            or <span className="text-[#E9327C] font-bold underline decoration-[#E9327C]/30 underline-offset-4 hover:decoration-[#E9327C]">browse files</span>
          </p>
          <p className="text-xs text-slate-400">PDF only &middot; Maximum 5MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-[#FAFAFC] border border-[#7fdcb5] rounded-[16px] shadow-sm">
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full shrink-0">
              PDF
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors ml-2 shrink-0"
          >
            Remove
          </button>
        </div>
      )}

      {errorObj && (
        <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errorObj.message as string}
        </p>
      )}
    </div>
  );
};
