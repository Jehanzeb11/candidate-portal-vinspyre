import { AlertCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { Assessment, AssessmentAnswer } from "@/types"

interface ViolationRecord {
  type: string
  timestamp: number
  details?: string
}

interface AssessmentResultsViewProps {
  assessment: Assessment
  answers: Record<string, AssessmentAnswer>
  passed: boolean
  score: number
  violations: ViolationRecord[]
  isAlreadySubmitted: boolean
  handleFinish: () => void
  onReturnToDashboard: () => void
  getQuestionType: (question: any) => string
}

export function AssessmentResultsView({
  assessment,
  answers,
  passed,
  score,
  violations,
  isAlreadySubmitted,
  handleFinish,
  onReturnToDashboard,
  getQuestionType
}: AssessmentResultsViewProps) {
  if (!assessment?.questions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Error</h2>
            <p className="text-sm text-muted-foreground">Assessment data is not available</p>
            <Button onClick={onReturnToDashboard} variant="outline">
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
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${passed
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
                  className={`p-3 rounded-lg border ${notAnswered
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
                  className={`p-3 rounded-lg border ${notAnswered
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
