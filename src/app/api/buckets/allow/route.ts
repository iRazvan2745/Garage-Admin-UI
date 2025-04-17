import { makeRequest } from '@/lib/makeRequest';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bucketId, accessKeyId, permissions } = body;
    if (!bucketId || !accessKeyId || typeof permissions !== 'object') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Only send the flags that are true
    const filteredPermissions = Object.fromEntries(
      Object.entries(permissions).filter(([_, v]) => v === true)
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err?.message?.includes('not found')) {
      return new Response(JSON.stringify({ error: 'Bucket not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), { status: 500 });
  }
}