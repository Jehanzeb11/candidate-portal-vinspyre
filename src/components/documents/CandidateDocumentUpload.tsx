"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/features/auth/store"
import ENDPOINTS from "@/server/Endpoints"
import { cn } from "@/utils"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""
const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

interface DocumentSlot {
  id: keyof DocumentUploadPayload
  label: string
  description: string
  file: File | null
  error: string | null
}

interface DocumentUploadPayload {
  cnic: File
  payslip: File
  bill: File
}

interface CandidateDocumentUploadProps {
  /** Called after a successful upload so the parent can refresh state */
  onSuccess?: () => void
}

export function CandidateDocumentUpload({ onSuccess }: CandidateDocumentUploadProps) {
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

  // ── File validation ───────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Only PDF and images (JPG, PNG, WebP) are allowed.`
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`
    }
    return null
  }

  // ── File handling ─────────────────────────────────────────────────────────

  const handleFileSelect = (documentId: keyof DocumentUploadPayload, file: File) => {
    const error = validateFile(file)
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file: error ? null : file, error }
        : doc
    ))
  }

  const handleRemoveFile = (documentId: keyof DocumentUploadPayload) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId
        ? { ...doc, file: null, error: null }
        : doc
    ))
  }

  const handleDrop = (documentId: keyof DocumentUploadPayload, e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(documentId, file)
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────

  const allFilesSelected = documents.every(doc => doc.file !== null)
  const hasErrors = documents.some(doc => doc.error !== null)
  const canSubmit = allFilesSelected && !hasErrors && !isUploading

  // ── Upload submission ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
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
        // Handle specific error cases
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

  // ── Success state ─────────────────────────────────────────────────────────

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-emerald-700">Documents Uploaded Successfully!</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your documents have been submitted and are now under review by our HR team. 
                You will be notified once the review is complete.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Upload form ───────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Required Documents</CardTitle>
        <CardDescription>
          Please upload all three required documents to proceed with your application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {documents.map((document) => (
          <DocumentUploadSlot
            key={document.id}
            document={document}
            onFileSelect={(file) => handleFileSelect(document.id, file)}
            onRemove={() => handleRemoveFile(document.id)}
            onDrop={(e) => handleDrop(document.id, e)}
          />
        ))}

        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Documents...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit All Documents
              </>
            )}
          </Button>
          {!allFilesSelected && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please select all three required documents before submitting.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Individual upload slot component ──────────────────────────────────────────

interface DocumentUploadSlotProps {
  document: DocumentSlot
  onFileSelect: (file: File) => void
  onRemove: () => void
  onDrop: (e: React.DragEvent) => void
}

function DocumentUploadSlot({ document, onFileSelect, onRemove, onDrop }: DocumentUploadSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(e)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={`upload-${document.id}`}>
        {document.label} *
      </label>
      <p className="text-xs text-muted-foreground">{document.description}</p>
      
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
          isDragOver && "border-primary bg-primary/5",
          document.file && !document.error && "border-emerald-500 bg-emerald-50",
          document.error && "border-destructive bg-destructive/5",
          !document.file && !isDragOver && "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
        aria-label={`Upload ${document.label} document`}
        aria-describedby={document.error ? `error-${document.id}` : undefined}
      >
        <input
          ref={fileInputRef}
          id={`upload-${document.id}`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {document.file && !document.error ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="font-medium text-sm">{document.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(document.file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className={cn(
              "mx-auto h-8 w-8 mb-2",
              document.error ? "text-destructive" : "text-muted-foreground"
            )} />
            <p className="text-sm font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG, PNG, WebP (max {MAX_FILE_SIZE_MB} MB)
            </p>
          </div>
        )}
      </div>

      {document.error && (
        <p 
          id={`error-${document.id}`}
          className="text-sm text-destructive"
          role="alert"
        >
          {document.error}
        </p>
      )}
    </div>
  )
}