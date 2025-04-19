import dotenvx from "@dotenvx/dotenvx"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dotenvx.get("DATABASE_URL"),
  },
})
