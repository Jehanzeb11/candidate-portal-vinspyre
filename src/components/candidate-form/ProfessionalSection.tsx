"use client";

import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import {
  Briefcase,
  Banknote,
  Calendar,
  Clock,
  Building,
  UserCheck,
  Users,
  Megaphone,
  GraduationCap,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  CandidateFormValues,
  EDUCATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  JOB_SEEKING_OPTIONS,
  NOTICE_PERIOD_OPTIONS,
  HOW_DID_YOU_HEAR_OPTIONS,
} from "./types";
import { FormField } from "./FormField";

interface ProfessionalSectionProps {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  watch: UseFormWatch<CandidateFormValues>;
  isFresher: boolean;
  hideNotice: boolean;
  hasReference: "yes" | "no" | "";
  jobTitle?: string;
  validTill?: string;
}

const input =
  "w-full bg-[#fff] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#E9327C] focus:ring-4 focus:ring-[#E9327C]/10 outline-none transition-all duration-200";

const select =
  "w-full bg-[#fff] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:bg-white focus:ring-0 outline-none transition-all duration-200 appearance-none";

export function ProfessionalSection({
  register,
  errors,
  isFresher,
  hideNotice,
  hasReference,
  jobTitle,
  validTill,
}: ProfessionalSectionProps) {
  const positionReadOnly = Boolean(jobTitle);

  // Today as YYYY-MM-DD for the min constraint
  const today = new Date().toISOString().split("T")[0];

  // validTill from the API is an ISO string — extract just the date part for max
  const maxDate = validTill ? validTill.split("T")[0] : undefined;

  return (
    <div className="space-y-6">

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
            id="positionAppliedFor"
            type="text"
            placeholder="e.g. Senior Backend Engineer"
            {...register("positionAppliedFor", { required: "Position is required" })}
            readOnly={positionReadOnly}
            className={`${input} ${positionReadOnly ? "cursor-not-allowed" : ""}`}
          />
        </FormField>

        {/* Highest Education */}
        <FormField
          label="Highest Level of Education"
          htmlFor="highestEducation"
          required
          icon={<GraduationCap className="w-4 h-4" />}
          error={errors.highestEducation?.message}
        >
          <select
            id="highestEducation"
            {...register("highestEducation", { required: "Education level is required" })}
            className={select}
          >
            <option value="">Select education level…</option>
            {EDUCATION_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </FormField>

        {/* Years of Experience */}
        <FormField
          label="Experience in Years"
          htmlFor="yearsOfExperience"
          required
          icon={<Clock className="w-4 h-4" />}
          error={errors.yearsOfExperience?.message}
        >
          <select
            id="yearsOfExperience"
            {...register("yearsOfExperience", { required: "Experience is required" })}
            className={select}
          >
            <option value="">Select experience…</option>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </FormField>

        {/* Expected Salary — always shown */}
        <FormField
          label="Salary Expectations (PKR)"
          htmlFor="expectedSalary"
          required
          icon={<Banknote className="w-4 h-4" />}
          error={errors.expectedSalary?.message}
        >
          <input
            id="expectedSalary"
            type="number"
            placeholder="e.g. 200000"
            {...register("expectedSalary", { required: "Expected salary is required" })}
            className={input}
          />
        </FormField>

        {/* ── Non-fresher fields ───────────────────────────────────────── */}

        {!isFresher && (
          <>
            {/* Current Salary */}
            <FormField
              label="Current Salary (PKR)"
              htmlFor="currentSalary"
              required
              icon={<Banknote className="w-4 h-4" />}
              error={errors.currentSalary?.message}
            >
              <input
                id="currentSalary"
                type="number"
                placeholder="e.g. 150000"
                {...register("currentSalary", { required: "Current salary is required" })}
                className={input}
              />
            </FormField>

            {/* Current Employment Status */}
            <FormField
              label="Current Employment Status"
              htmlFor="currentEmploymentStatus"
              required
              icon={<TrendingUp className="w-4 h-4" />}
              error={errors.currentEmploymentStatus?.message}
            >
              <select
                id="currentEmploymentStatus"
                {...register("currentEmploymentStatus", {
                  required: "Employment status is required",
                })}
                className={select}
              >
                <option value="">Select status…</option>
                {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </FormField>

            {/* Job Seeking Status */}
            <div className="md:col-span-2">
              <FormField
                label="Job Seeking Status"
                htmlFor="jobSeekingStatus"
                required
                icon={<Search className="w-4 h-4" />}
                error={errors.jobSeekingStatus?.message}
              >
                <select
                  id="jobSeekingStatus"
                  {...register("jobSeekingStatus", { required: "Job seeking status is required" })}
                  className={select}
                >
                  <option value="">Select status…</option>
                  {JOB_SEEKING_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Reason for Leaving */}
            <div className="md:col-span-2">
              <FormField
                label="Reason for Leaving Current Role"
                htmlFor="reasonForLeaving"
                required
                icon={<Building className="w-4 h-4" />}
                error={errors.reasonForLeaving?.message}
              >
                <textarea
                  id="reasonForLeaving"
                  rows={3}
                  placeholder="Briefly describe your reason for seeking a new opportunity…"
                  {...register("reasonForLeaving", { required: "Reason for leaving is required" })}
                  className={`${input} resize-y`}
                />
              </FormField>
            </div>

            {/* Notice Period — hidden when Unemployed / On a career break */}
            {!hideNotice && (
              <FormField
                label="Notice Period (If Applicable)"
                htmlFor="noticePeriod"
                required
                icon={<Clock className="w-4 h-4" />}
                error={errors.noticePeriod?.message}
              >
                <select
                  id="noticePeriod"
                  {...register("noticePeriod", { required: "Notice period is required" })}
                  className={select}
                >
                  <option value="">Select notice period…</option>
                  {NOTICE_PERIOD_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </FormField>
            )}

            {/* Organization Name */}
            <FormField
              label="Organization Name"
              htmlFor="organizationName"
              required
              icon={<Building className="w-4 h-4" />}
              error={errors.organizationName?.message}
            >
              <input
                id="organizationName"
                type="text"
                placeholder="e.g. Systems Limited"
                {...register("organizationName", { required: "Organization name is required" })}
                className={input}
              />
            </FormField>

            {/* Position / Designation */}
            <FormField
              label="Position / Designation"
              htmlFor="positionDesignation"
              required
              icon={<UserCheck className="w-4 h-4" />}
              error={errors.positionDesignation?.message}
            >
              <input
                id="positionDesignation"
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                {...register("positionDesignation", { required: "Position / designation is required" })}
                className={input}
              />
            </FormField>
          </>
        )}

        {/* Earliest Start Date — always shown */}
        <FormField
          label="Earliest Start Date"
          htmlFor="joiningDate"
          required
          icon={<Calendar className="w-4 h-4" />}
          error={errors.joiningDate?.message}
          hint={maxDate ? `Must be on or before ${new Date(maxDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}` : undefined}
        >
          <input
            id="joiningDate"
            type="date"
            min={today}
            max={maxDate}
            {...register("joiningDate", {
              required: "Start date is required",
              validate: (value) => {
                if (!value) return "Start date is required";
                if (value < today) return "Start date cannot be in the past";
                if (maxDate && value > maxDate)
                  return `Start date must be on or before ${new Date(maxDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`;
                return true;
              },
            })}
            className={input}
          />
        </FormField>

        {/* How Did You Hear */}
        <FormField
          label="How Did You Hear About This Opportunity?"
          htmlFor="howDidYouHear"
          required
          icon={<Megaphone className="w-4 h-4" />}
          error={errors.howDidYouHear?.message}
        >
          <select
            id="howDidYouHear"
            {...register("howDidYouHear", { required: "Please select how you heard about this opportunity" })}
            className={select}
          >
            <option value="">Select an option…</option>
            {HOW_DID_YOU_HEAR_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </FormField>

        {/* ── Quick Questions ───────────────────────────────────────────── */}
        <div className="md:col-span-2 mt-6 pt-6 border-t border-slate-200/60">
          <h4 className="text-[15px] font-bold text-slate-500 mb-6">
            A few quick questions
          </h4>

          <div className="space-y-8">
            {/* Evening Shift */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-slate-800 block">
                Are you comfortable working evening shifts? <span className="text-[#E9327C]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer text-[15px] font-bold text-slate-800 border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 transition-colors bg-white shadow-xs">
                  <input type="radio" value="yes" {...register("comfortableEveningShift", { required: "Please select an option" })} className="w-5 h-5 text-[#E9327C] bg-white border-slate-300 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#E9327C] cursor-pointer" />
                  Yes
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-[15px] font-bold text-slate-800 border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 transition-colors bg-white shadow-xs">
                  <input type="radio" value="no" {...register("comfortableEveningShift", { required: "Please select an option" })} className="w-5 h-5 text-[#E9327C] bg-white border-slate-300 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#E9327C] cursor-pointer" />
                  No
                </label>
              </div>
              {errors.comfortableEveningShift && (
                <p className="text-xs text-rose-500 font-medium">{errors.comfortableEveningShift.message}</p>
              )}
            </div>

            {/* Worked With Us Before — hidden for freshers */}
            {!isFresher && (
              <div className="space-y-3">
                <label className="text-[15px] font-bold text-slate-800 block">
                  Have you worked with us before? <span className="text-[#E9327C]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer text-[15px] font-bold text-slate-800 border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 transition-colors bg-white shadow-xs">
                    <input type="radio" value="yes" {...register("workedWithUsBefore", { required: "Please select an option" })} className="w-5 h-5 text-[#E9327C] bg-white border-slate-300 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#E9327C] cursor-pointer" />
                    Yes
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-[15px] font-bold text-slate-800 border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 transition-colors bg-white shadow-xs">
                    <input type="radio" value="no" {...register("workedWithUsBefore", { required: "Please select an option" })} className="w-5 h-5 text-[#E9327C] bg-white border-slate-300 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#E9327C] cursor-pointer" />
                    No
                  </label>
                </div>
                {errors.workedWithUsBefore && (
                  <p className="text-xs text-rose-500 font-medium">{errors.workedWithUsBefore.message}</p>
                )}
              </div>
            )}

            {/* Reference */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-slate-800 block">
                Do you have any references? <span className="text-[#E9327C]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer text-[15px] font-bold text-slate-800 border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 transition-colors bg-white shadow-xs">
                  <input type="radio" value="yes" {...register("hasReference", { required: "Please select an option" })} className="w-5 h-5 text-[#E9327C] bg-white border-slate-300 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#E9327C] cursor-pointer" />
                  Yes
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-[15px] font-bold text-slate-800 border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 transition-colors bg-white shadow-xs">
                  <input type="radio" value="no" {...register("hasReference", { required: "Please select an option" })} className="w-5 h-5 text-[#E9327C] bg-white border-slate-300 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#E9327C] cursor-pointer" />
                  No
                </label>
              </div>
              {errors.hasReference && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.hasReference.message}</p>
              )}

              {/* Reference detail fields */}
              {hasReference === "yes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2">
                  <FormField
                    label="Reference Name"
                    htmlFor="referenceName"
                    required
                    icon={<Users className="w-4 h-4" />}
                    error={errors.referenceName?.message}
                  >
                    <input
                      id="referenceName"
                      type="text"
                      placeholder="e.g. John Doe"
                      {...register("referenceName", { required: "Reference name is required" })}
                      className={input}
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
                      id="referenceRelationship"
                      type="text"
                      placeholder="e.g. Former Manager"
                      {...register("referenceRelationship", { required: "Reference relationship is required" })}
                      className={input}
                    />
                  </FormField>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
