import { cors } from "hono/cors"

import { j } from "./jstack"
import { postRouter } from "./routers/post-router"

/**
 * This is your base API.
 * Here, you can handle errors, not-found responses, cors and more.
 *
 * @see https://jstack.app/docs/backend/app-router
 */
const api = j
  .router()
  .basePath("/api")
  .use(
    cors({
      allowHeaders: ["x-is-superjson", "content-type"],
      exposeHeaders: ["x-is-superjson"],
      origin: "https://my-jstack.vercel.app",
      credentials: true,
    }),
  )
  .onError(j.defaults.errorHandler)

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.mergeRouters(api, {
  post: postRouter,
})

export type AppRouter = typeof appRouter

export default appRouter
