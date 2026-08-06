"use client"

import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Clock,
  ClipboardCheck,
  FileText,
  Gift,
  GraduationCap,
  Handshake,
  UserCheck,
  XCircle,
  Briefcase,
  Play,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/store"
import { useCandidateProfile } from "@/features/auth/hooks/use-candidate-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { CandidateJobApplication } from "@/types"

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  {
    key: "applied",
    label: "Applied",
    description: "Application submitted and under review",
    icon: FileText,
    statuses: ["pending", "applied", "received"],
  },
  {
    key: "approval",
    label: "Approval",
    description: "HR is reviewing your application",
    icon: ClipboardCheck,
    statuses: ["approved", "shortlisted", "reviewing"],
  },
  {
    key: "assessment",
    label: "Assessment",
    description: "Skills and technical evaluation",
    icon: GraduationCap,
    statuses: ["assessment", "test", "evaluation"],
  },
  {
    key: "interview",
    label: "Interview",
    description: "One or more interview rounds",
    icon: UserCheck,
    statuses: ["interview", "interviewing"],
  },
  {
    key: "offer",
    label: "Offer",
    description: "Offer letter extended to you",
    icon: Gift,
    statuses: ["offer", "offered"],
  },
  {
    key: "documents",
    label: "Documents",
    description: "Submit required onboarding documents",
    icon: Handshake,
    statuses: ["documents", "document_submission"],
  },
  {
    key: "onboarding",
    label: "Onboarding",
    description: "Welcome aboard! Joining formalities",
    icon: Briefcase,
    statuses: ["onboarding", "accepted", "hired"],
  },
] as const

type StepKey = (typeof STEPS)[number]["key"]

// ─── Derive current step from application status ──────────────────────────────

function getCurrentStep(status?: string): { stepIndex: number; rejected: boolean } {
  if (!status) return { stepIndex: 0, rejected: false }

  const s = status.toLowerCase()

  if (s === "rejected" || s === "declined") return { stepIndex: -1, rejected: true }

  for (let i = STEPS.length - 1; i >= 0; i--) {
    if ((STEPS[i].statuses as readonly string[]).includes(s)) {
      return { stepIndex: i, rejected: false }
    }
  }

  return { stepIndex: 0, rejected: false }
}

// ─── Step node ────────────────────────────────────────────────────────────────

function StepNode({
  step,
  index,
  currentIndex,
  rejected,
}: {
  step: (typeof STEPS)[number]
  index: number
  currentIndex: number
  rejected: boolean
}) {
  const Icon = step.icon
  const isCurrent = index === currentIndex && !rejected
  const isCompleted = index < currentIndex && !rejected

  return (
    <div className="flex flex-col items-center flex-1 relative">

      {/* Connector line — left */}
      {index > 0 && (
        <div
          className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-500 ${
            isCompleted || isCurrent ? "bg-primary" : "bg-border"
          }`}
        />
      )}

      {/* Icon bubble */}
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          rejected && isCurrent
            ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-950/40"
            : isCompleted
            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30"
            : isCurrent
            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20 ring-4 ring-primary/10"
            : "border-border bg-muted text-muted-foreground"
        }`}
      >
        {rejected && index === currentIndex ? (
          <XCircle className="h-5 w-5" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : isCurrent ? (
          <Icon className="h-5 w-5" />
        ) : (
          <Icon className="h-4 w-4 opacity-50" />
        )}

        {/* Pulse for current */}
        {isCurrent && !rejected && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
        )}
      </div>

      {/* Label */}
      <p
        className={`mt-2.5 text-xs font-semibold text-center leading-tight transition-colors ${
          isCompleted
            ? "text-primary"
            : isCurrent && !rejected
            ? "text-foreground"
            : rejected && index === currentIndex
            ? "text-red-500"
            : "text-muted-foreground"
        }`}
      >
        {step.label}
      </p>

      {/* Status chip */}
      <div className="mt-1 h-4">
        {isCompleted && (
          <span className="text-[10px] text-primary font-medium">Done</span>
        )}
        {isCurrent && !rejected && (
          <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" /> Active
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Application card ─────────────────────────────────────────────────────────

function ApplicationTracker({ application }: { application: CandidateJobApplication }) {
  const router = useRouter()
  const { stepIndex, rejected } = getCurrentStep(application.status)

  const completedCount = rejected ? 0 : stepIndex
  const progressPercent = Math.round((completedCount / (STEPS.length - 1)) * 100)

  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <CardTitle className="text-base font-bold">
              {application.positionAppliedFor ?? "Job Application"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applied {application.createdAt
                ? new Date(application.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })
                : "—"}
            </p>
          </div>

          {/* Overall status badge */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize shrink-0 ${
            rejected
              ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
              : stepIndex === STEPS.length - 1
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
          }`}>
            {rejected ? "Rejected" : stepIndex === STEPS.length - 1 ? "Hired 🎉" : "In Progress"}
          </span>
        </div>

        {/* Assessment button */}
        <div className="mb-3">
          <Button
            size="sm"
            onClick={() => router.push(`/assessment/${application.id}`)}
            className="gap-1.5 w-full sm:w-auto"
          >
            <Play className="h-3.5 w-3.5" />
            Start Assessment
          </Button>
        </div>

        {/* Progress bar */}
        {!rejected && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-8 pb-6 overflow-x-auto">
        {/* Step tracker */}
        <div className="flex items-start min-w-150">
          {STEPS.map((step, index) => (
            <StepNode
              key={step.key}
              step={step}
              index={index}
              currentIndex={stepIndex}
              rejected={rejected}
            />
          ))}
        </div>

        {/* Current step description */}
        {!rejected && stepIndex >= 0 && stepIndex < STEPS.length && (
          <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              {(() => { const Icon = STEPS[stepIndex].icon; return <Icon className="h-3.5 w-3.5 text-primary" /> })()}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Current Stage: {STEPS[stepIndex].label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {STEPS[stepIndex].description}
              </p>
            </div>
          </div>
        )}

        {/* Rejected state */}
        {rejected && (
          <div className="mt-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 px-4 py-3 flex items-start gap-3">
            <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-700 dark:text-red-400">Application Not Selected</p>
              {application.rejectionReason && (
                <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">
                  {application.rejectionReason}
                </p>
              )}
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
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-6">
          {/* Step nodes */}
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

  const applications = profile?.jobApplications ?? []

  return (
    <div className="space-y-6 pb-12 max-w-8xl mx-auto">

      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Welcome back{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your recruitment journey below.
        </p>
      </div>

      {/* Applications */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Briefcase className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No applications found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <ApplicationTracker key={app.id} application={app} />
          ))}
        </div>
      )}

    </div>
  )
}
