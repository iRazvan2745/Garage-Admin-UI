import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index"; // your drizzle instance
import * as schema from "@/db/schema"; // <-- import your schema object

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema, // <-- pass schema here
  })
});