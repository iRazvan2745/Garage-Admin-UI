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
  } catch (error: unknown) {
    console.error("Failed to add node:", error);
    let message = "Failed to add node";
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