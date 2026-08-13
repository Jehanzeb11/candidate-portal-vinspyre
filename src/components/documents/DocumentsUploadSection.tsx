"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/features/auth/store"
import ENDPOINTS from "@/server/Endpoints"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""
const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"]

interface UploadedFile {
  file: File
  /** client-side preview name */
  name: string
}

interface DocumentsUploadSectionProps {
  /** Called after a successful upload so the parent can refresh state */
  onSuccess?: () => void
}

export function DocumentsUploadSection({ onSuccess }: DocumentsUploadSectionProps) {
  const token = useAuthStore((s) => s.token)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)

  // ── helpers ────────────────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported file type. Only PDF/images allowed.`
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`
    }
    return null
  }

  const addFiles = (incoming: FileList | File[]) => {
    const newFiles: UploadedFile[] = []
    const errors: string[] = []

    Array.from(incoming).forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
        return
      }
      // Avoid exact duplicates (same name + size)
      const isDuplicate = files.some(
        (f) => f.name === file.name && f.file.size === file.size
      )
      if (!isDuplicate) {
        newFiles.push({ file, name: file.name })
      }
    })

    if (errors.length) {
      errors.forEach((e) => toast.error(e))
    }
    if (newFiles.length) {
      setFiles((prev) => [...prev, ...newFiles])
      setUploadDone(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setUploadDone(false)
  }

  // ── drag-and-drop ──────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files)
    }
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Please select at least one document to upload.")
      return
    }

    setIsUploading(true)
    const toastId = toast.loading("Uploading documents…")

    try {
      const formData = new FormData()
      files.forEach(({ file }) => {
        formData.append("documents", file)
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
        throw new Error(body?.message ?? `Upload failed (${res.status})`)
      }

      toast.success(body?.message ?? "Documents uploaded successfully!", {
        id: toastId,
        duration: 5000,
      })

      setFiles([])
      setUploadDone(true)
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again."
      toast.error(message, { id: toastId, duration: 5000 })
    } finally {
      setIsUploading(false)
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────

  if (uploadDone) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold text-emerald-700">Documents uploaded successfully!</p>
        <p className="text-xs text-muted-foreground">Our team will review your documents shortly.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setUploadDone(false)}
        >
          Upload more documents
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop zone for document upload"
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/60 hover:bg-muted/40"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Drag &amp; drop files here, or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, JPG, PNG, WEBP · Max {MAX_FILE_SIZE_MB} MB per file · Multiple files allowed
          </p>
        </div>

        {/* hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) {
              addFiles(e.target.files)
              // reset input so the same file can be re-selected after removal
              e.target.value = ""
            }
          }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Selected files">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
            >
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 truncate text-sm font-medium text-foreground">
                {f.name}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {(f.file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                className="ml-1 rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add more + upload row */}
      <div className="flex items-center gap-2">
        {files.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add more
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          className="ml-auto gap-1.5"
          disabled={isUploading || files.length === 0}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload PDFs
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
