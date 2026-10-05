"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertCircle, AlertTriangle, Loader } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-fetch"
import ENDPOINTS from "@/server/Endpoints"
import type { AssessmentAnswer, Assessment } from "@/types"
import { useAuthStore } from "@/store"
import { AssessmentInstructionsView } from "@/components/assessment/views/AssessmentInstructionsView"
import { AssessmentTakingView } from "@/components/assessment/views/AssessmentTakingView"
import { AssessmentResultsView } from "@/components/assessment/views/AssessmentResultsView"
import { AssessmentForcedSubmitView, AssessmentDisabledView } from "@/components/assessment/views/AssessmentFeedbackViews"
import { AssessmentSubmissionSuccessModal } from "@/components/assessment/AssessmentSubmissionSuccessModal"

type AssessmentState = "loading" | "instructions" | "taking" | "submitting" | "results" | "blocked" | "violation_disabled" | "screen_recording_blocked" | "violation_forced_submit"

interface ViolationRecord {
  type: string
  timestamp: number
  details?: string
}

// Helper function to get question type from either type or questionType field
const getQuestionType = (question: any): string => {
  return question.type || question.questionType || "mcq"
}

const VIOLATION_THRESHOLD = 3
const MAX_VIOLATIONS_BEFORE_AUTO_SUBMIT = 5
const TIME_PER_QUESTION = 120 // 2 minutes per question in seconds

export default function AssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.applicationId as string
  const clearUser = useAuthStore((s) => s.clearUser)

  // State management
  const [state, setState] = useState<AssessmentState>("loading")
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loadError, setLoadError] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({})
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)
  const [violations, setViolations] = useState<ViolationRecord[]>([])
  const [blockedReason, setBlockedReason] = useState("")
  const [tabHidden, setTabHidden] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false)
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false)
  const [screenRecordingDetected, setScreenRecordingDetected] = useState(false)
  // Use a ref so toggling in-progress never triggers a re-render (and re-run of the polling effect)
  const checkInProgressRef = useRef(false)
  const [screenRecordingCheckInProgress, setScreenRecordingCheckInProgress] = useState(false)
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({})
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [assessmentStartTime, setAssessmentStartTime] = useState<number | null>(null)
  const [totalAssessmentDuration, setTotalAssessmentDuration] = useState(0)
  const [forcedSubmitViolations, setForcedSubmitViolations] = useState<ViolationRecord[]>([])
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const violationRef = useRef<ViolationRecord[]>([])
  const submitRef = useRef(false)
  const answersRef = useRef<Record<string, AssessmentAnswer>>({})

  // ─── Violation Recording ────────────────────────────────────────────────
  // ─── Report Violations to Backend ──────────────────────────────────────
  const reportViolationsToBackend = useCallback(async (violationsToReport: ViolationRecord[]) => {
    try {
      // Step 1: Hit the violations API
      const violationPayload = {
        testId: assessment?.id,
        candidateProfileId: assessment?.candidateProfileId,
        violations: violationsToReport.map((v) => ({
          type: v.type,
          message: v.details || v.type,
          detectedAt: new Date(v.timestamp).toISOString(),
        })),
      }

      await apiFetch<any>(ENDPOINTS.VIOLATION, {
        method: "POST",
        body: JSON.stringify(violationPayload),
      })
    } catch (error) {
      console.error("Error reporting violations:", error)
    }

    // Step 2: Auto-submit the assessment
    try {
      const assessmentEndTime = Date.now()
      const totalDurationSeconds = (assessment?.questions?.length || 0) * TIME_PER_QUESTION
      const timeSpentSeconds = assessmentStartTime
        ? Math.floor((assessmentEndTime - assessmentStartTime) / 1000)
        : totalDurationSeconds

      // Build answers object for API submission
      const submissionAnswers: Record<string, string | number> = {}
      const currentAnswers = answersRef.current
      Object.entries(currentAnswers).forEach(([questionId, answer]) => {
        if (answer.type === "mcq" && answer.selectedAnswerIndex !== undefined) {
          const question = assessment?.questions?.find((q: any) => q.id === questionId)
          if (question?.options) {
            submissionAnswers[questionId] = question.options[answer.selectedAnswerIndex]
          }
        } else if (answer.freeTextAnswer !== undefined) {
          submissionAnswers[questionId] = answer.freeTextAnswer
        }
      })

      await apiFetch<any>(ENDPOINTS.SUBMIT_TEST, {
        method: "POST",
        body: JSON.stringify({
          jobApplicationId: applicationId,
          answers: submissionAnswers,
          violations: violationsToReport,
          totalDurationSeconds,
          timeSpentSeconds,
        }),
      })
    } catch (error) {
      console.error("Error auto-submitting assessment after violations:", error)
    }

    // Step 3: Exit fullscreen and show violation forced-submit screen
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (e) {
      console.error("Exit fullscreen error:", e)
    }

    setForcedSubmitViolations(violationsToReport)
    setState("violation_forced_submit")

    // Step 4: Log out after 8 seconds so the user has time to read
    setTimeout(() => {
      clearUser()
      router.push("/login")
    }, 8000)
  }, [assessment, applicationId, assessmentStartTime, clearUser, router])
  // ─── Extension message listener ─────────────────────────────────────────
  useEffect(() => {
    const handleRecorderStatus = (event: MessageEvent) => {
      if (event.data?.type !== "SCREEN_RECORDER_STATUS") return
      if (event.data.recording === true) {
        setScreenRecordingDetected(true)
      }
    }
    window.addEventListener("message", handleRecorderStatus)
    return () => window.removeEventListener("message", handleRecorderStatus)
  }, [])

  const recordViolation = useCallback((type: string, details?: string) => {
    const violation: ViolationRecord = {
      type,
      timestamp: Date.now(),
      details,
    }
    violationRef.current = [...violationRef.current, violation]
    setViolations([...violationRef.current])

    const violationCount = violationRef.current.length

    if (violationCount < 3) {
      toast.warning(`⚠️ Violation #${violationCount}: ${type}`, {
        description: `${3 - violationCount} more violation(s) will auto-submit your assessment.`,
      })
    }

    // At exactly 3 violations — report to backend, auto-submit, and logout
    if (violationCount === 3) {
      toast.error("🚨 Maximum violations reached. Your assessment is being submitted.", {
        duration: 5000,
      })
      // reportViolationsToBackend(violationRef.current)
    }
  }, [reportViolationsToBackend])

  // ─── Fetch Test Data on Mount ───────────────────────────────────────────
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await apiFetch<{ data: Assessment }>(
          `${ENDPOINTS.GET_TEST}`
        )

        const assessmentData = response.data

        // Normalize question types: convert questionType to type
        if (assessmentData.questions) {
          assessmentData.questions = assessmentData.questions.map((q: any) => ({
            ...q,
            type: q.type || q.questionType,
          }))
        }

        setAssessment(assessmentData)

        // Check if already submitted
        if (assessmentData.status === "submitted") {
          setIsAlreadySubmitted(true)
          toast.info("This assessment has already been submitted.", {
            description: "You can view your results below.",
          })
          setState("results")
          return
        }

        // Initialize question timers (2 minutes each)
        const timers: Record<string, number> = {}
        assessmentData.questions?.forEach((q: any) => {
          timers[q.id] = TIME_PER_QUESTION
        })
        setQuestionTimers(timers)
        setTimeLeft(TIME_PER_QUESTION)

        // Show skills information if available
        if (assessmentData.matchedSkills && assessmentData.matchedSkills.length > 0) {
          const totalTime = (assessmentData.questions?.length || 0) * 2
          toast.success(`Assessment loaded: ${totalTime} min total (2 min per question)`, {
            description: assessmentData.matchedSkills.join(", ")
          })
        }

        setState("instructions")
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to load assessment"
        setLoadError(errorMsg)
        toast.error("Failed to load assessment", {
          description: errorMsg,
        })
        setState("instructions") // Still show instructions page with error
      }
    }

    fetchTestData()
  }, [applicationId])

  // ─── Fullscreen Management ──────────────────────────────────────────────
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = pageRef.current
      if (elem?.requestFullscreen) {
        await elem.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error)
      recordViolation("fullscreen_request_failed")
    }
  }, [recordViolation])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Exit fullscreen failed:", error)
    }
  }, [])

  // Monitor fullscreen changes
  useEffect(() => {
    if (state !== "taking") return

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen && state === "taking") {
        recordViolation("exited_fullscreen", "User exited fullscreen mode during assessment")
        toast.warning("⚠️ You exited fullscreen. Please return to fullscreen mode.", {
          duration: 5000,
        })
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [state, recordViolation])

  // ─── Tab/Window Visibility Detection ────────────────────────────────────
  useEffect(() => {
    if (state !== "taking") return

    const handleVisibilityChange = () => {
      const isHidden = document.hidden
      setTabHidden(isHidden)

      if (isHidden) {
        recordViolation("tab_hidden", "User switched away from assessment tab")
        toast.warning("⚠️ Tab visibility lost. Return to continue.", {
          duration: 3000,
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [state, recordViolation])

  // ─── Blur Detection (window focus loss) ─────────────────────────────────
  useEffect(() => {
    if (state !== "taking") return

    const handleBlur = () => {
      recordViolation("window_blur", "Browser window lost focus")
    }

    const handleFocus = () => {
      // Optional: notify on return
    }

    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
    }
  }, [state, recordViolation])

  // ─── Security: Disable Copy/Paste/Cut ────────────────────────────────────
  useEffect(() => {
    if (state !== "taking") return

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      recordViolation("copy_attempted", "User attempted to copy content")
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      recordViolation("paste_attempted", "User attempted to paste content")
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      recordViolation("cut_attempted", "User attempted to cut content")
    }

    document.addEventListener("copy", handleCopy)
    document.addEventListener("paste", handlePaste)
    document.addEventListener("cut", handleCut)

    return () => {
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("paste", handlePaste)
      document.removeEventListener("cut", handleCut)
    }
  }, [state, recordViolation])

  // ─── Security: Disable Right-Click & Context Menu ───────────────────────
  useEffect(() => {
    if (state !== "taking") return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      recordViolation("context_menu_attempted", "Right-click menu blocked")
    }

    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [state, recordViolation])

  // ─── Security: Block Keyboard Shortcuts ─────────────────────────────────
  useEffect(() => {
    if (state !== "taking") return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0

      // Developer tools shortcuts
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (isMac && e.metaKey && e.altKey && e.key === "I") ||
        (isMac && e.metaKey && e.altKey && e.key === "J")
      ) {
        e.preventDefault()
        recordViolation("devtools_shortcut_attempted", `Shortcut: ${e.key}`)
      }

      // Screenshot shortcuts (cannot prevent, but can record)
      if (
        e.key === "PrintScreen" ||
        (isMac && e.shiftKey && e.metaKey && e.key === "3") ||
        (isMac && e.shiftKey && e.metaKey && e.key === "4")
      ) {
        recordViolation("screenshot_attempted", "Screenshot shortcut detected")
        // Browser cannot prevent OS-level screenshots
      }

      // Ctrl/Cmd + Shift + P (DevTools search)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        e.preventDefault()
        recordViolation("devtools_palette_attempted", "Command palette blocked")
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [state, recordViolation])

  // ─── Security: Prevent New Window/Tab Opening ───────────────────────────
  useEffect(() => {
    if (state !== "taking") return

    // Intercept window.open
    const originalOpen = window.open
    window.open = function (...args: any[]) {
      recordViolation("new_window_attempted", `Target: ${args[1] || "default"}`)
      return null
    }

    // Prevent target="_blank" on links
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a") as HTMLAnchorElement

      if (link && link.getAttribute("target") === "_blank") {
        e.preventDefault()
        recordViolation("new_tab_link_attempted", link.href)
      }
    }

    document.addEventListener("click", handleLinkClick, true)

    return () => {
      window.open = originalOpen
      document.removeEventListener("click", handleLinkClick, true)
    }
  }, [state, recordViolation])

  // ─── Timer ──────────────────────────────────────────────────────────────
  // Reset timer when question changes
  useEffect(() => {
    if (state !== "taking" || !assessment) return

    const currentQ = assessment.questions[currentQuestionIndex]
    if (currentQ) {
      setTimeLeft(TIME_PER_QUESTION)
    }
  }, [currentQuestionIndex, state, assessment])

  // Countdown timer for current question
  useEffect(() => {
    if (state !== "taking" || timeLeft <= 0 || !assessment) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1

        if (newTime <= 0) {
          // Time's up - check if last question
          if (currentQuestionIndex >= assessment.questions.length - 1) {
            // Last question - auto-submit entire assessment
            if (!submitRef.current && !isSubmitting) {
              submitRef.current = true
              toast.error("Time's up! Auto-submitting assessment...", {
                duration: 2000,
              })
              setTimeout(() => handleSubmit(), 500)
            }
            return 0
          } else {
            // Not last question - move to next
            toast.warning("Time's up for this question. Moving to next...", {
              duration: 2000,
            })
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            return TIME_PER_QUESTION
          }
        }
        return newTime
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state, timeLeft, currentQuestionIndex, assessment, isSubmitting])

  // ─── Prevent Window Close / Navigation Away ──────────────────────────────
  useEffect(() => {
    if (state !== "taking") return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
      recordViolation("window_close_attempted", "User attempted to close/leave assessment")
      return ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [state, recordViolation])

  // ─── Handlers ────────────────────────────────────────────────────────────

  // ─── Screen Recording Detection ──────────────────────────────────────────
  //
  // Strategy (no browser permission prompts):
  //  1. Query the "display-capture" permission — if "granted" a share is active
  //  2. Inspect active MediaStreamTracks on the page for display-surface types
  //  3. Listen to extension SCREEN_RECORDER_STATUS messages (handled above)
  //
  // getDisplayMedia() is intentionally NOT called here — it always opens a
  // system dialog which is disruptive and would confuse the candidate.
  // ──────────────────────────────────────────────────────────────────────────

  const checkScreenRecording = useCallback(async (): Promise<boolean> => {
    let detected = false

    // ── Method 1: Permission API ────────────────────────────────────────────
    // Chrome/Edge 93+: query the display-capture permission without prompting.
    try {
      const result = await navigator.permissions.query(
        { name: "display-capture" } as unknown as PermissionDescriptor
      )
      if (result.state === "granted") {
        detected = true
      }
    } catch {
      // Safari / Firefox don't support display-capture permission query — skip
    }

    if (detected) return true

    // ── Method 2: Scan active MediaStreamTracks for display surfaces ────────
    // If any existing track on the page is a display/window/browser surface,
    // screen sharing is already active.
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      // enumerateDevices() itself won't reveal sharing, but calling it
      // refreshes the browser's internal device list and flushes the
      // permission cache used by Method 1.
      void devices
    } catch {
      // ignore
    }

    return false
  }, [])

  // ── Periodic poll on the instructions screen (every 3 s) ─────────────────
  useEffect(() => {
    if (state !== "instructions") return

    // Use a ref for the in-progress guard so it never triggers a re-render
    // (and therefore never causes this effect to re-run in a tight loop).
    const runCheck = async () => {
      if (checkInProgressRef.current) return
      checkInProgressRef.current = true
      setScreenRecordingCheckInProgress(true)
      try {
        const detected = await checkScreenRecording()
        setScreenRecordingDetected(detected)
      } finally {
        checkInProgressRef.current = false
        setScreenRecordingCheckInProgress(false)
      }
    }

    void runCheck()
    const interval = setInterval(runCheck, 3000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, checkScreenRecording])

  // ── Continuous monitoring while taking the assessment ─────────────────────
  // If screen recording is detected mid-test it is recorded as a violation.
  useEffect(() => {
    if (state !== "taking") return

    const interval = setInterval(async () => {
      const detected = await checkScreenRecording()
      if (detected) {
        setScreenRecordingDetected(true)
        recordViolation(
          "screen_recording_detected",
          "Screen recording or sharing was detected during the assessment"
        )
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [state, checkScreenRecording, recordViolation])

  const handleStartAssessment = async () => {
    // Final guard — re-check synchronously before allowing start
    const stillRecording = await checkScreenRecording()
    if (stillRecording || screenRecordingDetected) {
      setScreenRecordingDetected(true)
      toast.error("🎥 Screen recording detected", {
        description: "Please stop all screen sharing / recording software before starting.",
        duration: 5000,
      })
      return
    }
    await enterFullscreen()
    setAssessmentStartTime(Date.now())
    setState("taking")
  }

  // Keep answersRef in sync so reportViolationsToBackend always has the latest answers
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        type: "mcq",
        selectedAnswerIndex: answerIndex,
      },
    }))
  }

  const handleSetFreeTextAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        type: "free_input",
        freeTextAnswer: text,
      },
    }))
  }

  const handleNextQuestion = () => {
    const currentQuestion = assessment?.questions[currentQuestionIndex]

    // Check if current question is answered
    if (!currentQuestion || !answers[currentQuestion.id]) {
      toast.warning("Please answer the current question before proceeding", {
        duration: 2000,
      })
      return
    }

    if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    const currentQuestion = assessment?.questions[currentQuestionIndex]

    // Check if current question is answered
    if (!currentQuestion || !answers[currentQuestion.id]) {
      toast.warning("Please answer the current question before proceeding", {
        duration: 2000,
      })
      return
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!assessment?.questions || isSubmitting) return

    setIsSubmitting(true)

    // Show loading toast
    const toastId = toast.loading("Submitting your assessment...")

    try {
      // Calculate durations
      const assessmentEndTime = Date.now()
      const totalDurationSeconds = assessment.questions.length * TIME_PER_QUESTION
      const timeSpentSeconds = assessmentStartTime
        ? Math.floor((assessmentEndTime - assessmentStartTime) / 1000)
        : totalDurationSeconds

      // Only score MCQ questions
      let correctCount = 0
      let mcqCount = 0

      assessment.questions.forEach((question: any) => {
        const qType = getQuestionType(question)
        if (qType === "mcq") {
          mcqCount++
          const answer = answers[question.id]
          if (answer?.selectedAnswerIndex === question.correctAnswer) {
            correctCount++
          }
        }
      })

      const scorePercentage = mcqCount > 0 ? Math.round((correctCount / mcqCount) * 100) : 0
      const isPassed = scorePercentage >= (assessment?.passingScore || 70)

      // Build answers object for API submission
      const submissionAnswers: Record<string, string | number> = {}
      Object.entries(answers).forEach(([questionId, answer]) => {
        if (answer.type === "mcq" && answer.selectedAnswerIndex !== undefined) {
          const question = assessment.questions.find((q: any) => q.id === questionId)
          if (question?.options) {
            submissionAnswers[questionId] = question.options[answer.selectedAnswerIndex]
          }
        } else if (answer.freeTextAnswer !== undefined) {
          submissionAnswers[questionId] = answer.freeTextAnswer
        }
      })

      // Submit to backend
      const response = await apiFetch<{ data: Assessment }>(
        ENDPOINTS.SUBMIT_TEST,
        {
          method: "POST",
          body: JSON.stringify({
            jobApplicationId: applicationId,
            answers: submissionAnswers,
            violations: violationRef.current,
            totalDurationSeconds,
            timeSpentSeconds,
          }),
        }
      )

      // Update state with response data
      setScore(scorePercentage)
      setPassed(isPassed)

      // Dismiss the loading toast
      toast.dismiss(toastId)

      // Show success modal instead of full-screen view
      setShowSubmissionModal(true)
      setJustSubmitted(true)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to submit assessment"
      toast.error("Submission failed", {
        id: toastId,
        description: errorMsg,
      })
      console.error("Assessment submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [assessment, applicationId, answers, violationRef, assessmentStartTime, isSubmitting, exitFullscreen, router])

  const handleFinish = async () => {
    await exitFullscreen()
    router.push("/")
  }

  // ─── Auto-submit trigger from violations ────────────────────────────────
  // useEffect(() => {
  //   if (shouldAutoSubmit && !isSubmitting) {
  //     handleSubmit()
  //   }
  // }, [shouldAutoSubmit, isSubmitting, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const totalAnswered = Object.keys(answers).length
  const allMCQAnswered = assessment?.questions?.filter((q: any) => q.type === "mcq").every((q: any) => answers[q.id]) ?? false
  const isTimeAlmostUp = timeLeft < 300

  // Check if current question is answered
  const currentQuestion = assessment?.questions[currentQuestionIndex]
  const isCurrentQuestionAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false

  // ─── Render States ──────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-spin">
              <Loader className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Loading Assessment</h2>
            <p className="text-sm text-muted-foreground">Fetching your test questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === "blocked") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-destructive/10">
        <Card className="max-w-md border-destructive/30">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-destructive">Assessment Blocked</h2>
            <p className="text-sm text-muted-foreground">{blockedReason}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === "instructions") {
    if (!assessment) {
      return (
        <div className="space-y-6 pb-12 max-w-full mx-auto p-4">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
            <CardContent className="pt-6">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-200 text-sm ml-2">
                  {loadError || "Failed to load assessment"}
                </AlertDescription>
              </Alert>
              <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <AssessmentInstructionsView
        assessment={assessment!}
        screenRecordingDetected={screenRecordingDetected}
        screenRecordingCheckInProgress={screenRecordingCheckInProgress}
        checkInProgressRef={checkInProgressRef}
        onBack={() => router.push("/")}
        onStart={handleStartAssessment}
        onCheckScreenRecording={checkScreenRecording}
        setScreenRecordingDetected={setScreenRecordingDetected}
        setScreenRecordingCheckInProgress={setScreenRecordingCheckInProgress}
        VIOLATION_THRESHOLD={VIOLATION_THRESHOLD}
      />
    )
  }

  if (state === "taking") {
    return (
      <>
        <AssessmentTakingView
          pageRef={pageRef}
          assessment={assessment!}
          currentQuestionIndex={currentQuestionIndex}
          currentQuestion={assessment?.questions?.[currentQuestionIndex]}
          timeLeft={timeLeft}
          progressPercentage={((currentQuestionIndex + 1) / (assessment?.questions?.length || 1)) * 100}
          isTimeAlmostUp={timeLeft < 300}
          tabHidden={tabHidden}
          violations={violations}
          answers={answers}
          handleSelectAnswer={handleSelectAnswer}
          handleSetFreeTextAnswer={handleSetFreeTextAnswer}
          handleNextQuestion={handleNextQuestion}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isCurrentQuestionAnswered={isCurrentQuestionAnswered}
          totalAnswered={totalAnswered}
          formatTime={formatTime}
          getQuestionType={getQuestionType}
        />
        <AssessmentSubmissionSuccessModal
          isOpen={showSubmissionModal}
          questionCount={assessment?.questions?.length ?? 0}
          onReturnDashboard={async () => {
            await exitFullscreen()
            router.push("/")
          }}
        />
      </>
    )
  }

  if (state === "violation_forced_submit") {
    return <AssessmentForcedSubmitView forcedSubmitViolations={forcedSubmitViolations} />
  }

  if (state === "violation_disabled") {
    return <AssessmentDisabledView violations={violations} />
  }

  if (state === "results") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b132b]/40 backdrop-blur-sm">
        <AssessmentResultsView
          assessment={assessment!}
          answers={answers}
          passed={passed}
          score={score}
          violations={violations}
          isAlreadySubmitted={isAlreadySubmitted}
          handleFinish={handleFinish}
          onReturnToDashboard={() => router.push("/")}
          getQuestionType={getQuestionType}
        />
      </div>
    )
  }

  return null
}
