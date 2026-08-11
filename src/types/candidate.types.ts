// ---------------------------------------------------------------------------
// Candidate profile types
// Shape returned by GET /recruitment/candidate-profile
// ---------------------------------------------------------------------------

export interface CandidateEducationRecord {
  certificateOrDegree: string
}

export interface CandidateEmploymentRecord {
  organizationName: string
  position: string
}

export interface CandidateJobApplication {
  id: string
  candidateProfileId: string
  jobId: string | null
  fullName: string
  email: string
  phone?: string
  portfolioLink?: string
  linkedInProfile?: string
  workedWithUsBefore?: boolean
  referenceName?: string
  referenceRelationship?: string
  yearsOfExperience?: string
  educationalRecords?: CandidateEducationRecord[]
  employmentRecords?: CandidateEmploymentRecord[]
  positionAppliedFor?: string
  noticePeriod?: string
  earliestAvailableJoiningDate?: string
  currentSalaryPkr?: number
  expectedMonthlySalaryPkr?: number
  reasonForLeavingLastJob?: string
  comfortableEveningShift?: boolean
  cv?: string
  cvUrl?: string
  coverLetter?: string
  status?: string
  reviewedByUserId?: string | null
  reviewedAt?: string | null
  rejectionReason?: string | null
  isDeleted?: boolean
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CandidateProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  portfolioLink?: string
  linkedInProfile?: string
  workedWithUsBefore?: boolean
  referenceName?: string
  referenceRelationship?: string
  yearsOfExperience?: string
  educationalRecords?: CandidateEducationRecord[]
  employmentRecords?: CandidateEmploymentRecord[]
  createdByUserId?: string | null
  jobApplications?: CandidateJobApplication[]
  createdAt?: string
  updatedAt?: string
}

// ---------------------------------------------------------------------------
// Assessment types
// ---------------------------------------------------------------------------

export type AssessmentQuestionType = "mcq" | "free_input" | "fill_blank"

export interface AssessmentQuestion {
  id: string
  /** Determines how the question is rendered and scored */
  type: AssessmentQuestionType
  question: string
  skillTag?: string
  difficulty?: "easy" | "medium" | "hard"
  /** Only present when type === "mcq" or "fill_blank" */
  options?: string[]
  /** Index of correct option — only present when type === "mcq" */
  correctAnswer?: number
  explanation?: string
}

export interface Assessment {
  id: string
  candidateProfileId?: string
  jobApplicationId?: string
  matchedSkills?: string[]
  title?: string
  description?: string
  totalQuestions: number
  timeLimit?: number // minutes
  passingScore?: number // percentage — calculated from MCQ questions only
  questions: AssessmentQuestion[]
  status?: "pending" | "in_progress" | "completed"
  answers?: AssessmentAnswer[] | null
  score?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface AssessmentAnswer {
  questionId: string
  type: AssessmentQuestionType
  /** MCQ only — index of the selected option */
  selectedAnswerIndex?: number
  /** Free-input/fill_blank — candidate's typed response */
  freeTextAnswer?: string
}

export interface AssessmentSubmission {
  applicationId: string
  assessmentId: string
  answers: AssessmentAnswer[]
  /** Score percentage calculated from MCQ questions only */
  score: number
  passed: boolean
  submittedAt: string
}
