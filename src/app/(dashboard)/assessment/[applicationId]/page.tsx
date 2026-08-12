"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertCircle, Clock, CheckCircle2, XCircle, AlertTriangle, Loader } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-fetch"
import ENDPOINTS from "@/server/Endpoints"
import { MCQQuestion, FillBlankQuestion, DescriptiveQuestion } from "@/components/assessment/QuestionTypes"
import type { AssessmentAnswer, Assessment } from "@/types"
import { useAuthStore } from "@/store"

type AssessmentState = "loading" | "instructions" | "taking" | "submitting" | "results" | "blocked" | "violation_disabled"

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
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({})
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [assessmentStartTime, setAssessmentStartTime] = useState<number | null>(null)
  const [totalAssessmentDuration, setTotalAssessmentDuration] = useState(0)

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const violationRef = useRef<ViolationRecord[]>([])
  const submitRef = useRef(false)

  // ─── Violation Recording ────────────────────────────────────────────────
  // ─── Report Violations to Backend ──────────────────────────────────────
  const reportViolationsToBackend = useCallback(async (violationsToReport: ViolationRecord[]) => {
    try {
      const payload = {
        testId: assessment?.id,
        candidateProfileId: assessment?.candidateProfileId,
        violations: violationsToReport.map((v) => ({
          type: v.type,
          message: v.details || v.type,
          detectedAt: new Date(v.timestamp).toISOString(),
        })),
      }

      const response = await apiFetch<any>(ENDPOINTS.VIOLATION, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      // If response indicates test is disabled
      if (response.data?.isDisabled) {
        toast.error("❌ Assessment Disabled", {
          description: response.data.disabledReason || "Your test has been disabled due to violations.",
          duration: 5000,
        })

        // Show violation disabled screen
        setState("violation_disabled")

        // Exit fullscreen
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen()
          }
        } catch (e) {
          console.error("Exit fullscreen error:", e)
        }

        // Logout after 3-4 seconds
        setTimeout(() => {
          clearUser()
          router.push("/login")
        }, 5000)
      }
    } catch (error) {
      console.error("Error reporting violations:", error)
    }
  }, [assessment])

  const recordViolation = useCallback((type: string, details?: string) => {
    const violation: ViolationRecord = {
      type,
      timestamp: Date.now(),
      details,
    }
    violationRef.current = [...violationRef.current, violation]
    setViolations([...violationRef.current])

    const violationCount = violationRef.current.length

    // Report to backend at exactly 3 violations
    if (violationCount === 3) {
      reportViolationsToBackend(violationRef.current)
    }

    // Warn at threshold
    if (violationCount === VIOLATION_THRESHOLD) {
      toast.error(`⚠️ Assessment Violation #${violationCount}: ${type}`, {
        description: "Suspicious activity detected. One more violation will disable your test.",
      })
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
        (isMac && e.shiftKey && (e.metaKey as any) && e.key === "3") ||
        (isMac && e.shiftKey && (e.metaKey as any) && e.key === "4")
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

  const handleStartAssessment = async () => {
    await enterFullscreen()
    setAssessmentStartTime(Date.now())
    setState("taking")
  }

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

  const handleSubmit = async () => {
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
      
      // Show success screen first
      setJustSubmitted(true)
      setState("submitting")
      
      // Wait 3 seconds then redirect to dashboard
      setTimeout(() => {
        exitFullscreen()
        router.push("/")
      }, 3000)
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
  }

  const handleFinish = async () => {
    await exitFullscreen()
    router.push("/")
  }

  // ─── Auto-submit trigger from violations ────────────────────────────────
  useEffect(() => {
    if (shouldAutoSubmit && !isSubmitting) {
      handleSubmit()
    }
  }, [shouldAutoSubmit, isSubmitting, handleSubmit])

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
        <div className="space-y-6 pb-12 max-w-2xl mx-auto p-4">
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
      <div className="space-y-6 pb-12 max-w-2xl mx-auto p-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {assessment.title || "Technical Assessment"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {assessment.description || "Test your skills"}
          </p>
        </div>

        {assessment.matchedSkills && assessment.matchedSkills.length > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Skills Being Tested:
              </p>
              <div className="flex flex-wrap gap-2">
                {assessment.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-200">Assessment Details</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Total Questions: {assessment.totalQuestions || assessment.questions?.length || 0}</li>
                <li>• Time Per Question: 2 minutes</li>
                <li>• Total Time: {(assessment.questions?.length || 0) * 2} minutes</li>
                <li>• Passing Score: {assessment.passingScore || 70}%</li>
              </ul>
            </div>

            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-200 text-sm ml-5">
                <strong>Security Notice:</strong> This assessment is monitored for integrity. The following are prohibited and will be recorded:
              </AlertDescription>
            </Alert>

            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Prohibited Activities:</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>🚫 Switching to another tab or window</li>
                <li>🚫 Exiting fullscreen mode</li>
                <li>🚫 Copying, pasting, or cutting content</li>
                <li>🚫 Right-clicking or accessing context menu</li>
                <li>🚫 Opening developer tools</li>
                <li>🚫 Taking screenshots or recording screen</li>
                <li>🚫 Opening links in new windows/tabs</li>
              </ul>
              <p className="text-xs text-muted-foreground italic mt-3">
                Violations will be recorded server-side. After {VIOLATION_THRESHOLD} violations, you'll receive a warning. After {MAX_VIOLATIONS_BEFORE_AUTO_SUBMIT} violations, the assessment will auto-submit.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">Instructions:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Answer all questions within the time limit</li>
                <li>✓ You can review and change your answers before submission</li>
                <li>✓ Stay in fullscreen throughout the assessment</li>
                <li>✓ Keep this window/tab in focus at all times</li>
                <li>✓ Once submitted, you cannot change your answers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleStartAssessment} size="lg" className="w-full">
          Start Assessment (Fullscreen)
        </Button>
      </div>
    )
  }

  if (state === "taking") {
    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <h2 className="text-lg font-bold">Assessment Error</h2>
              <p className="text-sm text-muted-foreground">Assessment data is not available</p>
              <Button onClick={() => router.push("/")} variant="outline">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const currentQuestion = assessment.questions[currentQuestionIndex]

    return (
      <div
        ref={pageRef}
        className="min-h-screen bg-background flex flex-col p-4 md:p-6"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 bg-background border-b border-border py-4 mb-6 -mx-4 md:-mx-6 px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
            <div className="flex-1">
              <h2 className="font-bold text-foreground">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </h2>
              <div className="h-1 w-full bg-muted rounded-full mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className={`flex flex-col items-end gap-1 shrink-0 ${isTimeAlmostUp ? "text-red-500" : "text-foreground"}`}>
              <div className="flex items-center gap-2 font-mono font-bold">
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
              {tabHidden && (
                <div className="text-xs text-amber-500 font-semibold">⚠️ Tab Hidden</div>
              )}
              {!isFullscreen && (
                <div className="text-xs text-red-500 font-semibold">⚠️ Not Fullscreen</div>
              )}
            </div>
          </div>

          {/* Violations indicator */}
          {violations.length > 0 && (
            <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              {violations.length} violation{violations.length !== 1 ? "s" : ""} recorded
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-5xl mx-auto w-full space-y-6">
          {/* Question Type Renderer */}
          {getQuestionType(currentQuestion) === "mcq" && (
            <MCQQuestion
              question={currentQuestion}
              selectedAnswerIndex={answers[currentQuestion.id]?.selectedAnswerIndex}
              onSelectAnswer={(index) => handleSelectAnswer(currentQuestion.id, index)}
            />
          )}

          {getQuestionType(currentQuestion) === "fill_blank" && (
            <FillBlankQuestion
              question={currentQuestion}
              answer={answers[currentQuestion.id]?.freeTextAnswer}
              onAnswerChange={(text) => handleSetFreeTextAnswer(currentQuestion.id, text)}
            />
          )}

          {getQuestionType(currentQuestion) === "descriptive" && (
            <DescriptiveQuestion
              question={currentQuestion}
              answer={answers[currentQuestion.id]?.freeTextAnswer}
              onAnswerChange={(text) => handleSetFreeTextAnswer(currentQuestion.id, text)}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {/* <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || !isCurrentQuestionAnswered}
              variant="outline"
              title={!isCurrentQuestionAnswered ? "Answer the current question first" : ""}
            >
              Previous
            </Button> */}

            {/* <div className="text-sm text-muted-foreground">
              {totalAnswered} of {assessment.questions.length} answered
            </div> */}

            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!allMCQAnswered || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionAnswered}
                title={!isCurrentQuestionAnswered ? "Answer the current question first" : ""}
              >
                Next
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Questions Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {assessment.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined
                  const isCurrent = idx === currentQuestionIndex
                  const canNavigate = isAnswered || isCurrent

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        // Allow navigation if question is answered or is current
                        if (canNavigate) {
                          setCurrentQuestionIndex(idx)
                        } else {
                          toast.warning("Answer the current question first", {
                            duration: 2000,
                          })
                        }
                      }}
                      disabled={!canNavigate}
                      className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                          : isAnswered
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 cursor-pointer hover:opacity-80"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      }`}
                      title={!canNavigate ? "Answer the current question to unlock" : ""}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (state === "violation_disabled") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-950/30">
        <Card className="max-w-md border-red-200 dark:border-red-800/40">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Assessment Disabled
              </h2>
              <p className="text-muted-foreground">
                Your assessment has been disabled due to suspicious activity (proctoring violations).
              </p>
            </div>

            <div className="bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Violations Detected:
              </p>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {violations.map((v, idx) => (
                  <li key={idx}>
                    • {v.type}: {v.details || "Violation detected"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
              <p className="text-xs text-red-700 dark:text-red-300">
                ⏱️ You will be logged out automatically in a few seconds. Please contact support if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === "submitting") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Assessment Submitted!</h2>
              <p className="text-muted-foreground">
                Your assessment has been submitted successfully. We will get back to you soon.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-lg p-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                ✓ Thank you for completing the assessment. Our team will review your responses and contact you with the results.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === "results") {
    if (!assessment?.questions) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <h2 className="text-lg font-bold">Error</h2>
              <p className="text-sm text-muted-foreground">Assessment data is not available</p>
              <Button onClick={() => router.push("/")} variant="outline">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const correctCount = Object.entries(answers)
      .filter(([qId, answer]) => {
        const question = assessment.questions.find((q: any) => q.id === qId)
        const qType = getQuestionType(question)
        return qType === "mcq" && answer.selectedAnswerIndex === question?.correctAnswer
      })
      .length
    
    const mcqCount = assessment.questions.filter((q: any) => getQuestionType(q) === "mcq").length

    return (
      <div className="space-y-6 pb-12 max-w-2xl mx-auto p-4">
        {/* Result header */}
        <div className="text-center">
          {isAlreadySubmitted && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              ✓ Already Submitted
            </div>
          )}
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              passed
                ? "bg-emerald-100 dark:bg-emerald-950/50"
                : "bg-red-100 dark:bg-red-950/50"
            }`}
          >
            {passed ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {passed ? "Congratulations! 🎉" : "Not Passed"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {passed
              ? "You have successfully passed the assessment."
              : "You did not meet the passing score. Keep practicing!"}
          </p>
        </div>

        {/* Score card */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{score}%</div>
                <div className="text-xs text-muted-foreground mt-1">Your Score</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {correctCount}/{mcqCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Correct Answers (MCQ Only)
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-600">
                  {assessment.passingScore || 70}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Passing Score
                </div>
              </div>
            </div>

            {!passed && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-600 -mt-1" />
                <AlertDescription className="text-amber-700 dark:text-amber-200 text-sm ml-5">
                  You scored {score}%, but need {assessment.passingScore}% to pass. Please
                  review the material and try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Violations Summary */}
        {violations.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
            <CardHeader>
              <CardTitle className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {violations.length} Violation{violations.length !== 1 ? "s" : ""} Recorded
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {violations.map((v, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-white dark:bg-slate-900/50 p-2 rounded border border-amber-200 dark:border-amber-800"
                >
                  <p className="font-semibold text-amber-700 dark:text-amber-300">
                    {v.type}
                  </p>
                  {v.details && (
                    <p className="text-amber-600 dark:text-amber-400 text-[11px] mt-0.5">
                      {v.details}
                    </p>
                  )}
                  <p className="text-muted-foreground text-[10px] mt-0.5">
                    {new Date(v.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Review answers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Answer Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {assessment.questions?.map((question: any, idx: number) => {
              const answer = answers[question.id]
              const notAnswered = !answer
              const qType = getQuestionType(question)
              
              if (qType === "mcq") {
                const isCorrect = answer?.selectedAnswerIndex === question.correctAnswer
                
                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border ${
                      notAnswered
                        ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30"
                        : isCorrect
                        ? "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {notAnswered ? (
                        <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {idx + 1}. {question.question}
                        </p>
                        {!notAnswered && (
                          <div className="mt-2 space-y-1 text-sm">
                            <p
                              className={
                                isCorrect
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-red-700 dark:text-red-300"
                              }
                            >
                              <strong>Your answer:</strong>{" "}
                              {(question.options ?? [])[answer.selectedAnswerIndex ?? 0]}
                            </p>
                            {!isCorrect && (
                              <>
                                <p className="text-emerald-700 dark:text-emerald-300">
                                  <strong>Correct answer:</strong>{" "}
                                  {(question.options ?? [])[question.correctAnswer ?? 0]}
                                </p>
                                {question.explanation && (
                                  <p className="text-muted-foreground italic">
                                    <strong>Explanation:</strong>{" "}
                                    {question.explanation}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {notAnswered && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Not answered
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              } else {
                // Free-input question
                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border ${
                      notAnswered
                        ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30"
                        : "border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {notAnswered ? (
                        <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {idx + 1}. {question.question}
                        </p>
                        {notAnswered ? (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Not answered
                          </p>
                        ) : (
                          <>
                            <div className="mt-2 p-2.5 bg-white dark:bg-slate-900/50 rounded border border-blue-200 dark:border-blue-800/40">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {answer.freeTextAnswer}
                              </p>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                              This response has been submitted for manual review by the assessment team.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </CardContent>
        </Card>

        <Button onClick={handleFinish} size="lg" className="w-full">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return null
}
