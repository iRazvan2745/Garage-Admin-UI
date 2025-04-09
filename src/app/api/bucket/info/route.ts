import { makeRequest } from "@/lib/makeRequest";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
      return new Response(JSON.stringify({ 
          error: "Bucket ID is required" 
      }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
      });
  }

  const response = await makeRequest(`bucket?id=${id}`);
  return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
  });
}