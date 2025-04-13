import { makeDeleteRequest } from "@/lib/makeRequest";

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const response = await makeDeleteRequest(`key?id=${id}`);
    
    return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}