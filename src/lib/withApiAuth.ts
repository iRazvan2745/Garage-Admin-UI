interface AuthSession {
  user: {
    id: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function withApiAuth(request: Request): Promise<AuthSession | Response> {
  try {
    const sessionUrl = new URL('/api/auth/get-session', request.url).toString();
    const sessionRes = await fetch(sessionUrl, {
      headers: { cookie: request.headers.get('cookie') || '' },
    });
    if (sessionRes.ok) {
      try {
        const session = await sessionRes.json();
        if (session && session.user && typeof session.user.id === 'string') {
          return session;
        }
      } catch {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token === process.env.GARAGE_API_KEY) {
        return { user: { id: 'api-key-user' } };
      }
    }

    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}