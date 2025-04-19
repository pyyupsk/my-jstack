import { j } from "@/server/jstack"

type RateLimitOptions = {
  limit: number
  windowInSeconds: number
}

type RateLimitEntry = {
  count: number
  reset: number
}

// In-memory storage for rate limiting
const requests = new Map<string, RateLimitEntry>()

export const rateLimitMiddleware = (options: RateLimitOptions) => {
  const { limit, windowInSeconds } = options

  return j.middleware(async ({ c, next }) => {
    try {
      // Get identifier (usually IP address)
      const identifier =
        c.req.raw.headers.get("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown"
      const key = `rate-limit:${identifier}`
      const now = Date.now()
      const windowMs = windowInSeconds * 1000
      const resetTime = now + windowMs

      let currentCount = 0
      let remaining = limit

      // Use in-memory store
      let record = requests.get(key)

      if (!record || record.reset < now) {
        // First request or expired window
        record = { count: 1, reset: resetTime }
        requests.set(key, record)
      } else {
        // Increment within existing window
        record.count++
        requests.set(key, record)
      }

      currentCount = record.count
      remaining = Math.max(0, limit - currentCount)

      // Add headers
      c.header("x-ratelimit-limit", limit.toString())
      c.header("x-ratelimit-remaining", remaining.toString())
      c.header("x-ratelimit-reset", Math.floor(record.reset / 1000).toString())

      // Check if rate limit is exceeded
      if (currentCount > limit) {
        c.status(429)
        return c.json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        })
      }

      // Continue to next middleware/handler
      return await next()
    } catch (error) {
      console.error("Rate limit middleware error:", error)
      // Continue even if rate limiting fails
      return await next()
    }
  })
}

// Clear expired records in-memory store
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requests.entries()) {
    if (value.reset < now) {
      // eslint-disable-next-line drizzle/enforce-delete-with-where
      requests.delete(key)
    }
  }
}, 60000) // Clean up every minute
