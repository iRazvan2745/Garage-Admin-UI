import { makePostRequest } from "@/lib/makeRequest";

export async function POST(request: Request) {
  const { connectID } = await request.json();
  
  try {
    const response = await makePostRequest('node', {
      method: 'POST',
      body: JSON.stringify({ connectID })
    });
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Failed to add node:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to add node" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}