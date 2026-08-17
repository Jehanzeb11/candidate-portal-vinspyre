"use client"

import {
  Mail,
  Phone,
  MapPin,
  Link2,
  ExternalLink,
  Briefcase,
  GraduationCap,
  FileText,
  CalendarDays,
  Clock,
  Edit3,
  MapPinIcon,
  Globe,
} from "lucide-react"

import { useAuthStore } from "@/features/auth/store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils/cn"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount)
}

function humanize(str?: string | null) {
  if (!str) return "—"
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Field component ──────────────────────────────────────────────────────────

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
    <div className={cn("flex-1", className)}>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-[14px] font-medium text-foreground wrap-break-word">
        {value ?? "—"}
      </p>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  onEdit,
}: {
  title: string
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="gap-1.5 text-orange-500 border-orange-200 hover:bg-orange-50 dark:border-orange-900/40 dark:hover:bg-orange-950/20"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </Button>
      )}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <SectionHeader title={title} onEdit={onEdit} />
      {children}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-4 pb-12 max-w-6xl mx-auto">
      {/* Hero skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Sections skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-8 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)

  if (!profile) {
    return <ProfileSkeleton />
  }

  const application = profile.jobApplications?.[0]

  return (
    <div className="space-y-4 pb-12 max-w-8xl mx-auto">

      {/* ── Hero card ──────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-primary/15 shrink-0">
            <AvatarFallback className="bg-linear-to-br from-primary to-pink-500 text-white text-2xl font-bold">
              {getInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold text-foreground truncate">
              {profile.fullName}
            </h1>
            {application?.positionAppliedFor && (
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                {application.positionAppliedFor}
              </p>
            )}
            {application?.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <MapPin className="h-3 w-3" />
                {application.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal Information ───────────────────── */}
      <Section title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="First Name" value={profile.fullName?.split(" ")[0]} />
          <Field label="Last Name" value={profile.fullName?.split(" ").slice(1).join(" ")} />
          <Field label="Date of Birth" value={profile.age ? `Age ${profile.age}` : "—"} />
          <Field label="Email Address" value={profile.email} />
          <Field label="Phone Number" value={profile.phone} />
          <Field label="Gender" value={humanize(profile.gender)} />
        </div>
      </Section>

      {/* ── Address ────────────────────────────────── */}
      {application?.address && (
        <Section title="Address">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Address" value={application.address} className="lg:col-span-3" />
            {application.linkedInProfile && (
              <Field label="City / State" value={application.linkedInProfile} />
            )}
            {profile.age && (
              <Field label="Postal Code" value={profile.age?.toString()} />
            )}
          </div>
        </Section>
      )}

      {/* ── Employment ────────────────────────────── */}
      {application && (
        <Section title="Employment">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Position Applied For" value={application.positionAppliedFor} />
            <Field label="Current Employment Status" value={humanize(application.currentEmploymentStatus)} />
            <Field label="Years of Experience" value={humanize(profile.yearsOfExperience)} />
            <Field label="Current Salary (PKR)" value={formatCurrency(application.currentSalaryPkr)} />
            <Field label="Expected Salary (PKR)" value={formatCurrency(application.expectedMonthlySalaryPkr)} />
            <Field label="Notice Period" value={humanize(application.noticePeriod)} />
            <Field label="Earliest Join Date" value={formatDate(application.earliestAvailableJoiningDate)} />
            <Field label="Evening Shift" value={application.comfortableEveningShift ? "Comfortable" : "Not Comfortable"} />
            <Field label="Worked With Us Before" value={profile.workedWithUsBefore ? "Yes" : "No"} />
          </div>
        </Section>
      )}

      {/* ── Education ──────────────────────────────── */}
      {profile.educationalRecords && profile.educationalRecords.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {profile.educationalRecords.map((edu, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/30">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm font-medium">{edu.certificateOrDegree}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Employment History ────────────────────── */}
      {profile.employmentRecords && profile.employmentRecords.length > 0 && (
        <Section title="Employment History">
          <div className="space-y-3">
            {profile.employmentRecords.map((emp, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-border/40 bg-muted/30">
                <Briefcase className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{emp.position}</p>
                  <p className="text-xs text-muted-foreground">{emp.organizationName}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Job Details ────────────────────────────── */}
      {application && (
        <Section title="Job Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Job Seeking Status" value={humanize(application.jobSeekingStatus)} />
            <Field label="Heard About Opportunity" value={humanize(application.heardAboutOpportunity)} />
            <Field label="Application Status" value={humanize(application.status)} />
            {application.organizationName && (
              <Field label="Current Organization" value={application.organizationName} />
            )}
            {application.positionDesignation && (
              <Field label="Current Designation" value={application.positionDesignation} />
            )}
            {application.reasonForLeavingLastJob && (
              <Field label="Reason For Leaving" value={application.reasonForLeavingLastJob} />
            )}
          </div>
        </Section>
      )}

      {/* ── Interview & Offer ──────────────────────── */}
      {profile.candidateInterviews && profile.candidateInterviews.length > 0 && (
        <Section title="Interview & Offer">
          <div className="space-y-4">
            {profile.candidateInterviews.map((interview, i) => (
              <div key={interview.id} className="p-4 rounded-lg border border-border/40 bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Round" value={`${humanize(interview.roundType)} — Round ${interview.roundNumber}`} />
                  <Field label="Interview Status" value={humanize(interview.status)} />
                  <Field label="Offer Status" value={humanize(interview.offerStatus)} />
                  {interview.offerSentAt && (
                    <Field label="Offer Sent Date" value={formatDate(interview.offerSentAt)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Documents ──────────────────────────────── */}
      {profile.candidateDocumentSubmissions && profile.candidateDocumentSubmissions.length > 0 && (
        <Section title="Submitted Documents">
          <div className="space-y-4">
            {profile.candidateDocumentSubmissions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-lg border border-border/40 bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Document Status" value={humanize(sub.status)} />
                  <Field label="Submitted At" value={formatDate(sub.submittedAt)} />
                  {sub.reviewedAt && (
                    <Field label="Reviewed At" value={formatDate(sub.reviewedAt)} />
                  )}
                  {sub.reviewNote && (
                    <Field label="Review Note" value={sub.reviewNote} className="sm:col-span-2 lg:col-span-3" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── CV & Cover Letter ──────────────────────– */}
      {(application?.cvUrl || application?.coverLetter) && (
        <Section title="Documents & Notes">
          <div className="space-y-4">
            {application.cvUrl && (
              <a
                href={application.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Curriculum Vitae</p>
                    <p className="text-xs text-muted-foreground">Submitted with application</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}

            {application.coverLetter && (
              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Cover Letter
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

    </div>
  )
}
