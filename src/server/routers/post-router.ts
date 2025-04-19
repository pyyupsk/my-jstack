import { posts } from "@/server/db/schema"
import { j, publicProcedure } from "@/server/jstack"
import { desc } from "drizzle-orm"
import { z } from "zod"

export const postRouter = j.router({
  recent: publicProcedure.query(async ({ c, ctx }) => {
    const { db } = ctx

    const [recentPost] = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(1)

    return c.superjson(recentPost ?? null)
  }),

  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input
      const { db } = ctx

      if (!name) {
        return c.newResponse("Name is required, please try again", { status: 400 })
      }

      const post = await db.insert(posts).values({ name })

      return c.superjson(post)
    }),
})
