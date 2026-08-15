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
  "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10 outline-none transition-all duration-200";

const select =
  "w-full bg-[#f8f9fa] border border-slate-200/90 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#d81b60] focus:ring-4 focus:ring-[#d81b60]/10 outline-none transition-all duration-200 appearance-none";

const radioRow = "flex flex-wrap items-center gap-x-6 gap-y-3";
const radioLabel = "flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700";
const radioInput =
  "w-4 h-4 text-[#d81b60] bg-white border-slate-300 focus:ring-[#d81b60] focus:ring-2 accent-[#d81b60]";
const radioBox =
  "md:col-span-2 bg-[#f8f9fa] p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3";

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
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#d81b60]" />
          Professional Information
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Career details, salary expectations, and role specifics.
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
            id="positionAppliedFor"
            type="text"
            placeholder="e.g. Senior Backend Engineer"
            {...register("positionAppliedFor", { required: "Position is required" })}
            readOnly={positionReadOnly}
            className={`${input} ${positionReadOnly ? "bg-slate-100 cursor-not-allowed" : ""}`}
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

        {/* Evening Shift */}
        <div className={radioBox}>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Are you comfortable working the evening shift (7:00 PM – 4:00 AM)?{" "}
            <span className="text-rose-500">*</span>
          </label>
          <div className={radioRow}>
            <label className={radioLabel}>
              <input type="radio" value="yes" {...register("comfortableEveningShift", { required: "Please select an option" })} className={radioInput} />
              Yes, I am comfortable
            </label>
            <label className={radioLabel}>
              <input type="radio" value="no" {...register("comfortableEveningShift", { required: "Please select an option" })} className={radioInput} />
              No
            </label>
          </div>
          {errors.comfortableEveningShift && (
            <p className="text-xs text-rose-500 font-medium">{errors.comfortableEveningShift.message}</p>
          )}
        </div>

        {/* Worked With Us Before — hidden for freshers */}
        {!isFresher && (
          <div className={radioBox}>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Have you worked with us before? <span className="text-rose-500">*</span>
            </label>
            <div className={radioRow}>
              <label className={radioLabel}>
                <input type="radio" value="yes" {...register("workedWithUsBefore", { required: "Please select an option" })} className={radioInput} />
                Yes
              </label>
              <label className={radioLabel}>
                <input type="radio" value="no" {...register("workedWithUsBefore", { required: "Please select an option" })} className={radioInput} />
                No
              </label>
            </div>
            {errors.workedWithUsBefore && (
              <p className="text-xs text-rose-500 font-medium">{errors.workedWithUsBefore.message}</p>
            )}
          </div>
        )}

        {/* Reference */}
        <div className={`${radioBox} space-y-4`}>
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
              Do you have any reference? <span className="text-rose-500">*</span>
            </label>
            <div className={radioRow}>
              <label className={radioLabel}>
                <input type="radio" value="yes" {...register("hasReference", { required: "Please select an option" })} className={radioInput} />
                Yes
              </label>
              <label className={radioLabel}>
                <input type="radio" value="no" {...register("hasReference", { required: "Please select an option" })} className={radioInput} />
                No
              </label>
            </div>
            {errors.hasReference && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.hasReference.message}</p>
            )}
          </div>

          {/* Reference detail fields */}
          {hasReference === "yes" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-300">
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
  );
}
