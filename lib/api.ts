// API utility functions with automatic Authorization header handling

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Makes an API call with automatic Authorization header if token exists
 * @param url - The API endpoint URL
 * @param options - Fetch options including requireAuth flag
 * @returns Promise<Response>
 */
export const apiCall = async (url: string, options: ApiOptions = {}): Promise<Response> => {
  const { requireAuth = true, ...fetchOptions } = options;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  
  // Add Authorization header if token exists and auth is required
  if (token && requireAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the API call
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
};

/**
 * Makes a GET request with automatic Authorization header
 * @param url - The API endpoint URL
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export const apiGet = (url: string, options: Omit<ApiOptions, 'method'> = {}) => {
  return apiCall(url, { ...options, method: 'GET' });
};

/**
 * Makes a POST request with automatic Authorization header
 * @param url - The API endpoint URL
 * @param data - The data to send
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export const apiPost = (url: string, data?: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
  return apiCall(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Makes a PUT request with automatic Authorization header
 * @param url - The API endpoint URL
 * @param data - The data to send
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export const apiPut = (url: string, data?: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
  return apiCall(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Makes a DELETE request with automatic Authorization header
 * @param url - The API endpoint URL
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export const apiDelete = (url: string, options: Omit<ApiOptions, 'method'> = {}) => {
  return apiCall(url, { ...options, method: 'DELETE' });
};
