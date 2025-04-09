import { makeRequest } from "@/utils/makeRequest";


export async function GET() {
  const response = await makeRequest('bucket?list');
  return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
  });
}