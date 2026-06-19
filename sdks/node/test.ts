import { shorten, Client } from './src';

// User provided testing token
const TEST_TOKEN = process.env.DCO_API_KEY || "your_api_key_here";

async function main() {
  try {
    console.log("--- 1. Testing Anonymous ---");
    const anonLink = await shorten("https://google.com");
    console.log(`✅ Anonymous link generated: ${anonLink.shortUrl} (Code: ${anonLink.shortCode})`);

    console.log("\n--- 2. Testing Client (Authenticated) ---");
    const client = new Client({ apiKey: TEST_TOKEN });
    
    // Get Me
    const me = await client.getMe();
    console.log(`✅ User Info: ${me.name} (${me.email}) - Subscribed: ${me.isSubscribed}`);
    
    // Create Link
    const authLink = await client.createLink("https://github.com/dcoink");
    console.log(`✅ Authenticated link generated: ${authLink.shortUrl}`);

    // List Links
    const links = await client.listLinks({ limit: 5 });
    console.log(`✅ Found ${links.length} links in history.`);
    
    console.log("\n🎉 All SDK tests passed!");
  } catch (error: any) {
    console.error("❌ Test failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
