"use client";

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import { CandidateFormValues, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from "./types";
import { FormField } from "./FormField";

interface PersonalSectionProps {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  watch: UseFormWatch<CandidateFormValues>;
  setValue: UseFormSetValue<CandidateFormValues>;
}

const input =
  "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10 outline-none transition-all duration-200";

const select =
  "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10 outline-none transition-all duration-200 appearance-none";

export function PersonalSection({ register, errors }: PersonalSectionProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#d81b60]" />
          Personal Information
        </h3>
        <p className="text-xs text-slate-500 mt-1">Your basic contact and personal details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <FormField label="Full Name" htmlFor="fullName" required icon={<User className="w-4 h-4" />} error={errors.fullName?.message}>
          <input
            id="fullName"
            type="text"
            placeholder="e.g. Muhammad Ali"
            {...register("fullName", {
              required: "Full name is required",
              minLength: { value: 2, message: "At least 2 characters required" },
            })}
            className={input}
          />
        </FormField>

        {/* Email */}
        <FormField label="Email" htmlFor="email" required icon={<Mail className="w-4 h-4" />} error={errors.email?.message}>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email format" },
            })}
            className={input}
          />
        </FormField>

        {/* Phone */}
        <FormField label="Phone Number" htmlFor="phone" required icon={<Phone className="w-4 h-4" />} error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            placeholder="+92 300 1234567"
            {...register("phone", { required: "Phone number is required" })}
            className={input}
          />
        </FormField>

        {/* Address */}
        <FormField label="Address" htmlFor="address" required icon={<MapPin className="w-4 h-4" />} error={errors.address?.message}>
          <input
            id="address"
            type="text"
            placeholder="e.g. Lahore, Pakistan"
            {...register("address", { required: "Address is required" })}
            className={input}
          />
        </FormField>

        {/* Age */}
        <FormField label="Age" htmlFor="age" required icon={<Calendar className="w-4 h-4" />} error={errors.age?.message}>
          <input
            id="age"
            type="number"
            min={16}
            max={80}
            placeholder="e.g. 25"
            {...register("age", {
              required: "Age is required",
              min: { value: 16, message: "Minimum age is 16" },
              max: { value: 80, message: "Maximum age is 80" },
            })}
            className={input}
          />
        </FormField>

        {/* Gender */}
        <FormField label="Gender" htmlFor="gender" required icon={<User className="w-4 h-4" />} error={errors.gender?.message}>
          <select
            id="gender"
            {...register("gender", { required: "Please select your gender" })}
            className={select}
          >
            <option value="">Select gender…</option>
            {GENDER_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </FormField>

        {/* Marital Status */}
        <FormField label="Marital Status" htmlFor="maritalStatus" required error={errors.maritalStatus?.message}>
          <select
            id="maritalStatus"
            {...register("maritalStatus", { required: "Please select your marital status" })}
            className={select}
          >
            <option value="">Select marital status…</option>
            {MARITAL_STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </FormField>

        {/* LinkedIn */}
        <FormField label="LinkedIn URL" htmlFor="linkedInUrl" required icon={<LinkIcon className="w-4 h-4" />} error={errors.linkedInUrl?.message}>
          <input
            id="linkedInUrl"
            type="url"
            placeholder="https://linkedin.com/in/username"
            {...register("linkedInUrl", { required: "LinkedIn URL is required" })}
            className={input}
          />
        </FormField>

        {/* Portfolio */}
        <FormField label="Portfolio" htmlFor="portfolioUrl" optional icon={<Globe className="w-4 h-4" />} error={errors.portfolioUrl?.message}>
          <input
            id="portfolioUrl"
            type="url"
            placeholder="https://myportfolio.com"
            {...register("portfolioUrl")}
            className={input}
          />
        </FormField>
      </div>
    </div>
  );
}
