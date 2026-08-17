import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useOfferToken() {
  const router = useRouter()
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerToken, setOfferToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for offerToken in URL on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("offerToken")
      console.log('Checking for offerToken in URL:', window.location.search)
      console.log('Found offerToken:', token)
      
      if (token) {
        console.log('Setting offer token and showing modal')
        setOfferToken(token)
        setShowOfferModal(true)
      } else {
        console.log('No offerToken found in URL')
      }
    }
  }, [])

  // Prevent navigation away when modal is open
  useEffect(() => {
    if (!showOfferModal) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "You must accept or decline the job offer before leaving this page."
      return "You must accept or decline the job offer before leaving this page."
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      // Push the current state back to prevent navigation
      window.history.pushState(null, "", window.location.href)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Push an extra history entry to prevent back navigation
    window.history.pushState(null, "", window.location.href)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [showOfferModal])

  const closeOfferModal = () => {
    setShowOfferModal(false)
    // Clear the offerToken from URL
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("offerToken")
      router.replace(newUrl.pathname + newUrl.search)
    }
  }

  const handleOfferAcceptSuccess = (loginToken: string) => {
    console.log("Offer accepted, login token received:", loginToken)
    
    // Close the modal and clean up URL immediately
    setShowOfferModal(false)
    
    // Clean up URL by removing the offerToken parameter
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("offerToken")
      
      // Update URL without page reload first
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
    }
    
    // Small delay then refresh to get updated profile data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleOfferReject = () => {
    console.log("Offer rejected")
    
    // Close modal and clean up URL
    closeOfferModal()
    
    // Refresh to get updated profile data
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return {
    showOfferModal,
    offerToken,
    closeOfferModal,
    handleOfferAcceptSuccess,
  }
}