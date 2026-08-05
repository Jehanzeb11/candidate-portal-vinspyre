"use client"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { useDeleteUser } from "@/features/users/hooks/use-users"
import type { User } from "@/types"

interface DeleteUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const { mutate: deleteUser, isPending } = useDeleteUser()

  function handleConfirm() {
    deleteUser(user.id, {
      onSuccess: () => {
        toast.success(`${user.name} has been removed.`)
        onOpenChange(false)
      },
      onError: (err) =>
        toast.error("Failed to remove user", { description: err.message }),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold text-zinc-900 dark:text-white">
            Remove team member?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            This will permanently revoke{" "}
            <strong className="text-zinc-700 dark:text-zinc-300">{user.name}</strong>&apos;s
            access. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-xl text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold gap-2"
          >
            {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
