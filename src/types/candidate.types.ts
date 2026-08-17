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

export interface CandidateInterview {
  id: string
  candidateProfileId?: string
  jobApplicationId?: string
  candidateTestId?: string
  roundType?: string
  roundNumber?: number
  parentInterviewId?: string | null
  status?: string
  offerStatus?: string
  offerSentAt?: string | null
  offerCancelledAt?: string | null
  offerCancellationReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CandidateJobApplication {
  id: string
  candidateProfileId: string
  jobId: string | null
  fullName: string
  email: string
  phone?: string
  address?: string
  age?: number
  gender?: string
  maritalStatus?: string
  portfolioLink?: string
  linkedInProfile?: string
  highestEducation?: string
  workedWithUsBefore?: boolean
  referenceName?: string | null
  referenceRelationship?: string | null
  yearsOfExperience?: string
  educationalRecords?: CandidateEducationRecord[]
  employmentRecords?: CandidateEmploymentRecord[]
  positionAppliedFor?: string
  noticePeriod?: string
  earliestAvailableJoiningDate?: string
  currentSalaryPkr?: number
  expectedMonthlySalaryPkr?: number
  currentEmploymentStatus?: string
  jobSeekingStatus?: string
  reasonForLeavingLastJob?: string
  heardAboutOpportunity?: string
  comfortableEveningShift?: boolean
  cv?: string
  cvUrl?: string
  coverLetter?: string
  organizationName?: string
  positionDesignation?: string
  status?: string
  reviewedByUserId?: string | null
  reviewedAt?: string | null
  rejectionReason?: string | null
  interviewType?: string | null
  interviewDateTime?: string | null
  interviewLocation?: string | null
  interviewInstructions?: string | null
  isDeleted?: boolean
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

// ---------------------------------------------------------------------------
// Document submission types
// ---------------------------------------------------------------------------

export interface CandidateDocumentSubmission {
  id: string
  candidateProfileId: string
  candidateInterviewId: string
  documents: { cnic: string; payslip: string; bill: string } | string[] // Support both new structured format and legacy array format
  status: "submitted" | "reviewed" | "rejected"
  reviewedByUserId?: string | null
  reviewedAt?: string | null
  reviewNote?: string | null
  rejectionReason?: string | null
  submittedAt: string
  createdAt: string
  updatedAt: string
}

// Document upload types
export interface DocumentUploadPayload {
  cnic: File
  payslip: File
  bill: File
}

export interface DocumentUploadResponse {
  message: string
  id: string
}

// ---------------------------------------------------------------------------
// Offer access types
// ---------------------------------------------------------------------------

export interface OfferAccess {
  hasActiveOffer: boolean
  canUploadDocuments: boolean
  documentsTabEnabled: boolean
  activeOfferId: string | null
  activeOfferStatus: string | null
  offerSentAt: string | null
  offerCancelledAt: string | null
  offerCancellationReason: string | null
}

// ---------------------------------------------------------------------------
// Recruitment Progress types
// ---------------------------------------------------------------------------

export interface RecruitmentStage {
  key: string
  label: string
  status: "done" | "active" | "pending" | "submitted"
}

export interface RecruitmentProgress {
  currentStage: string
  currentStageLabel: string
  currentStatus: "active" | "pending" | "completed"
  progressPercent: number
  message: string
  stages: RecruitmentStage[]
}

// ---------------------------------------------------------------------------
// Onboarding types
// ---------------------------------------------------------------------------

export type OnboardingContentType = "video" | "document" | "article" | "quiz" | "link"
export type OnboardingAssignmentStatus = "pending" | "in_progress" | "completed"

export interface OnboardingContent {
  id: string
  title: string
  description?: string
  type: OnboardingContentType  // API uses "type" not "contentType"
  url?: string                 // API uses "url" not "contentUrl"
  playerUrl?: string
  playbackFormat?: string
  processingStatus?: string
  processingError?: string | null
  sourceFileName?: string | null
  processedAt?: string | null
  isRequired?: boolean
  isActive?: boolean
  createdByUserId?: string
  createdAt?: string
  updatedAt?: string
  // Legacy fields for backward compatibility
  contentType?: OnboardingContentType
  contentUrl?: string
  thumbnailUrl?: string
  durationSeconds?: number
  order?: number
}

export interface OnboardingAssignment {
  id: string
  onboardingId: string         // API uses this instead of candidateProfileId directly
  contentId: string
  content: OnboardingContent
  status: OnboardingAssignmentStatus
  progressPercent: number
  durationSeconds?: number | null
  watchedSeconds?: number | null
  lastPositionSeconds?: number | null
  viewCount?: number
  startedAt?: string | null
  lastOpenedAt?: string | null
  completedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CandidateOnboarding {
  id: string
  candidateProfileId: string
  assignments: OnboardingAssignment[]
  totalContent: number
  completedContent: number
  overallProgressPercent: number
  createdAt?: string
  updatedAt?: string
}

export interface OnboardingProgressPayload {
  progressPercent: number
  watchedSeconds?: number
  lastPositionSeconds?: number
  durationSeconds?: number
}

export interface OnboardingListResponse {
  success: boolean
  data: OnboardingAssignment[]
}

export interface CandidateProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  address?: string
  age?: number
  gender?: string
  maritalStatus?: string
  highestEducation?: string
  portfolioLink?: string
  linkedInProfile?: string
  workedWithUsBefore?: boolean
  referenceName?: string | null
  referenceRelationship?: string | null
  yearsOfExperience?: string
  educationalRecords?: CandidateEducationRecord[]
  employmentRecords?: CandidateEmploymentRecord[]
  createdByUserId?: string | null
  portalStatus?: string
  portalSuspendedAt?: string | null
  portalSuspendedReason?: string | null
  jobApplications?: CandidateJobApplication[]
  candidateTests?: { id: string; status?: string; violationCount?: number }[]
  candidateInterviews?: CandidateInterview[]
  candidateDocumentSubmissions?: CandidateDocumentSubmission[]
  candidateOnboardings?: CandidateOnboarding[]
  offerAccess?: OfferAccess
  recruitmentProgress?: RecruitmentProgress
  createdAt?: string
  updatedAt?: string
  isPasswordUpdated?: boolean
}

// ---------------------------------------------------------------------------
// Assessment types
// ---------------------------------------------------------------------------

export type AssessmentQuestionType = "mcq" | "free_input" | "fill_blank" | "descriptive"

export interface AssessmentQuestion {
  id: string
  /** Determines how the question is rendered and scored */
  type?: AssessmentQuestionType
  /** Alias for type field from API (maps to type internally) */
  questionType?: AssessmentQuestionType
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
  status?: "pending" | "in_progress" | "completed" | "submitted"
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
