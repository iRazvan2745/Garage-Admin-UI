import { makePostRequest } from "@/lib/makeRequest";

export async function POST(request: Request) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    console.log("Key name parameter:", name);
    
    try {
        // Create the key with optional name
        const key = await makePostRequest('key', {
            body: JSON.stringify(
                name ? { name } : {}
            )
        });
        
        console.log("Key created:", key.id);
        
        return new Response(JSON.stringify({
            ...key,
            ...(name && { name })
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("API error:", error);
        return new Response(JSON.stringify({ 
            error: error.message || "Failed to create key" 
        }), {
            status: error.code === 'AccessDenied' ? 403 : 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}