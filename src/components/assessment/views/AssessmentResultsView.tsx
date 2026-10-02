import { Check, Clock, ArrowRight, CheckCheck } from "lucide-react"
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

  const totalQuestions = assessment?.questions?.length || 0
  const completedQuestions = Object.keys(answers).length

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl p-10 sm:p-14 max-w-lg w-full mx-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">

      {/* Success Icon */}
      <div className="w-16 h-16 bg-[#e6f8ef] rounded-full flex items-center justify-center mb-6">
        <CheckCheck className="h-8 w-8 text-[#10b981] stroke-[3]" />
      </div>

      {/* Title block */}
      <p className="text-[10px] font-extrabold tracking-[0.15em] text-[#ff3870] uppercase mb-2">
        One step closer
      </p>

      <h1 className="text-3xl font-extrabold text-[#0f172a] mb-4">
        Assessment Submitted
      </h1>

      <p className="text-[#8ca0be] text-sm leading-relaxed max-w-[320px] mx-auto mb-8">
        Your answers have been submitted successfully. Our team will review your results and reach out with an update soon.
      </p>

      {/* Info Divider */}
      <div className="w-full h-px bg-slate-100 mb-6" />

      {/* Meta Info */}
      <div className="flex items-center justify-center gap-8 mb-10 w-full text-xs font-semibold text-[#8ca0be]">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{totalQuestions} questions completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Under review</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleFinish}
      >
        <span>Return to Dashboard</span>
        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
      </Button>

    </div>
  )
}
