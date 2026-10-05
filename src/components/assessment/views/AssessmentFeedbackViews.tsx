import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ViolationRecord {
  type: string
  timestamp: number
  details?: string
}

interface AssessmentForcedSubmitViewProps {
  forcedSubmitViolations: ViolationRecord[]
}

export function AssessmentForcedSubmitView({ forcedSubmitViolations }: AssessmentForcedSubmitViewProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-950/30">
      <Card className="max-w-lg w-full mx-4 border-red-200 dark:border-red-800/40">
        <CardContent className="pt-6 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Assessment Auto-Submitted
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You reached the maximum number of allowed violations. Your assessment has been
              automatically submitted and your session will end shortly.
            </p>
          </div>

          {/* Violations list */}
          <div className="bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-lg p-4 text-left space-y-3">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300 text-center">
              Violations that triggered auto-submit ({forcedSubmitViolations.length})
            </p>
            <ul className="space-y-2">
              {forcedSubmitViolations.map((v, idx) => (
                <li
                  key={idx}
                  className="text-xs bg-white dark:bg-slate-900/50 rounded border border-red-200 dark:border-red-800 p-2.5 space-y-0.5"
                >
                  <p className="font-semibold text-red-700 dark:text-red-300">
                    #{idx + 1} — {v.type.replace(/_/g, " ")}
                  </p>
                  {v.details && (
                    <p className="text-red-600 dark:text-red-400">{v.details}</p>
                  )}
                  <p className="text-muted-foreground text-[10px]">
                    {new Date(v.timestamp).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Logout countdown notice */}
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
            <p className="text-xs text-red-700 dark:text-red-300">
              ⏱️ You will be logged out automatically in a few seconds. Contact support if you believe
              this is an error.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AssessmentDisabledViewProps {
  violations: ViolationRecord[]
}

export function AssessmentDisabledView({ violations }: AssessmentDisabledViewProps) {
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


