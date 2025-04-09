import { makeDeleteRequest } from "@/lib/makeRequest";

export async function DELETE(request: Request) {
    try {
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
        
        // Ensure we're using the correct endpoint format
        await makeDeleteRequest(`bucket?id=${id}`);
        
        return new Response(null, { status: 204 });
        
    } catch (error: any) {
        console.error("API error:", error);
        
        if (error.message?.includes("not empty")) {
            return new Response(JSON.stringify({ 
                error: "Bucket is not empty" 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        } else if (error.code === "NoSuchBucket") {
            return new Response(JSON.stringify({ 
                error: "Bucket not found" 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        } else if (error.message?.includes("Method Not Allowed")) {
            return new Response(JSON.stringify({ 
                error: "Invalid request method - contact administrator" 
            }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ 
            error: error.message || "Failed to delete bucket" 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}