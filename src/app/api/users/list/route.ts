import { db } from "@/index";
import { user } from "@/db/schema";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/withApiAuth";

export async function GET(request: Request) {
  const authResult = await withApiAuth(request);
  if (authResult instanceof Response) return authResult;
  const users = await db.select().from(user).limit(10);
  return NextResponse.json(users);
}