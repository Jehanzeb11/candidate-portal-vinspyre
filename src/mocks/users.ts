import type { User } from "@/types"

export const LOCAL_USERS: User[] = [
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

export function getLocalUsers(): User[] {
  return LOCAL_USERS.map((user) => ({ ...user }))
}