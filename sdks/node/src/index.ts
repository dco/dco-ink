import { Client } from './client';
import { ShortenOptions, Link } from './types';
import { ValidationError, DcoApiError } from './errors';

const DEFAULT_BASE_URL = 'https://api.dco.ink';

/**
 * Intelligently shortens a URL.
 * - If `apiKey` is provided, calls POST /api/links (authenticated, allows custom codes).
 * - If `apiKey` is NOT provided, calls GET /api/s (fast anonymous mode).
 * 
 * @param url The long URL to shorten
 * @param options Options including customCode and apiKey
 * @returns A structured Link object
 */
export async function shorten(url: string, options?: ShortenOptions): Promise<Link> {
  const { customCode, apiKey, baseUrl = DEFAULT_BASE_URL } = options || {};

  if (customCode && !apiKey) {
    throw new ValidationError('customCode requires an apiKey to be provided.');
  }

  if (apiKey) {
    // Authenticated Mode
    const client = new Client({ apiKey, baseUrl });
    return client.createLink(url, customCode);
  } else {
    // Fast Anonymous Mode
    const searchParams = new URLSearchParams();
    searchParams.append('url', url);
    
    const response = await fetch(`${baseUrl}/api/s?${searchParams.toString()}`);
    const text = await response.text();

    if (!response.ok) {
      if (text.startsWith('error: invalid_url')) {
        throw new ValidationError('Please provide a valid URL.', 'invalid_url', response.status);
      }
      throw new DcoApiError(`Failed to create anonymous link: ${text}`, 'unknown_error', response.status);
    }

    const shortUrl = text.trim();
    const parts = shortUrl.split('/');
    const shortCode = parts[parts.length - 1];

    return {
      shortCode,
      shortUrl,
      targetUrl: url,
      clicks: 0
    };
  }
}

export * from './client';
export * from './types';
export * from './errors';
