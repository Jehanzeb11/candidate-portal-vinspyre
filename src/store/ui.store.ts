import { create } from "zustand"
import { devtools } from "zustand/middleware"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UIState {
  sidebarOpen: boolean
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set) => ({
      sidebarOpen: true,

      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "ui/toggleSidebar"),
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }, false, "ui/setSidebarOpen"),
    }),
    { name: "UIStore" }
  )
)
