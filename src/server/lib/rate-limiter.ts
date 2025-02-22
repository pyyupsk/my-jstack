import { HTTPException } from "hono/http-exception"

type RateLimitEntry = {
  count: number
  firstRequest: number
}

export class RateLimiter {
  private requests: Map<string, RateLimitEntry>
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number, maxRequests: number) {
    this.requests = new Map()
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  check(key: string): void {
    const now = Date.now()
    const entry = this.requests.get(key)

    if (!entry) {
      this.requests.set(key, { count: 1, firstRequest: now })
      return
    }

    if (now - entry.firstRequest > this.windowMs) {
      // Reset window
      this.requests.set(key, { count: 1, firstRequest: now })
      return
    }

    if (entry.count >= this.maxRequests) {
      const waitTime = Math.ceil((this.windowMs - (now - entry.firstRequest)) / 1000)
      throw new HTTPException(429, {
        message: `Rate limit exceeded. Please try again in ${waitTime} seconds.`,
      })
    }

    entry.count++
    this.requests.set(key, entry)
  }
}
