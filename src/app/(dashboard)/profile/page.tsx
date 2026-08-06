"use client"

import {
  Mail,
  Phone,
  Link2,
  ExternalLink,
  Users,
  Briefcase,
  GraduationCap,
  Clock,
  FileText,
  CalendarDays,
  BadgeCheck,
  Banknote,
  Moon,
  UserCheck,
} from "lucide-react"

import { useAuthStore } from "@/features/auth/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// ─── helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return "—"
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── small display primitives ─────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground wrap-break-word">
        {value || "—"}
      </p>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  )
}

function ApplicationStatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    pending:  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  }
  const key = (status ?? "pending").toLowerCase()
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[key] ?? map.pending}`}>
      {status ?? "Pending"}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground text-sm">No profile data available.</p>
      </div>
    )
  }

  const application = profile.jobApplications?.[0]

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">

      {/* ── Hero card ─────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20 shrink-0">
              <AvatarFallback className="bg-linear-to-br from-primary to-pink-500 text-white text-2xl font-bold">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl font-bold text-foreground truncate">
                {profile.fullName}
              </h1>
              {application?.positionAppliedFor && (
                <p className="text-sm text-muted-foreground font-medium">
                  {application.positionAppliedFor}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {profile.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              {profile.portfolioLink && (
                <a
                  href={profile.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                >
                  <Link2 className="h-3.5 w-3.5" /> Portfolio
                </a>
              )}
              {profile.linkedInProfile && (
                <a
                  href={profile.linkedInProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Two-column grid ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Personal info */}
        <Section icon={UserCheck} title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name"           value={profile.fullName} />
            <Field label="Email"               value={profile.email} />
            <Field label="Phone"               value={profile.phone} />
            <Field label="Years of Experience" value={profile.yearsOfExperience} />
            <Field
              label="Worked With Us Before"
              value={profile.workedWithUsBefore ? "Yes" : "No"}
            />
          </div>
        </Section>

        {/* Reference */}
        <Section icon={Users} title="Reference">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Reference Name"         value={profile.referenceName} />
            <Field label="Reference Relationship" value={profile.referenceRelationship} />
          </div>
        </Section>

      </div>

      {/* ── Education ─────────────────────────────── */}
      {profile.educationalRecords && profile.educationalRecords.length > 0 && (
        <Section icon={GraduationCap} title="Education">
          <div className="space-y-3">
            {profile.educationalRecords.map((edu, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <GraduationCap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{edu.certificateOrDegree}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Employment ────────────────────────────── */}
      {profile.employmentRecords && profile.employmentRecords.length > 0 && (
        <Section icon={Briefcase} title="Employment History">
          <div className="space-y-3">
            {profile.employmentRecords.map((emp, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <Briefcase className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{emp.position}</p>
                  <p className="text-xs text-muted-foreground">{emp.organizationName}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Job Application ───────────────────────── */}
      {application && (
        <Section icon={FileText} title="Job Application">
          <div className="space-y-5">

            {/* Status + position */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Position Applied For
                </p>
                <p className="text-sm font-semibold">{application.positionAppliedFor ?? "—"}</p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Notice Period"       value={application.noticePeriod} />
              <Field
                label="Earliest Join Date"
                value={formatDate(application.earliestAvailableJoiningDate)}
              />
              <Field
                label="Evening Shift"
                value={application.comfortableEveningShift ? "Comfortable" : "Not Comfortable"}
              />
              <Field
                label="Current Salary"
                value={formatCurrency(application.currentSalaryPkr)}
              />
              <Field
                label="Expected Salary"
                value={formatCurrency(application.expectedMonthlySalaryPkr)}
              />
              <Field
                label="Reason for Leaving"
                value={application.reasonForLeavingLastJob}
              />
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Cover Letter
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </>
            )}

            {/* CV link */}
            {application.cvUrl && (
              <>
                <Separator />
                <a
                  href={application.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  View CV
                </a>
              </>
            )}

          </div>
        </Section>
      )}

      {/* ── Timestamps ────────────────────────────── */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Joined {formatDate(profile.createdAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Updated {formatDate(profile.updatedAt)}
        </span>
      </div>

    </div>
  )
}
