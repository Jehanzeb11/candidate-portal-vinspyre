"use server"

import type { User } from "@/types"
import { LoginSchema } from "@/features/auth/validations"

export type LoginResult =
  | { status: "ok"; user: User }
  | {
      status: "error"
      fieldErrors?: Partial<Record<"email", string>>
      message?: string
    }

function getBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.")
  }
  return baseUrl.replace(/\/$/, "")
}

function toUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null

  const candidate = value as {
    id?: unknown
    fullName?: unknown
    email?: unknown
    phone?: unknown
  }

  const id = typeof candidate.id === "string" ? candidate.id : undefined
  const name = typeof candidate.fullName === "string" ? candidate.fullName : undefined
  const email = typeof candidate.email === "string" ? candidate.email : undefined

  if (!id || !name || !email) return null

  return {
    id,
    name,
    email,
    phone: typeof candidate.phone === "string" ? candidate.phone : undefined,
    role: "viewer",
    avatarUrl: undefined,
  }
}

function extractUser(body: unknown): User | null {
  if (!body || typeof body !== "object") return null
  return toUser((body as { data?: { candidate?: unknown } }).data?.candidate)
}

export async function login(
  _prevState: LoginResult | undefined,
  formData: FormData
): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return {
      status: "error",
      fieldErrors: {
        email: flat.email?.[0],
      },
    }
  }

  try {
    const response = await fetch(`${getBackendBaseUrl()}/recruitment/candidate-profile/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      const fieldErrors =
        body && typeof body === "object" ? (body as { errors?: Record<string, string> }).errors : undefined

      return {
        status: "error",
        fieldErrors: {
          email: fieldErrors?.email,
        },
        message:
          (body && typeof body === "object" && typeof (body as { message?: string }).message === "string"
            ? (body as { message?: string }).message
            : undefined) ?? "Unable to sign in.",
      }
    }

    const user = extractUser(body)
    if (!user) {
      return {
        status: "error",
        message: "Login succeeded, but the backend did not return a candidate profile.",
      }
    }

    return { status: "ok", user }
  } catch {
    return {
      status: "error",
      message: "Unable to reach the authentication server.",
    }
  }
}