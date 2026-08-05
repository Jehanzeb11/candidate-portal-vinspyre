"use client"

import * as React from "react"
import {
  Mail,
  CheckCircle2,
  Search,
  Trash2,
  Edit2,
  UserCheck,
} from "lucide-react"

import { useUsers } from "@/features/users/hooks/use-users"
import { useRole, isMutationRole } from "@/features/auth/hooks/use-role"
import { InviteUserDialog } from "./invite-user-dialog"
import { EditUserDialog } from "./edit-user-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { User } from "@/types"

// Fallback user data for demo mode (seeds the cache when no API data arrives)
const fallbackUsers: User[] = [
  {
    id: "usr-1",
    name: "Alex Morgan",
    email: "alex.morgan@nextboilerplate.com",
    role: "admin",
    createdAt: "2026-01-15",
  },
  {
    id: "usr-2",
    name: "Sarah Chen",
    email: "sarah.chen@nextboilerplate.com",
    role: "manager",
    createdAt: "2026-02-04",
  },
  {
    id: "usr-3",
    name: "Michael Scott",
    email: "m.scott@nextboilerplate.com",
    role: "user",
    createdAt: "2026-03-10",
  },
  {
    id: "usr-4",
    name: "Elena Rostova",
    email: "elena.r@nextboilerplate.com",
    role: "manager",
    createdAt: "2026-04-01",
  },
  {
    id: "usr-5",
    name: "David Kim",
    email: "david.kim@nextboilerplate.com",
    role: "viewer",
    createdAt: "2026-05-18",
  },
]

export function UserTable() {
  const { data: usersData, isLoading } = useUsers()
  const [searchTerm, setSearchTerm] = React.useState("")

  // Dialog state
  const [editTarget, setEditTarget] = React.useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null)

  // RBAC
  const role = useRole()
  const canMutate = isMutationRole(role)

  const usersList = usersData && usersData.length > 0 ? usersData : fallbackUsers

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (r: User["role"]) => {
    switch (r) {
      case "admin":
        return (
          <Badge className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 font-semibold px-2.5 py-0.5 rounded-full">
            Admin
          </Badge>
        )
      case "manager":
        return (
          <Badge className="bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 font-semibold px-2.5 py-0.5 rounded-full">
            Manager
          </Badge>
        )
      case "user":
        return (
          <Badge className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-semibold px-2.5 py-0.5 rounded-full">
            User
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-zinc-500 font-semibold px-2.5 py-0.5 rounded-full">
            Viewer
          </Badge>
        )
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search & Action Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-2xl"
              aria-label="Search users"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <UserCheck className="h-4 w-4 text-primary" />
              Active Members:{" "}
              <span className="font-bold text-foreground">{filteredUsers.length}</span>
            </div>
            {canMutate && <InviteUserDialog />}
          </div>
        </div>

        {/* User Table Card */}
        <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border/70">
              <TableRow>
                <TableHead className="w-[320px] text-xs font-bold text-foreground py-3.5">
                  User Details
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground">Role</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Joined Date</TableHead>
                <TableHead className="text-right text-xs font-bold text-foreground pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-36 text-center text-xs text-muted-foreground"
                  >
                    Loading user directory...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-36 text-center text-xs text-muted-foreground"
                  >
                    No users matching &ldquo;{searchTerm}&rdquo;
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()

                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-xs">
                            <AvatarFallback className="bg-linear-to-tr from-purple-600 to-indigo-600 text-white text-xs font-extrabold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {user.createdAt ?? "2026-01-01"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {canMutate && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-mutation-control="edit"
                                onClick={() => setEditTarget(user)}
                                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                aria-label={`Edit ${user.name}`}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-mutation-control="delete"
                                onClick={() => setDeleteTarget(user)}
                                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label={`Remove ${user.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialogs — rendered outside the table to avoid DOM nesting issues */}
      {editTarget && (
        <EditUserDialog
          user={editTarget}
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        />
      )}
      {deleteTarget && (
        <DeleteUserDialog
          user={deleteTarget}
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        />
      )}
    </>
  )
}
