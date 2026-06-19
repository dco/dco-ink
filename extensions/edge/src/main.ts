import './style.css';
import { shorten, Client, DcoApiError } from 'dcoink';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header>
    <div id="logo-link" class="title" style="display:flex; align-items:center; gap:8px; cursor:pointer;" title="Visit dco.ink">
      <img src="/icon-48.png" width="20" height="20" alt="logo" style="border-radius:4px;" id="logo-img" />
      dco.ink
    </div>
    <div class="user-info" id="user-display" style="cursor:pointer;" title="Click to set API Key">Loading...</div>
  </header>

  <div id="settings-content" class="hidden glass-panel" style="margin-bottom:16px;">
    <div class="input-group" style="margin-bottom:8px;">
      <input type="password" id="api-key" placeholder="Enter dco.ink API Key" style="padding:6px; font-size:0.75rem;" />
    </div>
    <button id="save-key-btn" class="btn-primary" style="padding:6px; font-size:0.75rem;">Save & Reload</button>
    <div id="settings-feedback" class="feedback"></div>
  </div>

  <main class="glass-panel" id="main-panel">
    <div class="input-group" style="margin-bottom: 4px;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="text" id="target-url" placeholder="Fetching current URL..." style="padding:8px; font-size:0.875rem; flex:1;" />
        <button id="toggle-custom" class="btn-icon" style="padding:6px; font-size:1.1rem; cursor:pointer;" title="Custom Code">⚙️</button>
      </div>
    </div>
    
    <div class="input-group hidden" id="custom-code-container" style="margin-bottom: 12px; margin-top: 8px;">
      <input type="text" id="custom-code" placeholder="Enter custom code (e.g., mybrand)" style="padding:8px; font-size:0.875rem;" />
    </div>

    <button id="shorten-btn" class="btn-primary" style="padding:8px; font-size:0.875rem;">⚡ Shorten</button>
    <div id="status-feedback" class="feedback"></div>
  </main>

  <section class="glass-panel hidden" id="history-panel">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="font-size:0.875rem; color:var(--text-secondary);">Recent Links</h3>
    </div>
    <div class="link-list" id="link-list">
      <!-- Links injected via JS -->
    </div>
  </section>
`;

let currentClient: Client | null = null;
let currentApiKey: string | null = null;

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Copy failed', e);
    return false;
  }
}

function showFeedback(elementId: string, message: string, isError = false) {
  const el = document.getElementById(elementId)!;
  el.textContent = message;
  el.className = `feedback ${isError ? 'error' : 'success'}`;
  setTimeout(() => { el.textContent = ''; }, 3000);
}

async function renderHistory() {
  if (!currentClient) return;
  const historyPanel = document.getElementById('history-panel')!;
  const linkList = document.getElementById('link-list')!;
  
  try {
    const links = await currentClient.listLinks({ limit: 10 });
    historyPanel.classList.remove('hidden');
    linkList.innerHTML = '';
    
    if (links.length === 0) {
      linkList.innerHTML = '<div style="text-align:center;font-size:0.75rem;color:var(--text-secondary)">No recent links</div>';
      return;
    }

    for (const link of links) {
      const item = document.createElement('div');
      item.className = 'link-item';
      
      const info = document.createElement('div');
      info.className = 'link-info';
      
      const shortTitle = document.createElement('div');
      shortTitle.className = 'link-short';
      shortTitle.textContent = link.shortCode;
      shortTitle.title = "Click to copy";
      shortTitle.onclick = async () => {
        if (await copyToClipboard(link.shortUrl)) {
          shortTitle.textContent = "✅ Copied";
          setTimeout(() => { shortTitle.textContent = link.shortCode; }, 1000);
        }
      };
      
      const targetSub = document.createElement('div');
      targetSub.className = 'link-target';
      targetSub.textContent = link.targetUrl || '';
      targetSub.title = link.targetUrl || '';
      
      info.appendChild(shortTitle);
      info.appendChild(targetSub);
      
      const actions = document.createElement('div');
      actions.className = 'link-actions';
      
      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'btn-icon';
      editBtn.innerHTML = '✏️';
      editBtn.title = "Edit target URL";
      editBtn.onclick = async () => {
        const newUrl = prompt(`Enter new target URL for /${link.shortCode}:`, link.targetUrl);
        if (newUrl && newUrl !== link.targetUrl) {
          try {
            await currentClient!.updateLink(link.shortCode, newUrl);
            await renderHistory();
          } catch (e: any) {
            alert('Update failed: ' + e.message);
          }
        }
      };
      
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-icon';
      delBtn.innerHTML = '🗑️';
      delBtn.title = "Delete short link";
      delBtn.onclick = async () => {
        if (confirm(`Are you sure you want to delete /${link.shortCode}?`)) {
          try {
            await currentClient!.deleteLink(link.shortCode);
            await renderHistory();
          } catch (e: any) {
            alert('Delete failed: ' + e.message);
          }
        }
      };
      
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      
      item.appendChild(info);
      item.appendChild(actions);
      linkList.appendChild(item);
    }
  } catch (e) {
    console.error('Failed to load history', e);
  }
}

async function init() {
  const urlInput = document.getElementById('target-url') as HTMLInputElement;
  const customCodeInput = document.getElementById('custom-code') as HTMLInputElement;
  const userDisplay = document.getElementById('user-display') as HTMLDivElement;
  
  // Get active tab URL
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.url) {
      urlInput.value = tabs[0].url;
    }
  } catch (e) {
    urlInput.value = "";
  }

  // Load API Key
  const data = await chrome.storage.local.get(['dcoApiKey']);
  currentApiKey = data.dcoApiKey;

  if (currentApiKey) {
    (document.getElementById('api-key') as HTMLInputElement).value = currentApiKey;
    currentClient = new Client({ apiKey: currentApiKey });
    try {
      const me = await currentClient.getMe();
      userDisplay.textContent = `Hi, ${me.name}`;
      await renderHistory();
    } catch (e) {
      userDisplay.textContent = "Invalid Token";
    }
  } else {
    userDisplay.textContent = "Login";
    customCodeInput.disabled = true;
    customCodeInput.placeholder = "API Key required for custom codes";
  }

  // Logo Link
  document.getElementById('logo-link')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://dco.ink' });
  });

  // Toggle Custom Code via Gear Icon
  document.getElementById('toggle-custom')?.addEventListener('click', () => {
    const container = document.getElementById('custom-code-container');
    container?.classList.toggle('hidden');
  });

  // Settings toggle via header user-display
  document.getElementById('user-display')?.addEventListener('click', () => {
    document.getElementById('settings-content')?.classList.toggle('hidden');
  });

  document.getElementById('save-key-btn')?.addEventListener('click', async () => {
    const key = (document.getElementById('api-key') as HTMLInputElement).value.trim();
    if (!key) {
      await chrome.storage.local.remove('dcoApiKey');
    } else {
      await chrome.storage.local.set({ dcoApiKey: key });
    }
    showFeedback('settings-feedback', 'Saved!');
    setTimeout(() => location.reload(), 800);
  });

  // Shorten action
  document.getElementById('shorten-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('shorten-btn') as HTMLButtonElement;
    const targetUrl = urlInput.value.trim();
    const customCode = customCodeInput.value.trim() || undefined;

    if (!targetUrl) {
      showFeedback('status-feedback', 'Please enter a URL', true);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Shortening...';

    try {
      const link = await shorten(targetUrl, { 
        apiKey: currentApiKey || undefined, 
        customCode 
      });

      const copied = await copyToClipboard(link.shortUrl);
      if (copied) {
        showFeedback('status-feedback', `✅ Copied! ${link.shortUrl}`);
      } else {
        showFeedback('status-feedback', `✅ Success: ${link.shortUrl}`);
      }
      
      // Auto refresh history if authed
      if (currentClient) {
        await renderHistory();
      }
      
      customCodeInput.value = '';
    } catch (error: any) {
      if (error instanceof DcoApiError) {
        showFeedback('status-feedback', `❌ ${error.message}`, true);
      } else {
        showFeedback('status-feedback', `❌ Unknown error`, true);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ Shorten';
    }
  });
}

init();
