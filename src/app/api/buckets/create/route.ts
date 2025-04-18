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
    } catch (error: unknown) {
        console.error("API error:", error);
        let message = "Failed to create bucket";
        if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: string }).message === 'string') {
            message = (error as { message: string }).message;
        }
        let statusCode = 400;
        if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: string }).code === 'string') {
            if ((error as { code: string }).code === 'AccessDenied') {
                statusCode = 403;
            }
        }
        return new Response(JSON.stringify({ 
            error: message 
        }), {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}