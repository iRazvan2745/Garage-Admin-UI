import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { db } from "@/index";
import { user } from "@/db/schema";

const handler = toNextJsHandler(auth);

export async function POST(request: Request) {
  // Only intercept sign-up requests
  if (request.url.includes("sign-up/email")) {
    const users = await db.select().from(user).limit(1);
    if (users.length > 0) {
      return new Response(JSON.stringify({ error: "Registration is disabled: an account already exists." }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  // Fallback to better-auth handler
  return handler.POST(request);
}

export const GET = handler.GET;