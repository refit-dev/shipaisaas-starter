import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// LOAD THE ENV FILE
config({ path: ".env" }); // or '.env.local' if that's what you use

if (!process.env.DATABASE_URL) {
  throw new Error("🔴 DATABASE_URL is missing in drizzle.config.ts");
}

export default defineConfig({
  schema: [
    "./lib/db/schema/account.ts",
    "./lib/db/schema/chat.ts",
    "./lib/db/schema/agent.ts",
  ],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
