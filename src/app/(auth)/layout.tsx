// (auth)/layout.tsx — Server Component
// Renders only the children; no sidebar or header.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
