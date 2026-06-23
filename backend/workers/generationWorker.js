const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const ProjectService = require('../services/projectService');
const SecurityValidator = require('../utils/securityValidator');
const CacheManager = require('../utils/cacheManager');
const ValidationService = require('../services/validationService');
const IntelligenceService = require('../services/intelligenceService');
const AIService = require('../services/aiService');
const { generatePng } = require('../utils/pngGenerator');
const SecurityLog = require('../models/SecurityLog');

const MAX_CONCURRENT_JOBS = 50;

function buildExtensionFiles(prompt) {
  const p = prompt.toLowerCase();

  // Helper to check for intent while avoiding simple negations
  const hasIntent = (keywords) => {
    const match = keywords.some(k => p.includes(k));
    const isNegated = p.includes('not ') || p.includes('no ') || p.includes('without ') || p.includes('except ');
    return match && !isNegated;
  };

  const isDarkMode   = hasIntent(['dark', 'night']);
  const isAdBlock    = hasIntent(['ad block', 'adblock', 'remove ad']);
  const isTabManager = hasIntent(['tab manag', 'save tab', 'close tab', 'group tab']);
  const isTimer      = hasIntent(['timer', 'pomodoro', 'focus', 'break']);
  const isHighlight  = hasIntent(['highlight', 'mark']);
  const isNotes      = hasIntent(['note', 'sticky', 'memo']);
  const isRedSquare  = (hasIntent(['block']) && p.includes('image')) || (p.includes('red') && p.includes('square'));

  const nameParts = prompt.split(' ').slice(0, 4).join(' ') || 'Custom Extension';
  const extName   = (nameParts.charAt(0).toUpperCase() + nameParts.slice(1)).trim() || 'Extensio Project';
  const shortDesc = prompt.length > 80 ? prompt.slice(0, 77) + '...' : prompt;

  // ─── Shared background.js that initializes state ─────────────────────────
  const backgroundJs = `// Background service worker — Extensio.ai
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isActive', (data) => {
    if (typeof data.isActive === 'undefined') {
      chrome.storage.local.set({ isActive: false });
    }
  });
});`;

  // ─── Shared popup CSS factory ─────────────────────────────────────────────
  const sharedCss = (accent) => `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 300px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0b0b0f; color: #e2e8f0; padding: 20px;
}
.header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.header-icon { font-size: 22px; }
.header-title { font-size: 15px; font-weight: 700; color: #fff; }
.header-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  background: #161620; border-radius: 12px; padding: 14px 16px;
  border: 1px solid rgba(255,255,255,0.06);
}
.toggle-label { font-size: 13px; font-weight: 500; color: #cbd5e1; }
.toggle-switch { position: relative; width: 48px; height: 26px; cursor: pointer; }
.toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
.slider {
  position: absolute; inset: 0;
  background: #2d2d3a; border-radius: 26px; transition: background 0.25s;
}
.slider:before {
  content: ''; position: absolute;
  width: 20px; height: 20px; left: 3px; bottom: 3px;
  background: #fff; border-radius: 50%; transition: transform 0.25s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}
input:checked + .slider { background: ${accent}; }
input:checked + .slider:before { transform: translateX(22px); }
.status {
  margin-top: 12px; font-size: 11px; text-align: center;
  min-height: 18px; transition: color 0.2s; color: #4b5563;
}
.status.active { color: #4ade80; }
.status.inactive { color: #6b7280; }
.divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 14px 0; }
.info { font-size: 11px; color: #4b5563; text-align: center; line-height: 1.5; }
`;

  let popupHtml = '', popupJs = '', popupCss = '', contentJs = '';
  let extraFiles = [];
  let permissions = ['activeTab', 'scripting', 'storage'];
  let host_permissions = ['<all_urls>'];
  let content_scripts = [{ matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_end' }];
  let manifestExtras = {};
  let iconColor = { r: 99, g: 102, b: 241 };

  // ─── DARK MODE ────────────────────────────────────────────────────────────
  if (isDarkMode) {
    iconColor = { r: 139, g: 92, b: 246 };
    popupCss = sharedCss('#7c3aed');
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<div class="header"><span class="header-icon">🌙</span><div><div class="header-title">Dark Mode</div><div class="header-sub">Applies to current &amp; future pages</div></div></div>
<div class="toggle-row"><span class="toggle-label">Enable Dark Mode</span>
<label class="toggle-switch"><input type="checkbox" id="toggle"><span class="slider"></span></label></div>
<div class="status inactive" id="status">Dark mode is inactive</div>
<script src="popup.js"></script></body></html>`;

    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyDark() {
  if (document.getElementById('__ext_dark__')) return;
  const el = document.createElement('style'); el.id = '__ext_dark__';
  el.textContent = 'html{filter:invert(1) hue-rotate(180deg)!important}img,video,canvas,picture{filter:invert(1) hue-rotate(180deg)!important}';
  document.documentElement.appendChild(el);
}
function removeDark() { const s = document.getElementById('__ext_dark__'); if (s) s.remove(); }
chrome.storage.local.get('isActive', ({ isActive }) => {
  toggle.checked = !!isActive;
  status.textContent = isActive ? '✓ Dark mode is active' : 'Dark mode is inactive';
  status.className = 'status ' + (isActive ? 'active' : 'inactive');
});
toggle.addEventListener('change', () => {
  const on = toggle.checked;
  chrome.storage.local.set({ isActive: on });
  status.textContent = on ? '✓ Dark mode is active' : 'Dark mode is inactive';
  status.className = 'status ' + (on ? 'active' : 'inactive');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: on ? applyDark : removeDark });
  });
});`;

    contentJs = `(function() {
  chrome.storage.local.get('isActive', ({ isActive }) => { if (isActive) applyDark(); });
  chrome.storage.onChanged.addListener((changes) => {
    if ('isActive' in changes) { changes.isActive.newValue ? applyDark() : removeDark(); }
  });
  function applyDark() {
    if (document.getElementById('__ext_dark__')) return;
    const el = document.createElement('style'); el.id = '__ext_dark__';
    el.textContent = 'html{filter:invert(1) hue-rotate(180deg)!important}img,video,canvas,picture{filter:invert(1) hue-rotate(180deg)!important}';
    document.documentElement.appendChild(el);
  }
  function removeDark() { const s = document.getElementById('__ext_dark__'); if (s) s.remove(); }
})();`;

  // ─── AD BLOCK ──────────────────────────────────────────────────────────────
  } else if (isAdBlock) {
    iconColor = { r: 244, g: 114, b: 182 };
    permissions = ['activeTab', 'scripting', 'storage', 'declarativeNetRequest'];
    manifestExtras = {
      declarative_net_request: {
        rule_resources: [{ id: 'block_ads', enabled: true, path: 'rules.json' }]
      }
    };
    const rules = JSON.stringify([
      { id: 1, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'doubleclick.net', resourceTypes: ['script', 'image', 'xmlhttprequest'] } },
      { id: 2, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'googlesyndication.com', resourceTypes: ['script', 'image'] } },
      { id: 3, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'adservice.google.com', resourceTypes: ['script', 'xmlhttprequest'] } },
      { id: 4, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'pagead2.googlesyndication.com', resourceTypes: ['script', 'image'] } }
    ], null, 2);
    extraFiles.push({ path: 'rules.json', content: rules });
    popupCss = sharedCss('#f472b6');
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<div class="header"><span class="header-icon">🛡️</span><div><div class="header-title">Ad Blocker</div><div class="header-sub">Blocks ads &amp; trackers</div></div></div>
<div class="toggle-row"><span class="toggle-label">Enable Ad Blocking</span>
<label class="toggle-switch"><input type="checkbox" id="toggle"><span class="slider"></span></label></div>
<div class="status inactive" id="status">Ad blocker is inactive</div>
<script src="popup.js"></script></body></html>`;

    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function removeAds() {
  const selectors = ['[class*="ad-"]','[id*="google_ad"]','ins.adsbygoogle','[class*="banner-ad"]','iframe[src*="doubleclick"]','[class*="sponsored"]','[class*="advertisement"]'];
  selectors.forEach(s => { try { document.querySelectorAll(s).forEach(el => el.remove()); } catch(e){} });
}
function restorePage() { window.location.reload(); }
chrome.storage.local.get('isActive', ({ isActive }) => {
  toggle.checked = !!isActive;
  status.textContent = isActive ? '✓ Blocking ads on this page' : 'Ad blocker is inactive';
  status.className = 'status ' + (isActive ? 'active' : 'inactive');
});
toggle.addEventListener('change', () => {
  const on = toggle.checked;
  chrome.storage.local.set({ isActive: on });
  status.textContent = on ? '✓ Blocking ads on this page' : 'Ad blocker is inactive';
  status.className = 'status ' + (on ? 'active' : 'inactive');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: on ? removeAds : restorePage });
  });
});`;

    contentJs = `(function() {
  chrome.storage.local.get('isActive', ({ isActive }) => { if (isActive) removeAds(); });
  chrome.storage.onChanged.addListener((changes) => {
    if ('isActive' in changes && changes.isActive.newValue) removeAds();
  });
  function removeAds() {
    const selectors = ['[class*="ad-"]','[id*="google_ad"]','ins.adsbygoogle','[class*="banner-ad"]','iframe[src*="doubleclick"]','[class*="sponsored"]','[class*="advertisement"]'];
    selectors.forEach(s => { try { document.querySelectorAll(s).forEach(el => el.remove()); } catch(e){} });
    const obs = new MutationObserver(() => {
      selectors.forEach(s => { try { document.querySelectorAll(s).forEach(el => el.remove()); } catch(e){} });
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  }
})();`;

  // ─── RED SQUARE IMAGE BLOCKER ─────────────────────────────────────────────
  } else if (isRedSquare) {
    iconColor = { r: 244, g: 63, b: 94 };
    popupCss = sharedCss('#f43f5e');
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<div class="header"><span class="header-icon">🟥</span><div><div class="header-title">Image Blocker</div><div class="header-sub">Replaces images with red squares</div></div></div>
<div class="toggle-row"><span class="toggle-label">Block Images</span>
<label class="toggle-switch"><input type="checkbox" id="toggle"><span class="slider"></span></label></div>
<div class="status inactive" id="status">Image blocking is inactive</div>
<script src="popup.js"></script></body></html>`;

    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function blockImages() {
  document.querySelectorAll('img:not([data-ext-blocked])').forEach(img => {
    const w = img.naturalWidth || img.width || 100;
    const h = img.naturalHeight || img.height || 100;
    const div = document.createElement('div');
    div.dataset.extBlocker = 'true';
    div.style.cssText = 'display:inline-block;background:#f43f5e;width:'+w+'px;height:'+h+'px;vertical-align:middle;';
    img.parentNode.insertBefore(div, img);
    img.style.display = 'none';
    img.dataset.extBlocked = 'true';
  });
}
function restoreImages() {
  document.querySelectorAll('[data-ext-blocker]').forEach(d => d.remove());
  document.querySelectorAll('img[data-ext-blocked]').forEach(img => {
    img.style.display = ''; delete img.dataset.extBlocked;
  });
}
chrome.storage.local.get('isActive', ({ isActive }) => {
  toggle.checked = !!isActive;
  status.textContent = isActive ? '✓ Images are blocked with red squares' : 'Image blocking is inactive';
  status.className = 'status ' + (isActive ? 'active' : 'inactive');
});
toggle.addEventListener('change', () => {
  const on = toggle.checked;
  chrome.storage.local.set({ isActive: on });
  status.textContent = on ? '✓ Images are blocked with red squares' : 'Image blocking is inactive';
  status.className = 'status ' + (on ? 'active' : 'inactive');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: on ? blockImages : restoreImages });
  });
});`;

    contentJs = `(function() {
  chrome.storage.local.get('isActive', ({ isActive }) => { if (isActive) blockImages(); });
  chrome.storage.onChanged.addListener((changes) => {
    if ('isActive' in changes) { changes.isActive.newValue ? blockImages() : restoreImages(); }
  });
  function blockImages() {
    document.querySelectorAll('img:not([data-ext-blocked])').forEach(img => {
      const w = img.naturalWidth || img.width || 100;
      const h = img.naturalHeight || img.height || 100;
      const div = document.createElement('div');
      div.dataset.extBlocker = 'true';
      div.style.cssText = 'display:inline-block;background:#f43f5e;width:'+w+'px;height:'+h+'px;vertical-align:middle;';
      img.parentNode.insertBefore(div, img); img.style.display = 'none'; img.dataset.extBlocked = 'true';
    });
    const obs = new MutationObserver(() => blockImages());
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
  function restoreImages() {
    document.querySelectorAll('[data-ext-blocker]').forEach(d => d.remove());
    document.querySelectorAll('img[data-ext-blocked]').forEach(img => {
      img.style.display = ''; delete img.dataset.extBlocked;
    });
  }
})();`;

  // ─── POMODORO TIMER ───────────────────────────────────────────────────────
  } else if (isTimer) {
    iconColor = { r: 245, g: 158, b: 11 };
    host_permissions = []; content_scripts = [];
    popupCss = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0c0a09; color: #fef3c7; padding: 22px; }
h2 { font-size: 15px; color: #f59e0b; margin-bottom: 14px; text-align: center; }
.modes { display: flex; gap: 6px; justify-content: center; margin-bottom: 16px; }
.mode-btn { padding: 5px 12px; border-radius: 20px; border: 1px solid #44403c; background: transparent; color: #a8a29e; font-size: 11px; cursor: pointer; transition: all 0.2s; }
.mode-btn.active { background: #f59e0b; color: #000; border-color: #f59e0b; }
.display { font-size: 52px; font-weight: 700; letter-spacing: 2px; text-align: center; margin: 8px 0 20px; font-variant-numeric: tabular-nums; }
.buttons { display: flex; gap: 8px; }
button.main { flex: 2; padding: 11px; border: none; border-radius: 9px; font-weight: 700; cursor: pointer; font-size: 13px; background: #f59e0b; color: #000; }
button.reset-btn { flex: 1; padding: 11px; border: none; border-radius: 9px; background: #292524; color: #a8a29e; cursor: pointer; font-size: 13px; }`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>⏱ Focus Timer</h2>
<div class="modes">
  <button class="mode-btn active" data-time="1500">Pomodoro</button>
  <button class="mode-btn" data-time="300">Short Break</button>
  <button class="mode-btn" data-time="900">Long Break</button>
</div>
<div class="display" id="display">25:00</div>
<div class="buttons">
  <button class="main" id="startBtn">▶ Start</button>
  <button class="reset-btn" id="resetBtn">↺ Reset</button>
</div>
<script src="popup.js"></script></body></html>`;
    popupJs = `let interval, running = false, total = 1500, left = 1500;
const disp = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const fmt = s => String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
disp.textContent = fmt(left);
document.querySelectorAll('.mode-btn').forEach(b => b.addEventListener('click', () => {
  clearInterval(interval); running = false; startBtn.textContent = '▶ Start';
  document.querySelectorAll('.mode-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); total = left = parseInt(b.dataset.time); disp.textContent = fmt(left);
}));
startBtn.addEventListener('click', () => {
  if (running) { clearInterval(interval); running = false; startBtn.textContent = '▶ Start'; }
  else { running = true; startBtn.textContent = '⏸ Pause';
    interval = setInterval(() => { if (left <= 0) { clearInterval(interval); running = false; return; } left--; disp.textContent = fmt(left); }, 1000); }
});
document.getElementById('resetBtn').addEventListener('click', () => {
  clearInterval(interval); running = false; left = total; disp.textContent = fmt(left); startBtn.textContent = '▶ Start';
});`;
    contentJs = '';

  // ─── TAB MANAGER ─────────────────────────────────────────────────────────
  } else if (isTabManager) {
    iconColor = { r: 96, g: 165, b: 250 };
    permissions = ['tabs', 'storage', 'activeTab']; host_permissions = []; content_scripts = [];
    popupCss = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 340px; max-height: 520px; overflow-y: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 16px; }
h2 { font-size: 14px; color: #60a5fa; margin-bottom: 10px; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; }
.actions button { flex: 1; padding: 7px; border: none; border-radius: 7px; font-size: 11px; font-weight: 600; cursor: pointer; background: #1e3a5f; color: #93c5fd; }
.tab-item { display: flex; align-items: center; gap: 8px; padding: 8px; background: #1e293b; border-radius: 8px; margin-bottom: 5px; cursor: pointer; }
.tab-item:hover { background: #334155; }
.tab-item img { width: 16px; height: 16px; flex-shrink: 0; }
.tab-title { flex: 1; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.close-btn { background: #ef4444; border: none; color: #fff; border-radius: 4px; padding: 2px 7px; font-size: 11px; cursor: pointer; flex-shrink: 0; }`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>📑 Tab Manager</h2>
<div class="actions">
  <button id="closeOther">Close Others</button>
  <button id="closeDupe">Remove Dupes</button>
</div>
<div id="tabList"></div>
<script src="popup.js"></script></body></html>`;
    popupJs = `function loadTabs() {
  const list = document.getElementById('tabList'); list.innerHTML = '';
  chrome.tabs.query({ currentWindow: true }, tabs => {
    tabs.forEach(t => {
      const div = document.createElement('div'); div.className = 'tab-item';
      const img = document.createElement('img'); img.src = t.favIconUrl || '';
      img.onerror = () => { img.style.display = 'none'; };
      const span = document.createElement('span'); span.className = 'tab-title'; span.textContent = t.title; span.title = t.url;
      const btn = document.createElement('button'); btn.className = 'close-btn'; btn.textContent = '\u2715';
      btn.addEventListener('click', e => { e.stopPropagation(); chrome.tabs.remove(t.id, () => div.remove()); });
      div.addEventListener('click', () => chrome.tabs.update(t.id, { active: true }));
      div.append(img, span, btn); list.appendChild(div);
    });
  });
}
loadTabs();
document.getElementById('closeOther').addEventListener('click', () => {
  chrome.tabs.query({ currentWindow: true, active: false }, tabs => {
    chrome.tabs.remove(tabs.map(t => t.id), loadTabs);
  });
});
document.getElementById('closeDupe').addEventListener('click', () => {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    const seen = new Set();
    tabs.forEach(t => { if (seen.has(t.url)) chrome.tabs.remove(t.id); else seen.add(t.url); });
    setTimeout(loadTabs, 300);
  });
});`;
    contentJs = '';

  // ─── NOTES ───────────────────────────────────────────────────────────────
  } else if (isNotes) {
    iconColor = { r: 167, g: 139, b: 250 };
    permissions = ['storage']; host_permissions = []; content_scripts = [];
    popupCss = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1c1917; color: #fafaf9; padding: 16px; }
h2 { font-size: 14px; color: #a78bfa; margin-bottom: 10px; }
textarea { width: 100%; height: 190px; background: #292524; border: 1px solid #44403c; border-radius: 8px; color: #fafaf9; padding: 10px; font-size: 13px; resize: none; display: block; }
textarea:focus { outline: none; border-color: #7c3aed; }
.row { display: flex; gap: 8px; margin-top: 8px; }
.row button { flex: 1; padding: 9px; border: none; border-radius: 7px; font-weight: 600; font-size: 12px; cursor: pointer; }
#saveBtn { background: #7c3aed; color: #fff; }
#clearBtn { background: #292524; color: #a8a29e; }
#statusEl { font-size: 11px; color: #4ade80; text-align: center; margin-top: 7px; min-height: 16px; }`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>\u{1F4DD} Quick Notes</h2>
<textarea id="note" placeholder="Write anything — saved automatically..."></textarea>
<div class="row"><button id="saveBtn">\u{1F4BE} Save</button><button id="clearBtn">\u{1F5D1} Clear</button></div>
<div id="statusEl"></div>
<script src="popup.js"></script></body></html>`;
    popupJs = `const note = document.getElementById('note'), statusEl = document.getElementById('statusEl');
chrome.storage.local.get('note', ({ note: n }) => { if (n) note.value = n; });
document.getElementById('saveBtn').addEventListener('click', () => {
  chrome.storage.local.set({ note: note.value }, () => {
    statusEl.textContent = '\u2713 Saved!'; setTimeout(() => statusEl.textContent = '', 2000);
  });
});
document.getElementById('clearBtn').addEventListener('click', () => {
  note.value = ''; chrome.storage.local.remove('note', () => {
    statusEl.textContent = 'Cleared'; setTimeout(() => statusEl.textContent = '', 2000);
  });
});
note.addEventListener('input', () => {
  clearTimeout(note._t);
  note._t = setTimeout(() => chrome.storage.local.set({ note: note.value }), 800);
});`;
    contentJs = '';

  // ─── LINK HIGHLIGHTER ─────────────────────────────────────────────────────
  } else if (isHighlight) {
    iconColor = { r: 251, g: 191, b: 36 };
    popupCss = sharedCss('#fbbf24');
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<div class="header"><span class="header-icon">\u2728</span><div><div class="header-title">Link Highlighter</div><div class="header-sub">Highlights all links in yellow</div></div></div>
<div class="toggle-row"><span class="toggle-label">Highlight Links</span>
<label class="toggle-switch"><input type="checkbox" id="toggle"><span class="slider"></span></label></div>
<div class="status inactive" id="status">Link highlighting is inactive</div>
<script src="popup.js"></script></body></html>`;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyHL() {
  if (document.getElementById('__ext_hl__')) return;
  const s = document.createElement('style'); s.id = '__ext_hl__';
  s.textContent = 'a{background:#fbbf24!important;color:#000!important;padding:1px 3px!important;border-radius:3px!important;}';
  document.head.appendChild(s);
}
function removeHL() { const s = document.getElementById('__ext_hl__'); if (s) s.remove(); }
chrome.storage.local.get('isActive', ({ isActive }) => {
  toggle.checked = !!isActive;
  status.textContent = isActive ? '\u2713 Links are highlighted' : 'Link highlighting is inactive';
  status.className = 'status ' + (isActive ? 'active' : 'inactive');
});
toggle.addEventListener('change', () => {
  const on = toggle.checked;
  chrome.storage.local.set({ isActive: on });
  status.textContent = on ? '\u2713 Links are highlighted' : 'Link highlighting is inactive';
  status.className = 'status ' + (on ? 'active' : 'inactive');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: on ? applyHL : removeHL });
  });
});`;
    contentJs = `(function() {
  chrome.storage.local.get('isActive', ({ isActive }) => { if (isActive) apply(); });
  chrome.storage.onChanged.addListener((changes) => {
    if ('isActive' in changes) { changes.isActive.newValue ? apply() : remove(); }
  });
  function apply() {
    if (document.getElementById('__ext_hl__')) return;
    const s = document.createElement('style'); s.id = '__ext_hl__';
    s.textContent = 'a{background:#fbbf24!important;color:#000!important;padding:1px 3px!important;border-radius:3px!important;}';
    document.head.appendChild(s);
  }
  function remove() { const s = document.getElementById('__ext_hl__'); if (s) s.remove(); }
})();`;

  // ─── GENERIC FALLBACK — real activate badge + scripting ──────────────────
  } else {
    popupCss = sharedCss('#6366f1');
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<div class="header"><span class="header-icon">\u26A1</span><div><div class="header-title">${extName}</div><div class="header-sub">${shortDesc.slice(0,55)}${shortDesc.length>55?'...':''}</div></div></div>
<div class="toggle-row"><span class="toggle-label">Activate Extension</span>
<label class="toggle-switch"><input type="checkbox" id="toggle"><span class="slider"></span></label></div>
<div class="status inactive" id="status">Inactive — toggle to activate</div>
<script src="popup.js"></script></body></html>`;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  if (document.getElementById('__ext_badge__')) return;
  const b = document.createElement('div'); b.id = '__ext_badge__';
  b.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#6366f1;color:#fff;padding:8px 14px;border-radius:999px;font-size:13px;font-weight:600;font-family:system-ui,sans-serif;box-shadow:0 4px 24px rgba(99,102,241,0.5);cursor:pointer;';
  b.textContent = '\u26A1 Extension Active';
  b.addEventListener('click', () => b.remove());
  document.body.appendChild(b);
}
function removeEffect() { const b = document.getElementById('__ext_badge__'); if (b) b.remove(); }
chrome.storage.local.get('isActive', ({ isActive }) => {
  toggle.checked = !!isActive;
  status.textContent = isActive ? '\u2713 Extension is active on this page' : 'Inactive — toggle to activate';
  status.className = 'status ' + (isActive ? 'active' : 'inactive');
});
toggle.addEventListener('change', () => {
  const on = toggle.checked;
  chrome.storage.local.set({ isActive: on });
  status.textContent = on ? '\u2713 Extension is active on this page' : 'Inactive — toggle to activate';
  status.className = 'status ' + (on ? 'active' : 'inactive');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: on ? applyEffect : removeEffect });
  });
});`;
    contentJs = `(function() {
  chrome.storage.local.get('isActive', ({ isActive }) => { if (isActive) applyEffect(); });
  chrome.storage.onChanged.addListener((changes) => {
    if ('isActive' in changes) { changes.isActive.newValue ? applyEffect() : removeEffect(); }
  });
  function applyEffect() {
    if (document.getElementById('__ext_badge__')) return;
    const b = document.createElement('div'); b.id = '__ext_badge__';
    b.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#6366f1;color:#fff;padding:8px 14px;border-radius:999px;font-size:13px;font-weight:600;font-family:system-ui,sans-serif;box-shadow:0 4px 24px rgba(99,102,241,0.5);cursor:pointer;';
    b.textContent = '\u26A1 Extension Active';
    b.addEventListener('click', () => b.remove());
    document.body.appendChild(b);
  }
  function removeEffect() { const b = document.getElementById('__ext_badge__'); if (b) b.remove(); }
})();`;
  }

  // ─── Assemble manifest ────────────────────────────────────────────────────
  const manifest = {
    manifest_version: 3,
    name: extName,
    version: '1.0.0',
    description: shortDesc,
    action: { default_popup: 'popup.html', default_title: extName },
    background: { service_worker: 'background.js' },
    icons: { '16': 'icons/icon16.png', '48': 'icons/icon48.png', '128': 'icons/icon128.png' },
    permissions,
    ...(host_permissions.length > 0 ? { host_permissions } : {}),
    ...(content_scripts.length > 0 ? { content_scripts } : {}),
    ...manifestExtras
  };

  // ─── Assemble file list ───────────────────────────────────────────────────
  const files = [
    { path: 'manifest.json', content: JSON.stringify(manifest, null, 2) },
    { path: 'popup.html',    content: popupHtml },
    { path: 'popup.css',     content: popupCss },
    { path: 'popup.js',      content: popupJs },
    { path: 'background.js', content: backgroundJs },
  ];

  if (contentJs) files.push({ path: 'content.js', content: contentJs });
  extraFiles.forEach(f => files.push(f));

  // Generate PNG icons with the correct accent color per template
  const { r, g, b } = iconColor;
  files.push({ path: 'icons/icon16.png',  content: generatePng(16,  16,  r, g, b) });
  files.push({ path: 'icons/icon48.png',  content: generatePng(48,  48,  r, g, b) });
  files.push({ path: 'icons/icon128.png', content: generatePng(128, 128, r, g, b) });

  return files;
}

class GenerationWorker {
  constructor() {
    this.activeJobs = new Map();
    // TTL cleanup loop (every 10 minutes, delete active jobs > 1 hour)
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [jobId, job] of this.activeJobs.entries()) {
        if (job.createdAt && (now - new Date(job.createdAt).getTime() > 3600000)) {
          this.activeJobs.delete(jobId);
        }
      }
    }, 600000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  async enqueueGeneration(userId, promptText) {
    if (this.activeJobs.size >= MAX_CONCURRENT_JOBS) {
      throw new Error('Server is currently at maximum generation capacity. Please try again in a few minutes.');
    }

    const jobId = uuidv4();
    this.activeJobs.set(jobId, {
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      userId,
      prompt: promptText
    });
    this._processJob(jobId, promptText, userId).catch(err => {
      console.error(`Job ${jobId} failed:`, err);
      const job = this.activeJobs.get(jobId);
      if (job) { job.status = 'failed'; job.error = err.message; }
    });
    return jobId;
  }

  async _processJob(jobId, promptText, userId) {
    const job = this.activeJobs.get(jobId);

    job.status = 'analyzing'; job.progress = 20;
    await new Promise(r => setTimeout(r, 1200));

    job.status = 'generating_code'; job.progress = 55;
    await new Promise(r => setTimeout(r, 2000));

    try {
      const promptHash = crypto.createHash('sha256').update(promptText.toLowerCase()).digest('hex');

      // Check cache first
      let files = await CacheManager.getCachedGeneration(promptHash);

      if (!files) {
        // Attempt custom AI generation if API key is provided
        files = await AIService.generateExtension(promptText);

        if (files) {
          // Post-process custom generated AI files to ensure valid PNG icons and secure V3 rules
          files = postProcessAIFiles(files);
          console.log(`[Job ${jobId}] AI generation successful for user ${userId}`);
        } else {
          // Seamless fallback to local rules if AI generation is not enabled or fails
          console.warn(`[Job ${jobId}] AI generation returned null or failed parsing. Falling back to local templates.`);
          await IntelligenceService.logGenerationTelemetry(null, null, false, 'AI_PARSE_FALLBACK');
          files = buildExtensionFiles(promptText);
        }

        // Security check
        for (const file of files) {
          if (file.path.endsWith('.js') || file.path.endsWith('.html')) {
            try {
              await SecurityValidator.scanContent(file.content);
            } catch (err) {
              // Log threat to MongoDB SecurityLog
              try {
                await SecurityLog.create({
                  eventType: 'CODE_VULNERABILITY',
                  severity: 'HIGH',
                  userId: userId || null,
                  details: `Security check failed for file "${file.path}": ${err.message}`,
                  metadata: { promptText, filePath: file.path, content: file.content },
                  resolved: false
                });
              } catch (dbErr) {
                console.error('Failed to log security violation to MongoDB:', dbErr);
              }

              // Log telemetry failure
              await IntelligenceService.logGenerationTelemetry(null, null, false, 'SECURITY_VIOLATION');
              throw err;
            }
          }
        }

        // Validate files map
        const filesMap = {};
        files.forEach(f => {
          filesMap[f.path] = f.content;
        });

        const validationReport = await ValidationService.validateProject(filesMap);
        if (!validationReport.isValid) {
          const validationError = new Error(`Validation failed: ${validationReport.errors.join(', ')}`);
          await IntelligenceService.logGenerationTelemetry(null, null, false, 'VALIDATION_FAILURE');
          throw validationError;
        }

        // Cache the files map
        await CacheManager.cacheGeneration(promptHash, files);
      }

      job.status = 'packaging'; job.progress = 85;
      await new Promise(r => setTimeout(r, 800));

      const projectName = (promptText.split(' ').slice(0, 4).join(' ') || 'New Extension').trim();

      const result = await ProjectService.createProject(userId, projectName, promptText, files, jobId);
      job.projectId = result?.project?._id || result?.project?.id;

      // Log success telemetry
      await IntelligenceService.logGenerationTelemetry(
        result?.project?._id || result?.project?.id,
        result?.version?._id || result?.version?.id,
        true
      );

      job.status = 'completed';
      job.progress = 100;
      job.resultUrl = `/api/downloads/${jobId}`;
      job.files = files;

    } catch (err) {
      console.error(`Job ${jobId} failed:`, err);
      job.status = 'failed';
      job.error = err.message;

      // Log telemetry error if not already handled
      if (!err.message.includes('Security') && !err.message.includes('Validation')) {
        await IntelligenceService.logGenerationTelemetry(null, null, false, 'GENERATION_ERROR');
      }
    }
  }

  async getJobStatus(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    return job;
  }
}

function postProcessAIFiles(files) {
  if (!files || !Array.isArray(files)) return files;

  // Find manifest.json
  const manifestFile = files.find(f => f.path === 'manifest.json');
  if (!manifestFile) return files;

  try {
    let manifest = JSON.parse(manifestFile.content);

    // 1. Convert any referenced .svg extension icons in manifest.json to .png
    let updatedManifest = false;

    if (manifest.icons) {
      for (const [size, pathStr] of Object.entries(manifest.icons)) {
        if (pathStr.endsWith('.svg')) {
          manifest.icons[size] = pathStr.replace('.svg', '.png');
          updatedManifest = true;
        }
      }
    }

    if (manifest.action && manifest.action.default_icon) {
      if (typeof manifest.action.default_icon === 'string' && manifest.action.default_icon.endsWith('.svg')) {
        manifest.action.default_icon = manifest.action.default_icon.replace('.svg', '.png');
        updatedManifest = true;
      } else if (typeof manifest.action.default_icon === 'object') {
        for (const [size, pathStr] of Object.entries(manifest.action.default_icon)) {
          if (pathStr.endsWith('.svg')) {
            manifest.action.default_icon[size] = pathStr.replace('.svg', '.png');
            updatedManifest = true;
          }
        }
      }
    }

    if (updatedManifest) {
      manifestFile.content = JSON.stringify(manifest, null, 2);
    }

    const iconPaths = manifest.icons || { '16': 'icons/icon16.png', '48': 'icons/icon48.png', '128': 'icons/icon128.png' };
    const iconPathValues = Object.values(iconPaths);

    // 2. Filter out raw SVG files and existing PNG icons to prevent duplicates in the files array
    let filteredFiles = files.filter(f => {
      const isSvgIcon = f.path.endsWith('.svg') && (f.path.includes('icon') || f.path.includes('logo'));
      const isAlreadyAnIconPath = iconPathValues.includes(f.path);
      return !isSvgIcon && !isAlreadyAnIconPath;
    });

    // 3. Extract customized SVG fill color if any SVG icon is present
    let r = 99, g = 102, b = 241; // Default modern Indigo (#6366f1)
    const originalSvgFile = files.find(f => f.path.endsWith('.svg') && (f.path.includes('icon') || f.path.includes('logo')));
    if (originalSvgFile) {
      // Enhanced regex to catch fill in attributes and style strings
      const fillMatch = originalSvgFile.content.match(/fill=["'](#(?:[a-fA-F0-9]{3}){1,2})["']|style=.*fill:\s*(#(?:[a-fA-F0-9]{3}){1,2})/i);
      if (fillMatch) {
        const hex = fillMatch[1] || fillMatch[2];
        const parsed = parseHexColor(hex);
        if (parsed) {
          r = parsed.r;
          g = parsed.g;
          b = parsed.b;
        }
      }
    }

    for (const [size, pathStr] of Object.entries(iconPaths)) {
      const sizeInt = parseInt(size, 10) || 48;
      // Add the binary PNG buffer directly
      filteredFiles.push({
        path: pathStr,
        content: generatePng(sizeInt, sizeInt, r, g, b)
      });
    }

    return filteredFiles;
  } catch (err) {
    console.error('Failed to post-process AI-generated extension files:', err);
    return files;
  }
}

function parseHexColor(hex) {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length === 6) {
    return {
      r: parseInt(c.substring(0, 2), 16),
      g: parseInt(c.substring(2, 4), 16),
      b: parseInt(c.substring(4, 6), 16)
    };
  }
  return null;
}

module.exports = new GenerationWorker();
