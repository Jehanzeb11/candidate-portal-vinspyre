"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Play,
  FileUp,
  ChevronDown,
  ChevronUp,
  CheckCheck,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/store"
import { useCandidateProfile } from "@/features/auth/hooks/use-candidate-profile"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CandidateDocumentUpload } from "@/components/documents/CandidateDocumentUpload"
import { OfferAcceptanceModal } from "@/components/offer/OfferAcceptanceModal"
import { useOfferToken } from "@/hooks/useOfferToken"
import { OnboardingSection } from "@/features/onboarding/components/OnboardingSection"
import { cn } from "@/utils/cn"

// ─── Stage config ────────────────────────────────────────────────────────────

const STAGES = [
  { key: "applied",    label: "Applied",    icon: "✦" },
  { key: "approval",   label: "Approval",   icon: "✦" },
  { key: "assessment", label: "Assessment", icon: "✦" },
  { key: "interview",  label: "Interview",  icon: "✦" },
  { key: "offer",      label: "Offer",      icon: "✦" },
  { key: "documents",  label: "Documents",  icon: "✦" },
  { key: "onboarding", label: "Onboarding", icon: "✦" },
] as const

const stageDescriptions: Record<string, string> = {
  applied:    "Your application has been submitted and is under review.",
  approval:   "HR is reviewing your application details.",
  assessment: "Complete your skills and technical evaluation.",
  interview:  "One or more interview rounds to be scheduled.",
  offer:      "An offer letter has been extended to you.",
  documents:  "Submit required documents to proceed.",
  onboarding: "Welcome aboard — complete your onboarding formalities.",
}

// ─── Recruitment Tracker ─────────────────────────────────────────────────────

function RecruitmentTracker() {
  const router = useRouter()
  const { refetch } = useCandidateProfile()
  const profile = useAuthStore((s) => s.profile)
  const [docsOpen, setDocsOpen] = useState(false)

  const recruitment = profile?.recruitmentProgress
  const applications = profile?.jobApplications ?? []

  if (!recruitment) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No active application</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Apply for a position to start your recruitment journey.
          </p>
        </div>
      </div>
    )
  }

  const progressPercent = recruitment.progressPercent ?? 0
  const stages = recruitment.stages ?? []

  const currentStageIndex = stages.findIndex((s) => s.status === "active")

  return (
    <div className="space-y-4">
      {/* ── Header card ── */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">
              {applications[0]?.positionAppliedFor ?? "Your Application"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {applications[0]?.createdAt
                ? `Applied ${new Date(applications[0].createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}`
                : "Recruitment in progress"}
            </p>
          </div>

          <StatusPill status={recruitment.currentStatus} />
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Overall progress</span>
            <span className="text-[11px] font-semibold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Stage stepper ── */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 overflow-x-auto">
        <div className="flex min-w-max items-start">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === "done" || stage.status === "submitted"
            const isCurrent = stage.status === "active"
            const isPending = stage.status === "pending"

            return (
              <div key={stage.key} className="flex items-start flex-1 relative">
                {/* Connector */}
                {idx > 0 && (
                  <div
                    className={cn(
                      "absolute top-4 right-1/2 h-px w-full -translate-y-px",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                )}

                <div className="flex flex-col items-center w-full gap-2">
                  {/* Node */}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-muted text-primary ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCheck className="h-3.5 w-3.5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "whitespace-nowrap text-[10px] font-medium",
                      isCompleted
                        ? "text-primary"
                        : isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>

                  {/* Micro status */}
                  <span className={cn(
                    "text-[9px] font-semibold uppercase tracking-wide",
                    isCompleted ? "text-primary/70" :
                    isCurrent ? "text-amber-500" :
                    "text-transparent"
                  )}>
                    {isCompleted ? "Done" : isCurrent ? "Active" : "—"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Current stage info ── */}
      {recruitment.currentStage && (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            Current Stage · {recruitment.currentStageLabel}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stageDescriptions[recruitment.currentStage] || recruitment.message}
          </p>
        </div>
      )}

      {/* ── Assessment CTA ── */}
      {recruitment.currentStage === "assessment" && applications[0] && (() => {
        const assessmentStage = stages.find((s) => s.key === "assessment")
        const isAssessmentDone = assessmentStage?.status === "done" || assessmentStage?.status === "submitted"
        return !isAssessmentDone ? (
          <Button
            onClick={() => router.push(`/assessment/${applications[0].id}`)}
            className="w-full sm:w-auto gap-2"
          >
            <Play className="h-4 w-4" />
            Start Assessment
          </Button>
        ) : null
      })()}

      {/* ── Documents upload ── */}
      {recruitment.currentStage === "documents" && (() => {
        const documentsStage = stages.find((s) => s.key === "documents")
        const isDocsDone = documentsStage?.status === "done" || documentsStage?.status === "submitted"
        const canUpload = profile?.offerAccess?.canUploadDocuments ?? true
        return !isDocsDone && canUpload ? (
          <div className="space-y-3">
            <Button
              variant={docsOpen ? "secondary" : "default"}
              className="w-full sm:w-auto gap-2"
              onClick={() => setDocsOpen((prev) => !prev)}
            >
              <FileUp className="h-4 w-4" />
              Upload Documents
              {docsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {docsOpen && (
              <div className="rounded-2xl border border-border overflow-hidden">
                <CandidateDocumentUpload
                  onSuccess={() => { setDocsOpen(false); void refetch() }}
                />
              </div>
            )}
          </div>
        ) : null
      })()}

      {/* ── Onboarding ── */}
      {recruitment.currentStage === "onboarding" && (
        <OnboardingSection />
      )}
    </div>
  )
}

// ─── Status pill ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
        status === "active"
          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          : status === "completed"
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" ? "bg-blue-500 animate-pulse" :
          status === "completed" ? "bg-emerald-500" :
          "bg-amber-500"
        )}
      />
      {status === "active" ? "In Progress" : status === "completed" ? "Completed" : "Pending"}
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 pb-12 max-w-3xl mx-auto">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      {/* Stepper card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Stage info */}
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { isLoading } = useCandidateProfile()
  const profile = useAuthStore((s) => s.profile)
  const { showOfferModal, offerToken, closeOfferModal, handleOfferAcceptSuccess } = useOfferToken()

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 pb-12 max-w-8xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Welcome back{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's where you are in your recruitment journey.
        </p>
      </div>

      {/* Recruitment Tracker */}
      <RecruitmentTracker />

      {/* Offer Acceptance Modal */}
      <OfferAcceptanceModal
        isOpen={showOfferModal}
        onClose={closeOfferModal}
        offerToken={offerToken}
        onAcceptSuccess={handleOfferAcceptSuccess}
      />
    </div>
  )
}
