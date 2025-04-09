import { makePostRequest, makePutRequest } from "@/lib/makeRequest";

export async function POST(request: Request) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    console.log("Bucket name parameter:", name);
    
    if(!name) {
        return new Response(JSON.stringify({ 
            error: "Bucket name is required" 
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 1. First create the bucket
        const bucket = await makePostRequest('bucket', {
            body: JSON.stringify({})
        });
        
        console.log("Bucket created:", bucket.id);
        
        // 2. Then set the global alias using path parameters
        const aliasResult = await makePutRequest(`bucket/alias/global?id=${bucket.id}&alias=${name}`);
        
        console.log("Alias set:", aliasResult);
        
        return new Response(JSON.stringify({
            ...bucket,
            globalAliases: [name]
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("API error:", error);
        return new Response(JSON.stringify({ 
            error: error.message || "Failed to create bucket" 
        }), {
            status: error.code === 'AccessDenied' ? 403 : 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}