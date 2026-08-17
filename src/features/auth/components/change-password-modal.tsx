"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/features/auth/store"
import { apiFetch } from "@/lib/api-fetch"
import { cn } from "@/utils/cn"
import { useRouter } from "next/navigation"

// ─── Schema ───────────────────────────────────────────────────────────────────

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>

// ─── Primitives ───────────────────────────────────────────────────────────────

const inputBase = cn(
  "w-full rounded-xl border bg-muted/50 px-4 py-3 text-sm font-medium",
  "text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
  "disabled:opacity-60 disabled:cursor-not-allowed transition-all"
)

function PasswordField({
  id,
  label,
  error,
  disabled,
  registration,
}: {
  id: string
  label: string
  error?: string
  disabled: boolean
  registration: ReturnType<ReturnType<typeof useForm<ChangePasswordInput>>["register"]>
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          {...registration}
          id={id}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(inputBase, "pr-11", error && "border-red-400 focus:ring-red-400")}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ChangePasswordModal() {
  const isPasswordUpdated = useAuthStore((s) => s.isPasswordUpdated)
  const setPasswordUpdated = useAuthStore((s) => s.setPasswordUpdated)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  })

  async function onSubmit(data: ChangePasswordInput) {
    try {
      await apiFetch("/recruitment/candidate-profile/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      toast.success("Password updated successfully!")
      
      // Update the password status in the store
      setPasswordUpdated(true)
      
      // Reset form and close modal
      reset()
      setDismissed(true)
      
      // Refresh to get updated profile data
      router.refresh()
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password.")
    }
  }

  return (
    <Dialog
      open={!isPasswordUpdated && !dismissed}
      onOpenChange={(open) => { if (!open) setDismissed(true) }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <KeyRound className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Set Your Password</DialogTitle>
          </div>
          <DialogDescription>
            You must set a new password before continuing. Use the temporary password you received to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            error={errors.currentPassword?.message}
            disabled={isSubmitting}
            registration={register("currentPassword")}
          />
          <PasswordField
            id="newPassword"
            label="New Password"
            error={errors.newPassword?.message}
            disabled={isSubmitting}
            registration={register("newPassword")}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            registration={register("confirmPassword")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl mt-2",
              "bg-primary text-white px-4 py-3 text-sm font-bold",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            )}
          >
            {isSubmitting
              ? <><Loader2 size={15} className="animate-spin" />Updating…</>
              : "Update Password"
            }
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
