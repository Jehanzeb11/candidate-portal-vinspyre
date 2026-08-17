"use client"

import { useState, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  FileText,
  Link2,
  BookOpen,
  Loader2,
  ChevronDown,
  Trophy,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useOnboarding,
  useUpdateOnboardingProgress,
  useCompleteOnboardingContent,
} from "@/features/onboarding/hooks/use-onboarding"
import type { OnboardingAssignment, OnboardingContentType } from "@/types/candidate.types"
import { cn } from "@/utils/cn"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds?: number | null): string {
  if (!seconds) return ""
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function getContentIcon(type: OnboardingContentType, className = "h-4 w-4") {
  switch (type) {
    case "video":    return <Play className={className} />
    case "document": return <FileText className={className} />
    case "link":     return <Link2 className={className} />
    case "article":  return <BookOpen className={className} />
    default:         return <BookOpen className={className} />
  }
}

function getContentLabel(type: OnboardingContentType): string {
  const map: Record<string, string> = {
    video: "Video", document: "Document",
    article: "Article", quiz: "Quiz", link: "Link",
  }
  return map[type] ?? "Content"
}

// ─── Progress ring (small SVG circle) ────────────────────────────────────────

function ProgressRing({ percent, size = 32 }: { percent: number; size?: number }) {
  const r = (size - 4) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className="stroke-muted" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3}
        className="stroke-primary transition-all duration-500"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Video Player ─────────────────────────────────────────────────────────────

function VideoPlayer({ assignment }: { assignment: OnboardingAssignment }) {
  const { content } = assignment
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const progressSaveTimer = useRef<NodeJS.Timeout | null>(null)

  const { mutate: updateProgress } = useUpdateOnboardingProgress()
  const { mutate: markComplete } = useCompleteOnboardingContent()

  const videoUrl = content.url || content.contentUrl

  const saveProgress = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const watchedSeconds = Math.floor(video.currentTime)
    const durationSeconds = Math.floor(video.duration) || content.durationSeconds || 0
    const progressPercent = durationSeconds > 0
      ? Math.min(100, Math.floor((watchedSeconds / durationSeconds) * 100))
      : 0
    updateProgress({ contentId: content.id, payload: { progressPercent, watchedSeconds, lastPositionSeconds: watchedSeconds, durationSeconds } })
  }, [content.id, content.durationSeconds, updateProgress])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
    if (progressSaveTimer.current) return
    progressSaveTimer.current = setTimeout(() => { saveProgress(); progressSaveTimer.current = null }, 10_000)
  }, [saveProgress])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    saveProgress()
    if (assignment.status !== "completed") {
      markComplete(content.id, { onSuccess: () => toast.success(`"${content.title}" completed!`) })
    }
  }, [assignment.status, content.id, content.title, markComplete, saveProgress])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) { void video.play(); setIsPlaying(true) }
    else { video.pause(); setIsPlaying(false); saveProgress() }
  }

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration)
    if (assignment.lastPositionSeconds && assignment.lastPositionSeconds > 0) {
      video.currentTime = assignment.lastPositionSeconds
    }
  }

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Player */}
      <div className="relative rounded-xl overflow-hidden bg-zinc-950 aspect-video group">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {/* Play/pause overlay */}
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all duration-200",
                "group-hover:scale-105 group-hover:bg-black/75",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
              </div>
            </button>
            {/* Scrub bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${playedPercent}%` }}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-white/30 text-xs">
            No video source
          </div>
        )}
      </div>

      {assignment.status !== "completed" && (
        <MarkCompleteButton contentId={content.id} contentTitle={content.title} />
      )}
    </div>
  )
}

// ─── Link / Document viewer ───────────────────────────────────────────────────

function ContentViewer({ assignment }: { assignment: OnboardingAssignment }) {
  const { content } = assignment
  const { mutate: updateProgress } = useUpdateOnboardingProgress()
  const contentUrl = content.url || content.contentUrl
  const contentType = content.type || content.contentType || "document"

  const handleOpen = () => {
    if (contentUrl) window.open(contentUrl, "_blank", "noopener,noreferrer")
    if (assignment.status === "pending") {
      updateProgress({ contentId: content.id, payload: { progressPercent: 10 } })
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {contentUrl && (
        <Button variant="outline" size="sm" onClick={handleOpen} className="gap-1.5 h-8 text-xs">
          {getContentIcon(contentType, "h-3.5 w-3.5")}
          Open {getContentLabel(contentType)}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </Button>
      )}
      {assignment.status !== "completed" && (
        <MarkCompleteButton contentId={content.id} contentTitle={content.title} />
      )}
    </div>
  )
}

// ─── Mark complete button ─────────────────────────────────────────────────────

function MarkCompleteButton({ contentId, contentTitle }: { contentId: string; contentTitle: string }) {
  const { mutate: markComplete, isPending } = useCompleteOnboardingContent()
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      className="gap-1.5 h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      onClick={() => markComplete(contentId, {
        onSuccess: () => toast.success(`"${contentTitle}" marked as complete!`),
        onError: (err) => toast.error(err.message || "Failed to mark complete"),
      })}
    >
      {isPending
        ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving</>
        : <><CheckCircle2 className="h-3 w-3" /> Mark complete</>
      }
    </Button>
  )
}

// ─── Content row ─────────────────────────────────────────────────────────────

function ContentRow({ assignment, index }: { assignment: OnboardingAssignment; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { content } = assignment

  const isCompleted = assignment.status === "completed"
  const isInProgress = assignment.status === "in_progress"
  const progress = assignment.progressPercent ?? 0
  const contentType = content.type || content.contentType || "document"

  return (
    <div className={cn(
      "rounded-xl border transition-colors duration-200",
      isCompleted
        ? "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10"
        : "border-border bg-card hover:border-border/80"
    )}>
      {/* Row header */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Index / check */}
        <div className={cn(
          "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
          isCompleted
            ? "bg-emerald-500 text-white"
            : isInProgress
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {isCompleted
            ? <CheckCircle2 className="h-3.5 w-3.5" />
            : isInProgress
            ? <ProgressRing percent={progress} size={28} />
            : index + 1
          }
        </div>

        {/* Content info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground leading-snug truncate">
              {content.title}
            </span>

            {/* Type pill */}
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isCompleted
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}>
              {getContentIcon(contentType, "h-2.5 w-2.5")}
              {getContentLabel(contentType)}
            </span>

            {content.isRequired && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500 dark:bg-red-950/30 dark:text-red-400">
                Required
              </span>
            )}
          </div>

          {/* Sub-row: description + duration + progress */}
          <div className="mt-0.5 flex items-center gap-3 flex-wrap">
            {content.description && (
              <span className="text-[11px] text-muted-foreground truncate max-w-xs">
                {content.description}
              </span>
            )}
            {content.durationSeconds && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0">
                <Clock className="h-2.5 w-2.5" />
                {formatDuration(content.durationSeconds)}
              </span>
            )}
            {isInProgress && progress > 0 && (
              <span className="text-[11px] font-medium text-primary shrink-0">{progress}% done</span>
            )}
            {isCompleted && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">Completed</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          expanded && "rotate-180"
        )} />
      </button>

      {/* Inline progress bar for in-progress items */}
      {isInProgress && progress > 0 && (
        <div className="mx-4 mb-1 h-0.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-border/50">
          {contentType === "video"
            ? <VideoPlayer assignment={assignment} />
            : <ContentViewer assignment={assignment} />
          }
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OnboardingSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="p-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── All done ─────────────────────────────────────────────────────────────────

function AllDoneState() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
        <Trophy className="h-7 w-7 text-emerald-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">All content completed!</p>
        <p className="mt-0.5 text-xs text-muted-foreground max-w-xs mx-auto">
          You've finished all onboarding material. Our team will follow up with next steps.
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingSection() {
  const { data: assignments, isLoading, error } = useOnboarding()

  if (isLoading) return <OnboardingSkeleton />

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Failed to load onboarding content.
      </div>
    )
  }

  if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        No onboarding content assigned yet. Check back soon.
      </div>
    )
  }

  const validAssignments = assignments.filter(a => a && a.content)
  const total = validAssignments.length
  const completed = validAssignments.filter(a => a.status === "completed").length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = completed === total

  const sorted = [...validAssignments].sort((a, b) => {
    const orderA = a.content?.order ?? 0
    const orderB = b.content?.order ?? 0
    if (orderA !== orderB) return orderA - orderB
    return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
  })

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Onboarding Content</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {completed} of {total} completed
            </p>
          </div>
          <span className="text-sm font-bold text-primary">{percent}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Content list */}
      <div className="p-4 space-y-2">
        {allDone ? (
          <AllDoneState />
        ) : (
          sorted.map((assignment, idx) => (
            <ContentRow key={assignment.id} assignment={assignment} index={idx} />
          ))
        )}
      </div>
    </div>
  )
}
