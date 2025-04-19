import { makeDeleteRequest } from "@/lib/makeRequest";

import { withApiAuth } from "@/lib/withApiAuth";

export async function DELETE(request: Request) {
    const authResult = await withApiAuth(request);
    if (authResult instanceof Response) return authResult;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const response = await makeDeleteRequest(`key?id=${id}`);
    
    return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}