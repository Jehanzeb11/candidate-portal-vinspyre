"use client"

import { useState, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  FileText,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

function formatDuration(seconds?: number): string {
  if (!seconds) return ""
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function contentTypeIcon(type: OnboardingContentType) {
  switch (type) {
    case "video":    return <Play className="h-4 w-4" />
    case "document": return <FileText className="h-4 w-4" />
    case "article":  return <BookOpen className="h-4 w-4" />
    case "link":     return <BookOpen className="h-4 w-4" />
    default:         return <BookOpen className="h-4 w-4" />
  }
}

function contentTypeLabel(type: OnboardingContentType): string {
  switch (type) {
    case "video":    return "Video"
    case "document": return "Document"
    case "article":  return "Article"
    case "quiz":     return "Quiz"
    case "link":     return "Link"
    default:         return "Content"
  }
}

// ─── Video Player ─────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  assignment: OnboardingAssignment
}

function VideoPlayer({ assignment }: VideoPlayerProps) {
  const { content } = assignment
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const progressSaveTimer = useRef<NodeJS.Timeout | null>(null)

  const { mutate: updateProgress } = useUpdateOnboardingProgress()
  const { mutate: markComplete } = useCompleteOnboardingContent()

  // Get video URL - API uses 'url' field, legacy uses 'contentUrl'
  const videoUrl = content.url || content.contentUrl

  const saveProgress = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const watchedSeconds = Math.floor(video.currentTime)
    const durationSeconds = Math.floor(video.duration) || content.durationSeconds || 0
    const progressPercent = durationSeconds > 0
      ? Math.min(100, Math.floor((watchedSeconds / durationSeconds) * 100))
      : 0

    updateProgress({
      contentId: content.id,
      payload: {
        progressPercent,
        watchedSeconds,
        lastPositionSeconds: watchedSeconds,
        durationSeconds,
      },
    })
  }, [content.id, content.durationSeconds, updateProgress])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    // Debounce saves to every 10 seconds
    if (progressSaveTimer.current) return
    progressSaveTimer.current = setTimeout(() => {
      saveProgress()
      progressSaveTimer.current = null
    }, 10_000)
  }, [saveProgress])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    // Save final progress immediately on end
    saveProgress()

    if (assignment.status !== "completed") {
      markComplete(content.id, {
        onSuccess: () => toast.success(`"${content.title}" completed!`),
      })
    }
  }, [assignment.status, content.id, content.title, markComplete, saveProgress])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
      saveProgress()
    }
  }

  // Resume from last position
  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    if (assignment.lastPositionSeconds && assignment.lastPositionSeconds > 0) {
      video.currentTime = assignment.lastPositionSeconds
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {videoUrl ? (
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
        ) : (
          <div className="flex items-center justify-center h-full text-white/50 text-sm">
            No video source available
          </div>
        )}

        {/* Play/Pause overlay */}
        {videoUrl && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white transition-opacity",
              "group-hover:bg-black/70",
              isPlaying && "opacity-0 group-hover:opacity-100"
            )}>
              {isPlaying
                ? <Pause className="h-6 w-6" />
                : <Play className="h-6 w-6 translate-x-0.5" />
              }
            </div>
          </button>
        )}
      </div>

      {/* Mark complete button for non-video or manual completion */}
      {assignment.status !== "completed" && (
        <ManualCompleteButton contentId={content.id} contentTitle={content.title} />
      )}
    </div>
  )
}

// ─── Document / Article Viewer ────────────────────────────────────────────────

interface ContentViewerProps {
  assignment: OnboardingAssignment
}

function ContentViewer({ assignment }: ContentViewerProps) {
  const { content } = assignment
  const { mutate: updateProgress } = useUpdateOnboardingProgress()
  const { mutate: markComplete } = useCompleteOnboardingContent()

  // Get content URL - API uses 'url' field, legacy uses 'contentUrl'
  const contentUrl = content.url || content.contentUrl

  const handleOpen = () => {
    if (contentUrl) {
      window.open(contentUrl, "_blank", "noopener,noreferrer")
    }

    // Move to in_progress when opened
    if (assignment.status === "pending") {
      updateProgress({
        contentId: content.id,
        payload: { progressPercent: 10 },
      })
    }
  }

  return (
    <div className="space-y-3">
      {contentUrl && (
        <Button variant="outline" size="sm" onClick={handleOpen} className="gap-2">
          {contentTypeIcon(content.type || content.contentType || "document")}
          Open {contentTypeLabel(content.type || content.contentType || "document")}
        </Button>
      )}
      {assignment.status !== "completed" && (
        <ManualCompleteButton contentId={content.id} contentTitle={content.title} />
      )}
    </div>
  )
}

// ─── Manual Complete Button ───────────────────────────────────────────────────

function ManualCompleteButton({
  contentId,
  contentTitle,
}: {
  contentId: string
  contentTitle: string
}) {
  const { mutate: markComplete, isPending } = useCompleteOnboardingContent()

  return (
    <Button
      size="sm"
      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      disabled={isPending}
      onClick={() =>
        markComplete(contentId, {
          onSuccess: () => toast.success(`"${contentTitle}" marked as complete!`),
          onError: (err) => toast.error(err.message || "Failed to mark complete"),
        })
      }
    >
      {isPending ? (
        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
      ) : (
        <><CheckCircle2 className="h-3.5 w-3.5" /> Mark as Complete</>
      )}
    </Button>
  )
}

// ─── Single Content Card ──────────────────────────────────────────────────────

interface ContentCardProps {
  assignment: OnboardingAssignment
  index: number
}

function ContentCard({ assignment, index }: ContentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { content } = assignment

  const isCompleted = assignment.status === "completed"
  const isInProgress = assignment.status === "in_progress"
  const progress = assignment.progressPercent ?? 0

  // Get content type - API uses 'type', legacy uses 'contentType'
  const contentType = content.type || content.contentType || "document"

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        isCompleted
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          : "border-border bg-card"
      )}
    >
      {/* Card header — always visible */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Order badge */}
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold mt-0.5",
          isCompleted
            ? "bg-emerald-500 text-white"
            : isInProgress
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + type tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate">{content.title}</span>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
              isCompleted
                ? "bg-emerald-100 text-emerald-700"
                : isInProgress
                ? "bg-blue-100 text-blue-700"
                : "bg-muted text-muted-foreground"
            )}>
              {contentTypeIcon(contentType)}
              {contentTypeLabel(contentType)}
            </span>
            {content.isRequired && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                Required
              </span>
            )}
          </div>

          {/* Description */}
          {content.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{content.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5">
            {content.durationSeconds && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(content.durationSeconds)}
              </span>
            )}
            {isInProgress && progress > 0 && (
              <span className="text-[10px] text-blue-600 font-medium">{progress}% watched</span>
            )}
            {isCompleted && (
              <span className="text-[10px] text-emerald-600 font-semibold">✓ Completed</span>
            )}
          </div>

          {/* Progress bar (in-progress only) */}
          {isInProgress && (
            <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <div className="shrink-0 text-muted-foreground mt-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4">
          {contentType === "video" ? (
            <VideoPlayer assignment={assignment} />
          ) : (
            <ContentViewer assignment={assignment} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Overall progress bar ─────────────────────────────────────────────────────

function OnboardingProgressBar({
  assignments,
}: {
  assignments: OnboardingAssignment[]
}) {
  // Ensure assignments is always an array
  const validAssignments = Array.isArray(assignments) ? assignments.filter(a => a && a.status) : []
  const total = validAssignments.length
  const completed = validAssignments.filter((a) => a.status === "completed").length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{completed} of {total} completed</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// ─── All done state ───────────────────────────────────────────────────────────

function AllDoneState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Trophy className="h-8 w-8" />
      </div>
      <p className="text-base font-bold text-emerald-700">All onboarding content completed!</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        You've finished all required content. Our team will be in touch with your next steps.
      </p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OnboardingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main exported section ────────────────────────────────────────────────────

export function OnboardingSection() {
  const { data: assignments, isLoading, error } = useOnboarding()

  // Debug logging
  console.log('OnboardingSection - assignments:', assignments, 'isLoading:', isLoading, 'error:', error)

  if (isLoading) return <OnboardingSkeleton />

  if (error) {
    console.error('Onboarding error:', error)
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load onboarding content: {error.message}
      </div>
    )
  }

  if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No onboarding content assigned yet. Check back soon!
      </div>
    )
  }

  const allDone = assignments.every((a) => a?.status === "completed")

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">🎉 Onboarding Content</CardTitle>
        </div>
        <OnboardingProgressBar assignments={assignments} />
      </CardHeader>
      <CardContent className="pt-5 space-y-3">
        {allDone ? (
          <AllDoneState />
        ) : (
          assignments
            .filter(assignment => assignment && assignment.content) // Filter out invalid assignments
            .sort((a, b) => {
              // Sort by content order if available, otherwise by creation date
              const orderA = a.content?.order ?? 0
              const orderB = b.content?.order ?? 0
              if (orderA !== orderB) return orderA - orderB
              
              // Fallback to creation date
              const dateA = new Date(a.createdAt || '').getTime()
              const dateB = new Date(b.createdAt || '').getTime()
              return dateA - dateB
            })
            .map((assignment, idx) => (
              <ContentCard key={assignment.id} assignment={assignment} index={idx} />
            ))
        )}
      </CardContent>
    </Card>
  )
}
