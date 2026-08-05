"use server"
// ---------------------------------------------------------------------------
// Auth Server Actions
//
// login()   validates credentials server-side, creates the session cookie,
//           and redirects. RHF on the client maps the returned errors onto
//           the correct fields.
//
// logout()  clears the session cookie and redirects to /login.
// ---------------------------------------------------------------------------
import { redirect } from "next/navigation"
import { createSession, deleteSession, mintIdentityToken } from "@/server/session"
import { LoginSchema } from "@/features/auth/validations"
import { findDemoAccount } from "@/server/demo-accounts"

// ─── Result type ─────────────────────────────────────────────────────────────

export type LoginResult =
  | { status: "ok" }
  | {
      status: "error"
      fieldErrors?: Partial<Record<"email" | "password", string>>
      message?: string
    }

// ─── login ───────────────────────────────────────────────────────────────────

export async function login(
  _prev: LoginResult | undefined,
  formData: FormData
): Promise<LoginResult> {
  // 1. Validate shape
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

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

  const { email, password } = parsed.data

  // 2. Check demo credentials (replace with a real backend call when ready)
  const account = findDemoAccount(email, password)

  if (!account) {
    return { status: "error", message: "Invalid email or password." }
  }

  // 3. Mint a signed JWT — verifiable with getEncodedKey() + jwtVerify.
  //    In production: call your backend, get a real accessToken, pass it here.
  const accessToken = await mintIdentityToken({
    sub: account.user.id,
    email: account.user.email,
    name: account.user.name,
    role: account.user.role,
    demo: true,
  })

  await createSession(accessToken)

  redirect("/")
}

// ─── logout ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await deleteSession()
  redirect("/login")
}
