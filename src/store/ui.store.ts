import { create } from "zustand"
import { devtools } from "zustand/middleware"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AssessmentHeaderState {
  title: string
  questionIndex: number
  totalQuestions: number
  violations: number
  violationThreshold: number
  timeLeft: number
  isTimeAlmostUp: boolean
  progressPercentage: number
  active: boolean
}

interface UIState {
  sidebarOpen: boolean
  assessmentHeader: AssessmentHeaderState
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setAssessmentHeader: (state: Partial<AssessmentHeaderState>) => void
  clearAssessmentHeader: () => void
}

const defaultAssessmentHeader: AssessmentHeaderState = {
  title: "",
  questionIndex: 0,
  totalQuestions: 0,
  violations: 0,
  violationThreshold: 3,
  timeLeft: 0,
  isTimeAlmostUp: false,
  progressPercentage: 0,
  active: false,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      assessmentHeader: defaultAssessmentHeader,

      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "ui/toggleSidebar"),
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }, false, "ui/setSidebarOpen"),
      setAssessmentHeader: (state) =>
        set((s) => ({ assessmentHeader: { ...s.assessmentHeader, ...state, active: true } }), false, "ui/setAssessmentHeader"),
      clearAssessmentHeader: () =>
        set({ assessmentHeader: defaultAssessmentHeader }, false, "ui/clearAssessmentHeader"),
    }),
    { name: "UIStore" }
  )
)
