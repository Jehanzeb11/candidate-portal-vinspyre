// ---------------------------------------------------------------------------
// rate-limit.ts — server-only, in-process sliding-window rate limiter
//
// This is an in-memory solution suitable for single-instance deployments
// (local, single-region Vercel, etc.). For multi-instance or edge deployments
// replace with a distributed store (Upstash Redis, Vercel KV, etc.).
//
// Usage:
//   const limiter = new RateLimiter({ windowMs: 60_000, max: 10 })
//   const { ok, retryAfterMs } = limiter.check(key)
// ---------------------------------------------------------------------------
import "server-only"

interface RateLimiterOptions {
  /** Rolling window duration in milliseconds. */
  windowMs: number
  /** Maximum number of requests allowed within the window. */
  max: number
}

interface CheckResult {
  ok: boolean
  /** Milliseconds until the client may retry. Only set when ok === false. */
  retryAfterMs?: number
}

interface Record {
  timestamps: number[]
}

export class RateLimiter {
  private readonly windowMs: number
  private readonly max: number
  private readonly store = new Map<string, Record>()

  constructor({ windowMs, max }: RateLimiterOptions) {
    this.windowMs = windowMs
    this.max = max
  }

  check(key: string): CheckResult {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get or create the record for this key
    let record = this.store.get(key)
    if (!record) {
      record = { timestamps: [] }
      this.store.set(key, record)
    }

    // Drop timestamps outside the current window
    record.timestamps = record.timestamps.filter((t) => t > windowStart)

    if (record.timestamps.length >= this.max) {
      // Oldest timestamp in window determines when the slot frees up
      const oldest = record.timestamps[0]
      const retryAfterMs = oldest + this.windowMs - now
      return { ok: false, retryAfterMs: Math.ceil(retryAfterMs) }
    }

    record.timestamps.push(now)
    return { ok: true }
  }

  /** Remove the store entry for a key (e.g. after successful login). */
  reset(key: string): void {
    this.store.delete(key)
  }
}

// ---------------------------------------------------------------------------
// Shared limiters — instantiated once per process lifetime
// ---------------------------------------------------------------------------

/** 10 login attempts per IP per 60 seconds. */
export const loginRateLimiter = new RateLimiter({ windowMs: 60_000, max: 10 })
