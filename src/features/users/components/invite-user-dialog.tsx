"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { UserPlus, CalendarIcon, Check, Shield, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Zod Form Schema ─────────────────────────────────────────────────────────

const inviteUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  role: z.enum(["admin", "manager", "user", "viewer"] as const),
})

type InviteUserInput = z.infer<typeof inviteUserSchema>

interface InviteUserDialogProps {
  children?: React.ReactNode
}

export function InviteUserDialog({ children }: InviteUserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date())
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "manager",
    },
  })

  const onSubmit = (data: InviteUserInput) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
      toast.success(`Invitation sent to ${data.email}!`, {
        description: `Name: ${data.name} | Role: ${data.role.toUpperCase()} | Effective Date: ${startDate ? format(startDate, "PP") : "Immediate"}`,
      })
      reset()
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          children ? (
            (children as React.ReactElement)
          ) : (
            <Button size="sm" className="gap-2 rounded-xl bg-linear-to-r from-primary to-pink-600 text-white text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition-all">
              <UserPlus className="h-3.5 w-3.5" /> Invite User
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md rounded-3xl border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">
              Invite Team Member
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Validated team member access onboarding with role permissions and starting date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Full Name *
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. Jordan Lee"
              className={`h-9 text-xs rounded-xl transition-all ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-200 dark:border-zinc-800 focus:border-primary"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="h-3 w-3" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address *
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="jordan.lee@nextboilerplate.com"
              className={`h-9 text-xs rounded-xl transition-all ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-200 dark:border-zinc-800 focus:border-primary"
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Access Role — shadcn Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Access Role *
              </label>
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

            {/* Effective Date Datepicker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Effective Date
              </label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left text-xs h-9 rounded-xl font-normal border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-indigo-600" />
                      {startDate ? format(startDate, "PP") : "Pick Date"}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 dark:border-zinc-800" align="end">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => {
                      setStartDate(d)
                      setPopoverOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator className="my-2 bg-zinc-200/80 dark:bg-zinc-800/80" />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold gap-2 shadow-md shadow-indigo-500/20"
            >
              {loading ? <Spinner className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
