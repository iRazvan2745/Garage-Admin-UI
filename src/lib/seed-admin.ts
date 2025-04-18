import { db } from "@/index";
import * as schema from "@/db/schema";

export async function seedAdminIfNoneExists() {
  const users = await db.select().from(schema.user).limit(1);
  if (users.length > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "admin";

  if (!email || !password) {
    console.warn("ADMIN_EMAIL and ADMIN_PASSWORD must be set in env to auto-create admin user.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      throw new Error(`Failed to seed admin user: ${await res.text()}`);
    }
    console.log("Admin user seeded from environment variables.");
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }
}