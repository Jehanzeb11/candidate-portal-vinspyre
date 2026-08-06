"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { CandidateApplicationForm } from "@/components/candidate-form/CandidateApplicationForm"
import type { JobDetails } from "@/components/candidate-form/types"

export default function CandidateApplyPage() {
  const params = useParams()
  const jobId = params.id as string
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_JOB_API_URL || "http://192.168.18.106:5004/api/v1"
        const response = await fetch(`${apiUrl}/hrms/recruitment/jobs/${jobId}/form`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch job details")
        }

        const data = await response.json()
        
        if (data.success && data.data) {
          setJobDetails(data.data)
        } else {
          throw new Error("Invalid job details response")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Job</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  if (!jobDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Job Not Found</h2>
          <p className="text-slate-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return <CandidateApplicationForm jobDetails={jobDetails} jobId={jobId} />
}
