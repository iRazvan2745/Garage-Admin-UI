import { makeRequest } from "@/lib/makeRequest"
import type { NodeList } from "@/lib/types"

export async function GET({params}: {params: {id: string}}) {
    try {
        const response = await makeRequest("status");
        const nodeList: NodeList[] = response.nodes || [];
        
        return new Response(JSON.stringify(nodeList), {
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