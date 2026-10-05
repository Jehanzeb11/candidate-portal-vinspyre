"use client"

import { CheckCircle2, ArrowRight, CheckCheck } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "../ui/button"

interface AssessmentSubmissionSuccessModalProps {
  isOpen: boolean
  questionCount: number
  onReturnDashboard: () => void
}

export function AssessmentSubmissionSuccessModal({
  isOpen,
  questionCount,
  onReturnDashboard,
}: AssessmentSubmissionSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-md w-full bg-white rounded-[32px] p-8 sm:p-10 flex flex-col shadow-2xl border-0"
      >
        {/* Checkmark Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCheck className="h-11 w-11 text-emerald-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Label */}
        <p className="text-[10px] font-extrabold tracking-widest text-primary uppercase mb-2 text-center">
          One Step Closer
        </p>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-[#0f172a] mb-3 text-center">
          Assessment Submitted
        </h2>

        {/* Description */}
        <p className="text-[13px] text-[#64748b] leading-relaxed mb-6 text-center">
          Your answers have been submitted successfully. Our team will review your results and reach out with an update soon.
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 px-4 py-4 bg-slate-50 rounded-2xl mb-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Questions Completed
            </p>
            <p className="text-xl font-extrabold text-[#0f172a]">{questionCount}</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Status
            </p>
            <p className="text-sm font-bold text-slate-600">Under review</p>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onReturnDashboard}
        >
          Return to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  )
}
