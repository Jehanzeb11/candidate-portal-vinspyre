"use server"

import type { User, CandidateProfile } from "@/types"
import { LoginSchema } from "@/features/auth/validations"

export type LoginResult =
  | { status: "ok"; user: User; token: string; profile: CandidateProfile }
  | {
      status: "error"
      fieldErrors?: Partial<Record<"email", string>>
      message?: string
    }

function getBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.")
  return baseUrl.replace(/\/$/, "")
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null
  const c = value as Record<string, unknown>
  const id    = typeof c.id       === "string" ? c.id       : undefined
  const name  = typeof c.fullName === "string" ? c.fullName : undefined
  const email = typeof c.email    === "string" ? c.email    : undefined
  if (!id || !name || !email) return null
  return {
    id,
    name,
    email,
    phone: typeof c.phone === "string" ? c.phone : undefined,
    role: "viewer",
    avatarUrl: undefined,
  }
}

function extractToken(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  const d = b.data && typeof b.data === "object" ? (b.data as Record<string, unknown>) : null
  const token = d?.accessToken ?? d?.token ?? b.accessToken ?? b.token
  return typeof token === "string" && token.length > 0 ? token : null
}

function extractCandidate(body: unknown): User | null {
  if (!body || typeof body !== "object") return null
  const d = (body as Record<string, unknown>).data
  if (!d || typeof d !== "object") return null
  return toUser((d as Record<string, unknown>).candidate)
}

// ─── Fetch profile with token ─────────────────────────────────────────────────

async function fetchProfile(token: string): Promise<CandidateProfile | null> {
  try {
    const res = await fetch(`${getBackendBaseUrl()}/recruitment/candidate-profile`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
    const body = await res.json().catch(() => null)
    console.log("[fetchProfile] response:", JSON.stringify(body, null, 2))
    if (!res.ok || !body?.data) return null
    return body.data as CandidateProfile
  } catch {
    return null
  }
}

// ─── Login action ─────────────────────────────────────────────────────────────

export async function login(
  _prevState: LoginResult | undefined,
  formData: FormData
): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse({ email: formData.get("email") })

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return { status: "error", fieldErrors: { email: flat.email?.[0] } }
  }

  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/recruitment/candidate-profile/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(parsed.data),
        cache: "no-store",
      }
    )

    const body = await response.json().catch(() => null)
    console.log("[login] raw response:", JSON.stringify(body, null, 2))

    if (!response.ok) {
      const fieldErrors =
        body && typeof body === "object"
          ? (body as { errors?: Record<string, string> }).errors
          : undefined
      return {
        status: "error",
        fieldErrors: { email: fieldErrors?.email },
        message:
          (body as { message?: string })?.message ?? "Unable to sign in.",
      }
    }

    const token = extractToken(body)
    const user  = extractCandidate(body)

    console.log("[login] token:", token)
    console.log("[login] user:", user)

    if (!token || !user) {
      return {
        status: "error",
        message: "Login succeeded but token or user data is missing.",
      }
    }

    // Fetch full profile immediately after login
    const profile = await fetchProfile(token)
    if (!profile) {
      return {
        status: "error",
        message: "Logged in but failed to load candidate profile.",
      }
    }

    return { status: "ok", user, token, profile }
  } catch {
    return { status: "error", message: "Unable to reach the authentication server." }
  }
}
