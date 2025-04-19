import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { env } from "hono/adapter"
import { jstack } from "jstack"

type Env = {
  Bindings: {
    DATABASE_URL: string
  }
}

export const j = jstack.init<Env>()

/**
 * Type-safely injects database into all procedures
 *
 * @see https://jstack.app/docs/backend/middleware
 */
export const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { DATABASE_URL } = env(c)

  const sql = neon(DATABASE_URL)
  const db = drizzle(sql)

  return await next({ db })
})

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

      // Clear expired requests
      for (const [key, value] of requests.entries()) {
        if (value.reset < now) {
          // eslint-disable-next-line drizzle/enforce-delete-with-where
          requests.delete(key)
        }
      }

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

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure
  .use(rateLimitMiddleware({ limit: 5, windowInSeconds: 60 }))
  .use(databaseMiddleware)
