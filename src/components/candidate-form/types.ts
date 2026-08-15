export interface CandidateFormValues {
  // Personal
  fullName: string;
  email: string;
  phone: string;
  address: string;
  age: string;
  gender: "Male" | "Female" | "Rather not say" | "";
  maritalStatus: "Single" | "Married" | "Prefer Not to Say" | "";

  // Professional links
  linkedInUrl: string;
  portfolioUrl?: string;

  // Cover letter
  coverLetter?: string;

  // Education
  highestEducation:
    | "Primary Level"
    | "Intermediate"
    | "Diploma"
    | "Bachelors"
    | "Masters"
    | "MPhil"
    | "PhD"
    | "Other"
    | "";

  // Experience
  yearsOfExperience:
    | "Fresher"
    | "0 - 1 Year"
    | "1 - 2 Years"
    | "2 - 3 Years"
    | "3 - 4 Years"
    | "4 - 5 Years"
    | "5 - 7 Years"
    | "";

  // Salary (hidden when Fresher)
  currentSalary?: string;
  expectedSalary: string;

  // Employment status (hidden when Fresher)
  currentEmploymentStatus?:
    | "Employed full-time"
    | "Employed part-time"
    | "Freelancing / Contract work"
    | "Unemployed"
    | "Student / Fresh Graduate"
    | "On a career break"
    | "Other"
    | "";

  // Job seeking status (hidden when Fresher)
  jobSeekingStatus?:
    | "I am looking for a new opportunity"
    | "I am exploring a secondary opportunity along with my current job"
    | "";

  // Reason for leaving (hidden when Fresher)
  reasonForLeaving?: string;

  // Notice period (hidden when Fresher OR when Unemployed/On a career break)
  noticePeriod?:
    | "None"
    | "1 week"
    | "2 weeks"
    | "1 month"
    | "2 months"
    | "3+ months"
    | "";

  // Availability
  joiningDate: string;

  // Discovery
  howDidYouHear:
    | "LinkedIn"
    | "Career Site"
    | "Job Board (Indeed, Glassdoor, etc.)"
    | "Referred by someone"
    | "Company Website"
    | "Career Placement Center / University"
    | "Recruiter reached out to me directly"
    | "Social Media (Instagram, Twitter, etc.)"
    | "Networking Event or Conference"
    | "Other"
    | "";

  // Resume
  cvFile: FileList | null;

  // Job
  positionAppliedFor: string;

  // Evening shift
  comfortableEveningShift: "yes" | "no" | "";

  // Worked before (hidden when Fresher)
  workedWithUsBefore?: "yes" | "no" | "";

  // Reference
  hasReference: "yes" | "no" | "";
  referenceName?: string;
  referenceRelationship?: string;

  // Last employer (hidden when Fresher)
  organizationName?: string;
  positionDesignation?: string;
}

// ─── Option lists ───────────────────────────────────────────────────────────

export const GENDER_OPTIONS = ["Male", "Female", "Rather not say"] as const;

export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Prefer Not to Say"] as const;

export const EDUCATION_OPTIONS = [
  "Primary Level",
  "Intermediate",
  "Diploma",
  "Bachelors",
  "Masters",
  "MPhil",
  "PhD",
  "Other",
] as const;

export const EXPERIENCE_OPTIONS = [
  "Fresher",
  "0 - 1 Year",
  "1 - 2 Years",
  "2 - 3 Years",
  "3 - 4 Years",
  "4 - 5 Years",
  "5 - 7 Years",
] as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  "Employed full-time",
  "Employed part-time",
  "Freelancing / Contract work",
  "Unemployed",
  "Student / Fresh Graduate",
  "On a career break",
  "Other",
] as const;

export const JOB_SEEKING_OPTIONS = [
  "I am looking for a new opportunity",
  "I am exploring a secondary opportunity along with my current job",
] as const;

export const NOTICE_PERIOD_OPTIONS = [
  "None",
  "1 week",
  "2 weeks",
  "1 month",
  "2 months",
  "3+ months",
] as const;

export const HOW_DID_YOU_HEAR_OPTIONS = [
  "LinkedIn",
  "Career Site",
  "Job Board (Indeed, Glassdoor, etc.)",
  "Referred by someone",
  "Company Website",
  "Career Placement Center / University",
  "Recruiter reached out to me directly",
  "Social Media (Instagram, Twitter, etc.)",
  "Networking Event or Conference",
  "Other",
] as const;

// ─── Job details (from API) ─────────────────────────────────────────────────

export interface JobDetails {
  id: string;
  jobTitle: string;
  location?: string;
  shiftTimings?: string;
  aboutRole?: string;
  keyResponsibilities?: string;
  qualification?: string;
  skills?: string[];
  datePosted?: string;
  validTill?: string;
  jobClosedAt?: string | null;
  isActive?: boolean;
  formUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
