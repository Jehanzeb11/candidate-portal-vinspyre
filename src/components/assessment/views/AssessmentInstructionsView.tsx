import { AlertCircle, Clock, CheckCircle, XCircle, FileText, Timer, TrendingUp, Ban, PenTool, Sparkles, GitBranch, ArrowLeft, ArrowRight, Loader, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Assessment } from "@/types"

interface AssessmentInstructionsViewProps {
  assessment: Assessment
  screenRecordingDetected: boolean
  screenRecordingCheckInProgress: boolean
  checkInProgressRef: React.MutableRefObject<boolean>
  onBack: () => void
  onStart: () => void
  onCheckScreenRecording: () => Promise<boolean>
  setScreenRecordingDetected: (detected: boolean) => void
  setScreenRecordingCheckInProgress: (inProgress: boolean) => void
  VIOLATION_THRESHOLD: number
}

export function AssessmentInstructionsView({
  assessment,
  screenRecordingDetected,
  screenRecordingCheckInProgress,
  checkInProgressRef,
  onBack,
  onStart,
  onCheckScreenRecording,
  setScreenRecordingDetected,
  setScreenRecordingCheckInProgress,
  VIOLATION_THRESHOLD
}: AssessmentInstructionsViewProps) {
  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-full mx-auto pt-6 space-y-6">

        {/* Back button */}
        <Button
          variant={"link"}
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>

        {/* Header area */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 ">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                Your Next Step
              </span>
              <div className="h-1 w-12 bg-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a2342] tracking-tight">
              {assessment.title || "Technical Assessment"}
            </h1>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {assessment.description || "A chance to show us your approach to design and problem-solving.\nTake a moment to get comfortable before you begin."}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              onClick={onStart}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-5 rounded-xl shadow-sm text-sm font-bold flex items-center gap-2"
            >
              {"Start Assessment"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Questions", value: assessment.totalQuestions || assessment.questions?.length || 0, icon: FileText },
            { label: "Per question", value: "2 min", icon: Clock },
            { label: "Total time", value: `${(assessment.questions?.length || 0) * 2} min`, icon: Timer },
            { label: "Pass score", value: `${assessment.passingScore || 70}%`, icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="bg-[#FBEAF0] border-2 border-[#F5D3DF] rounded-[22px] px-6 py-5 relative overflow-hidden flex items-center gap-5 min-h-[100px]">
              {/* Large decorative filled circle — right center, partially cropped */}
              {/* <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[100px] h-[110px] bg-pink-200 rounded-full pointer-events-none" /> */}
              {/* Smaller circle overlapping top-right of the big one */}
              <div className="absolute right-[-55px] top-[-55px] w-[150px] h-[150px] bg-[#f5d3df9a] border-2 border-[#F5D3DF] rounded-full pointer-events-none z-20" />
              <div className="absolute right-[-45px] top-[-60px] w-[170px] h-[170px] bg-[#ffeff5b9] rounded-full pointer-events-none z-10" />

              {/* White icon box */}
              <div className="w-[60px] h-[60px] bg-white rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] flex items-center justify-center shrink-0 relative z-30">
                <stat.icon className="h-[26px] w-[26px] text-rose-500" strokeWidth={1.6} />
              </div>

              {/* Text */}
              <div className="relative z-30 min-w-0">
                <p className="text-[28px] font-bold text-[#1a2342] leading-none tracking-tight">{stat.value}</p>
                <p className="text-[13px] font-normal text-[#B0B8C1] mt-2 whitespace-nowrap">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Skills assessed */}
        {assessment.matchedSkills && assessment.matchedSkills.length > 0 && (
          <div className="bg-[#FBEAF0] border-2 border-[#F5D3DF] rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-[18px] font-bold text-[#1a2342]">What you'll be assessed on</p>
              <div className="flex flex-wrap gap-3">
                {assessment.matchedSkills.map((skill: string, i: number) => {
                  let Icon = Sparkles
                  if (skill.toLowerCase().includes("design")) Icon = PenTool
                  if (skill.toLowerCase().includes("problem")) Icon = GitBranch

                  return (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-pink-100 rounded-lg shadow-sm">
                      <Icon className="h-3 w-3 text-rose-500" />
                      <span className="text-[12px] font-bold text-[#1a2342]">{skill}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 text-right hidden md:block">
              This assessment helps us understand your skills and approach.
            </p>
          </div>
        )}

        {/* Rules section */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">

          {/* Guidelines */}
          <div className="bg-[#F1F6FF] border-2 border-[#D7E6FF] rounded-[24px] p-6 sm:p-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <FileText className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-[#1a2342] mb-6">GUIDELINES</h2>
            <ul className="space-y-4">
              {[
                "Stay in fullscreen for the entire session",
                "Keep this window in focus at all times",
                "You can review answers before final submission",
                "Each question has a 2-minute timer",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" strokeWidth={5} />
                  </div>
                  <span className="text-[14px] font-medium text-[#475569]">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prohibited */}
          <div className="bg-[#FFF1F3] border-2 border-[#F5D3DF] rounded-[24px] p-6 sm:p-8 flex flex-col">
            <div className="w-12 h-12 bg-[#FFDCE5] text-rose-500 rounded-xl flex items-center justify-center mb-6">
              <Ban className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-[#1a2342] mb-6">PROHIBITED</h2>
            <ul className="space-y-4 flex-1">
              {[
                "Switching tabs or windows",
                "Copying, pasting, or right-clicking",
                "Opening developer tools or taking screenshots",
                "Opening links in new windows or tabs",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5 text-white" strokeWidth={4} />
                  </div>
                  <span className="text-[14px] font-medium text-[#475569]">{rule}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 bg-[#FFDCE5] rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
              <p className="text-[12px] font-medium text-rose-700">
                Violations are recorded. After {VIOLATION_THRESHOLD} warnings the test auto-submits.
              </p>
            </div>
          </div>

        </div>


      </div>
    </div>
  )
}
