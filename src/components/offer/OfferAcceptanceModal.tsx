"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, X, Loader2, Gift } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [actionCompleted, setActionCompleted] = useState<'accepted' | 'rejected' | null>(null)
  const [actionMessage, setActionMessage] = useState("")

  console.log('OfferAcceptanceModal - isOpen:', isOpen, 'offerToken:', offerToken)

  // ── Accept Offer ──────────────────────────────────────────────────────────

  const handleAccept = async () => {
    if (!offerToken) return

    setIsAccepting(true)
    const toastId = toast.loading("Accepting your offer...")

    try {
      const response = await fetch(
        `${BASE_URL}/recruitment/candidate-profile/offers/accept`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: offerToken
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
          onAcceptSuccess(data.data.loginToken)
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
    if (!offerToken) return

    setIsRejecting(true)
    const toastId = toast.loading("Processing your decision...")

    try {
      const response = await fetch(
        `${BASE_URL}/recruitment/candidate-profile/offers/reject`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: offerToken
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
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              actionCompleted === 'accepted' 
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
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent 
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <DialogTitle className="text-xl text-center">
            Job Offer Decision Required
          </DialogTitle>
          <DialogDescription className="text-center">
            You have received a job offer. You must make a decision to proceed.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
          <AlertDescription className="text-red-700 dark:text-red-200">
            <strong>Notice:</strong> You cannot close this dialog or navigate away until you accept or decline the offer.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 mt-6">
          {/* Accept Button */}
          <Button
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            {isAccepting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Accepting Offer...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Accept Offer
              </>
            )}
          </Button>

          {/* Reject Button */}
          <Button
            onClick={handleReject}
            disabled={isAccepting || isRejecting}
            variant="destructive"
            className="w-full h-12"
            size="lg"
          >
            {isRejecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Declining Offer...
              </>
            ) : (
              <>
                <X className="w-5 h-5 mr-2" />
                Decline Offer
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          This decision cannot be undone. Please choose carefully.
        </div>
      </DialogContent>
    </Dialog>
  )
}