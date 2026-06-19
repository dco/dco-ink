# dco-ink-tools

> Official Ecosystem Tools and SDKs for the [dco.ink](https://dco.ink) URL Shortener.

This repository is a monorepo containing the official SDKs, Command Line Interfaces (CLI), and Browser Extensions for interacting seamlessly with the `dco.ink` URL shortener API. All tools are designed with an obsession for performance, minimalism, and zero-bloat architecture.

---

## 📦 Ecosystem Packages

| Package | Type | Path | Description |
|---|---|---|---|
| **dcoink (Node)** | Node.js / TS SDK | [`sdks/node`](./sdks/node) | Zero-dependency TypeScript SDK using native `fetch`. Supports ESM/CJS and edge runtimes. |
| **dcoink (Python)** | Python SDK & CLI | [`sdks/python`](./sdks/python) | Sync & Async Python SDK powered by `httpx`, plus a built-in terminal CLI. |
| **dco.ink Extension** | Browser Extension | [`extensions/edge`](./extensions/edge) | Ultra-lightweight Chrome/Edge extension. Built with Vanilla TS & MV3 (No React/Vue bloat). |

---

## 🚀 Quick Start

### 1. Node.js / TypeScript SDK

Install via npm/pnpm/yarn:

```bash
npm install dcoink
```

**Usage:**

```typescript
import { shorten, Client } from 'dcoink';

// 1. Anonymous Usage
const link = await shorten('https://github.com/dco');
console.log(link.shortUrl); // https://dco.ink/xxxx

// 2. Authenticated Usage (for custom codes and link management)
const client = new Client({ apiKey: 'your_api_key_here' });
const customLink = await client.shorten('https://github.com/dco', { customCode: 'my-github' });
console.log(customLink.shortUrl); // https://dco.ink/my-github
```

### 2. Python SDK & CLI

Install via pip:

```bash
pip install dcoink
```

**SDK Usage:**

```python
from dcoink import shorten, Client

# Anonymous
link = shorten("https://github.com/dco")
print(link.short_url)

# Authenticated
client = Client(api_key="your_api_key_here")
custom_link = client.shorten("https://github.com/dco", custom_code="my-github")
print(custom_link.short_url)
```

**CLI Usage:**

```bash
# Generate a short link instantly from your terminal
dcoink shorten https://github.com/dco
```

### 3. Browser Extension

The browser extension allows you to generate short links with a single click while browsing any web page. 

1. Navigate to `extensions/edge/dist`.
2. Open `chrome://extensions/` or `edge://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist` directory.
5. Click the extension icon to shorten your current tab's URL!

---

## 🔒 Authentication

By default, the `shorten` function works anonymously. 

To use advanced features such as **Custom Short Codes**, **Link Deletion**, and **History Management**, you must provide an API Key. 

* **Node.js/Python**: Initialize the `Client` with your `apiKey`.
* **Browser Extension**: Click your profile name in the extension header to enter and save your API Key securely in local storage.

---

## 🛠️ Development

This project is structured as a monorepo.

```bash
# Clone the repository
git clone https://github.com/dco/dco-ink-tools.git
cd dco-ink-tools

# Extension Development
cd extensions/edge
npm install
npm run dev

# Node SDK Development
cd sdks/node
npm install
npm run build
```

---

## 📄 License

MIT License © [dco](https://github.com/dco)
