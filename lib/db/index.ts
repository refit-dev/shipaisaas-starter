// import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as accountSchema from "@/lib/db/schema/account";
import * as chatSchema from "@/lib/db/schema/chat";

declare global {
  // eslint-disable-next-line no-var
  var cachedPgPool: Pool | undefined;
}

const pool =
  process.env.NODE_ENV === "production"
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
      })
    : (global.cachedPgPool ??
      (global.cachedPgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
      })));

// Merge the schema objects
const schema = {
  ...accountSchema,
  ...chatSchema,
};

export const db = drizzle(pool, { schema });
