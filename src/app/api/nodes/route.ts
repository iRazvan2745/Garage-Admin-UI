import { makeRequest } from "@/lib/makeRequest"
import type { NodeList } from "@/lib/types"

export async function GET() {
    try {
        const response = await makeRequest("status");
        const nodeList: NodeList[] = response.nodes || [];
        
        return new Response(JSON.stringify(nodeList), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: unknown) {
        console.error("Failed to fetch nodes:", error);
        let message = "Failed to fetch nodes";
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