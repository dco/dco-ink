from typing import Optional

class DcoApiError(Exception):
    """Base class for all API errors."""
    def __init__(self, message: str, code: Optional[str] = None, status_code: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code

class AuthenticationError(DcoApiError):
    """Raised when the API key is missing or invalid."""
    pass

class ValidationError(DcoApiError):
    """Raised when the provided URL or custom code is invalid."""
    pass

class CodeTakenError(DcoApiError):
    """Raised when the requested custom code is already in use."""
    pass

class ForbiddenError(DcoApiError):
    """Raised when the user attempts an action they do not have permission for."""
    pass

class RateLimitError(DcoApiError):
    """Raised when the API rate limit is exceeded."""
    pass
