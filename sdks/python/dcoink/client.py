import httpx
from typing import List, Optional, Dict, Any
from .models import Link, UserInfo
from .errors import (
    DcoApiError,
    AuthenticationError,
    ValidationError,
    CodeTakenError,
    ForbiddenError,
    RateLimitError
)

BASE_URL = "https://api.dco.ink"

class Client:
    """Synchronous client for the dco.ink API."""
    
    def __init__(self, api_key: str, base_url: str = BASE_URL, timeout: float = 10.0):
        self.api_key = api_key
        self.base_url = base_url
        self._client = httpx.Client(
            base_url=self.base_url,
            headers={
                "X-API-Key": self.api_key,
                "Content-Type": "application/json",
                "User-Agent": "dcoink-python-sdk/0.1.0"
            },
            timeout=timeout
        )

    def _handle_error(self, response: httpx.Response):
        try:
            data = response.json()
            error_code = data.get("error", "unknown_error")
            message = data.get("message", response.text)
        except Exception:
            error_code = "unknown_error"
            message = response.text

        status = response.status_code
        if status == 401:
            raise AuthenticationError(message, error_code, status)
        elif status == 403:
            raise ForbiddenError(message, error_code, status)
        elif status == 409:
            raise CodeTakenError(message, error_code, status)
        elif status == 429:
            raise RateLimitError("Rate limit exceeded", error_code, status)
        elif status == 400:
            raise ValidationError(message, error_code, status)
        else:
            raise DcoApiError(message, error_code, status)

    def _request(self, method: str, path: str, **kwargs) -> Any:
        response = self._client.request(method, path, **kwargs)
        if not response.is_success:
            self._handle_error(response)
        
        # 204 No Content handling
        if response.status_code == 204 or not response.content:
            return None
            
        return response.json()

    def get_me(self) -> UserInfo:
        """Get the current authenticated user's details."""
        data = self._request("GET", "/api/auth/me")
        return UserInfo.from_dict(data)

    def create_link(self, url: str, custom_code: Optional[str] = None) -> Link:
        """Create a new shortened link."""
        payload = {"url": url}
        if custom_code:
            payload["custom_code"] = custom_code
            
        data = self._request("POST", "/api/links", json=payload)
        return Link(
            short_code=data["short_code"],
            short_url=data["short_url"],
            target_url=data.get("target_url", url),
            expires_at=data.get("expires_at")
        )

    def list_links(self, limit: int = 50, offset: int = 0) -> List[Link]:
        """List all links created by the current user."""
        data = self._request("GET", "/api/links", params={"limit": limit, "offset": offset})
        links = []
        for item in data.get("links", []):
            links.append(Link(
                short_code=item["short_code"],
                short_url=f"https://dco.ink/{item['short_code']}",
                target_url=item.get("target_url"),
                created_at=item.get("created_at"),
                expires_at=item.get("expires_at")
            ))
        return links

    def update_link(self, short_code: str, new_url: str) -> None:
        """Update the target URL of an existing link."""
        self._request("PUT", f"/api/links/{short_code}", json={"url": new_url})

    def delete_link(self, short_code: str) -> None:
        """Delete an existing link."""
        self._request("DELETE", f"/api/links/{short_code}")

    def close(self):
        """Close the underlying HTTP client."""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
