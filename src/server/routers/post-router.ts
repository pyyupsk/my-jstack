import { posts } from "@/server/db/schema"
import { j, publicProcedure } from "@/server/jstack"
import { RateLimiter } from "@/server/lib/rate-limiter"
import { desc } from "drizzle-orm"
import { z } from "zod"

// Create a rate limiter instance: 5 requests per minute
const createPostLimiter = new RateLimiter(60 * 1000, 5)

export const postRouter = j.router({
  recent: publicProcedure.query(async ({ c, ctx }) => {
    const { db } = ctx

    const [recentPost] = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(1)

    return c.superjson(recentPost ?? null)
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input
      const { db } = ctx

      // Get client IP from Cloudflare headers
      const clientIp = c.req.raw.headers.get("cf-connecting-ip") || "unknown"

      // Check rate limit
      createPostLimiter.check(clientIp)

      const post = await db.insert(posts).values({ name })

      return c.superjson(post)
    }),
})
