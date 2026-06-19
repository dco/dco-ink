import asyncio
import os
import dcoink

# User provided testing token
TEST_TOKEN = os.getenv("DCO_API_KEY", "your_api_key_here")

def test_sync():
    print("--- 1. Testing Sync Anonymous ---")
    link = dcoink.shorten("https://google.com")
    print(f"✅ Anonymous link generated: {link.short_url} (Code: {link.short_code})")

    print("\n--- 2. Testing Sync Client (Authenticated) ---")
    with dcoink.Client(api_key=TEST_TOKEN) as client:
        # Get Me
        me = client.get_me()
        print(f"✅ User Info: {me.name} ({me.email}) - Subscribed: {me.is_subscribed}")
        
        # Create link
        link2 = client.create_link("https://github.com/dcoink")
        print(f"✅ Authenticated link generated: {link2.short_url}")
        
        # List links
        links = client.list_links(limit=5)
        print(f"✅ Found {len(links)} links in history.")

async def test_async():
    print("\n--- 3. Testing Async Client (Authenticated) ---")
    async with dcoink.AsyncClient(api_key=TEST_TOKEN) as client:
        me = await client.get_me()
        print(f"✅ Async User Info: {me.name} ({me.email})")

if __name__ == "__main__":
    test_sync()
    asyncio.run(test_async())
    print("\n🎉 All SDK tests passed!")
