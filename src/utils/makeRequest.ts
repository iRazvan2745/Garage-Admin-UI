const url = process.env.GARAGE_API_URL;

async function makeRequest(route: string, options: RequestInit = {}) {
  if (!process.env.GARAGE_API_KEY) {
    throw new Error('GARAGE_API_KEY is not configured in environment variables');
  }

  const headers = {
    Authorization: `Bearer ${process.env.GARAGE_API_KEY}`,
    ...options.headers,
  };

  const fullUrl = `${url}/v1/${route}`;

  const response = await fetch(fullUrl, {
    method: options.method || 'GET',
    headers,
    ...options,
  });
  
  const data = await response.json();

  if (!response.ok) {
    throw {
      code: data.code || 'UnknownError',
      message: data.message || 'An unknown error occurred',
      region: data.region || 'garage',
      path: data.path || `/v1/${route}`
    };
  }
  
  return data;
}

async function makePostRequest(route: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GARAGE_API_KEY}`,
    ...(options.headers || {})
  };
  
  return makeRequest(route, {
    method: 'POST',
    headers,
    ...options,
  });
}

async function makePutRequest(route: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GARAGE_API_KEY}`,
    ...(options.headers || {})
  };
  
  return makeRequest(route, {
    method: 'PUT',
    headers,
    ...options,
  });
}

async function makeDeleteRequest(route: string, options: RequestInit = {}) {
  const headers = {
    'Authorization': `Bearer ${process.env.GARAGE_API_KEY}`,
    ...(options.headers || {})
  };
  
  return makeRequest(route, {
    method: 'DELETE',
    headers,
    ...options,
  });
}

export { makeRequest, makePostRequest, makePutRequest, makeDeleteRequest };