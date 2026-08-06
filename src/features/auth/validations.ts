// ---------------------------------------------------------------------------
// Auth validation schemas
// Shared between the client form and local auth helpers.
// ---------------------------------------------------------------------------
import { z } from "zod"

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),
})

export type LoginInput = z.infer<typeof LoginSchema>
