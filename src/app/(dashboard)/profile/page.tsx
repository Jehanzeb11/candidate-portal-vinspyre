"use client"

import {
  FileText,
  ExternalLink,
  ArrowRight,
  Check,
  Lock,
  Sparkles,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/store"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils/cn"
import Link from "next/link"
import Image from "next/image"
import vpImg from "@/assets/vp-apply.png"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount?: number | null) {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function humanize(str?: string | null) {
  if (!str) return "—"
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  className,
}: {
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
      <p className="text-[13px] font-semibold text-[#1a2342]">{value ?? "—"}</p>
    </div>
  )
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[20px] border border-gray-100 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[18px] font-extrabold text-[#1a2342]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="pb-12 px-4 sm:px-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[160px] w-full rounded-[24px]" />
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-[20px]" />
          ))}
        </div>
        <Skeleton className="w-[260px] h-[400px] rounded-[20px] shrink-0" />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)

  if (!profile) return <ProfileSkeleton />

  const application = profile.jobApplications?.[0]
  const recruitment = profile.recruitmentProgress
  const stages = recruitment?.stages ?? []
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.fullName || "—"
  const firstName = profile.firstName || profile.fullName?.split(" ")[0] || "there"
  const skills: string[] = (profile as any).skills ?? []
  const documents: { label: string; status: string }[] = (() => {
    const subs = profile.candidateDocumentSubmissions ?? []
    if (subs.length > 0) {
      return subs.map((s) => ({
        label: humanize((s as any).documentType ?? (s as any).type ?? "Document"),
        status: s.status ?? "submitted",
      }))
    }
    return []
  })()

  return (
    <div className="pb-16 px-4 sm:px-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-4">
          <p className="text-primary text-[14px] font-extrabold tracking-widest uppercase">Your Information</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1a2342] tracking-tight">My profile</h1>
          <p className="text-base font-medium text-muted-foreground">A complete view of your information and hiring journey.</p>
        </div>
        <div className="pointer-events-none hidden md:block -mt-2">
          <Image src={vpImg} alt="Vinspyre" className="h-[150px] w-auto object-contain" />
        </div>
      </div>

      {/* ── Hero Card (Dark) ── */}
      <div
        className="rounded-[24px] text-white p-6 sm:p-8 mb-6 relative overflow-hidden flex items-center justify-between gap-6"
        style={{ background: "linear-gradient(112deg, #101F45 8.57%, #172B5A 63.26%, #1C356B 91.43%)" }}
      >
        {/* Background shapes */}
        <div className="absolute right-0 top-0 w-[350px] h-[350px] border border-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute right-0 top-0 w-[450px] h-[450px] border border-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">
            {firstName}{" "}
            <span className="text-primary">{profile.lastName ?? ""}</span>
          </h2>
          <p className="text-white/60 text-sm font-medium mb-4">
            {application?.positionAppliedFor ?? "Applicant"}
            {application?.id && (
              <span className="ml-3 text-white/40">· VSP-CAN-{String(application.id).slice(-4).toUpperCase()}</span>
            )}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-[14px] font-semibold text-white">
            {recruitment?.currentStatus === "active" ? "Application in progress" :
              recruitment?.currentStatus === "locked" ? "Stage locked" :
                recruitment?.currentStatus === "completed" ? "Application complete" :
                  "Application in progress"}
          </div>
        </div>

        {/* Avatar */}
        <div className="relative z-10 shrink-0 hidden sm:block">
          <div className="h-20 w-20 sm:h-32 sm:w-32 rounded-full border-4 border-primary flex items-center justify-center overflow-hidden bg-white/10">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Profile" className="object-cover h-full w-full" />
            ) : (
              <span className="text-3xl font-bold text-white">{firstName.charAt(0)}</span>
            )}
          </div>
          <div className="absolute bottom-1 right-1 h-4 w-4 bg-emerald-400 rounded-full border-[3px] border-[#172B5A]" />
        </div>
      </div>

      {/* ── Two Column Layout ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Personal Information */}
          <SectionCard title="Personal information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Full Name" value={fullName} />
              <Field label="Email Address" value={profile.email} />
              <Field label="Phone Number" value={profile.phone} />
              <Field label="Address" value={application?.address} />
            </div>
          </SectionCard>

          {/* Professional Information */}
          {application && (
            <SectionCard title="Professional information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <Field label="Position Applied" value={application.positionAppliedFor} />
                <Field
                  label="Experience"
                  value={profile.yearsOfExperience ? `${humanize(profile.yearsOfExperience)}` : "—"}
                />
                <Field label="Current Organization" value={application.organizationName} />
                <Field
                  label="Current Salary"
                  value={
                    application.currentSalaryPkr
                      ? `${formatCurrency(application.currentSalaryPkr)} / year`
                      : "—"
                  }
                />
                {application.noticePeriod && (
                  <Field label="Notice Period" value={humanize(application.noticePeriod)} />
                )}
                {application.currentEmploymentStatus && (
                  <Field label="Employment Status" value={humanize(application.currentEmploymentStatus)} />
                )}
              </div>
            </SectionCard>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <SectionCard title="Skills & expertise">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-gray-100 text-[#1a2342] text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* CV */}
          {application?.cvUrl && (
            <SectionCard title="CV / Resume">
              <a
                href={application.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a2342]">Curriculum Vitae</p>
                    <p className="text-xs text-gray-400 font-medium">Submitted with application</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </SectionCard>
          )}

          {/* Documents */}
          {(documents.length > 0 || (profile.candidateDocumentSubmissions && profile.candidateDocumentSubmissions.length > 0)) && (
            <SectionCard
              title="Documents"
              action={
                <Link href="/documents" className="flex items-center gap-1 text-primary text-xs font-bold hover:text-primary/80 transition-colors">
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              <div className="space-y-2">
                {(profile.candidateDocumentSubmissions ?? []).map((sub, i) => {
                  const label = humanize((sub as any).documentType ?? (sub as any).type ?? `Document ${i + 1}`)
                  const isUploaded = sub.status === "submitted" || sub.status === "approved" || sub.status === "reviewed"
                  return (
                    <div key={sub.id ?? i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-[#1a2342]">{label}</span>
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-full",
                        isUploaded
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      )}>
                        {isUploaded ? "Uploaded" : humanize(sub.status)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </SectionCard>
          )}

        </div>

        {/* Right Column — Recruitment Timeline */}
        <div className="w-full lg:w-[260px] shrink-0">
          <div className="rounded-[20px] border border-gray-100 bg-white p-5 sticky top-4">
            <h2 className="text-[15px] font-extrabold text-[#1a2342] mb-5">Recruitment timeline</h2>
            <div className="space-y-0">
              {stages.map((stage, idx) => {
                const isCompleted = stage.status === "done" || stage.status === "submitted"
                const isCurrent = stage.status === "active" || stage.status === "locked"
                const isLocked = stage.status === "locked"

                return (
                  <div key={stage.key} className="flex gap-3 pb-5 last:pb-0 relative">
                    {/* Vertical connector */}
                    {idx < stages.length - 1 && (
                      <div className={cn(
                        "absolute left-[15px] top-8 w-[2px] h-[calc(100%-8px)]",
                        isCompleted ? "bg-primary" : "bg-gray-100"
                      )} />
                    )}

                    {/* Node */}
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold z-10",
                      isCompleted
                        ? "bg-primary text-white"
                        : isCurrent
                          ? "bg-white border-2 border-primary text-primary"
                          : "bg-gray-100 text-gray-400"
                    )}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" strokeWidth={3} />
                      ) : isLocked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <span>{String(idx + 1)}</span>
                      )}
                    </div>

                    {/* Label */}
                    <div className="pt-0.5">
                      <p className={cn(
                        "text-[13px] font-semibold leading-tight",
                        isCompleted || isCurrent ? "text-[#1a2342]" : "text-gray-400"
                      )}>
                        {stage.label}
                      </p>
                      <p className={cn(
                        "text-[11px] font-medium mt-0.5",
                        isCompleted ? "text-gray-400" :
                          isCurrent && !isLocked ? "text-primary" :
                            isLocked ? "text-amber-500" :
                              "text-gray-300"
                      )}>
                        {isCompleted ? "Completed" :
                          isLocked ? "Locked" :
                            isCurrent ? "Current stage" :
                              "Upcoming"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
