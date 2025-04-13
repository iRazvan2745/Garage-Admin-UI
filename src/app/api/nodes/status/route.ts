import { makeRequest } from "@/lib/makeRequest"

export async function GET() {
  const response = await makeRequest('status');
  return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
  });
}