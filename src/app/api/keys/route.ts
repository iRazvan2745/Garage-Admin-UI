import { makeRequest } from "@/lib/makeRequest";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryType = url.searchParams.get('query');
    const id = url.searchParams.get('id');
    const showSecretKey = url.searchParams.get('showSecretKey');
    
    if (queryType === 'id') {
      const response = await makeRequest(`key?id=${id}${showSecretKey ? '&showSecretKey=true' : ''}`);
      return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
      });
    }
    if (queryType === 'search') {
        const response = await makeRequest(`key?search=${id}${showSecretKey ? '&showSecretKey=true' : ''}`);
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify({
        error: 'Invalid query type'
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}