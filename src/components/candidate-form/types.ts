export interface EducationRecord {
  id?: string;
  degreeTitle: string;
  institution: string;
  yearCompleted: string;
  gradeOrCgpa?: string;
}

export interface EmploymentRecord {
  id?: string;
  organizationName: string;
  position: string;
  duration?: string;
  responsibilities?: string;
}

export interface CandidateFormValues {
  // Basic Information
  positionAppliedFor: string;
  fullName: string;
  email: string;
  phone: string;
  noticePeriod: string;
  joiningDate: string;
  currentSalary: string;
  expectedSalary: string;
  reasonForLeaving: string;
  comfortableEveningShift: "yes" | "no" | "";
  cvFile: FileList | null;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedInUrl: string;
  workedWithUsBefore: "yes" | "no" | "";
  hasReference: "yes" | "no" | "";
  referenceName: string;
  referenceRelationship: string;
  yearsOfExperience: string;

  // Educational Record
  educationHistory: EducationRecord[];

  // Employment Record
  employmentHistory: EmploymentRecord[];
}

export const EXPERIENCE_OPTIONS = [
  "Fresh / Entry Level",
  "Less than 1 Year",
  "1 - 2 Years",
  "2 - 4 Years",
  "4 - 6 Years",
  "6 - 8 Years",
  "8+ Years",
];

export const NOTICE_PERIOD_OPTIONS = [
  "Immediate",
  "15 Days",
  "1 Month",
  "2 Months",
  "3 Months or more",
];

export const POSITION_OPTIONS = [
  "Frontend Developer (React / Next.js)",
  "Backend Developer (Node.js / Python)",
  "Full Stack Engineer",
  "UI/UX Designer",
  "Mobile App Developer (React Native / Flutter)",
  "DevOps Engineer",
  "QA / Test Automation Engineer",
  "Project Manager",
  "Other",
];
