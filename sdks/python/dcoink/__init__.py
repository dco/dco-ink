"""
dcoink - The official Python SDK for dco.ink
"""

import httpx
from typing import Optional

from .models import Link, UserInfo
from .client import Client, BASE_URL
from .async_client import AsyncClient
from . import errors

def shorten(url: str, custom_code: Optional[str] = None, api_key: Optional[str] = None, base_url: str = BASE_URL) -> Link:
    """
    Intelligently shortens a URL.
    - If `api_key` is provided, calls POST /api/links (authenticated, allows custom codes).
    - If `api_key` is NOT provided, calls GET /api/s (fast anonymous mode).
    """
    if custom_code and not api_key:
        raise errors.ValidationError("custom_code requires an api_key to be provided.")
        
    if api_key:
        # Authenticated Mode
        with Client(api_key=api_key, base_url=base_url) as client:
            return client.create_link(url, custom_code=custom_code)
    else:
        # Fast Anonymous Mode
        response = httpx.get(f"{base_url}/api/s", params={"url": url})
        
        if not response.is_success:
            # Handle specific known errors from the plain-text endpoint
            if response.text.startswith("error: invalid_url"):
                raise errors.ValidationError("Please provide a valid URL.", status_code=response.status_code)
            raise errors.DcoApiError(f"Failed to create anonymous link: {response.text}", status_code=response.status_code)
            
        short_url = response.text.strip()
        short_code = short_url.split("/")[-1]
        
        return Link(
            short_code=short_code,
            short_url=short_url,
            target_url=url
        )

__all__ = [
    "Client",
    "AsyncClient",
    "Link",
    "UserInfo",
    "shorten",
    "errors",
]
