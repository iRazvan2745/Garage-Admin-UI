import { betterFetch } from '@better-fetch/fetch';

/**
 * Makes a request to the API with the given endpoint and options.
 * 
 * @param endpoint - The API endpoint to request
 * @param method - HTTP method to use (GET, POST, PUT, DELETE)
 * @param options - Optional fetch options
 * @returns Promise with the response data
 */
export async function makeRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options?: RequestInit
): Promise<any> {
  try {
    const apiUrl = process.env.GARAGE_API_URL;
    const { data, error } = await betterFetch(`${apiUrl}/v1/${endpoint}`, {
      ...options,
      method,
      headers: {
        'Authorization': `Bearer ${process.env.GARAGE_API_KEY}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (error) {
      throw new Error(`API error: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Request failed:', err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}

// Export convenience methods
export const makePostRequest = (
  endpoint: string, 
  options?: RequestInit
): Promise<any> => makeRequest(endpoint, 'POST', options);

export const makePutRequest = (
  endpoint: string, 
  options?: RequestInit
): Promise<any> => makeRequest(endpoint, 'PUT', options);

export const makeDeleteRequest = (
  endpoint: string, 
  options?: RequestInit
): Promise<any> => makeRequest(endpoint, 'DELETE', options);