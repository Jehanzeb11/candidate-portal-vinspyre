"use client"

import { useRole, isMutationRole } from "@/features/auth/hooks/use-role"

interface InviteUserGateProps {
  children: React.ReactNode
}

/**
 * Renders children only when the current user has a mutation role.
 * Removes the element from the DOM entirely for read-only roles.
 */
export function InviteUserGate({ children }: InviteUserGateProps) {
  const role = useRole()
  if (!isMutationRole(role)) return null
  return <>{children}</>
}
