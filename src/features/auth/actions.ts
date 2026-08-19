import type { User, LatestApplication } from "@/types"
import { LoginSchema } from "@/features/auth/validations"

export type LoginResult =
  | { status: "ok"; user: User; token: string; isPasswordUpdated: boolean }
  | {
      status: "error"
      fieldErrors?: Partial<Record<"email" | "password", string>>
      message?: string
    }

function getBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.")
  return baseUrl.replace(/\/$/, "")
}

function toUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null
  const c = value as Record<string, unknown>

  const id    = typeof c.id        === "string" ? c.id        : undefined
  const email = typeof c.email     === "string" ? c.email     : undefined
  const first = typeof c.firstName === "string" ? c.firstName : ""
  const last  = typeof c.lastName  === "string" ? c.lastName  : ""
  const name  = `${first} ${last}`.trim() || undefined

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
  const d = (body as Record<string, unknown>).data
  if (!d || typeof d !== "object") return null
  const token = (d as Record<string, unknown>).accessToken
  return typeof token === "string" && token.length > 0 ? token : null
}

function extractCandidate(body: unknown): User | null {
  if (!body || typeof body !== "object") return null
  const d = (body as Record<string, unknown>).data
  if (!d || typeof d !== "object") return null
  return toUser((d as Record<string, unknown>).candidate)
}

function extractLatestApplication(body: unknown): LatestApplication | undefined {
  if (!body || typeof body !== "object") return undefined
  const d = (body as Record<string, unknown>).data
  if (!d || typeof d !== "object") return undefined
  const app = (d as Record<string, unknown>).latestApplication
  if (!app || typeof app !== "object") return undefined
  const a = app as Record<string, unknown>
  const id               = typeof a.id               === "string" ? a.id               : undefined
  const jobId            = typeof a.jobId            === "string" ? a.jobId            : undefined
  const positionAppliedFor = typeof a.positionAppliedFor === "string" ? a.positionAppliedFor : undefined
  if (!id || !jobId || !positionAppliedFor) return undefined
  return { id, jobId, positionAppliedFor }
}

export async function login(credentials: {
  email: string
  password: string
}): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse(credentials)

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return {
      status: "error",
      fieldErrors: {
        email: flat.email?.[0],
        password: flat.password?.[0],
      },
    }
  }

  const response = await fetch(
    `${getBackendBaseUrl()}/recruitment/candidate-profile/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(parsed.data),
    }
  )

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const fieldErrors =
      body && typeof body === "object"
        ? (body as { errors?: Record<string, string> }).errors
        : undefined
    return {
      status: "error",
      fieldErrors: {
        email: fieldErrors?.email,
        password: fieldErrors?.password,
      },
      message: (body as { message?: string })?.message ?? "Unable to sign in.",
    }
  }

  const token = extractToken(body)
  const user  = extractCandidate(body)

  if (!token || !user) {
    return { status: "error", message: "Login succeeded but token or user data is missing." }
  }

  const responseData = (body as { data?: Record<string, unknown> })?.data ?? {}
  const isPasswordUpdated = responseData.isPasswordUpdated === true

  const latestApplication = extractLatestApplication(body)
  if (latestApplication) user.latestApplication = latestApplication

  return { status: "ok", user, token, isPasswordUpdated }
}
