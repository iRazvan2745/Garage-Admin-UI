import { makeRequest } from "@/lib/makeRequest"

import { withApiAuth } from "@/lib/withApiAuth";

export async function GET(request: Request) {
  const authResult = await withApiAuth(request);
  if (authResult instanceof Response) return authResult;
  const authResult2 = await withApiAuth(request);
  if (authResult2 instanceof Response) return authResult2;
  try {
    const response = await makeRequest('status');
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error("Failed to fetch nodes:", error);
    let message = "Failed to fetch nodes";
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: string }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return new Response(JSON.stringify({ 
      error: message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}