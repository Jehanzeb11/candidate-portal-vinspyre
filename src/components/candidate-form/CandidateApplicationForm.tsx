"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import {
  Send,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { CandidateFormValues } from "./types";
import { DropCvSection } from "./DropCvSection";
import { BasicInfoSection } from "./BasicInfoSection";
import { EducationSection } from "./EducationSection";
import { EmploymentSection } from "./EmploymentSection";

const CANDIDATE_PROFILE_API_URL =
  process.env.NEXT_PUBLIC_CANDIDATE_PROFILE_API_URL ??
  "http://192.168.18.106:5004/api/v1/recruitment/candidate-profile";

const normalizeMoney = (value: string) => value.replaceAll(",", "").trim();

const toBooleanString = (value: "yes" | "no" | "") => (value === "yes" ? "true" : "false");

const buildCandidateProfileFormData = (data: CandidateFormValues, jobId?: string) => {
  const formData = new FormData();
  const cvFile = data.cvFile?.[0];

  formData.append("positionAppliedFor", data.positionAppliedFor.trim());
  formData.append("fullName", data.fullName.trim());
  formData.append("email", data.email.trim());
  formData.append("phone", data.phone.trim());
  formData.append("noticePeriod", data.noticePeriod.trim());
  formData.append("earliestAvailableJoiningDate", data.joiningDate);
  formData.append("currentSalaryPkr", normalizeMoney(data.currentSalary));
  formData.append("expectedMonthlySalaryPkr", normalizeMoney(data.expectedSalary));
  formData.append("reasonForLeavingLastJob", data.reasonForLeaving.trim());
  formData.append("comfortableEveningShift", toBooleanString(data.comfortableEveningShift));

  if (jobId) {
    formData.append("jobId", jobId);
  }

  if (cvFile) {
    formData.append("cv", cvFile);
  }

  if (data.coverLetter?.trim()) {
    formData.append("coverLetter", data.coverLetter.trim());
  }

  if (data.portfolioUrl?.trim()) {
    formData.append("portfolioLink", data.portfolioUrl.trim());
  }

  formData.append("linkedInProfile", data.linkedInUrl.trim());
  formData.append("workedWithUsBefore", toBooleanString(data.workedWithUsBefore));
  formData.append("hasReference", toBooleanString(data.hasReference));

  // Only append reference details if user selected "yes"
  if (data.hasReference === "yes") {
    formData.append("referenceName", data.referenceName.trim());
    formData.append("referenceRelationship", data.referenceRelationship.trim());
  }

  formData.append("yearsOfExperience", data.yearsOfExperience.trim());

  const educationalRecords = data.educationHistory
    .filter((record) => record.degreeTitle.trim())
    .map((record) => ({
      certificateOrDegree: record.degreeTitle.trim(),
    }));

  const employmentRecords = data.employmentHistory
    .filter((record) => record.organizationName.trim() || record.position.trim())
    .map((record) => ({
      organizationName: record.organizationName.trim(),
      position: record.position.trim(),
    }));

  formData.append("educationalRecords", JSON.stringify(educationalRecords));
  formData.append("employmentRecords", JSON.stringify(employmentRecords));

  return formData;
};

interface CandidateApplicationFormProps {
  jobTitle?: string;
  jobId?: string;
}

export function CandidateApplicationForm({ jobTitle, jobId }: CandidateApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<CandidateFormValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues: {
      positionAppliedFor: "",
      fullName: "",
      email: "",
      phone: "",
      noticePeriod: "",
      joiningDate: "",
      currentSalary: "",
      expectedSalary: "",
      reasonForLeaving: "",
      comfortableEveningShift: "",
      cvFile: null,
      coverLetter: "",
      portfolioUrl: "",
      linkedInUrl: "",
      workedWithUsBefore: "",
      hasReference: "",
      referenceName: "",
      referenceRelationship: "",
      yearsOfExperience: "",
      educationHistory: [
        { degreeTitle: "", institution: "", yearCompleted: "", gradeOrCgpa: "" },
      ],
      employmentHistory: [
        { organizationName: "", position: "", duration: "", responsibilities: "" },
      ],
    },
  });

  // Watch hasReference to trigger re-renders in parent, which propagates to children
  watch("hasReference");

  const hasReference = watch("hasReference");

  useEffect(() => {
    if (jobTitle) {
      setValue("positionAppliedFor", jobTitle);
    }
  }, [jobTitle, setValue]);

  // Clear reference fields when user selects "No"
  useEffect(() => {
    if (hasReference === "no") {
      setValue("referenceName", "");
      setValue("referenceRelationship", "");
    }
  }, [hasReference, setValue]);

  const onSubmit: SubmitHandler<CandidateFormValues> = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting your application...");
    try {
      const response = await fetch(CANDIDATE_PROFILE_API_URL, {
        method: "POST",
        body: buildCandidateProfileFormData(data, jobId),
      });

      const responseText = await response.text();
      let responseMessage = response.ok
        ? "Application submitted successfully!"
        : response.statusText || "Submission failed. Please try again.";

      if (responseText) {
        try {
          const parsedResponse = JSON.parse(responseText) as { message?: string };
          if (parsedResponse?.message) {
            responseMessage = parsedResponse.message;
          }
        } catch {
          // Ignore non-JSON responses and use the default message.
        }
      }

      if (!response.ok) {
        throw new Error(responseMessage);
      }

      toast.success(responseMessage, { 
        id: toastId,
        duration: 5000,
      });
      setSubmittedData(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submission failed. Please try again.";
      toast.error(message, { 
        id: toastId,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (submittedData) {
  //   return (
  //     <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-5 md:p-8 text-slate-800">
  //       <div className="text-center space-y-3 mb-6">
  //         <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
  //           <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" />
  //         </div>
  //         <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Application Submitted!</h2>
  //         <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
  //           Thank you, <span className="font-semibold text-slate-800">{submittedData.fullName}</span>. Your application for{" "}
  //           <span className="text-[#d81b60] font-bold">{submittedData.positionAppliedFor}</span> has been received.
  //         </p>
  //       </div>

  //       <div className="bg-[#f8f9fa] border border-slate-200/90 rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
  //         <h3 className="text-base md:text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
  //           <FileCheck className="w-5 h-5 text-[#d81b60]" />
  //           Submitted Details Summary
  //         </h3>

  //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
  //           {[
  //             { label: "Full Name", value: submittedData.fullName },
  //             { label: "Email Address", value: submittedData.email },
  //             { label: "Phone Number", value: submittedData.phone },
  //             { label: "Position Applied For", value: submittedData.positionAppliedFor },
  //             { label: "Years of Experience", value: submittedData.yearsOfExperience },
  //             { label: "Current Salary", value: `PKR ${submittedData.currentSalary}` },
  //             { label: "Expected Salary", value: `PKR ${submittedData.expectedSalary}` },
  //             { label: "Notice Period", value: submittedData.noticePeriod },
  //             { label: "Evening Shift", value: submittedData.comfortableEveningShift?.toUpperCase() },
  //           ].map(({ label, value }) => (
  //             <div key={label}>
  //               <span className="text-slate-400 block text-[10px] md:text-[11px] font-bold uppercase tracking-wider">{label}</span>
  //               <span className="font-semibold text-slate-800">{value}</span>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (submittedData) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-5 md:p-8 text-slate-800">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-lg">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Thank You for Submitting!</h2>
            <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Dear <span className="font-semibold text-slate-900">{submittedData.fullName}</span>, we've received your application for the position of{" "}
              <span className="text-[#d81b60] font-bold">{submittedData.positionAppliedFor}</span>.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-6 mb-6 space-y-3">
          <h3 className="text-base md:text-lg font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            What happens next?
          </h3>
          <ul className="text-sm text-emerald-800 space-y-2 ml-7">
            <li>✓ Your application has been successfully submitted to our system</li>
            <li>✓ Our recruitment team will review your application within 3-5 business days</li>
            <li>✓ You'll receive an email notification at <span className="font-semibold">{submittedData.email}</span> with updates</li>
            <li>✓ Keep an eye on your inbox (including spam folder) for further instructions</li>
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#d81b60]" />
            Application Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-sm">
            {[
              { label: "Full Name", value: submittedData.fullName },
              { label: "Email Address", value: submittedData.email },
              { label: "Phone Number", value: submittedData.phone },
              { label: "Position Applied For", value: submittedData.positionAppliedFor },
              { label: "Years of Experience", value: submittedData.yearsOfExperience || "N/A" },
              { label: "Notice Period", value: submittedData.noticePeriod || "N/A" },
              { label: "Current Salary", value: submittedData.currentSalary ? `PKR ${submittedData.currentSalary}` : "N/A" },
              { label: "Expected Salary", value: submittedData.expectedSalary ? `PKR ${submittedData.expectedSalary}` : "N/A" },
            ].map(({ label, value }) => (
              <div key={label} className="pb-3 border-b border-slate-200 last:border-0">
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-1">{label}</span>
                <span className="font-semibold text-slate-800 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>If you have any questions, please don't hesitate to reach out to us.</p>
          <p className="mt-2 text-slate-500">Best of luck! 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 text-[#d81b60] text-[10px] sm:text-xs font-bold rounded-full mb-2 sm:mb-3 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Join Our Team
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Candidate Application Form
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Fill in all sections below and submit your application in one go.
        </p>
      </div>

      {/* Single Page Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">

        {/* Section 1 — Drop Your CV */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          <DropCvSection register={register} errors={errors} setValue={setValue} />
        </div>

        {/* Section 2 — Basic Info */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          <BasicInfoSection register={register} errors={errors} watch={watch} jobTitle={jobTitle} />
        </div>

        {/* Section 3 — Educational Record */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          <EducationSection register={register} errors={errors} />
        </div>

        {/* Section 4 — Employment Record */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          <EmploymentSection register={register} errors={errors} />
        </div>

        {/* Submit Button */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#d81b60] hover:bg-[#c2185b] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Submitting...
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
