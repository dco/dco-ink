import { ClientOptions, Link, UserInfo, ListLinksOptions } from './types';
import {
  DcoApiError,
  AuthenticationError,
  ValidationError,
  CodeTakenError,
  ForbiddenError,
  RateLimitError
} from './errors';

const DEFAULT_BASE_URL = 'https://api.dco.ink';

export class Client {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.timeout = options.timeout || 10000;
  }

  private async handleResponseError(response: Response): Promise<never> {
    let errorData: any = {};
    let message = `HTTP Error ${response.status}`;
    let code = 'unknown_error';

    try {
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
        message = errorData.message || text;
        code = errorData.error || code;
      } catch {
        message = text;
      }
    } catch {
      // Ignore text read error
    }

    const status = response.status;
    if (status === 401) throw new AuthenticationError(message, code, status);
    if (status === 403) throw new ForbiddenError(message, code, status);
    if (status === 409) throw new CodeTakenError(message, code, status);
    if (status === 429) throw new RateLimitError('Rate limit exceeded', code, status);
    if (status === 400) throw new ValidationError(message, code, status);
    
    throw new DcoApiError(message, code, status);
  }

  private async request<T>(method: string, path: string, body?: any, params?: Record<string, any>): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
      'User-Agent': 'dcoink-node-sdk/0.1.0'
    };

    const init: RequestInit = {
      method,
      headers
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    let controller: AbortController | undefined;
    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      init.signal = controller.signal;
    }

    let timeoutId: any;
    if (controller) {
      timeoutId = setTimeout(() => controller!.abort(), this.timeout);
    }

    try {
      // We use the globally available fetch (Node 18+, Browser, Cloudflare Workers, etc.)
      const response = await fetch(url, init);
      if (!response.ok) {
        return this.handleResponseError(response);
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new DcoApiError(`Request timed out after ${this.timeout}ms`, 'timeout', 408);
      }
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Get the current authenticated user's details.
   */
  public async getMe(): Promise<UserInfo> {
    const data = await this.request<any>('GET', '/api/auth/me');
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      isSubscribed: data.is_subscribed,
      apiToken: data.api_token,
      avatarUrl: data.avatar_url
    };
  }

  /**
   * Create a new shortened link.
   * @param url The target URL to shorten
   * @param customCode An optional custom short code
   */
  public async createLink(url: string, customCode?: string): Promise<Link> {
    const payload: any = { url };
    if (customCode) payload.custom_code = customCode;

    const data = await this.request<any>('POST', '/api/links', payload);
    return {
      shortCode: data.short_code,
      shortUrl: data.short_url,
      targetUrl: data.target_url || url,
      expiresAt: data.expires_at,
      clicks: data.clicks || 0
    };
  }

  /**
   * List all links created by the current user.
   */
  public async listLinks(options?: ListLinksOptions): Promise<Link[]> {
    const data = await this.request<any>('GET', '/api/links', undefined, {
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0
    });

    const links = data.links || [];
    return links.map((item: any) => ({
      shortCode: item.short_code,
      shortUrl: `https://dco.ink/${item.short_code}`,
      targetUrl: item.target_url,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      clicks: item.clicks || 0
    }));
  }

  /**
   * Update the target URL of an existing link.
   */
  public async updateLink(shortCode: string, newUrl: string): Promise<void> {
    await this.request('PUT', `/api/links/${shortCode}`, { url: newUrl });
  }

  /**
   * Delete an existing link.
   */
  public async deleteLink(shortCode: string): Promise<void> {
    await this.request('DELETE', `/api/links/${shortCode}`);
  }
}
