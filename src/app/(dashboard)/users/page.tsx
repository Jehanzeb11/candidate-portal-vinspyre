import type { Metadata } from "next"
import { UserPlus } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { UserTable } from "@/features/users/components/user-table"
import { InviteUserDialog } from "@/features/users/components/invite-user-dialog"
import { Button } from "@/components/ui/button"
import { InviteUserGate } from "@/features/users/components/invite-user-gate"
import { APP_NAME } from "@/constants"

export const metadata: Metadata = {
  title: `Users — ${APP_NAME}`,
  description: "User and team role management.",
}

export default function UsersPage() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="User & Team Management"
        description="Review team member accounts, roles, permission scopes, and status."
        badge="Access Control"
      >
        <InviteUserGate>
          <InviteUserDialog>
            <Button size="sm" className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20">
              <UserPlus className="h-3.5 w-3.5" />
              Invite User
            </Button>
          </InviteUserDialog>
        </InviteUserGate>
      </PageHeader>

      <UserTable />
    </div>
  )
}
