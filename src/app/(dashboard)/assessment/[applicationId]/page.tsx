"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { dummyAssessment } from "@/mocks/assessments"
import type { AssessmentAnswer } from "@/types"

type AssessmentState = "instructions" | "taking" | "results"

export default function AssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.applicationId as string

  const [state, setState] = useState<AssessmentState>("instructions")
  const [timeLeft, setTimeLeft] = useState(dummyAssessment.timeLimit * 60) // in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const assessment = dummyAssessment
  const currentQuestion = assessment.questions[currentQuestionIndex]
  const totalAnswered = Object.keys(answers).length

  // ─── Security: Disable copy/paste ───────────────────────────────────────
  useEffect(() => {
    if (state !== "taking") return

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
    }
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
    }
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
    }
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable developer tools (F12, Ctrl+Shift+I, etc.)
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.shiftKey && e.key === "C")
      ) {
        e.preventDefault()
      }
    }

    // Disable new window/tab
    const handlePopup = (e: PopupEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener("copy", handleCopy)
    document.addEventListener("paste", handlePaste)
    document.addEventListener("cut", handleCut)
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("open", handlePopup as any)

    return () => {
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("paste", handlePaste)
      document.removeEventListener("cut", handleCut)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("open", handlePopup as any)
    }
  }, [state])

  // Prevent opening new windows/tabs
  useEffect(() => {
    if (state !== "taking") return

    const originalOpen = window.open
    window.open = function (...args: any[]) {
      return null
    }

    return () => {
      window.open = originalOpen
    }
  }, [state])

  // Prevent links from opening in new window
  useEffect(() => {
    if (state !== "taking") return

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === "A" && target.getAttribute("target") === "_blank") {
        e.preventDefault()
      }
    }

    document.addEventListener("click", handleLinkClick, true)
    return () => document.removeEventListener("click", handleLinkClick, true)
  }, [state])

  // ─── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "taking" || timeLeft <= 0) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time is up
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state, timeLeft])

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleStartAssessment = () => {
    setState("taking")
  }

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0
    assessment.questions.forEach((question) => {
      const selectedIndex = answers[question.id]
      if (selectedIndex === question.correctAnswer) {
        correctCount++
      }
    })

    const scorePercentage = Math.round((correctCount / assessment.questions.length) * 100)
    const isPassed = scorePercentage >= assessment.passingScore

    setScore(scorePercentage)
    setPassed(isPassed)

    // TODO: Submit to backend API
    // POST /recruitment/assessment/submit
    // payload: { applicationId, assessmentId, answers, score, passed }

    setState("results")
  }

  const handleFinish = () => {
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // ─── States ─────────────────────────────────────────────────────────────

  if (state === "instructions") {
    return (
      <div className="space-y-6 pb-12 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{assessment.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-200">Assessment Details</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Total Questions: {assessment.totalQuestions}</li>
                <li>• Time Limit: {assessment.timeLimit} minutes</li>
                <li>• Passing Score: {assessment.passingScore}%</li>
              </ul>
            </div>

            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-200 text-sm">
                <strong>Important:</strong> This assessment has security restrictions in place. Copy/paste, right-click, new windows/tabs, and developer tools are disabled. Do not attempt to circumvent these restrictions.
              </AlertDescription>
            </Alert>

            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">Instructions:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Answer all questions within the time limit</li>
                <li>• You can review and change your answers before submission</li>
                <li>• Once submitted, you cannot change your answers</li>
                <li>• Your score will be displayed immediately after submission</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleStartAssessment} size="lg" className="w-full">
          Start Assessment
        </Button>
      </div>
    )
  }

  if (state === "taking") {
    const isTimeAlmostUp = timeLeft < 300 // Less than 5 minutes

    return (
      <div ref={pageRef} className="space-y-6 pb-12 max-w-3xl mx-auto" onContextMenu={(e) => e.preventDefault()}>
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground">Question {currentQuestionIndex + 1} of {assessment.questions.length}</h2>
            <div className="h-1 w-full bg-muted rounded-full mt-2 max-w-xs">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className={`flex items-center gap-2 font-mono font-bold ${isTimeAlmostUp ? "text-red-500" : "text-foreground"}`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options */}
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() ?? ""}
              onValueChange={(value) =>
                handleSelectAnswer(currentQuestion.id, parseInt(value))
              }
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      disabled={state !== "taking"}
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {totalAnswered} of {assessment.questions.length} answered
          </div>

          {currentQuestionIndex === assessment.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={totalAnswered !== assessment.questions.length}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Submit Assessment
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>Next</Button>
          )}
        </div>

        {/* Question navigator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Questions Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {assessment.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined
                const isCurrent = idx === currentQuestionIndex

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === "results") {
    const correctCount = Object.entries(answers).filter(([qId, selectedIdx]) => {
      const question = assessment.questions.find((q) => q.id === qId)
      return question && selectedIdx === question.correctAnswer
    }).length

    return (
      <div className="space-y-6 pb-12 max-w-2xl mx-auto">
        {/* Result header */}
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            passed
              ? "bg-emerald-100 dark:bg-emerald-950/50"
              : "bg-red-100 dark:bg-red-950/50"
          }`}>
            {passed ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{passed ? "Congratulations! 🎉" : "Not Passed"}</h1>
          <p className="text-muted-foreground mt-1">
            {passed ? "You have successfully passed the assessment." : "You did not meet the passing score. Keep practicing!"}
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
                <div className="text-2xl font-bold">{correctCount}/{assessment.questions.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Correct Answers</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-600">{assessment.passingScore}%</div>
                <div className="text-xs text-muted-foreground mt-1">Passing Score</div>
              </div>
            </div>

            {!passed && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-200 text-sm">
                  You scored {score}%, but need {assessment.passingScore}% to pass. Please review the material and try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Review answers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Answer Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {assessment.questions.map((question, idx) => {
              const selectedIndex = answers[question.id]
              const isCorrect = selectedIndex === question.correctAnswer
              const notAnswered = selectedIndex === undefined

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
                      <p className="text-sm font-semibold">{idx + 1}. {question.question}</p>
                      {!notAnswered && (
                        <div className="mt-2 space-y-1 text-sm">
                          <p className={isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}>
                            <strong>Your answer:</strong> {question.options[selectedIndex]}
                          </p>
                          {!isCorrect && (
                            <>
                              <p className="text-emerald-700 dark:text-emerald-300">
                                <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                              </p>
                              {question.explanation && (
                                <p className="text-muted-foreground italic">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      {notAnswered && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Not answered</p>}
                    </div>
                  </div>
                </div>
              )
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
