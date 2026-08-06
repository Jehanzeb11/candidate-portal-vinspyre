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
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4 text-slate-400" />
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        <span className="text-[11px] text-slate-400 font-medium">{optional ? "Optional (" + hint + ")" : hint}</span>
      </div>

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-5 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? "border-[#d81b60] bg-rose-50/60 scale-[1.01]"
              : errorObj
              ? "border-rose-400 bg-rose-50/40 hover:border-rose-500"
              : "border-slate-200 bg-[#f8f9fa] hover:border-[#d81b60]/50 hover:bg-slate-50/80 shadow-sm"
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
          <div className="p-3 bg-[#d81b60]/10 text-[#d81b60] rounded-full mb-2.5">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700 mb-0.5">
            <span className="text-[#d81b60] hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-[11px] text-slate-400">Accepted formats: PDF up to 5MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-[#f8f9fa] border border-emerald-300 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1.5">
                {selectedFile.name}
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </p>
              <p className="text-[11px] text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-2 shrink-0"
            title="Remove file"
          >
            <X className="w-4.5 h-4.5" />
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
