import { useState } from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/features/auth/store"
import ENDPOINTS from "@/server/Endpoints"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""
const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

interface DocumentUploadPayload {
  cnic: File
  payslip: File
  bill: File
}

interface DocumentSlot {
  id: keyof DocumentUploadPayload
  label: string
  description: string
  file: File | null
  error: string | null
}

export function useDocumentUpload(onSuccess?: () => void) {
  const token = useAuthStore((s) => s.token)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [documents, setDocuments] = useState<DocumentSlot[]>([
    {
      id: "cnic",
      label: "CNIC",
      description: "Computerised National Identity Card (PDF or Image)",
      file: null,
      error: null,
    },
    {
      id: "payslip", 
      label: "Payslip",
      description: "Recent pay slip document (PDF or Image)",
      file: null,
      error: null,
    },
    {
      id: "bill",
      label: "Utility Bill", 
      description: "Recent utility bill (PDF or Image)",
      file: null,
      error: null,
    },
  ])

  // ── Validation helpers ────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Only PDF and images (JPG, PNG, WebP) are allowed.`
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`
    }
    return null
  }

  const allFilesSelected = documents.every(doc => doc.file !== null)
  const hasErrors = documents.some(doc => doc.error !== null)
  const canSubmit = allFilesSelected && !hasErrors && !isUploading

  // ── File operations ───────────────────────────────────────────────────────

  const updateDocument = (documentId: keyof DocumentUploadPayload, file: File | null, error: string | null = null) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file, error }
        : doc
    ))
  }

  const handleFileSelect = (documentId: keyof DocumentUploadPayload, file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      updateDocument(documentId, null, validationError)
    } else {
      updateDocument(documentId, file, null)
    }
  }

  const handleRemoveFile = (documentId: keyof DocumentUploadPayload) => {
    updateDocument(documentId, null, null)
  }

  // ── Upload submission ─────────────────────────────────────────────────────

  const submitDocuments = async () => {
    if (!canSubmit) return

    const toastId = toast.loading("Uploading documents...")
    setIsUploading(true)

    try {
      const formData = new FormData()
      documents.forEach(doc => {
        if (doc.file) {
          formData.append(doc.id, doc.file)
        }
      })

      const res = await fetch(`${BASE_URL}${ENDPOINTS.UPLOAD_DOCUMENTS}`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      const body = await res.json().catch(() => null) as { message?: string } | null

      if (!res.ok) {
        if (res.status === 401) {
          useAuthStore.getState().clearUser()
          window.location.href = "/login"
          return
        }
        // Handle specific error cases based on requirements
        if (res.status === 403) {
          throw new Error("An accepted offer is required before documents can be uploaded. Please wait for HR to accept your offer.")
        }
        if (res.status === 400) {
          throw new Error(body?.message ?? "Please ensure all required documents are uploaded.")
        }
        throw new Error(body?.message ?? `Upload failed (${res.status})`)
      }

      toast.success(body?.message ?? "Documents uploaded successfully!", {
        id: toastId,
        duration: 5000,
      })

      setIsSubmitted(true)
      onSuccess?.()

    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again."
      toast.error(message, { id: toastId, duration: 5000 })
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setDocuments(prev => prev.map(doc => ({ ...doc, file: null, error: null })))
    setIsSubmitted(false)
    setIsUploading(false)
  }

  return {
    documents,
    isUploading,
    isSubmitted,
    canSubmit,
    allFilesSelected,
    hasErrors,
    handleFileSelect,
    handleRemoveFile,
    submitDocuments,
    resetForm,
  }
}