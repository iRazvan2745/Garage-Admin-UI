import { makeRequest } from "@/lib/makeRequest";

export async function GET() {
    try {
        const response = await makeRequest("health");
        
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("Failed to fetch nodes:", error);
        return new Response(JSON.stringify({ 
            error: error.message || "Failed to fetch nodes" 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}