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

export interface AssessmentQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation?: string
}

export interface Assessment {
  id: string
  title: string
  description: string
  totalQuestions: number
  timeLimit: number // minutes
  passingScore: number // percentage
  questions: AssessmentQuestion[]
}

export interface AssessmentAnswer {
  questionId: string
  selectedAnswerIndex: number
}

export interface AssessmentSubmission {
  applicationId: string
  assessmentId: string
  answers: AssessmentAnswer[]
  score: number
  passed: boolean
  submittedAt: string
}
