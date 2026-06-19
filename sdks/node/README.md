# dcoink - Node.js / TypeScript SDK

The official, zero-dependency Node.js/TypeScript SDK for [dco.ink](https://dco.ink) - the minimalist, privacy-first URL shortener.

## Features

- **Zero Dependencies**: Uses the native `fetch` API. Extremely lightweight (~10KB).
- **Universal**: Works perfectly in Node.js, Browsers, Cloudflare Workers, Vercel Edge, Deno, and Bun.
- **Fully Typed**: Written in TypeScript with full strict-mode compliance and excellent autocomplete.
- **Isomorphic Output**: Bundled to support both `require()` (CommonJS) and `import` (ESModules).

## Installation

```bash
npm install dcoink
# or
yarn add dcoink
# or
pnpm add dcoink
```

## Quick Start (Anonymous Mode)
You don't even need an account to start shortening URLs!

```typescript
import { shorten } from 'dcoink';

const link = await shorten('https://example.com/a-very-long-url-that-needs-shortening');

console.log(link.shortUrl);
// Output: https://dco.ink/xyz123
```

## Authenticated Mode
By passing your API Key, you can manage your links and access advanced features (like specifying custom short codes).

```typescript
import { shorten } from 'dcoink';

const link = await shorten('https://example.com/my-campaign', {
  customCode: 'mybrand',
  apiKey: 'dco_xxxxxx'
});

console.log(link.shortUrl);
// Output: https://dco.ink/mybrand
```

## Advanced Usage (Client API)

For robust applications, use the `Client` to manage your links, check history, and more.

```typescript
import { Client } from 'dcoink';

async function run() {
  const client = new Client({ apiKey: 'dco_xxxxxx' });

  // Get user info
  const me = await client.getMe();
  console.log(`Logged in as ${me.name}`);
  
  // Create a link
  const link = await client.createLink('https://github.com', 'git');
  
  // List history
  const history = await client.listLinks({ limit: 10 });
  for (const item of history) {
    console.log(item.shortUrl, item.clicks);
  }
      
  // Update and delete
  await client.updateLink('git', 'https://github.com/new-target');
  await client.deleteLink('git');
}
```

## Error Handling

The SDK provides strongly-typed error classes so you can handle issues gracefully.

```typescript
import { shorten, CodeTakenError, ValidationError, AuthenticationError } from 'dcoink';

try {
  await shorten('https://example.com', { customCode: 'taken_code', apiKey: 'dco_xx' });
} catch (error) {
  if (error instanceof CodeTakenError) {
    console.error('This custom code is already in use!');
  } else if (error instanceof ValidationError) {
    console.error('Invalid URL or custom code format.');
  } else if (error instanceof AuthenticationError) {
    console.error('Invalid API Key.');
  } else {
    console.error('An unexpected error occurred:', error.message);
  }
}
```
