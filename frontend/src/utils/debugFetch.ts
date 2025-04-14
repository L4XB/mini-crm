/**
 * Debugging-Wrapper für fetch mit ausführlichem Logging
 */
export async function debugFetch(url: string, options: RequestInit = {}) {
  console.log(`API Request to: ${url}`);
  console.log('Request Options:', {
    ...options,
    body: options.body ? '[Body exists but not shown for privacy]' : undefined
  });
  
  try {
    const response = await fetch(url, options);
    
    const responseData = await response.clone().json().catch(() => null);
    
    console.log(`API Response from ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
      data: responseData
    });
    
    return response;
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
}
