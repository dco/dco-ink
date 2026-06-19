from dataclasses import dataclass
from typing import Optional, List

@dataclass
class Link:
    """Represents a shortened link."""
    short_code: str
    short_url: str
    target_url: Optional[str] = None
    id: Optional[str] = None
    clicks: int = 0
    created_at: Optional[str] = None
    expires_at: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Link':
        valid_keys = {k for k in cls.__annotations__}
        filtered = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered)

@dataclass
class UserInfo:
    """Represents the authenticated user's details."""
    id: str
    email: str
    name: str
    is_subscribed: int
    api_token: str
    avatar_url: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: dict) -> 'UserInfo':
        valid_keys = {k for k in cls.__annotations__}
        filtered = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered)
