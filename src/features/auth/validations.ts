// ---------------------------------------------------------------------------
// Auth validation schemas
// Shared between the client (react-hook-form resolver) and the server action.
// ---------------------------------------------------------------------------
import { z } from "zod"

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required."),
})

export type LoginInput = z.infer<typeof LoginSchema>
