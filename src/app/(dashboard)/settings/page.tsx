"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, User, Bell, Shield, Sliders, Check, AlertCircle } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const generalSchema = z.object({
  appName: z.string().min(2, "App name must be at least 2 characters"),
  supportEmail: z.string().email("Valid email address is required"),
})
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
})
const securitySchema = z.object({
  currentPassword: z.string().min(6, "Must be at least 6 characters"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
})

type GeneralInput  = z.infer<typeof generalSchema>
type ProfileInput  = z.infer<typeof profileSchema>
type SecurityInput = z.infer<typeof securitySchema>

// ─── Reusable field row ───────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
      <AlertCircle className="h-3 w-3" /> {message}
    </p>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general")

  const generalForm = useForm<GeneralInput>({
    resolver: zodResolver(generalSchema),
    defaultValues: { appName: "Next Boiler Plate", supportEmail: "support@nextboilerplate.com" },
  })
  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "Admin User", email: "admin@nextboilerplate.com" },
  })
  const securityForm = useForm<SecurityInput>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  })

  const cardClass = "rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm"
  const headerClass = "border-b border-border/60 pb-4"
  const inputClass = "h-9 text-xs rounded-xl"
  const labelClass = "text-xs font-semibold text-foreground/80"
  const saveBtn  = "rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-2 shadow-md shadow-primary/20"

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Settings & Configurations"
        description="Security protocols, user identity settings, and system controls."
        badge="Config"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-card/80 p-1.5 rounded-2xl border border-border/70 backdrop-blur-md shadow-sm h-auto flex-wrap">
          {[
            { value: "general",       icon: Sliders, label: "General" },
            { value: "profile",       icon: User,    label: "Profile" },
            { value: "notifications", icon: Bell,    label: "Notifications" },
            { value: "security",      icon: Shield,  label: "Security" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-2 text-xs rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── General ─────────────────────────────────── */}
        <TabsContent value="general">
          <Card className={cardClass}>
            <CardHeader className={headerClass}>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> General System Settings
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure application name, support contact, and system behaviour.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={generalForm.handleSubmit((data) => {
                toast.success("General settings saved!", {
                  description: `${data.appName} · ${data.supportEmail}`,
                })
              })} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Application Name *</label>
                    <Input {...generalForm.register("appName")} className={inputClass} />
                    <FieldError message={generalForm.formState.errors.appName?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Support Email *</label>
                    <Input {...generalForm.register("supportEmail")} type="email" className={inputClass} />
                    <FieldError message={generalForm.formState.errors.supportEmail?.message} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {[
                    { label: "Demo Mode Telemetry",      desc: "Local signed identity tokens validation" },
                    { label: "Catalog Cache Auto-Sync",  desc: "Revalidate product store every 60 seconds" },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="sm" className={saveBtn}>
                    <Save className="h-3.5 w-3.5" /> Save Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Profile ─────────────────────────────────── */}
        <TabsContent value="profile">
          <Card className={cardClass}>
            <CardHeader className={headerClass}>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> User Profile & Credentials
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Update your display name and email.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={profileForm.handleSubmit((data) => {
                toast.success("Profile updated!", {
                  description: `${data.fullName} (${data.email})`,
                })
              })} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Full Name *</label>
                    <Input {...profileForm.register("fullName")} className={inputClass} />
                    <FieldError message={profileForm.formState.errors.fullName?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Email Address *</label>
                    <Input {...profileForm.register("email")} type="email" className={inputClass} />
                    <FieldError message={profileForm.formState.errors.email?.message} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className={saveBtn}>
                    <Save className="h-3.5 w-3.5" /> Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ─────────────────────────── */}
        <TabsContent value="notifications">
          <Card className={cardClass}>
            <CardHeader className={headerClass}>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Alert Channel Configurations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure event alerts and automated digests.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {[
                { label: "Daily Executive Digest",  desc: "Morning summary of sales and user activity" },
                { label: "Security & Role Alerts",  desc: "Instant alert when a new admin is invited" },
                { label: "Low Inventory Warnings",  desc: "Alert when a product drops below 5 units" },
              ].map(({ label, desc }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                    <Switch defaultChecked={i < 2} />
                  </div>
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ────────────────────────────────── */}
        <TabsContent value="security">
          <Card className={cardClass}>
            <CardHeader className={headerClass}>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Security Credentials
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Update your account password and session settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={securityForm.handleSubmit(() => {
                toast.success("Password updated successfully!")
                securityForm.reset()
              })} className="space-y-4 max-w-md" noValidate>
                <div className="space-y-1.5">
                  <label className={labelClass}>Current Password *</label>
                  <Input {...securityForm.register("currentPassword")} type="password" placeholder="••••••••" className={inputClass} />
                  <FieldError message={securityForm.formState.errors.currentPassword?.message} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>New Password *</label>
                  <Input {...securityForm.register("newPassword")} type="password" placeholder="••••••••" className={inputClass} />
                  <FieldError message={securityForm.formState.errors.newPassword?.message} />
                </div>
                <div className="pt-2">
                  <Button type="submit" size="sm" className={saveBtn}>
                    <Check className="h-3.5 w-3.5" /> Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
