import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ViolationRecord {
  type: string
  timestamp: number
  details?: string
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


