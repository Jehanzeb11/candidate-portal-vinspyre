import { AlertCircle, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MCQQuestion, FillBlankQuestion, DescriptiveQuestion } from "@/components/assessment/QuestionTypes"
import type { Assessment, AssessmentAnswer } from "@/types"

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
  if (!assessment || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Progress Bar - Top */}
      <div className="sticky top-0 z-30 bg-background border-b border-border/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress header */}
          <div className="flex items-center justify-between mb-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-1">Progress</p>
              <h2 className="text-lg font-bold text-foreground">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </h2>
            </div>
            <div className={`text-right shrink-0 ${isTimeAlmostUp ? "text-red-500" : "text-foreground"}`}>
              <div className="flex items-center gap-2 font-mono font-bold text-lg justify-end">
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Time remaining</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            {tabHidden && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" />
                Tab Hidden
              </span>
            )}
            {violations.length > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                violation : {violations.length} / 3
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-8 px-4 sm:px-6">
        <div className="w-full max-w-4xl">
          {/* Session title */}
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-2">
              {assessment.title || "Technical Assessment"}
            </p>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            {currentQuestion.question}
          </h1>

          {/* Question content */}
          <div className="space-y-4 mb-12">
            {/* Question Type Renderer */}
            {getQuestionType(currentQuestion) === "mcq" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {currentQuestion.options?.map((option: string, index: number) => {
                    const isSelected = answers[currentQuestion.id]?.selectedAnswerIndex === index
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                        className={`
                          w-full text-left px-4 py-3 rounded-lg border transition-all
                          flex items-center justify-between gap-3 relative overflow-hidden
                          ${isSelected
                            ? "border-primary bg-inset dark:border-indigo-500/50 dark:bg-indigo-950/30"
                            : "border-border/50 bg-transparent hover:border-border hover:bg-muted/30"
                          }
                        `}
                      >
                        {/* Left accent bar */}
                        {isSelected && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
                        )}
                        <span className={`text-sm font-semibold pl-2 ${isSelected ? "text-black dark:text-indigo-100" : "text-black/50"}`}>
                          {option}
                        </span>
                        {/* Radio dot on the right */}
                        <div
                          className={`
                            flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all
                            flex items-center justify-center
                            ${isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30 bg-transparent"
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
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
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-border/50">
            <div className="text-sm text-muted-foreground text-center">
              {totalAnswered} of {assessment.questions.length} answered
            </div>

            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Submitting..." : "Finish Assessment"}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionAnswered}
                className="px-8 bg-primary hover:bg-primary/90"
                title={!isCurrentQuestionAnswered ? "Answer the current question first" : ""}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
