import { db } from "@/index";
import { user } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await db.select().from(user).limit(1);
    return NextResponse.json({ hasUsers: users.length > 0 });
  } catch {
    return NextResponse.json({ error: "Failed to check users" }, { status: 500 });
  }
}
