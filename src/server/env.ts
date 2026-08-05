// ---------------------------------------------------------------------------
// server/env.ts — validated environment variables
//
// Import this at the top of any server module that needs env vars.
// Fails fast at startup with a descriptive message rather than blowing up
// deep inside a request handler.
//
// Never import this in client-side code — it will throw on missing secrets.
// ---------------------------------------------------------------------------
import "server-only"
import { z } from "zod"

const serverEnvSchema = z.object({
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters for HS256 security."),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Optional — when unset the app runs in demo mode
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
})

function validateEnv() {
  const result = serverEnvSchema.safeParse(process.env)
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")
    throw new Error(
      `\n\nMissing or invalid environment variables:\n${formatted}\n\nCheck your .env.local file.\n`
    )
  }
  return result.data
}

export const env = validateEnv()
