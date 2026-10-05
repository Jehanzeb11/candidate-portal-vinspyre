"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  FileUp,
  ChevronDown,
  ChevronUp,
  Check,
  Briefcase,
  Calendar,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ClipboardCheck,
  Lock,
  Clock,
  MapPin,
  Video,
  FileCheck,
  FileText
} from "lucide-react"
import { useAuthStore } from "@/features/auth/store"
import { useCandidateProfile } from "@/features/auth/hooks/use-candidate-profile"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CandidateDocumentUpload } from "@/components/documents/CandidateDocumentUpload"
import { OfferAcceptanceModal } from "@/components/offer/OfferAcceptanceModal"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useOfferToken } from "@/hooks/useOfferToken"
import { OnboardingSection } from "@/features/onboarding/components/OnboardingSection"
import { cn } from "@/utils/cn"
import Link from "next/link"
import vpImg from "@/assets/vp-apply.png"
import Image from "next/image"
import { TeamNoteSidebar } from "@/components/shared/TeamNoteSidebar"


const stageDescriptions: Record<string, string> = {
  applied: "Your application has been submitted and is under review.",
  approval: "HR is reviewing your application details.",
  assessment: "Complete your skills and technical evaluation.",
  interview: "One or more interview rounds to be scheduled.",
  offer: "An offer letter has been extended to you.",
  documents: "Submit required documents to proceed.",
  onboarding: "Welcome aboard — complete your onboarding formalities.",
}

// ─── Recruitment Tracker ─────────────────────────────────────────────────────

function RecruitmentTracker({ onOpenOfferModal }: { onOpenOfferModal: (token?: string) => void }) {
  const router = useRouter()
  const { refetch } = useCandidateProfile()
  const profile = useAuthStore((s) => s.profile)

  const recruitment = profile?.recruitmentProgress
  const applications = profile?.jobApplications ?? []
  const firstName = profile?.firstName?.split(" ")[0] || "there"
  const hasDocumentSubmission = (profile?.candidateDocumentSubmissions ?? []).some(
    (d) => d.status === "submitted" || d.status === "reviewed"
  )

  const [docsOpen, setDocsOpen] = useState(false)
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [onboardingWelcomeOpen, setOnboardingWelcomeOpen] = useState(
    () => recruitment?.currentStage === "onboarding"
  )

  useEffect(() => {
    if (recruitment?.currentStage === "onboarding") {
      setOnboardingWelcomeOpen(true)
    }
  }, [recruitment?.currentStage])

  if (!recruitment) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[32px] border border-border bg-card p-12 text-center">
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

  const app = applications[0];
  const appliedDate = app?.createdAt
    ? `Applied ${new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "Applied Sep 29, 2026"

  const activeStageIndex = (() => {
    const active = stages.findIndex(s => s.status === 'active')
    if (active !== -1) return active
    const locked = stages.findIndex(s => s.status === 'locked')
    if (locked !== -1) return locked
    // fallback: last completed stage
    const lastDone = stages.map((s, i) => s.status === 'done' || s.status === 'submitted' ? i : -1).filter(i => i !== -1)
    return lastDone.length ? lastDone[lastDone.length - 1] : 0
  })()
  const progressLineWidth = Math.max(0, (activeStageIndex / (stages.length - 1)) * 100)

  return (
    <div className="space-y-6">
      {/* ── Header card (Dark Blue) ── */}
      <div className="rounded-[32px] text-white p-6 sm:p-8 relative overflow-hidden" style={{ background: 'linear-gradient(112deg, #101F45 8.57%, #172B5A 63.26%, #1C356B 91.43%)' }}>
        {/* Background shapes */}
        <div className="absolute right-0 top-0 w-[400px] h-[400px] border border-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute right-0 top-0 w-[500px] h-[500px] border border-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute right-0 top-0 w-[300px] h-[300px] border border-white/5 rounded-full -translate-y-1/2 translate-x-1/3 bg-white/5"></div>

        <div className="flex items-start justify-between relative z-10 mb-6 sm:mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white text-primary text-[11px] font-bold tracking-wide">
            {recruitment.currentStatus === 'active' && recruitment.currentStage === 'assessment' ? 'Assessment Active' :
              recruitment.currentStatus === 'active' && recruitment.currentStage === 'documents' && hasDocumentSubmission ? 'Documents Submitted' :
              recruitment.currentStatus === 'active' ? 'Active Application' : 'In Progress'}
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 sm:mb-8">
          <div className="min-w-0">
            <p className="text-pink-400 text-[10px] font-bold tracking-widest uppercase mb-2">Your Application</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-1 break-words">{app?.positionAppliedFor ?? "Designer Editor"}</h2>
            <p className="text-white/60 text-sm">Design & Creative - Full-time</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-4xl sm:text-5xl font-bold">{progressPercent}<span className="text-2xl sm:text-3xl text-white/70 ml-0.5">%</span></div>
            <p className="text-white/60 text-sm font-medium mt-1">Completed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 w-full h-2 rounded-full bg-white/10 mb-6 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{appliedDate}</span>
          </div>
          <button className="flex items-center gap-2 hover:text-white transition-colors font-medium text-left sm:text-right">
            Your journey is moving forward <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Stage stepper (The Big Picture) ── */}
      <div className="rounded-[32px] border border-border bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-pink-500 text-[10px] font-bold tracking-widest uppercase mb-1">The Big Picture</p>
            <h3 className="text-xl font-bold text-[#1a2342]">Your recruitment journey</h3>
          </div>
          <div className="text-sm text-muted-foreground font-medium hidden sm:block">
            {activeStageIndex + 1} of {stages.length} stages
          </div>
        </div>

        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex min-w-[700px] items-start justify-between relative">
            {/* Main connecting line background */}
            <div className="absolute top-5 left-[48px] right-[48px] h-[2px] bg-gray-100" />

            {/* Active Line Overlay */}
            <div
              className="absolute top-5 left-[48px] h-[2px] bg-[#DF2767] z-0 transition-all duration-700 ease-out"
              style={{ width: `calc((100% - 96px) * ${progressLineWidth} / 100)` }}
            />

            {stages.map((stage, idx) => {
              const isSubmitted = stage.key === "documents" && stage.status === "submitted"
              const isCompleted = (stage.status === "done") || (stage.status === "submitted" && !isSubmitted)
              const isCurrent = stage.status === "active" || isSubmitted
              const isLocked = stage.status === "locked"

              return (
                <div key={stage.key} className="flex flex-col items-center gap-3 relative z-10 w-24">
                  {/* Node */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300",
                      isCompleted
                        ? "bg-[#DF2767] text-white"
                        : isCurrent
                          ? "bg-white text-[#DF2767] border-2 border-[#DF2767] shadow-[0_0_0_4px_#FBEBF1]"
                          : isLocked
                            ? "bg-[#F4F5F7] text-gray-400 border border-gray-200"
                            : "bg-[#F4F5F7] text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : isSubmitted ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#DF2767] animate-pulse" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                    )}
                  </div>

                  <div className="text-center">
                    <p className={cn(
                      "text-[13px] font-semibold mb-1",
                      isCompleted || isCurrent ? "text-[#1a2342]" : "text-[#9CA3AF]"
                    )}>
                      {stage.label}
                    </p>
                    <p className={cn(
                      "text-[11px] font-medium",
                      isCurrent ? "text-[#DF2767]" : "text-[#BDBDBD]"
                    )}>
                      {isCompleted
                        ? "Completed"
                        : isCurrent && stage.key === "documents" && hasDocumentSubmission
                          ? "Submitted"
                          : isCurrent
                            ? "In Progress"
                            : isLocked
                              ? "Locked"
                              : "Upcoming"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Current stage action card ── */}
      {recruitment.currentStage === "assessment" && applications[0] ? (
        <div className={cn("rounded-[24px] border p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden", recruitment.currentStatus === 'locked' ? "bg-gray-50 border-gray-200" : "bg-pink-50 border-primary/20")}>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-pink-500/10">
            {recruitment.currentStatus === 'locked' ? (
              <Lock className="h-8 w-8 text-gray-400" />
            ) : (
              <ClipboardCheck className="h-8 w-8 text-pink-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-[10px] font-bold tracking-widest uppercase mb-1.5", recruitment.currentStatus === 'locked' ? "text-gray-500" : "text-pink-500")}>Current Stage</p>
            <h3 className="text-xl font-bold text-[#1a2342] mb-1.5">Technical assessment</h3>
            <p className="text-sm text-[#1a2342]/70 font-medium">
              {recruitment.currentStatus === 'locked' ? recruitment.message || "Assessment is currently locked." : "Show us how you think. Complete your technical evaluation to move forward."}
            </p>
          </div>
          {(recruitment.currentStatus === 'active' || recruitment.currentStatus === 'locked') && <Button
            onClick={() => router.push(`/assessment/${applications[0].id}`)}
            disabled={recruitment.currentStatus !== 'active'}
            className={cn("w-full md:w-auto font-bold text-sm", recruitment.currentStatus !== 'active' ? "" : "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02]")}
            variant={recruitment.currentStatus !== 'active' ? "outline" : "default"}
          >
            {recruitment.currentStatus !== 'active' ? "Locked" : <>Start Assessment <ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>}
        </div>
      ) : recruitment.currentStage === "interview" ? (
        <div className="rounded-[24px] border border-primary/20 bg-pink-50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute right-[-40px] top-[-40px] w-[160px] h-[160px] bg-pink-100/60 rounded-full pointer-events-none" />
          <div className="absolute right-[60px] bottom-[-50px] w-[100px] h-[100px] bg-pink-100/40 rounded-full pointer-events-none" />

          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-pink-500/10 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <div className="flex-1 relative z-10 min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5 text-pink-500">Current Stage</p>
            <h3 className="text-xl font-bold text-[#1a2342] mb-1.5">Your interview is coming up</h3>
            <p className="text-sm text-[#1a2342]/70 font-medium">
              Your conversation with our team is scheduled. We can&#39;t wait to meet you.
            </p>
          </div>

          <Button
            onClick={() => setInterviewModalOpen(true)}
            className="relative z-10 font-bold text-sm bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] gap-2 whitespace-nowrap w-full md:w-auto"
          >
            View Details <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : recruitment.currentStage === "offer" ? (
        <div className="rounded-[24px] border border-pink-100 bg-[#fff6f8] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-pink-50">
            <FileCheck className="h-8 w-8 text-[#ff3870]" strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold tracking-widest uppercase mb-1.5 text-[#ff3870]">Current Stage</p>
            <h3 className="text-[19px] text-[#2c3246] mb-1.5">Congratulations {firstName}, You're Our Top 10% Candidate</h3>
            <p className="text-[13px] text-[#8e98a8]">
              Please Find Your Offer Letter
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 relative z-10 w-full md:w-auto">
            <Button
              onClick={() => onOpenOfferModal(profile?.offerAccess?.activeOfferId || undefined)}
              className="bg-white hover:bg-slate-50 text-[#ff3870] border-0 shadow-sm rounded-xl font-bold transition-all h-[44px] px-6 text-[13px]"
            >
              Accept Offer <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              onClick={() => onOpenOfferModal(profile?.offerAccess?.activeOfferId || undefined)}
              className="bg-[#e4326d] hover:bg-[#d02960] text-white rounded-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] font-bold h-[44px] px-6 text-[13px]"
            >
              View Offer Letter <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : recruitment.currentStage === "documents" ? (
        (() => {
          const documentsStage = stages.find((s) => s.key === "documents")
          const isDocsDone = documentsStage?.status === "done" || documentsStage?.status === "submitted"
          const canUpload = profile?.offerAccess?.canUploadDocuments ?? true

          if (isDocsDone || !canUpload) {
            return (
              <div className="rounded-[24px] border border-primary bg-primary/5 px-6 py-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                  Current Stage · {recruitment.currentStageLabel}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stageDescriptions[recruitment.currentStage] || recruitment.message}
                </p>
              </div>
            )
          }

          return (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-pink-100 bg-[#fff6f8] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-pink-50">
                  <FileText className="h-8 w-8 text-[#ff3870]" strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold tracking-widest uppercase mb-1.5 text-[#ff3870]">Current Stage</p>
                  <h3 className="text-[19px] text-[#2c3246] mb-1.5">Upload your documents</h3>
                  <p className="text-[13px] text-[#8e98a8]">
                    We just need a few documents to prepare your joining.
                  </p>
                </div>

                <div className="flex mt-4 md:mt-0 relative z-10 w-full md:w-auto">
                  <Link
                    href="/documents"
                    className="bg-[#e4326d] hover:bg-[#d02960] flex items-center justify-center gap-2 text-white rounded-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] font-bold h-[44px] px-6 text-[13px] w-full sm:w-auto"
                  >
                    View Documents <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {docsOpen && (
                <div className="rounded-[24px] border border-border overflow-hidden bg-white">
                  <CandidateDocumentUpload
                    onSuccess={() => { setDocsOpen(false); void refetch() }}
                  />
                </div>
              )}
            </div>
          )
        })()
      ) : (
        recruitment.currentStage && (
          <div className="rounded-[24px] border border-primary bg-primary/5 px-6 py-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              Current Stage · {recruitment.currentStageLabel}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stageDescriptions[recruitment.currentStage] || recruitment.message}
            </p>
          </div>
        )
      )}


      {/* ── Onboarding ── */}
      {recruitment.currentStage === "onboarding" && (
        <div className="rounded-[24px] overflow-hidden">
          <OnboardingSection />
        </div>
      )}

      {/* ── Bottom Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Application details */}
        <div className="rounded-[24px] border border-border bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-[#1a2342] text-lg">Application details</h3>
            <Link href={"/profile"} className="text-pink-500 text-xs font-bold hover:text-pink-600 flex items-center gap-1 transition-colors">
              View profile <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-400 font-medium">Position applied</span>
              <span className="text-sm font-bold text-[#1a2342] text-right break-words">{app?.positionAppliedFor ?? "Designer Editor"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-400 font-medium">Application date</span>
              <span className="text-sm font-bold text-[#1a2342]">Sep 29, 2026</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-sm text-gray-400 font-medium">Application ID</span>
              <span className="text-sm font-bold text-[#1a2342]">VSP-CAN-2048</span>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-[24px] border border-border bg-white p-6 sm:p-8">
          <h3 className="font-bold text-[#1a2342] text-lg mb-8">Recent activity</h3>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", recruitment.currentStatus === 'locked' ? "bg-gray-50" : "bg-pink-50")}>
                {recruitment.currentStatus === 'locked' ? (
                  <Lock className="h-5 w-5 text-gray-500" />
                ) : (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </div>
              <div className="flex-1 pt-0.5 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-bold text-[#1a2342]">
                    {recruitment.currentStatus === 'locked' ? "Assessment locked" : "Assessment unlocked"}
                  </p>
                  <span className="text-[11px] font-medium text-gray-400">Today</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {recruitment.currentStatus === 'locked' ? "Awaiting HR approval to begin" : "Your next step is ready to begin"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 pt-0.5 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-bold text-[#1a2342]">Application approved</p>
                  <span className="text-[11px] font-medium text-gray-400">Sep 29</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Our team moved your application forward</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Onboarding Welcome Modal ── */}
      <Dialog open={onboardingWelcomeOpen} onOpenChange={setOnboardingWelcomeOpen}>
        <DialogContent showCloseButton className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 flex flex-col shadow-2xl border-0">
          {/* Icon */}
          <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="h-7 w-7 text-[#ff3870]" strokeWidth={1.75} />
          </div>

          {/* Label */}
          <p className="text-[10px] font-extrabold tracking-widest text-[#ff3870] uppercase mb-2">
            It&apos;s Official
          </p>

          {/* Title */}
          <DialogTitle className="text-2xl font-extrabold text-[#0f172a] text-left mb-3">
            Welcome to Vinspyre 🎉
          </DialogTitle>

          {/* Subtitle */}
          <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
            Congratulations, {firstName}. We&apos;re so excited to have you join the team. Your next chapter is just around the corner.
          </p>

          {/* Joining Date */}
          {app?.earliestAvailableJoiningDate && (
            <div className="w-full bg-slate-50 rounded-2xl px-5 py-4 flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-[#ff3870]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">
                  Your Joining Date
                </p>
                <p className="text-sm font-bold text-[#0f172a]">
                  {new Date(app.earliestAvailableJoiningDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={() => setOnboardingWelcomeOpen(false)}
            className="w-full h-[52px] bg-[#e4326d] hover:bg-[#d02960] text-white font-bold text-[15px] rounded-2xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] gap-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>

      {/* Interview Details Modal */}
      <Dialog open={interviewModalOpen} onOpenChange={setInterviewModalOpen}>
        <DialogContent showCloseButton className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 flex flex-col shadow-2xl border-0">
          <div className="w-14 h-14 bg-pink-100/50 rounded-2xl flex items-center justify-center mb-6">
            <Video className="h-6 w-6 text-pink-500" strokeWidth={2} />
          </div>

          <p className="text-[10px] font-extrabold tracking-widest text-[#ff3870] uppercase">
            Upcoming Interview
          </p>

          <DialogTitle className="text-2xl font-extrabold text-[#0f172a] text-left">
            Let's get to know each other.
          </DialogTitle>

          <p className="text-[#94a3b8] text-sm leading-relaxed px-2">
            We're looking forward to meeting you, {firstName}. Here are the details for your upcoming interview.
          </p>

          <div className="w-full h-px bg-slate-100 mb-3" />

          <div className="w-full flex flex-col gap-6 mb-8 text-left pl-4">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-1">Date</p>
                <p className="text-sm font-semibold text-[#0f172a]">October 5, 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-1">Time</p>
                <p className="text-sm font-semibold text-[#0f172a]">10:30 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-1">Location</p>
                <p className="text-sm font-semibold text-[#0f172a]">Vinspyre Office</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setInterviewModalOpen(false)}
          >
            <span>Got it</span>
            <Check className="h-4 w-4 stroke-[3]" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 pb-12 max-w-6xl mx-auto mt-6">
      <div className="flex gap-6 mb-8">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-[300px] w-full rounded-[32px]" />
      <Skeleton className="h-48 w-full rounded-[32px]" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { isLoading } = useCandidateProfile()
  const profile = useAuthStore((s) => s.profile)
  const { showOfferModal, offerToken, openOfferModal, closeOfferModal, handleOfferAcceptSuccess } = useOfferToken()

  if (isLoading) return <DashboardSkeleton />

  const firstName = profile?.firstName ? profile.firstName.split(" ")[0] : "Roary";

  return (
    <div className="pb-12 max-w-full mx-auto flex flex-col lg:flex-row gap-8 mt-4 sm:mt-4 px-4 sm:px-6">
      {/* ── Left Column (Main Content) ── */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-primary flex items-center justify-center overflow-hidden bg-muted">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="object-cover h-full w-full" />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">{firstName.charAt(0)}</span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 rounded-full border-[3px] border-white"></div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#1a2342] uppercase">Welcome Back</span>
              <div className="h-px w-8 sm:w-12 bg-[#1a2342]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a2342] tracking-tight">
              Hi, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
              Here's where you are in your recruitment journey.
            </p>
          </div>
        </div>

        {/* Recruitment Tracker */}
        <RecruitmentTracker onOpenOfferModal={openOfferModal} />
      </div>

      {/* ── Right Column (Sidebar) ── */}
      <div className="w-full lg:w-[300px] shrink-0">
        <div className="pointer-events-none relative -top-8 hidden lg:block -mb-4">
          <Image src={vpImg} alt="Vinspyre" className="h-[140px] lg:h-[190px] w-auto object-contain" />
        </div>

        <TeamNoteSidebar firstName={firstName} />
      </div>

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
