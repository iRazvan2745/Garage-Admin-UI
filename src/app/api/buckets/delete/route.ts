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
        
        await makeDeleteRequest(`bucket?id=${id}`);
        
        return new Response(JSON.stringify({ success: true, message: `Bucket ${id} deleted successfully` }), { status: 200 });
        
    } catch (error: unknown) {
        console.error("API error:", error);
        let message = "";
        let code = "";
        if (typeof error === 'object' && error !== null) {
            if ('message' in error && typeof (error as { message: string }).message === 'string') {
                message = (error as { message: string }).message;
            }
            if ('code' in error && typeof (error as { code: string }).code === 'string') {
                code = (error as { code: string }).code;
            }
        }
        if (message.includes("not empty")) {
            return new Response(JSON.stringify({ 
                error: "Bucket is not empty" 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        } else if (code === "NoSuchBucket") {
            return new Response(JSON.stringify({ 
                error: "Bucket not found" 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        } else if (code === "MethodNotAllowed") {
            return new Response(JSON.stringify({ 
                error: "Invalid request method - contact administrator" 
            }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ 
            error: message || "Failed to delete bucket" 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}