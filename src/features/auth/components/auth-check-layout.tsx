"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthCheckLayoutProps {
  children: React.ReactNode
}

/**
 * AuthCheckLayout - Prevents logged-in users from accessing login page
 * Checks localStorage directly to avoid Zustand hydration issues
 */
export function AuthCheckLayout({ children }: AuthCheckLayoutProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated by reading localStorage directly
    // This avoids Zustand hydration issues
    try {
      const authStorage = localStorage.getItem("auth-storage")
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        if (parsed.state?.token && parsed.state?.user) {
          setIsAuthenticated(true)
        }
      }
    } catch (e) {
      // localStorage read failed, assume not authenticated
    }
    
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only redirect after we've checked localStorage and mounted
    if (!mounted) return
    
    if (isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, router, mounted])

  // Show nothing while checking auth or if user is already authenticated
  if (!mounted || isAuthenticated) {
    return null
  }

  // User is not authenticated, show login page
  return <>{children}</>
}
