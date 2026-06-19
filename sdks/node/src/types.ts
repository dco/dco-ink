export interface Link {
  shortCode: string;
  shortUrl: string;
  targetUrl?: string;
  id?: string;
  clicks: number;
  createdAt?: string;
  expiresAt?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  isSubscribed: number;
  apiToken: string;
  avatarUrl?: string;
}

export interface ClientOptions {
  /**
   * Your dco.ink API Key. Required for managing links and custom codes.
   */
  apiKey: string;
  /**
   * Optional custom base URL. Defaults to https://api.dco.ink
   */
  baseUrl?: string;
  /**
   * Optional custom timeout in milliseconds. Defaults to 10000.
   */
  timeout?: number;
}

export interface ShortenOptions {
  /**
   * Your dco.ink API Key. If provided, the link will be created under your account.
   */
  apiKey?: string;
  /**
   * A custom short code for the URL (e.g., 'mybrand'). Requires an apiKey.
   */
  customCode?: string;
  /**
   * Optional custom base URL.
   */
  baseUrl?: string;
}

export interface ListLinksOptions {
  limit?: number;
  offset?: number;
}
