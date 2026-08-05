"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Edit2, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateUser } from "@/features/users/hooks/use-users"
import type { User } from "@/types"

// ─── Schema ──────────────────────────────────────────────────────────────────

const editUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["admin", "manager", "user", "viewer"] as const),
})

type EditUserInput = z.infer<typeof editUserSchema>

// ─── Props ───────────────────────────────────────────────────────────────────

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const { mutate: updateUser, isPending } = useUpdateUser(user.id)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  // Re-populate form whenever the dialog opens with a (potentially different) user
  React.useEffect(() => {
    if (open) {
      reset({ name: user.name, email: user.email, role: user.role })
    }
  }, [open, user, reset])

  function onSubmit(data: EditUserInput) {
    updateUser(data, {
      onSuccess: () => {
        toast.success("User updated successfully")
        onOpenChange(false)
      },
      onError: (err) =>
        toast.error("Failed to update user", { description: err.message }),
    })
  }

  const labelClass = "text-xs font-semibold text-zinc-700 dark:text-zinc-300"
  const inputClass = (hasError: boolean) =>
    `h-9 text-xs rounded-xl transition-all ${
      hasError
        ? "border-red-500 focus:ring-red-500"
        : "border-zinc-200 dark:border-zinc-800 focus:border-primary"
    }`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Edit2 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">
              Edit Team Member
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Update name, email, and access role for <strong>{user.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className={labelClass}>Full Name *</label>
            <Input
              {...register("name")}
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="h-3 w-3" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className={labelClass}>Email Address *</label>
            <Input
              {...register("email")}
              type="email"
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className={labelClass}>Access Role *</label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold gap-2 shadow-md shadow-purple-500/20"
            >
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
