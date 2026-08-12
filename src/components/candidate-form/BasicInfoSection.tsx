"use client";

import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Banknote,
  Globe,
  Link as LinkIcon,
  Users,
  Clock,
  Clock3,
  Building,
} from "lucide-react";
import {
  CandidateFormValues,
} from "./types";
import { FormField } from "./FormField";

interface BasicInfoSectionProps {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  watch: UseFormWatch<CandidateFormValues>;
  jobTitle?: string;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  register,
  errors,
  watch,
  jobTitle,
}) => {
const hasReference = watch("hasReference");

console.log("hasReference:", hasReference);

const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    setIsReadOnly(!!jobTitle);
  }, [jobTitle]);

  const inputStyles =
    "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10  outline-none transition-all duration-200";

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#d81b60]" />
          Basic Information
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Please fill out your personal information, contact details, and salary expectations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Position Applied For */}
        <FormField
          label="Position Applied For"
          htmlFor="positionAppliedFor"
          required
          icon={<Briefcase className="w-4 h-4" />}
          error={errors.positionAppliedFor?.message}
        >
          <input
            type="text"
            id="positionAppliedFor"
            placeholder="e.g. Frontend Developer (React / Next.js)"
            {...register("positionAppliedFor", {
              required: "Position applied for is required",
            })}
            readOnly={isReadOnly}
            className={`${inputStyles} ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          />
        </FormField>

        {/* Years of Experience (Text Input) */}
        <FormField
          label="Years of Experience"
          htmlFor="yearsOfExperience"
          required
          icon={<Clock className="w-4 h-4" />}
          error={errors.yearsOfExperience?.message}
        >
          <input
            type="text"
            id="yearsOfExperience"
            placeholder="e.g. 3 Years, Fresh, 5+ Years"
            {...register("yearsOfExperience", {
              required: "Years of experience is required",
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Full Name */}
        <FormField
          label="Full Name"
          htmlFor="fullName"
          required
          icon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
        >
          <input
            type="text"
            id="fullName"
            placeholder="e.g. Muhammad Ali"
            {...register("fullName", {
              required: "Full name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Email Address */}
        <FormField
          label="Email Address"
          htmlFor="email"
          required
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
        >
          <input
            type="email"
            id="email"
            placeholder="name@example.com"
            {...register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address format",
              },
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Phone Number */}
        <FormField
          label="Phone Number"
          htmlFor="phone"
          required
          icon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
        >
          <input
            type="tel"
            id="phone"
            placeholder="+92 300 1234567"
            {...register("phone", {
              required: "Phone number is required",
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Notice Period (Text Input) */}
        <FormField
          label="Notice Period"
          htmlFor="noticePeriod"
          required
          icon={<Clock3 className="w-4 h-4" />}
          error={errors.noticePeriod?.message}
        >
          <input
            type="text"
            id="noticePeriod"
            placeholder="e.g. Immediate, 1 Month, 2 Months"
            {...register("noticePeriod", {
              required: "Notice period is required",
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Earliest Available Joining Date */}
        <FormField
          label="Earliest Available Joining Date"
          htmlFor="joiningDate"
          required
          icon={<Calendar className="w-4 h-4" />}
          error={errors.joiningDate?.message}
        >
          <input
            type="date"
            id="joiningDate"
            {...register("joiningDate", {
              required: "Joining date is required",
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Current Salary (PKR) */}
        <FormField
          label="Current Salary (PKR)"
          htmlFor="currentSalary"
          required
          icon={<Banknote className="w-4 h-4" />}
          error={errors.currentSalary?.message}
        >
          <input
            type="number"
            id="currentSalary"
            placeholder="e.g. 150,000"
            {...register("currentSalary", {
              required: "Current salary is required",
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Expected Monthly Salary (PKR) */}
        <FormField
          label="Expected Monthly Salary (PKR)"
          htmlFor="expectedSalary"
          required
          icon={<Banknote className="w-4 h-4" />}
          error={errors.expectedSalary?.message}
        >
          <input
            type="number"
            id="expectedSalary"
            placeholder="e.g. 200,000"
            {...register("expectedSalary", {
              required: "Expected salary is required",
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Reason for Leaving Your Last Job */}
        <div className="md:col-span-2">
          <FormField
            label="Reason for Leaving Your Last Job"
            htmlFor="reasonForLeaving"
            required
            icon={<Building className="w-4 h-4" />}
            error={errors.reasonForLeaving?.message}
          >
            <textarea
              id="reasonForLeaving"
              rows={3}
              placeholder="Briefly state your reason for seeking a new opportunity..."
              {...register("reasonForLeaving", {
                required: "Reason for leaving is required",
              })}
              className={`${inputStyles} resize-y`}
            />
          </FormField>
        </div>

        {/* Comfortable working evening shift? */}
        <div className="md:col-span-2 bg-[#f8f9fa] p-4.5 rounded-xl border border-slate-200/90 shadow-sm">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
            Are you comfortable working the evening shift (7:00 PM – 4:00 AM)?{" "}
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="radio"
                value="yes"
                {...register("comfortableEveningShift", {
                  required: "Please select your availability for evening shift",
                })}
                className="w-4 h-4 text-[#d81b60] bg-white border-slate-300 focus:ring-[#d81b60] focus:ring-2 accent-[#d81b60]"
              />
              <span>Yes, I am comfortable</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="radio"
                value="no"
                {...register("comfortableEveningShift", {
                  required: "Please select your availability for evening shift",
                })}
                className="w-4 h-4 text-[#d81b60] bg-white border-slate-300 focus:ring-[#d81b60] focus:ring-2 accent-[#d81b60]"
              />
              <span>No</span>
            </label>
          </div>
          {errors.comfortableEveningShift && (
            <p className="text-xs text-rose-500 font-medium mt-1">
              {errors.comfortableEveningShift.message}
            </p>
          )}
        </div>

        {/* Portfolio Link */}
        <FormField
          label="Portfolio Link"
          htmlFor="portfolioUrl"
          optional
          icon={<Globe className="w-4 h-4" />}
          error={errors.portfolioUrl?.message}
        >
          <input
            type="url"
            id="portfolioUrl"
            placeholder="https://myportfolio.com"
            {...register("portfolioUrl")}
            className={inputStyles}
          />
        </FormField>

        {/* LinkedIn Profile */}
        <FormField
          label="LinkedIn Profile"
          htmlFor="linkedInUrl"
          required
          icon={<LinkIcon className="w-4 h-4" />}
          error={errors.linkedInUrl?.message}
        >
          <input
            type="url"
            id="linkedInUrl"
            placeholder="https://linkedin.com/in/username"
            {...register("linkedInUrl", {
              required: "LinkedIn profile link is required",
            })}
            className={inputStyles}
          />
        </FormField>

        {/* Have you worked with us before? */}
        <div className="md:col-span-2 bg-[#f8f9fa] p-4.5 rounded-xl border border-slate-200/90 shadow-sm">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
            Have you worked with us before? <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="radio"
                value="yes"
                {...register("workedWithUsBefore", {
                  required: "Please select an option",
                })}
                className="w-4 h-4 text-[#d81b60] bg-white border-slate-300 focus:ring-[#d81b60] focus:ring-2 accent-[#d81b60]"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="radio"
                value="no"
                {...register("workedWithUsBefore", {
                  required: "Please select an option",
                })}
                className="w-4 h-4 text-[#d81b60] bg-white border-slate-300 focus:ring-[#d81b60] focus:ring-2 accent-[#d81b60]"
              />
              <span>No</span>
            </label>
          </div>
          {errors.workedWithUsBefore && (
            <p className="text-xs text-rose-500 font-medium mt-1">
              {errors.workedWithUsBefore.message}
            </p>
          )}
        </div>

        {/* Any Reference */}
{/* Any Reference */}
<div className="md:col-span-2 bg-[#f8f9fa] p-4.5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
  <div>
    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
      Do you have any reference?{" "}
      <span className="text-rose-500 font-bold">*</span>
    </label>

    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

      {/* YES */}
      <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-slate-700">
        <input
          type="radio"
          value="yes"
          {...register("hasReference", {
            required: "Please select an option",
          })}
          className="w-4 h-4 text-[#d81b60] bg-white border-slate-300 focus:ring-[#d81b60] focus:ring-2 accent-[#d81b60]"
        />
        <span>Yes</span>
      </label>

      {/* NO */}
      <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-slate-700">
        <input
          type="radio"
          value="no"
          {...register("hasReference", {
            required: "Please select an option",
          })}
          className="w-4 h-4 text-[#d81b60] bg-white border-slate-300 focus:ring-[#d81b60] focus:ring-2 accent-[#d81b60]"
        />
        <span>No</span>
      </label>

    </div>

    {errors.hasReference && (
      <p className="text-xs text-rose-500 font-medium mt-1">
        {errors.hasReference.message}
      </p>
    )}
  </div>

  {/* Reference Details */}
  {hasReference === "yes" && (
    <div className="space-y-4 pt-2 border-t border-slate-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FormField
          label="Reference Name"
          htmlFor="referenceName"
          required
          icon={<Users className="w-4 h-4" />}
          error={errors.referenceName?.message}
        >
          <input
            type="text"
            id="referenceName"
            placeholder="e.g. John Doe"
            {...register("referenceName", {
              required: "Reference name is required",
            })}
            className={inputStyles}
          />
        </FormField>

        <FormField
          label="Reference Relationship"
          htmlFor="referenceRelationship"
          required
          icon={<Users className="w-4 h-4" />}
          error={errors.referenceRelationship?.message}
        >
          <input
            type="text"
            id="referenceRelationship"
            placeholder="e.g. Former Manager"
            {...register("referenceRelationship", {
              required: "Reference relationship is required",
            })}
            className={inputStyles}
          />
        </FormField>

      </div>
    </div>
  )}
</div>

        {/* Cover Letter (Textarea - Optional) */}
        <div className="md:col-span-2">
          <FormField
            label="Cover Letter"
            htmlFor="coverLetter"
            optional
            error={errors.coverLetter?.message}
          >
            <textarea
              id="coverLetter"
              rows={4}
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              {...register("coverLetter")}
              className={`${inputStyles} resize-y`}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};
