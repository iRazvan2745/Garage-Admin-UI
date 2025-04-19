import { makeRequest } from '@/lib/makeRequest';

import { withApiAuth } from "@/lib/withApiAuth";

export async function POST(req: Request) {
  const authResult = await withApiAuth(req);
  if (authResult instanceof Response) return authResult;
  try {
    const body = await req.json();
    const { bucketId, accessKeyId, permissions } = body;
    if (!bucketId || !accessKeyId || typeof permissions !== 'object') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Only send the flags that are true
    const filteredPermissions = Object.fromEntries(
      Object.entries(permissions).filter(([, v]) => v === true)
    );

    const payload = {
      bucketId,
      accessKeyId,
      permissions: filteredPermissions,
    };

    const data = await makeRequest('bucket/allow', 'POST', {
      body: JSON.stringify(payload),
    });
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      typeof (err as { message: string }).message === 'string'
    ) {
      const message = (err as { message: string }).message;
      if (message.includes('not found')) {
        return new Response(JSON.stringify({ error: 'Bucket not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}