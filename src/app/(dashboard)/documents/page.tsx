"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  CloudUpload,
  Lock,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuthStore } from "@/features/auth/store"
import { useCandidateProfile } from "@/features/auth/hooks/use-candidate-profile"
import ENDPOINTS from "@/server/Endpoints"
import { cn } from "@/utils"
import { TeamNoteSidebar } from "@/components/shared/TeamNoteSidebar"
import Image from "next/image"
import vpImg from "@/assets/vp-apply.png"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""
const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

interface DocumentSlot {
  id: "cnic" | "payslip" | "bill"
  label: string
  description: string
  file: File | null
  error: string | null
}

export default function DocumentsPage() {
  const router = useRouter()
  const { refetch } = useCandidateProfile()
  const token = useAuthStore((s) => s.token)

  const [isUploading, setIsUploading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [documents, setDocuments] = useState<DocumentSlot[]>([
    {
      id: "cnic",
      label: "CNIC",
      description: "National identity card, front and back",
      file: null,
      error: null,
    },
    {
      id: "payslip",
      label: "Payslip",
      description: "Your most recent salary slip",
      file: null,
      error: null,
    },
    {
      id: "bill",
      label: "Utility Bill",
      description: "A recent utility bill for address verification",
      file: null,
      error: null,
    },
  ])

  // File validation
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Only PDF and images are allowed.`
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`
    }
    return null
  }

  const handleFileSelect = (documentId: string, file: File) => {
    const error = validateFile(file)
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId ? { ...doc, file: error ? null : file, error } : doc
    ))
  }

  const handleRemoveFile = (documentId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId ? { ...doc, file: null, error: null } : doc
    ))
  }

  const uploadedCount = documents.filter(d => d.file !== null).length
  const allSelected = uploadedCount === documents.length
  const hasErrors = documents.some(d => d.error !== null)
  const canSubmit = allSelected && !hasErrors && !isUploading

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
        if (res.status === 403) {
          throw new Error("An accepted offer is required before documents can be uploaded. Please wait for HR to accept your offer.")
        }
        throw new Error(body?.message ?? `Upload failed (${res.status})`)
      }

      toast.dismiss(toastId)
      setShowSuccessModal(true)
      void refetch()

    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again."
      toast.error(message, { id: toastId, duration: 5000 })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to dashboard
        </button>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main Content */}
          <div className="flex-1 space-y-8">

            {/* Header Section */}
            <div>
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#ff3870] mb-2">
                Your Next Step
              </p>
              <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-[#1e293b]">Your documents</h1>
                <div className="bg-[#fff1f5] text-[#ff3870] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  {uploadedCount} of {documents.length} uploaded
                </div>
              </div>
              <p className="text-[#64748b] text-sm font-medium">
                Just a few essentials to get everything ready for your first day.
              </p>
            </div>

            {/* Alert Box */}
            <div className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl p-5 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-[#3b82f6] mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#334155] mb-1">Secure & confidential</h4>
                <p className="text-[13px] font-medium text-[#64748b]">
                  Your files are encrypted and only accessible by the Vinspyre hiring team. PDF, JPG or PNG · Max 10 MB per file.
                </p>
              </div>
            </div>

            {/* Document Slots */}
            <div className="space-y-4">
              {documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  onFileSelect={(f) => handleFileSelect(doc.id, f)}
                  onRemove={() => handleRemoveFile(doc.id)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-[#94a3b8] text-xs font-medium hidden sm:flex">
                <Lock className="w-3.5 h-3.5" />
                <span>Files are stored securely</span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "font-bold h-11 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm w-full sm:w-auto",
                  canSubmit
                    ? "bg-[#ff7aa2] hover:bg-[#ff5d8d] text-white shadow-[#ff7aa2]/20 shadow-lg"
                    : "bg-[#f1f5f9] text-[#94a3b8] hover:bg-[#f1f5f9] cursor-not-allowed border border-[#e2e8f0]"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Documents <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Sidebar Note */}
          <div className="w-full lg:w-[300px] shrink-0 pt-4 lg:pt-0">
            <div className="pointer-events-none relative -top-8 hidden lg:block -mb-4">
              <Image src={vpImg} alt="Vinspyre" className="h-[140px] lg:h-[190px] w-auto object-contain" />
            </div>
            <TeamNoteSidebar />
          </div>

        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-[425px] p-8 sm:p-10 border-0 shadow-2xl rounded-[32px] bg-white gap-0">
          <div className="w-14 h-14 bg-pink-100/50 rounded-2xl flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#ff3870" />
            </svg>
          </div>

          <p className="text-[10px] font-extrabold tracking-widest uppercase text-[#ff3870] mb-3">
            It's official
          </p>
          <h2 className="text-[28px] font-bold text-[#111827] leading-[1.1] mb-4 tracking-tight">
            Documents Submitted Successfully
          </h2>
          <p className="text-[15px] leading-relaxed text-[#6b7280] font-medium mb-10">
            Congratulations. We're so excited to have you. Know that your documents have been submitted successfully.
          </p>

          <Button
            onClick={() => router.push('/')}
            className="w-full bg-[#e4326d] hover:bg-[#d02960] text-white shadow-xl shadow-pink-500/20 rounded-xl h-12 font-bold text-base transition-all hover:scale-[1.02]"
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocumentRow({
  doc,
  onFileSelect,
  onRemove
}: {
  doc: DocumentSlot,
  onFileSelect: (f: File) => void,
  onRemove: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    // reset so you can select the same file again if removed
    if (e.target) {
      e.target.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn(
      "bg-white rounded-[20px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all shadow-sm",
      doc.file ? "border-[#ff3870]/20 bg-[#fff6f8]/30" : "border-[#e2e8f0]",
      doc.error && "border-red-300 bg-red-50/50"
    )}>
      <div className="w-12 h-12 bg-[#f8fafc] rounded-xl flex items-center justify-center shrink-0">
        <FileText className="w-6 h-6 text-[#94a3b8]" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-medium text-[#1e293b] mb-1">{doc.label}</h4>
        {doc.file ? (
          <div className="flex items-center gap-2 text-[#64748b] text-[10px]">
            <span className="truncate max-w-[200px]">{doc.file.name}</span>
            <span>·</span>
            <span>{formatFileSize(doc.file.size)}</span>
          </div>
        ) : (
          <p className="text-[#64748b] text-[13px] font-medium">{doc.description}</p>
        )}
        {doc.error && (
          <p className="text-red-500 text-xs font-medium mt-1">{doc.error}</p>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
        <div className="bg-[#f1f5f9] text-[#64748b] text-[9px] font-bold px-3 py-1.5 rounded-full tracking-wide">
          Required
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {doc.file ? (
          <Button
            variant="ghost"
            onClick={onRemove}
            className="text-[#64748b] hover:text-red-500 hover:bg-red-50 px-3 h-10 rounded-xl text-sm font-medium"
          >
            Remove
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-[#ff3870]/30 text-[#ff3870] hover:bg-[#fff1f5] hover:border-[#ff3870]/50 hover:text-[#ff3870] gap-2 h-10 rounded-lg px-5 text-xs font-bold shadow-sm"
          >
            <CloudUpload className="w-4 h-4" />
            Upload file
          </Button>
        )}
      </div>
    </div>
  )
}
