import { makePostRequest } from "@/lib/makeRequest";
import type { KeyList } from "@/lib/types";

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
        }) as KeyList;
        
        console.log("Key created:", key.id);
        
        return new Response(JSON.stringify({
            ...key,
            ...(name && { name })
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: unknown) {  
        console.error("API error:", error);
        let message = "Failed to create key";
        let code = "";
        if (typeof error === 'object' && error !== null) {
            if ('message' in error && typeof (error as { message: string }).message === 'string') {
                message = (error as { message: string }).message;
            }
            if ('code' in error && typeof (error as { code: string }).code === 'string') {
                code = (error as { code: string }).code;
            }
        }
        return new Response(JSON.stringify({ 
            error: message 
        }), {
            status: code === 'AccessDenied' ? 403 : 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}