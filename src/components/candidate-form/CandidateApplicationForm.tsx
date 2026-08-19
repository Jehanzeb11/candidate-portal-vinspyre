"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Send, CheckCircle2, FileCheck, RefreshCw, Sparkles } from "lucide-react";
import { CandidateFormValues } from "./types";
import { PersonalSection } from "./PersonalSection";
import { ProfessionalSection } from "./ProfessionalSection";
import { ResumeSection } from "./ResumeSection";
import { Button } from "../ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_CANDIDATE_PROFILE_API_URL ??
  "http://192.168.18.106:5004/api/v1/recruitment/candidate-profile";

const strip = (v: string | undefined) => v?.trim() ?? "";
// FormData carries only strings; server parses "true"/"false" as booleans
const toBool = (v: "yes" | "no" | "" | undefined) => (v === "yes" ? "true" : "false");

// ── Display label → API enum value maps ────────────────────────────────────

const GENDER_API: Record<string, string> = {
  "Male": "male",
  "Female": "female",
  "Rather not say": "rather_not_say",
};

const MARITAL_STATUS_API: Record<string, string> = {
  "Single": "single",
  "Married": "married",
  "Prefer Not to Say": "prefer_not_to_say",
};

const EDUCATION_API: Record<string, string> = {
  "Primary Level": "primary_level",
  "Intermediate": "intermediate",
  "Diploma": "diploma",
  "Bachelors": "bachelors",
  "Masters": "masters",
  "MPhil": "mphil",
  "PhD": "phd",
  "Other": "other",
};

const EXPERIENCE_API: Record<string, string> = {
  "Fresher": "fresher",
  "0 - 1 Year": "zero_to_one",
  "1 - 2 Years": "one_to_two",
  "2 - 3 Years": "two_to_three",
  "3 - 4 Years": "three_to_four",
  "4 - 5 Years": "four_to_five",
  "5 - 7 Years": "five_to_seven",
};

const EMPLOYMENT_STATUS_API: Record<string, string> = {
  "Employed full-time": "employed_full_time",
  "Employed part-time": "employed_part_time",
  "Freelancing / Contract work": "freelancing_contract",
  "Unemployed": "unemployed",
  "Student / Fresh Graduate": "student_fresh_graduate",
  "On a career break": "career_break",
  "Other": "other",
};

const JOB_SEEKING_API: Record<string, string> = {
  "I am looking for a new opportunity": "looking_for_new_opportunity",
  "I am exploring a secondary opportunity along with my current job": "exploring_secondary_opportunity",
};

const NOTICE_PERIOD_API: Record<string, string> = {
  "None": "none",
  "1 week": "one_week",
  "2 weeks": "two_weeks",
  "1 month": "one_month",
  "2 months": "two_months",
  "3+ months": "three_plus_months",
};

const HOW_DID_YOU_HEAR_API: Record<string, string> = {
  "LinkedIn": "linkedin",
  "Career Site": "career_site",
  "Job Board (Indeed, Glassdoor, etc.)": "job_board",
  "Referred by someone": "referred_by_someone",
  "Company Website": "company_website",
  "Career Placement Center / University": "career_placement_center_university",
  "Recruiter reached out to me directly": "recruiter_reached_out",
  "Social Media (Instagram, Twitter, etc.)": "social_media",
  "Networking Event or Conference": "networking_event_conference",
  "Other": "other",
};

/** Converts a display label to its API enum value; falls back to the raw value if not found. */
const toApi = (map: Record<string, string>, value: string) => map[value] ?? value;

function buildFormData(data: CandidateFormValues, jobId?: string): FormData {
  const fd = new FormData();
  const isFresher = data.yearsOfExperience === "Fresher";
  const hideNotice =
    isFresher ||
    data.currentEmploymentStatus === "Unemployed" ||
    data.currentEmploymentStatus === "On a career break";

  fd.append("firstName", strip(data.firstName));
  fd.append("lastName", strip(data.lastName));
  fd.append("email", strip(data.email));
  fd.append("phone", strip(data.phone));
  fd.append("address", strip(data.address));
  fd.append("age", strip(data.age));
  fd.append("gender", toApi(GENDER_API, data.gender));
  fd.append("maritalStatus", toApi(MARITAL_STATUS_API, data.maritalStatus));
  fd.append("linkedInProfile", strip(data.linkedInUrl));
  if (data.portfolioUrl?.trim()) fd.append("portfolioLink", strip(data.portfolioUrl));

  fd.append("highestEducation", toApi(EDUCATION_API, data.highestEducation));
  fd.append("yearsOfExperience", toApi(EXPERIENCE_API, data.yearsOfExperience));
  fd.append("expectedMonthlySalaryPkr", strip(data.expectedSalary).replaceAll(",", ""));

  if (!isFresher) {
    fd.append("currentSalaryPkr", strip(data.currentSalary).replaceAll(",", ""));
    fd.append("currentEmploymentStatus", toApi(EMPLOYMENT_STATUS_API, data.currentEmploymentStatus ?? ""));
    fd.append("jobSeekingStatus", toApi(JOB_SEEKING_API, data.jobSeekingStatus ?? ""));
    fd.append("reasonForLeavingLastJob", strip(data.reasonForLeaving));
    if (!hideNotice) fd.append("noticePeriod", toApi(NOTICE_PERIOD_API, data.noticePeriod ?? ""));
    fd.append("organizationName", strip(data.organizationName));
    fd.append("positionDesignation", strip(data.positionDesignation));
    fd.append("workedWithUsBefore", toBool(data.workedWithUsBefore));
  }

  fd.append("earliestAvailableJoiningDate", data.joiningDate);
  fd.append("heardAboutOpportunity", toApi(HOW_DID_YOU_HEAR_API, data.howDidYouHear));

  const cv = data.cvFile?.[0];
  if (cv) fd.append("cv", cv);

  fd.append("positionAppliedFor", strip(data.positionAppliedFor));
  if (jobId) fd.append("jobId", jobId);

  if (data.coverLetter?.trim()) fd.append("coverLetter", strip(data.coverLetter));

  fd.append("comfortableEveningShift", toBool(data.comfortableEveningShift));
  fd.append("hasReference", toBool(data.hasReference));
  if (data.hasReference === "yes") {
    fd.append("referenceName", strip(data.referenceName));
    fd.append("referenceRelationship", strip(data.referenceRelationship));
  }

  return fd;
}

interface Props {
  jobTitle?: string;
  jobId?: string;
  validTill?: string;
}

export function CandidateApplicationForm({ jobTitle, jobId, validTill }: Props) {
  const [submittedData, setSubmittedData] = useState<CandidateFormValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormValues>({
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      age: "",
      gender: "",
      maritalStatus: "",
      linkedInUrl: "",
      portfolioUrl: "",
      highestEducation: "",
      yearsOfExperience: "",
      currentSalary: "",
      expectedSalary: "",
      currentEmploymentStatus: "",
      jobSeekingStatus: "",
      reasonForLeaving: "",
      noticePeriod: "",
      joiningDate: "",
      howDidYouHear: "",
      cvFile: null,
      positionAppliedFor: "",
      comfortableEveningShift: "",
      workedWithUsBefore: "",
      hasReference: "",
      referenceName: "",
      referenceRelationship: "",
      organizationName: "",
      positionDesignation: "",
      coverLetter: "",
    },
  });

  const yearsOfExperience = watch("yearsOfExperience");
  const currentEmploymentStatus = watch("currentEmploymentStatus");
  const hasReference = watch("hasReference");

  const isFresher = yearsOfExperience === "Fresher";
  const hideNotice =
    isFresher ||
    currentEmploymentStatus === "Unemployed" ||
    currentEmploymentStatus === "On a career break";

  useEffect(() => {
    if (jobTitle) setValue("positionAppliedFor", jobTitle);
  }, [jobTitle, setValue]);

  useEffect(() => {
    if (hasReference === "no") {
      setValue("referenceName", "");
      setValue("referenceRelationship", "");
    }
  }, [hasReference, setValue]);

  const onSubmit: SubmitHandler<CandidateFormValues> = async (data) => {
    const toastId = toast.loading("Submitting your application…");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: buildFormData(data, jobId),
      });
      const text = await res.text();
      let message = res.ok ? "Application submitted successfully!" : res.statusText;
      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed?.message) message = parsed.message;
      } catch { /* non-JSON */ }
      if (!res.ok) throw new Error(message);
      toast.success(message, { id: toastId, duration: 5000 });
      setSubmittedData(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed.", {
        id: toastId,
        duration: 5000,
      });
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submittedData) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-5 md:p-8 text-slate-800 md:my-4 m-2">
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-lg">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Thank You for Submitting!</h2>
            <h3 className="text-[#d81b60] text-2xl md:text-3xl font-bold">{submittedData.positionAppliedFor}</h3>
            <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Dear <span className="font-semibold text-slate-900">{submittedData.firstName} {submittedData.lastName}</span>, we've received your
              application.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-6 mb-6 space-y-3">
          <h3 className="text-base md:text-lg font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            What happens next?
          </h3>
          <ul className="text-sm text-emerald-800 space-y-2 ml-7">
            <li>✓ Your application has been successfully submitted</li>
            <li>✓ Our recruitment team will review within 1–2 business days</li>
            <li>✓ You'll receive updates at <span className="font-semibold">{submittedData.email}</span></li>
            {/* <li>✓ Check your inbox (including spam) for further instructions</li> */}
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#d81b60]" />
            Application Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Full Name", value: `${submittedData.firstName} ${submittedData.lastName}` },
              { label: "Email", value: submittedData.email },
              { label: "Phone", value: submittedData.phone },
              { label: "Position", value: submittedData.positionAppliedFor },
              { label: "Experience", value: submittedData.yearsOfExperience || "N/A" },
              { label: "Expected Salary", value: submittedData.expectedSalary ? `PKR ${submittedData.expectedSalary}` : "N/A" },
            ].map(({ label, value }) => (
              <div key={label} className="pb-3 border-b border-slate-200 last:border-0">
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-1">{label}</span>
                <span className="font-semibold text-slate-800 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 mb-2 text-center text-slate-600 text-sm">
          <p>If you have any questions, feel free to reach out.</p>
          <p className="mt-2 text-slate-500">Best of luck! 🚀</p>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="xl:min-w-6xl max-w-6xl py-10">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 text-[#d81b60] text-[10px] sm:text-xs font-bold rounded-full mb-2 sm:mb-3 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Join Our Team
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Candidate Application Form  <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#d81b60] tracking-tight">(
            {jobTitle})
          </span>
        </h1>

        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Fill in all sections below and submit your application.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        {/* Section 1 — Personal Info */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          <PersonalSection register={register} errors={errors} watch={watch} setValue={setValue} />
        </div>

        {/* Section 2 — Professional Info */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          <ProfessionalSection
            register={register}
            errors={errors}
            watch={watch}
            isFresher={isFresher}
            hideNotice={hideNotice}
            hasReference={hasReference}
            jobTitle={jobTitle}
            validTill={validTill}
          />
        </div>

        {/* Section 3 — Resume */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          <ResumeSection register={register} errors={errors} setValue={setValue} />
        </div>

        {/* Submit */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full py-3.5 bg-[#d81b60] hover:bg-[#c2185b] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
