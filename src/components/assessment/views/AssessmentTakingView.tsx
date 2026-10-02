import * as React from "react"
import { AlertCircle, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Assessment, AssessmentAnswer } from "@/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface ViolationRecord {
  type: string
  timestamp: number
  details?: string
}

interface AssessmentTakingViewProps {
  pageRef?: React.RefObject<HTMLDivElement> | any
  assessment: Assessment
  currentQuestionIndex: number
  currentQuestion: any
  timeLeft: number
  progressPercentage: number
  isTimeAlmostUp: boolean
  tabHidden: boolean
  violations: ViolationRecord[]
  answers: Record<string, AssessmentAnswer>
  handleSelectAnswer: (questionId: string, answerIndex: number) => void
  handleSetFreeTextAnswer: (questionId: string, text: string) => void
  handleNextQuestion: () => void
  handleSubmit: () => void
  isSubmitting: boolean
  isCurrentQuestionAnswered: boolean
  totalAnswered: number
  formatTime: (seconds: number) => string
  getQuestionType: (question: any) => string
}

export function AssessmentTakingView({
  pageRef,
  assessment,
  currentQuestionIndex,
  currentQuestion,
  timeLeft,
  progressPercentage,
  isTimeAlmostUp,
  tabHidden,
  violations,
  answers,
  handleSelectAnswer,
  handleSetFreeTextAnswer,
  handleNextQuestion,
  handleSubmit,
  isSubmitting,
  isCurrentQuestionAnswered,
  totalAnswered,
  formatTime,
  getQuestionType
}: AssessmentTakingViewProps) {
  // ── Hooks must be declared before any early return ──
  const [showViolationWarning, setShowViolationWarning] = React.useState(false)
  const [lastViolationCount, setLastViolationCount] = React.useState(violations.length)

  React.useEffect(() => {
    if (violations.length > lastViolationCount && violations.length < 3) {
      setShowViolationWarning(true)
      setLastViolationCount(violations.length)
    } else if (violations.length > lastViolationCount) {
      setLastViolationCount(violations.length)
    }
  }, [violations.length, lastViolationCount])

  if (!assessment || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Assessment Error</h2>
            <p className="text-sm text-muted-foreground">Assessment data is not available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const qType = getQuestionType(currentQuestion)
  const questionNumberStr = String(currentQuestionIndex + 1).padStart(2, "0")
  const totalQuestions = assessment.questions?.length ?? 0
  const freeTextValue = answers[currentQuestion.id]?.freeTextAnswer ?? ""
  const selectedMCQIndex = answers[currentQuestion.id]?.selectedAnswerIndex

  const categoryTag = currentQuestion.category || currentQuestion.skillTag || "Designer Editor"
  const questionHint = currentQuestion.description || currentQuestion.hint || "Think through your approach and share a clear, concise answer."

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col font-sans pb-16"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ── Sub Header Bar: Technical Assessment title + badges ─────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-primary uppercase leading-none mb-2">
              {assessment.title?.toUpperCase() || "TECHNICAL ASSESSMENT"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-[#0f172a] flex items-baseline gap-2">
              <span>Question</span>
              <span>{currentQuestionIndex + 1}</span>
              <span className="font-bold text-[#8ca0be]">of {totalQuestions}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Violations badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200/90 bg-white shadow-2xs text-xs font-semibold text-[#8ca0be]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#94a3b8]"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="11" x2="12" y2="14" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Violations {violations.length}/3</span>
            </div>

            {/* Timer badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors bg-[#FFE7F1] text-[#DC2E67]`}>
              <Clock className="h-4 w-4 stroke-[2.5]" />
              <span className="text-sm font-extrabold font-mono tracking-wide">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* ── Main Question Card ────────────────────────────────────────── */}
        <div className="relative bg-white border border-slate-100/90 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-10 pl-8 sm:pl-12">
          {/* Left Vertical Hot Pink Accent Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ff3870]" />

          {/* Card Top: QUESTION 01 + Category Pill */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-extrabold tracking-wider text-[#ff3870] uppercase">
              QUESTION {questionNumberStr}
            </span>
            <span className="bg-[#fde8ef] text-[#ff3870] px-4 py-1.5 rounded-full text-xs font-bold">
              {categoryTag}
            </span>
          </div>

          {/* Question Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] leading-snug mb-2">
            {currentQuestion.question}
          </h2>

          {/* Subtitle / Hint */}
          <p className="text-[#8ca0be] text-sm font-normal mb-8">
            {questionHint}
          </p>

          {/* Answer Section */}
          <div className="space-y-3 mb-8">
            <label className="text-[#94a3b8] text-[11px] font-extrabold tracking-wider uppercase mb-2 block">
              YOUR ANSWER
            </label>

            {qType === "mcq" ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option: string, index: number) => {
                  const isSelected = selectedMCQIndex === index
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                      className={`
                        w-full text-left px-5 py-4 rounded-2xl border transition-all
                        flex items-center justify-between gap-3 relative overflow-hidden
                        ${isSelected
                          ? "border-[#ff3870] bg-[#ff3870]/5 shadow-xs font-semibold text-[#0f172a]"
                          : "border-slate-200/90 bg-white hover:border-[#ff3870]/40 hover:bg-[#ff3870]/[0.02] text-slate-700"
                        }
                      `}
                    >
                      <span className="text-sm sm:text-base font-medium">{option}</span>
                      <div className={`
                        w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center flex-shrink-0
                        ${isSelected ? "border-[#ff3870] bg-[#ff3870]" : "border-slate-300"}
                      `}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <textarea
                value={freeTextValue}
                onChange={(e) => handleSetFreeTextAnswer(currentQuestion.id, e.target.value)}
                placeholder="Write your answer here..."
                rows={6}
                className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff3870]/20 focus:border-[#ff3870] transition-all resize-y min-h-[160px]"
              />
            )}
          </div>

          {/* Card Footer: Character count + Next button */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-[#94a3b8]">
              {qType === "mcq" ? `${selectedMCQIndex !== undefined ? 1 : 0} selected` : `${freeTextValue.length} characters`}
            </span>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#ff3870] hover:bg-[#e02b61] active:scale-[0.99] text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-sm flex items-center gap-2.5 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? "Submitting..." : "Finish Assessment"}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionAnswered}
                className={"md:px-8 px-4"}
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Button>
            )}
          </div>
        </div>
      </div>


      <Dialog open={showViolationWarning} onOpenChange={setShowViolationWarning}>
        <DialogContent showCloseButton={false} className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl border-0">
          <div className="w-14 h-14 bg-[#fff3e0] rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="h-6 w-6 text-amber-500" strokeWidth={2} />
          </div>
          
          <p className="text-[10px] font-extrabold tracking-widest text-[#ff3870] uppercase mb-2">
            Assessment Guidelines
          </p>
          
          <DialogTitle className="text-2xl font-extrabold text-[#0f172a] mb-3">
            Warning {violations.length}/3
          </DialogTitle>
          
          <p className="text-[#94a3b8] text-sm leading-relaxed mb-8 px-4">
            {violations[violations.length - 1]?.details || "Window lost focus. Please stay in the assessment window and follow the guidelines."} After 3 violations, your answers will be automatically submitted.
          </p>

          <button
            onClick={() => setShowViolationWarning(false)}
            className="w-full bg-[#ff3870] hover:bg-[#e02b61] active:scale-[0.99] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Continue Assessment</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
