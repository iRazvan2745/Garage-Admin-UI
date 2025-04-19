import { makeRequest } from "@/lib/makeRequest";

import { withApiAuth } from "@/lib/withApiAuth";

export async function GET(request: Request) {
    const authResult = await withApiAuth(request);
    if (authResult instanceof Response) return authResult;
  const response = await makeRequest('key?list');
  return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
  });
}