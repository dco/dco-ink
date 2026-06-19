export class DcoApiError extends Error {
  public code?: string;
  public statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'DcoApiError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends DcoApiError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends DcoApiError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = 'ValidationError';
  }
}

export class CodeTakenError extends DcoApiError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = 'CodeTakenError';
  }
}

export class ForbiddenError extends DcoApiError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends DcoApiError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = 'RateLimitError';
  }
}
