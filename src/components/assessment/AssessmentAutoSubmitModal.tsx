"use client"

import { AlertCircle, Clock, ArrowRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "../ui/button"

interface AssessmentAutoSubmitModalProps {
  isOpen: boolean
  onReturnDashboard: () => void
}

export function AssessmentAutoSubmitModal({
  isOpen,
  onReturnDashboard,
}: AssessmentAutoSubmitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-md w-full bg-white rounded-[32px] p-8 sm:p-10 flex flex-col shadow-2xl border-0"
      >
        {/* Alert Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-11 w-11 text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Label */}
        <p className="text-[10px] font-extrabold tracking-widest text-red-500 uppercase mb-2 text-center">
          3 Violation Reached
        </p>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-[#0f172a] mb-3 text-center">
          Assessment Auto Submitted
        </h2>

        {/* Description */}
        <p className="text-[13px] text-[#64748b] leading-relaxed mb-6 text-center">
          Your assessment has been automatically submitted and you can no longer continue or make changes to your answers.
        </p>

        {/* Info Box */}
        <div className="flex items-start gap-3 px-4 py-4 bg-slate-50 rounded-2xl mb-6">
          <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#64748b] leading-relaxed">
            Please wait for the recruitment team to review your submission and provide further updates.
          </p>
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
