"use server"
// ---------------------------------------------------------------------------
// Candidate profile server actions
// Fetches the logged-in candidate's full profile from the backend.
// Endpoint: GET /recruitment/candidate-profile
// Auth:     Authorization: Bearer <token>
// ---------------------------------------------------------------------------
import type { CandidateProfile } from "@/types"

function getBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.")
  }
  return baseUrl.replace(/\/$/, "")
}

/**
 * Normalise the raw backend payload into a typed CandidateProfile.
 * The backend may evolve its shape; this is the single place to adapt.
 */
function toCandidateProfile(value: unknown): CandidateProfile | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>

  const id = typeof raw.id === "string" ? raw.id : undefined
  const fullName = typeof raw.fullName === "string" ? raw.fullName : undefined
  const email = typeof raw.email === "string" ? raw.email : undefined

  if (!id || !fullName || !email) return null

  return {
    id,
    fullName,
    email,
    phone: typeof raw.phone === "string" ? raw.phone : undefined,
    profileImage: typeof raw.profileImage === "string" ? raw.profileImage : undefined,
    designation: typeof raw.designation === "string" ? raw.designation : undefined,
    location: typeof raw.location === "string" ? raw.location : undefined,
    summary: typeof raw.summary === "string" ? raw.summary : undefined,
    skills: Array.isArray(raw.skills)
      ? (raw.skills as unknown[]).filter((s): s is string => typeof s === "string")
      : undefined,
    experience: Array.isArray(raw.experience)
      ? (raw.experience as CandidateProfile["experience"])
      : undefined,
    education: Array.isArray(raw.education)
      ? (raw.education as CandidateProfile["education"])
      : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  }
}

/**
 * Extract the candidate profile from the standard backend envelope:
 *   { data: { candidate: {...} } }  OR  { data: {...} }
 */
function extractProfile(body: unknown): CandidateProfile | null {
  if (!body || typeof body !== "object") return null

  const b = body as Record<string, unknown>
  const data = b.data

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>
    // Try nested candidate key first
    if (d.candidate) return toCandidateProfile(d.candidate)
    // Fall back to data itself being the profile
    return toCandidateProfile(data)
  }

  return null
}

// ---------------------------------------------------------------------------
// getCandidateProfile
// ---------------------------------------------------------------------------

export type CandidateProfileResult =
  | { status: "ok"; profile: CandidateProfile }
  | { status: "error"; message: string }

/**
 * Fetches the full profile for the authenticated candidate.
 * The token obtained at login is passed as `Authorization: Bearer <token>`.
 */
export async function getCandidateProfile(token: string): Promise<CandidateProfileResult> {
  if (!token) {
    return { status: "error", message: "No auth token available. Please log in again." }
  }

  try {
    const response = await fetch(`${getBackendBaseUrl()}/recruitment/candidate-profile/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      const message =
        body && typeof body === "object" && typeof (body as { message?: string }).message === "string"
          ? (body as { message: string }).message
          : `Request failed with status ${response.status}.`

      return { status: "error", message }
    }

    const profile = extractProfile(body)
    if (!profile) {
      return {
        status: "error",
        message:
          "The server responded successfully, but no candidate profile was found in the response.",
      }
    }

    return { status: "ok", profile }
  } catch {
    return {
      status: "error",
      message: "Unable to reach the server. Please check your connection and try again.",
    }
  }
}
