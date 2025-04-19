import { jstack } from "jstack"

import { databaseMiddleware } from "./middlewares/database"
import { loggingMiddleware } from "./middlewares/logging"
import { rateLimitMiddleware } from "./middlewares/rate-limit"

type Env = {
  Bindings: {
    DATABASE_URL: string
  }
  Variables: {
    NODE_ENV: "development" | "production"
  }
}

export const j = jstack.init<Env>()

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure
  .use(rateLimitMiddleware({ limit: 5, windowInSeconds: 60 }))
  .use(loggingMiddleware)
  .use(databaseMiddleware)
