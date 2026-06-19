# dcoink - Official Python SDK for dco.ink

The official, beautifully typed Python SDK for [dco.ink](https://dco.ink) - the minimalist, privacy-first URL shortener.

## Installation

```bash
pip install dcoink
```

## Quick Start (Anonymous Mode)
You don't even need an account to start shortening URLs! The SDK provides a blazing-fast anonymous mode.

```python
import dcoink

link = dcoink.shorten("https://example.com/a-very-long-url-that-needs-shortening")

print(f"Short URL: {link.short_url}")
# Output: https://dco.ink/xyz123
```

## Authenticated Mode
By passing your API Key, you can manage your links and access advanced features (like specifying custom short codes).

```python
import dcoink

link = dcoink.shorten(
    "https://example.com/my-campaign",
    custom_code="mybrand",
    api_key="dco_xxxxxx"
)

print(link.short_url)
# Output: https://dco.ink/mybrand
```

## Advanced Usage (Client API)

For robust applications, use the `Client` to manage your links, check history, and more.

```python
from dcoink import Client

with Client(api_key="dco_xxxxxx") as client:
    # Get user info
    me = client.get_me()
    print(f"Logged in as {me.name}")
    
    # Create a link
    link = client.create_link("https://github.com", custom_code="git")
    
    # List history
    links = client.list_links(limit=10)
    for l in links:
        print(l.short_url, l.clicks)
        
    # Update and delete
    client.update_link("git", "https://github.com/new-target")
    client.delete_link("git")
```

## Async Support

Building high-concurrency scrapers or bots? We've got you covered with `AsyncClient` powered by `httpx`.

```python
import asyncio
from dcoink import AsyncClient

async def main():
    async with AsyncClient(api_key="dco_xxxxxx") as client:
        link = await client.create_link("https://example.com")
        print(link.short_url)

asyncio.run(main())
```

## Built-in CLI Tool
When you install the SDK, you also get a neat terminal command!

```bash
# Quick shorten
dcoink shorten https://example.com

# Custom short code
dcoink shorten https://example.com -c mybrand -k dco_xxxxxx
```
