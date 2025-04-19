import { makeRequest } from "@/lib/makeRequest"
import { withApiAuth } from "@/lib/withApiAuth";


export async function GET(request: Request) {
  try {
    await withApiAuth(request);
    const response = await makeRequest('status') as Record<string, unknown>;
    return new Response(JSON.stringify({
      ...response,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}