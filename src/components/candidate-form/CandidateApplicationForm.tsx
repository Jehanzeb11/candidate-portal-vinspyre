"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Send, CheckCircle2, FileCheck, RefreshCw, Sparkles, Check, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";
import { CandidateFormValues } from "./types";
import { PersonalSection } from "./PersonalSection";
import { ProfessionalSection } from "./ProfessionalSection";
import { ResumeSection } from "./ResumeSection";
import vpImg from "@/assets/vp-apply.png"
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";

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
  department?: string;
  employmentType?: string;
  location?: string;
  experience?: string;
  details?: any;
}

export function CandidateApplicationForm({
  jobTitle,
  jobId,
  validTill,
  details
}: Props) {
  const [submittedData, setSubmittedData] = useState<CandidateFormValues | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
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
  const cvFile = watch("cvFile");
  const hasResume = cvFile && cvFile.length > 0;

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

  const handleNext = async (step: number) => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger([
        "firstName", "lastName", "email", "phone", "address",
        "age", "gender", "maritalStatus", "linkedInUrl", "portfolioUrl"
      ]);
    } else if (step === 2) {
      const fieldsToValidate: (keyof CandidateFormValues)[] = [
        "highestEducation", "yearsOfExperience", "expectedSalary",
        "joiningDate", "howDidYouHear", "comfortableEveningShift", "hasReference"
      ];
      if (!isFresher) {
        fieldsToValidate.push(
          "currentSalary", "currentEmploymentStatus", "jobSeekingStatus",
          "reasonForLeaving", "organizationName",
          "positionDesignation", "workedWithUsBefore"
        );
        if (!hideNotice) {
          fieldsToValidate.push("noticePeriod");
        }
      }
      if (hasReference === "yes") {
        fieldsToValidate.push("referenceName", "referenceRelationship");
      }
      isValid = await trigger(fieldsToValidate);
    }

    if (isValid) {
      setCurrentStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 xl:py-16 bg-[#fafafa]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-10 flex justify-between items-start relative">
          <div className="max-w-2xl z-10 relative">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-extrabold uppercase tracking-widest text-slate-900">Join our team</span>
              <div className="h-[3px] bg-slate-900 w-12" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[56px] leading-[1.1] font-extrabold text-[#111827] tracking-tight flex flex-wrap lg:flex-nowrap items-center gap-2 md:gap-3 whitespace-normal lg:whitespace-nowrap">
              {jobTitle} <span className="text-[#E9327C]">Application</span>
            </h1>
            <p className="mt-4 text-slate-500 text-lg max-w-lg">
              Complete your application and take the first step toward joining Vinspyre.
            </p>
          </div>

          {/* Decorative Image */}
          <div className="hidden md:block absolute -top-2 lg:-top-8 right-0 pointer-events-none z-0">
            <Image src={vpImg} alt="Vinspyre" className="h-[140px] lg:h-[230px] w-auto object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">

          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 space-y-6">

            {/* Blue Job Application Card */}
            <div style={{ background: "linear-gradient(135deg, #111B3A 0%, #1E2D60 100%)" }} className="rounded-[32px] p-5 md:p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />
              <div className="absolute right-0 bottom-0 w-[200px] h-[200px] bg-[#E9327C]/10 rounded-full blur-[60px]" />

              <div className="relative z-10">
                {/* Top row: icon + badge */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 border border-white/20 rounded-xl flex items-center justify-center bg-white/5 backdrop-blur-sm">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-[#FCE7F3] px-5 py-2.5 rounded-full text-[#E9327C] text-base font-bold shadow-sm">
                    Applications Open
                  </div>
                </div>

                {/* Label */}
                <p className="text-[#E9327C] text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Your Application</p>

                {/* Title row: job title left, percentage right */}
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">{jobTitle}</h2>
                  <div className="flex items-baseline gap-0.5 shrink-0 ml-4 md:ml-6">
                    <span className="text-3xl sm:text-4xl md:text-[48px] font-bold leading-none">
                      {submittedData ? 100 : Math.round(((currentStep - 1) / 3) * 100)}
                    </span>
                    <span className="text-lg md:text-xl text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* Subtitle row: department left, Completed right */}
                <div className="flex justify-between items-center mb-5">
                  <p className="text-slate-400 text-xs sm:text-sm md:text-base">{details?.employmentType}</p>
                  <p className="text-xs sm:text-sm text-slate-400 shrink-0 ml-2 sm:ml-6">Completed</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-500/40 h-1.5 rounded-full overflow-hidden mb-5">
                  <div className="bg-[#E9327C] h-full rounded-full transition-all duration-500" style={{ width: `${submittedData ? 100 : ((currentStep - 1) / 3) * 100}%` }} />
                </div>

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-slate-400 items-start sm:items-center gap-2 sm:gap-0">
                  <span>Application takes 5-7 minutes</span>
                  <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                    Your journey starts here <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper UI */}
            <div className="border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white w-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[#E9327C] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">The Big Picture</p>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Your application journey</h2>
                </div>
                <div className="text-slate-500 font-medium text-sm mt-1">
                  {submittedData ? "Application submitted" : `Step ${currentStep} of 3`}
                </div>
              </div>

              <div className="flex items-center justify-between relative mt-10 mb-4 w-full">
                {/* Connecting lines */}
                <div className={`absolute top-[18px] left-[23%] w-[20%] h-[3px] ${submittedData || currentStep > 1 ? "bg-[#E9327C]" : "bg-slate-100"}`} style={{ zIndex: 0 }} />
                <div className={`absolute top-[18px] left-[56.5%] w-[20%] h-[3px] ${submittedData || currentStep > 2 ? "bg-[#E9327C]" : "bg-slate-100"}`} style={{ zIndex: 0 }} />

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10 w-1/3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-4  ${submittedData || currentStep > 1
                    ? "bg-[#E9327C] text-white"
                    : "border-2 border-[#E9327C] text-[#E9327C] ring-[6px] ring-pink-50"
                    }`}>
                    {submittedData || currentStep > 1 ? <Check className="w-5 h-5 stroke-[3]" /> : "01"}
                  </div>
                  <p className="font-bold text-slate-900 text-[10px] md:text-xs text-center leading-tight mt-2 md:mt-0">Personal Information</p>
                  <p className={`text-[10px] mt-1 ${submittedData || currentStep > 1 ? "text-slate-800" : "text-[#E9327C] font-bold"}`}>
                    {submittedData || currentStep > 1 ? "Completed" : "In progress"}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10 w-1/3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-4 ${submittedData || currentStep > 2
                    ? "bg-[#E9327C] text-white"
                    : currentStep === 2
                      ? "border-2 border-[#E9327C] text-[#E9327C] ring-[6px] ring-pink-50"
                      : "border-2 border-slate-200 text-slate-400"
                    }`}>
                    {submittedData || currentStep > 2 ? <Check className="w-5 h-5 stroke-[3]" /> : "02"}
                  </div>
                  <p className="font-bold text-slate-900 text-[10px] md:text-xs text-center leading-tight mt-2 md:mt-0">Professional Background</p>
                  <p className={`text-[10px] mt-1 ${submittedData || currentStep > 2 ? "text-slate-800" : currentStep === 2 ? "text-[#E9327C] font-bold" : "text-slate-400"
                    }`}>
                    {submittedData || currentStep > 2 ? "Completed" : currentStep === 2 ? "In progress" : "Upcoming"}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10 w-1/3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-4 ${submittedData
                    ? "bg-[#E9327C] text-white"
                    : currentStep === 3
                      ? "border-2 border-[#E9327C] text-[#E9327C] ring-[6px] ring-pink-50"
                      : "border-2 border-slate-200 text-slate-400"
                    }`}>
                    {submittedData ? <Check className="w-5 h-5 stroke-[3]" /> : "03"}
                  </div>
                  <p className="font-bold text-slate-900 text-[10px] md:text-xs text-center leading-tight mt-2 md:mt-0">Resume & Submit</p>
                  <p className={`text-[10px] mt-1 ${submittedData ? "text-slate-800" : currentStep === 3 ? "text-[#E9327C] font-bold" : "text-slate-400"}`}>
                    {submittedData ? "Completed" : currentStep === 3 ? "In progress" : "Upcoming"}
                  </p>
                </div>
              </div>
            </div>

            {submittedData ? (
              <div className="bg-white border border-slate-100 rounded-[32px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] py-20 px-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-8">
                  <Check className="w-10 h-10 text-[#E9327C] stroke-[2]" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#111B3A] mb-4 tracking-tight">Application received</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  Thanks, {submittedData.firstName}. We sent a confirmation to <span className="font-bold text-slate-900">{submittedData.email}</span>. Use Candidate Portal Login to track your application status.
                </p>
                <Link href="/login" className="px-6 py-3 bg-[#111B3A] text-white rounded-xl font-bold hover:bg-[#1A2954] transition-colors shadow-sm">
                  Go to Candidate Portal
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 bg-white border border-slate-100 rounded-[32px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">

                {/* Header for Form Content */}
                <div className="px-6 md:px-8 pt-8 pb-2">
                  <p className="text-[#E9327C] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Step {currentStep} of 3</p>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {currentStep === 1 && "Personal Information"}
                    {currentStep === 2 && "Professional Background"}
                    {currentStep === 3 && "Resume / CV"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    {currentStep === 1 && "Tell us a little about yourself."}
                    {currentStep === 2 && "Share your professional journey with us."}
                    {currentStep === 3 && "Upload your latest resume and complete your application."}
                  </p>
                </div>

                {/* Section 1 — Personal Info */}
                <div className={currentStep === 1 ? "block" : "hidden"}>
                  <div className="px-4 sm:px-6 md:px-8 pb-8">
                    <PersonalSection register={register} errors={errors} watch={watch} setValue={setValue} />
                    <div className="mt-8 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => handleNext(1)}
                        className="px-8 py-3 font-bold"
                      >
                        Continue →
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Section 2 — Professional Info */}
                <div className={currentStep === 2 ? "block" : "hidden"}>
                  <div className="px-4 sm:px-6 md:px-8 pb-8">
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
                    <div className="mt-8 flex justify-between">
                      <Button
                        variant={"ghost"}
                        type="button"
                        onClick={handleBack}
                        className="px-8 py-3 border border-slate-200 font-bold"
                      >
                        &larr; Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleNext(2)}
                        className="px-8 py-3 font-bold"
                      >
                        Continue →
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Section 3 — Resume */}
                <div className={currentStep === 3 ? "block" : "hidden"}>
                  <div className="px-4 sm:px-6 md:px-8 pb-8">
                    <ResumeSection register={register} errors={errors} setValue={setValue} />
                    {hasResume && (
                      <div style={{ background: "linear-gradient(135deg, #111B3A 0%, #1E2D60 100%)" }} className="rounded-[24px] p-8 text-white mt-8 shadow-xl">
                        <h3 className="text-[22px] font-bold mb-5 tracking-tight">Ready to submit?</h3>
                        <ul className="space-y-3 mb-8">
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#E9327C] flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                            <span className="text-slate-200 text-sm">Information completed</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#E9327C] flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                            <span className="text-slate-200 text-sm">Resume uploaded</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#E9327C] flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                            <span className="text-slate-200 text-sm">Application reviewed</span>
                          </li>
                        </ul>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2.5 bg-[#E9327C] hover:bg-[#D12C6F] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-max"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Submitting…
                            </>
                          ) : (
                            "Submit Application"
                          )}
                        </button>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-200 flex justify-start">
                      <Button
                        type="button"
                        variant={"ghost"}
                        onClick={handleBack}
                        className="px-8 py-3 border border-slate-200 font-bold"
                      >
                        &larr; Back
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Job Summary */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="font-extrabold text-slate-900 text-lg mb-6 tracking-tight">Job Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-slate-400 text-xs mb-1">Job Title</p>
                  <p className="font-bold text-slate-900">{jobTitle}</p>
                </div>
                {/* <div className="border-b border-slate-100 pb-4">
                  <p className="text-slate-400 text-xs mb-1">Department</p>
                  <p className="font-bold text-slate-900">{department}</p>
                </div> */}
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-slate-400 text-xs mb-1">Employment</p>
                  <p className="font-bold text-slate-900">{details?.employmentType}</p>
                </div>
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-slate-400 text-xs mb-1">Location</p>
                  <p className="font-bold text-slate-900">{details?.location}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Experience</p>
                  <p className="font-bold text-slate-900">{details?.experience}</p>
                </div>
              </div>
            </div>

            {/* A little note from us */}
            <div className="bg-[#FCE7F3] rounded-[32px] p-8 border border-[#F8C9DE]">
              <div className="flex items-center gap-2 text-[#E9327C] text-[12px] md:text-[16px] font-extrabold uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-3.5 h-3.5" /> A little note from us
              </div>
              <h3 className="md:text-3xl text-2xl font-extrabold text-slate-900 mb-3 leading-tight tracking-tight">Every great journey starts with a first step.</h3>
              <p className="text-slate-600  mb-6 leading-relaxed text-sm md:text-base">Take your time and do your best. We're excited to see what you bring.</p>
              <div className="flex items-center gap-4 border-t border-pink-300 pt-5">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold border-2 border-pink-50">AS</div>
                  <div className="w-10 h-10 rounded-full bg-[#E9327C] flex items-center justify-center text-[10px] text-white font-bold border-2 border-pink-50">JM</div>
                  <div className="w-10 h-10 rounded-full bg-pink-300 flex items-center justify-center text-[10px] text-white font-bold border-2 border-pink-50">+3</div>
                </div>
                <div>
                  <p className="text-base text-slate-500 font-medium">Your Vinspyre</p>
                  <p className="text-base font-bold text-slate-900">People Team</p>
                </div>
              </div>
            </div>

            {/* Good hands */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-lg md:text-xl text-slate-900">You're in good hands</p>
                <p className="text-xs md:text-base text-slate-500 mt-1 leading-relaxed">Your information is safe and only shared with our hiring team.</p>
              </div>
            </div>

            {/* Need help? */}
            <div className="bg-[#111B3A] rounded-[32px] p-8 text-white">
              <div className="w-12 h-12 bg-[#E9327C] rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-extrabold text-xl mb-2 tracking-tight">Need help?</h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">Our team is here to support your application.</p>
              <a href="mailto:hr@vinspyre.com" className="px-5 py-2.5 bg-transparent border border-white/20 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2 w-fit">
                Contact Us <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
