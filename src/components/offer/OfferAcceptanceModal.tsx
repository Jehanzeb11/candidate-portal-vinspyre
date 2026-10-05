"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, X, Loader2, Gift, FileText, Briefcase, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/features/auth/store"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""

interface OfferAcceptanceModalProps {
  isOpen: boolean
  onClose: () => void
  offerToken: string | null
  onAcceptSuccess: (loginToken: string) => void
}

interface OfferActionResponse {
  success: boolean
  status: number
  message: string
  data?: {
    id: string
    candidateProfileId: string
    jobApplicationId: string
    offerStatus: "accepted" | "rejected"
    loginToken?: string
    frontendUrl?: string
    documentUploadUrl?: string
  }
}

export function OfferAcceptanceModal({
  isOpen,
  onClose,
  offerToken,
  onAcceptSuccess
}: OfferAcceptanceModalProps) {
  const profile = useAuthStore((s) => s.profile)
  const token = useAuthStore((s) => s.token)
  const app = profile?.jobApplications?.[0]
  const positionTitle = app?.positionAppliedFor || "Designer Editor"

  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [actionCompleted, setActionCompleted] = useState<'accepted' | 'rejected' | null>(null)
  const [actionMessage, setActionMessage] = useState("")

  console.log('OfferAcceptanceModal - isOpen:', isOpen, 'offerToken:', offerToken)

  // ── Accept Offer ──────────────────────────────────────────────────────────

  const handleAccept = async () => {
    // if (!offerToken) return

    setIsAccepting(true)
    const toastId = toast.loading("Accepting your offer...")

    try {
      const response = await fetch(
        `${BASE_URL}/recruitment/candidate-profile/offers/decision`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            action: "accept"
          }),
        }
      )

      const data = await response.json() as OfferActionResponse

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to accept offer (${response.status})`)
      }

      toast.success(data.message || "Offer accepted successfully!", {
        id: toastId,
        duration: 5000,
      })

      setActionCompleted("accepted")
      setActionMessage(data.message || "Your offer has been accepted successfully!")

      // If we get a login token, trigger the success handler immediately
      if (data.data?.loginToken) {
        // Short delay to show success message, then trigger cleanup
        setTimeout(() => {
          onAcceptSuccess(data?.data?.loginToken)
        }, 1500)
      } else {
        // If no login token, still trigger success for cleanup
        setTimeout(() => {
          onAcceptSuccess("")
        }, 1500)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to accept offer"
      toast.error(errorMessage, {
        id: toastId,
        duration: 5000,
      })
    } finally {
      setIsAccepting(false)
    }
  }

  // ── Reject Offer ──────────────────────────────────────────────────────────

  const handleReject = async () => {
    // if (!offerToken) return

    setIsRejecting(true)
    const toastId = toast.loading("Processing your decision...")

    try {
      const response = await fetch(
        `${BASE_URL}/recruitment/candidate-profile/offers/decision`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            action: "reject"
          }),
        }
      )

      const data = await response.json() as OfferActionResponse

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to reject offer (${response.status})`)
      }

      toast.success(data.message || "Offer rejected", {
        id: toastId,
        duration: 3000,
      })

      setActionCompleted("rejected")
      setActionMessage(data.message || "You have declined this offer.")

      // Trigger cleanup after showing rejection message
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject offer"
      toast.error(errorMessage, {
        id: toastId,
        duration: 5000,
      })
    } finally {
      setIsRejecting(false)
    }
  }

  // ── Success/Completion State ─────────────────────────────────────────────

  if (actionCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${actionCompleted === 'accepted'
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-slate-100 text-slate-600'
              }`}>
              {actionCompleted === 'accepted' ? (
                <Check className="w-8 h-8" />
              ) : (
                <X className="w-8 h-8" />
              )}
            </div>
            <DialogTitle className="text-xl">
              {actionCompleted === 'accepted' ? 'Offer Accepted!' : 'Offer Declined'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {actionMessage}
            </DialogDescription>
          </DialogHeader>

          {actionCompleted === 'accepted' && (
            <div className="flex justify-center mt-4">
              <div className="text-sm text-muted-foreground">
                Redirecting you to continue your journey...
              </div>
            </div>
          )}

          {actionCompleted === 'rejected' && (
            <div className="flex justify-center mt-6">
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  // ── Main Modal ───────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }} modal={true}>
      <DialogContent
        className="sm:max-w-md p-8 sm:p-10 border-0 shadow-2xl rounded-3xl bg-white gap-0"
      >
        <div className="w-14 h-14 bg-pink-100/50 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="h-6 w-6 text-pink-500" strokeWidth={2} />
        </div>

        <p className="text-[10px] font-extrabold tracking-widest text-[#ff3870] uppercase mb-2">
          An Exciting Next Step
        </p>

        <DialogTitle className="text-2xl font-extrabold text-[#0f172a] mb-4">
          Job Offer Decision Required
        </DialogTitle>

        <DialogDescription className="text-[#64748b] text-sm leading-relaxed mb-6">
          Congratulations! You have received an offer from Vinspyre for the <strong className="font-semibold text-[#0f172a]">{positionTitle}</strong> position. We would be thrilled to have you on the team.
        </DialogDescription>

        <div className="bg-[#f8fafc] border border-slate-100 rounded-[16px] p-5 flex items-center gap-4 mb-8">
          <Briefcase className="h-5 w-5 text-pink-500 shrink-0" strokeWidth={2} />
          <div>
            <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-0.5">Your Offer</p>
            <p className="text-sm font-semibold text-[#0f172a]">{positionTitle} · Full-time</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Accept Button */}
          <Button
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
            className="w-full h-12 bg-[#ff3870] hover:bg-[#e63265] text-white rounded-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] text-sm font-bold flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Accepting Offer...
              </>
            ) : (
              <>
                Accept Offer
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Reject Button */}
          <Button
            onClick={handleReject}
            disabled={isAccepting || isRejecting}
            variant="ghost"
            className="w-full h-12 text-[#ff3870] hover:bg-pink-50 hover:text-[#e63265] rounded-xl text-sm font-bold transition-all"
          >
            {isRejecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Declining Offer...
              </>
            ) : (
              "Decline Offer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}