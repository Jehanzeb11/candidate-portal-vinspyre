// (auth)/layout.tsx — Server Component
// Renders only the children; no sidebar or header.
// Protected to prevent logged-in users from accessing login page
import { AuthCheckLayout } from "@/features/auth/components/auth-check-layout"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthCheckLayout>{children}</AuthCheckLayout>
}
