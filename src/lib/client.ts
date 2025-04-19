import type { AppRouter } from "@/server"

import { createClient } from "jstack"

/**
 * Your type-safe API client
 * @see https://jstack.app/docs/backend/api-client
 */
export const client = createClient<AppRouter>({
  baseUrl: `${getBaseUrl()}/api`,
})

function getBaseUrl() {
  // 👇 In production, use the production worker
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_WORKER_URL // Ex: "https://my-jstack.username.workers.dev"
  }

  // 👇 Locally, use wrangler backend
  return `http://localhost:8080`
}
