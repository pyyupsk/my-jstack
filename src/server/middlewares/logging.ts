import { j } from "@/server/jstack"
import { env } from "hono/adapter"

export const loggingMiddleware = j.middleware(async ({ c, next }) => {
  const { NODE_ENV } = env(c)

  if (NODE_ENV === "development") {
    return await next()
  }

  const start = performance.now()

  await next()

  const end = performance.now()

  // eslint-disable-next-line no-console
  console.log(`${c.req.method} ${c.req.url} took ${end - start}ms`)
})
