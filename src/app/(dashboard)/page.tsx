"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Play,
  FileUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/store"
import { useCandidateProfile } from "@/features/auth/hooks/use-candidate-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentsUploadSection } from "@/components/documents/DocumentsUploadSection"

// ─── Stage icon mapping ─────────────────────────────────────────────────────

const stageIcons: Record<string, React.ReactNode> = {
  applied: "📝",
  approval: "✅",
  assessment: "📚",
  interview: "👤",
  offer: "🎁",
  documents: "📄",
  onboarding: "🎉",
}

const stageDescriptions: Record<string, string> = {
  applied: "Application submitted and under review",
  approval: "HR is reviewing your application",
  assessment: "Skills and technical evaluation",
  interview: "One or more interview rounds",
  offer: "Offer letter extended to you",
  documents: "Submit required onboarding documents",
  onboarding: "Welcome aboard! Joining formalities",
}

// ─── Recruitment Tracker Card ──────────────────────────────────────────────

function RecruitmentTracker() {
  const router = useRouter()
  const { isLoading, refetch } = useCandidateProfile()
  const profile = useAuthStore((s) => s.profile)
  const [docsOpen, setDocsOpen] = useState(false)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const recruitment = profile?.recruitmentProgress
  const applications = profile?.jobApplications ?? []

  if (!recruitment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-sm font-medium text-muted-foreground">
            No active applications found. Apply for a position to start your recruitment journey.
          </p>
        </CardContent>
      </Card>
    )
  }

  const progressPercent = recruitment.progressPercent ?? 0
  const stages = recruitment.stages ?? []

  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <CardTitle className="text-base font-bold">
              {applications[0]?.positionAppliedFor ?? "Your Application"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {applications[0]?.createdAt
                ? `Applied ${new Date(applications[0].createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}`
                : "Application status"}
            </p>
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize shrink-0 ${
              recruitment.currentStatus === "active"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                : recruitment.currentStatus === "completed"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
            }`}
          >
            {recruitment.currentStatus === "active" && "🔄 In Progress"}
            {recruitment.currentStatus === "completed" && "🎉 Completed"}
            {recruitment.currentStatus === "pending" && "⏳ Pending"}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-6">
        {/* Stage tracker */}
        <div className="flex items-start min-w-full overflow-x-auto pb-4">
          {stages.map((stage, idx) => {
            const icon = stageIcons[stage.key] || "◯"
            const isCurrent = stage.status === "active"
            const isCompleted = stage.status === "done" || stage.status === "submitted"

            return (
              <div key={stage.key} className="flex flex-col items-center flex-1 relative shrink-0 min-w-max">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 transition-colors ${
                      isCompleted || isCurrent ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}

                {/* Circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isCurrent
                      ? "bg-primary/10 text-primary shadow-lg ring-4 ring-primary/10"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {icon}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                  )}
                </div>

                {/* Label */}
                <p
                  className={`mt-2.5 text-xs font-semibold text-center whitespace-nowrap transition-colors ${
                    isCompleted
                      ? "text-primary"
                      : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </p>

                {/* Status */}
                <div className="mt-1 h-4">
                  {isCompleted && <span className="text-[10px] text-primary font-medium">Done</span>}
                  {isCurrent && <span className="text-[10px] text-amber-500 font-semibold">Active</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Assessment button - show if in assessment stage and not completed/submitted */}
        {recruitment.currentStage === "assessment" && applications[0] && (() => {
          const assessmentStage = stages.find((s) => s.key === "assessment")
          const isAssessmentDone = assessmentStage?.status === "done" || assessmentStage?.status === "submitted"
          return !isAssessmentDone ? (
            <div className="mt-6 flex gap-2">
              <Button
                size="sm"
                onClick={() => router.push(`/assessment/${applications[0].id}`)}
                className="gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                Start Assessment
              </Button>
            </div>
          ) : null
        })()}

        {/* Documents upload — show if in documents stage and not yet submitted */}
        {recruitment.currentStage === "documents" && (() => {
          const documentsStage = stages.find((s) => s.key === "documents")
          const isDocsDone = documentsStage?.status === "done" || documentsStage?.status === "submitted"
          return !isDocsDone ? (
            <div className="mt-6 space-y-3">
              <Button
                size="sm"
                variant={docsOpen ? "secondary" : "default"}
                className="gap-1.5"
                onClick={() => setDocsOpen((prev) => !prev)}
              >
                <FileUp className="h-3.5 w-3.5" />
                Upload Documents
                {docsOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>

              {docsOpen && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <DocumentsUploadSection onSuccess={() => { setDocsOpen(false); void refetch() }} />
                </div>
              )}
            </div>
          ) : null
        })()}

        {/* Current stage description */}
        {recruitment.currentStage && (
          <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {stageIcons[recruitment.currentStage]}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Current Stage: {recruitment.currentStageLabel}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stageDescriptions[recruitment.currentStage] || recruitment.message}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Welcome skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Card skeleton */}
      <Card>
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-6">
          {/* Stage nodes */}
          <div className="flex items-start gap-0 min-w-150">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3 w-14 mt-2.5" />
                <Skeleton className="h-2.5 w-8 mt-1" />
              </div>
            ))}
          </div>
          {/* Current stage panel */}
          <Skeleton className="h-16 w-full rounded-xl mt-6" />
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { isLoading } = useCandidateProfile()
  const profile = useAuthStore((s) => s.profile)

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Welcome back{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your recruitment journey below.
        </p>
      </div>

      {/* Recruitment Tracker */}
      <RecruitmentTracker />
    </div>
  )
}
