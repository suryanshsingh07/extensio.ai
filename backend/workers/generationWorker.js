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

  // â”€â”€â”€ Intent Detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Simple keyword match â€” no negation logic (negation was wrongly blocking "no ads", "image blocker" etc.)
  const has = (...kws) => kws.some(k => p.includes(k));

  // Media blocking
  const isImageBlocker  = (has('image','img','picture','photo') && has('block','remov','hide','disable','stop','replace','red square','no image')) || (has('red') && has('square'));
  const isVideoBlocker  = has('video','youtube','vimeo','reel','clip') && has('block','remov','hide','disable','stop','mute','no video');

  // Popup / cookie / modal
  const isCookieDismiss = has('cookie','gdpr','consent banner','cookie notice','cookie popup','cookie banner','accept cookie');
  const isPopupBlocker  = has('popup','modal','overlay','paywall','subscribe popup') && !isCookieDismiss;
  const isZapper        = has('cross','zap','remove element','delete element','click to remove','element remover','remove specific');

  // Ads & trackers
  const isAdBlock       = has('ad block','adblock','ads block','remove ad','block ad','no ads','block ads','tracker block','block tracker');

  // Privacy / security
  const isPrivacy       = has('privacy','fingerprint','tracker','surveillance','protect browsing','anonymous','privacy guard') && !isAdBlock;

  // Page tools
  const isDarkMode      = has('dark mode','dark theme','night mode','dark') && !isImageBlocker && !isVideoBlocker;
  const isReaderMode    = has('reader mode','reading mode','focus mode','distraction free','clutter','clean read');
  const isScrollTop     = has('scroll to top','back to top','scroll button','scroll tool','auto scroll','smooth scroll');
  const isWordCount     = has('word count','reading time','character count','word counter','text count');
  const isTextSize      = has('font size','text size','zoom text','increase font','decrease font','bigger text','smaller text','accessibility text');
  const isColorPicker   = has('color pick','colour pick','eyedropper','pick color','color grab');
  const isTranslate     = has('translat','language convert','translate page');
  const isHighlight     = has('highlight link','highlight text','mark text','colorize link') && !isImageBlocker;

  // Productivity
  const isTimer         = has('timer','pomodoro','focus timer','countdown','break timer','work timer');
  const isTabManager    = has('tab manag','save tab','close tab','group tab','tab organiz','duplicate tab');
  const isNotes         = has('note','sticky','memo','quick note','notepad') && !has('word count');
  const isPasswordGen   = has('password gen','passphrase','random pass','secure pass','strong password');
  const isCalculator    = has('calculator','calc extension','math extension');
  const isTodo          = has('todo','to-do','task list','checklist','task manager');

  const nameParts = prompt.split(' ').slice(0, 4).join(' ') || 'Custom Extension';
  const extName   = (nameParts.charAt(0).toUpperCase() + nameParts.slice(1)).trim() || 'Extensio Project';
  const shortDesc = prompt.length > 80 ? prompt.slice(0, 77) + '...' : prompt;

  // â”€â”€â”€ Shared Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const backgroundJs = `// Background service worker â€” Extensio.ai
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isActive', (data) => {
    if (typeof data.isActive === 'undefined') chrome.storage.local.set({ isActive: false });
  });
});`;

  const sharedCss = (accent) => `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 300px; min-height: 120px;
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
.slider { position: absolute; inset: 0; background: #2d2d3a; border-radius: 26px; transition: background 0.25s; }
.slider:before {
  content: ''; position: absolute;
  width: 20px; height: 20px; left: 3px; bottom: 3px;
  background: #fff; border-radius: 50%; transition: transform 0.25s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}
input:checked + .slider { background: ${accent}; }
input:checked + .slider:before { transform: translateX(22px); }
.status { margin-top: 12px; font-size: 11px; text-align: center; min-height: 18px; transition: color 0.2s; color: #4b5563; }
.status.active { color: #4ade80; }
.status.inactive { color: #6b7280; }
.divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 14px 0; }
.info { font-size: 11px; color: #4b5563; text-align: center; line-height: 1.5; }
`;

  // Builds a standard toggle popup HTML/CSS
  const togglePopup = (icon, title, sub, label, accent) => ({
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<div class="header"><span class="header-icon">${icon}</span><div><div class="header-title">${title}</div><div class="header-sub">${sub}</div></div></div>
<div class="toggle-row"><span class="toggle-label">${label}</span>
<label class="toggle-switch"><input type="checkbox" id="toggle"><span class="slider"></span></label></div>
<div class="status inactive" id="status"></div>
<script src="popup.js"></script></body></html>`,
    css: sharedCss(accent)
  });

  // Builds popup.js wiring â€” callers declare const toggle/status themselves
  const toggleJs = (onText, offText) => `chrome.storage.local.get('isActive', ({ isActive }) => {
  toggle.checked = !!isActive;
  status.textContent = isActive ? '${onText}' : '${offText}';
  status.className = 'status ' + (isActive ? 'active' : 'inactive');
});
toggle.addEventListener('change', () => {
  const on = toggle.checked;
  chrome.storage.local.set({ isActive: on });
  status.textContent = on ? '${onText}' : '${offText}';
  status.className = 'status ' + (on ? 'active' : 'inactive');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].url || /^(chrome|edge|brave|about|data):/.test(tabs[0].url)) return;
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: on ? applyEffect : removeEffect })
      .catch(() => { status.textContent = 'Reload the page and try again'; status.className = 'status inactive'; });
  });
});`;

  let popupHtml = '', popupJs = '', popupCss = '', contentJs = '';
  let extraFiles = [];
  let permissions = ['activeTab', 'scripting', 'storage'];
  let host_permissions = ['<all_urls>'];
  let content_scripts = [{ matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_end' }];
  let manifestExtras = {};
  let iconColor = { r: 99, g: 102, b: 241 };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 1. IMAGE BLOCKER (Red Square Replacement)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (isImageBlocker) {
    iconColor = { r: 244, g: 63, b: 94 };
    const ui = togglePopup('\uD83D\uDFE5', 'Image Blocker', 'Replaces all images with red squares', 'Block Images', '#f43f5e');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  document.querySelectorAll('img:not([data-xbl])').forEach(img => {
    const w = Math.max(img.getBoundingClientRect().width || img.naturalWidth || img.offsetWidth || 120, 32);
    const h = Math.max(img.getBoundingClientRect().height || img.naturalHeight || img.offsetHeight || 80, 24);
    const d = document.createElement('div'); d.dataset.xblocker = '1';
    d.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;background:#f43f5e;border-radius:4px;color:#fff;font-size:11px;font-weight:700;width:'+w+'px;height:'+h+'px;vertical-align:middle;box-sizing:border-box;';
    d.textContent = '\uD83D\uDEAB IMG';
    img.parentNode.insertBefore(d, img); img.style.display='none'; img.dataset.xbl='1';
  });
}
function removeEffect() {
  document.querySelectorAll('[data-xblocker]').forEach(d => d.remove());
  document.querySelectorAll('img[data-xbl]').forEach(i => { i.style.display=''; delete i.dataset.xbl; });
}
${toggleJs('\u2713 Images blocked', 'Image blocking inactive')}`;
    contentJs = `(function(){
  let _obs=null;
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) run(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?run():undo(); }});
  function run(){
    document.querySelectorAll('img:not([data-xbl])').forEach(replace);
    if(!_obs){
      _obs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{
        if(n.nodeType!==1)return;
        if(n.tagName==='IMG'&&!n.dataset.xbl) replace(n);
        n.querySelectorAll&&n.querySelectorAll('img:not([data-xbl])').forEach(replace);
      })));
      _obs.observe(document.documentElement,{childList:true,subtree:true});
    }
  }
  function replace(img){
    if(img.dataset.xbl)return;
    const w=Math.max(img.naturalWidth||img.offsetWidth||120,32);
    const h=Math.max(img.naturalHeight||img.offsetHeight||80,24);
    const d=document.createElement('div'); d.dataset.xblocker='1';
    d.style.cssText='display:inline-flex;align-items:center;justify-content:center;background:#f43f5e;border-radius:4px;color:#fff;font-size:11px;font-weight:700;width:'+w+'px;height:'+h+'px;vertical-align:middle;';
    d.textContent='\uD83D\uDEAB IMG';
    img.parentNode.insertBefore(d,img); img.style.display='none'; img.dataset.xbl='1';
  }
  function undo(){
    if(_obs){_obs.disconnect();_obs=null;}
    document.querySelectorAll('[data-xblocker]').forEach(d=>d.remove());
    document.querySelectorAll('img[data-xbl]').forEach(i=>{i.style.display='';delete i.dataset.xbl;});
  }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 2. VIDEO BLOCKER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isVideoBlocker) {
    iconColor = { r: 16, g: 185, b: 129 };
    const ui = togglePopup('\uD83C\uDFAC', 'Video Blocker', 'Hides all videos on any page', 'Block Videos', '#10b981');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  const sel = 'video,iframe[src*="youtube"],iframe[src*="vimeo"],iframe[src*="twitch"],iframe[src*="dailymotion"],iframe[allow*="autoplay"],[class*="video-player"],[id*="video-player"],.video-container';
  document.querySelectorAll(sel).forEach(el => { el.dataset.xvbl = el.style.display||'block'; el.style.display='none'; });
}
function removeEffect() {
  document.querySelectorAll('[data-xvbl]').forEach(el => { el.style.display=el.dataset.xvbl==='none'?'':el.dataset.xvbl; delete el.dataset.xvbl; });
}
${toggleJs('\u2713 Videos are hidden', 'Video blocker inactive')}`;
    contentJs = `(function(){
  const sel='video,iframe[src*="youtube"],iframe[src*="vimeo"],iframe[src*="twitch"],iframe[src*="dailymotion"],iframe[allow*="autoplay"],[class*="video-player"],[id*="video-player"],.video-container';
  let _obs=null;
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) run(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?run():undo(); }});
  function run(){
    document.querySelectorAll(sel).forEach(hide);
    if(!_obs){
      _obs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{
        if(n.nodeType!==1)return;
        try{ if(n.matches&&n.matches(sel)&&!n.dataset.xvbl) hide(n); }catch(e){}
        n.querySelectorAll&&n.querySelectorAll(sel).forEach(el=>{ if(!el.dataset.xvbl) hide(el); });
      })));
      _obs.observe(document.documentElement,{childList:true,subtree:true});
    }
  }
  function hide(el){ el.dataset.xvbl=el.style.display||'block'; el.style.display='none'; }
  function undo(){
    if(_obs){_obs.disconnect();_obs=null;}
    document.querySelectorAll('[data-xvbl]').forEach(el=>{ el.style.display=el.dataset.xvbl==='none'?'':el.dataset.xvbl; delete el.dataset.xvbl; });
  }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3. COOKIE / GDPR BANNER DISMISSER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isCookieDismiss) {
    iconColor = { r: 245, g: 158, b: 11 };
    const ui = togglePopup('\uD83C\uDF6A', 'Cookie Dismisser', 'Auto-closes cookie & GDPR banners', 'Auto-Dismiss Cookies', '#f59e0b');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() { dismissCookies(); }
function removeEffect() { status.textContent = 'Reload page to restore banners'; }
function dismissCookies() {
  const clickSel = 'button[id*="accept"],button[id*="agree"],button[id*="allow"],button[id*="consent"],button[class*="accept"],button[class*="agree"],a[id*="accept"],a[class*="accept-all"],[aria-label*="Accept"],[aria-label*="accept"],#onetrust-accept-btn-handler,.js-accept-cookies,.cc-accept-all,[data-testid*="accept"]';
  document.querySelectorAll(clickSel).forEach(btn => { try { btn.click(); } catch(e){} });
  const hideSel = '[id*="cookie-banner"],[id*="cookie-notice"],[id*="cookie-consent"],[id*="gdpr"],[class*="cookie-banner"],[class*="cookie-notice"],[class*="cookie-bar"],[class*="consent-banner"],#cookielaw-icon,.cc-window,#CybotCookiebotDialog,.cookie-overlay';
  document.querySelectorAll(hideSel).forEach(el => { el.style.display='none'; });
}
${toggleJs('\u2713 Cookie banners dismissed', 'Auto-dismiss inactive')}`;
    contentJs = `(function(){
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) run(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c&&c.isActive.newValue) run(); });
  function run(){
    dismiss(); setTimeout(dismiss,1200); setTimeout(dismiss,3000);
    const obs=new MutationObserver(()=>dismiss());
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }
  function dismiss(){
    const clickSel='button[id*="accept"],button[id*="agree"],button[id*="allow"],button[id*="consent"],button[class*="accept"],button[class*="agree"],a[id*="accept"],a[class*="accept-all"],[aria-label*="Accept"],#onetrust-accept-btn-handler,.js-accept-cookies,.cc-accept-all';
    document.querySelectorAll(clickSel).forEach(btn=>{ try{btn.click();}catch(e){} });
    const hideSel='[id*="cookie-banner"],[id*="cookie-notice"],[id*="cookie-consent"],[id*="gdpr"],[class*="cookie-banner"],[class*="cookie-bar"],[class*="consent-banner"],#cookielaw-icon,.cc-window,#CybotCookiebotDialog';
    document.querySelectorAll(hideSel).forEach(el=>{ el.style.display='none'; });
  }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 4. POPUP / MODAL BLOCKER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isPopupBlocker) {
    iconColor = { r: 239, g: 68, b: 68 };
    const ui = togglePopup('\uD83D\uDEAB', 'Popup Blocker', 'Closes intrusive modals & overlays', 'Block Popups', '#ef4444');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  const sel = '[class*="modal"],[class*="overlay"],[class*="popup"],[class*="paywall"],[id*="modal"],[id*="popup"],[id*="overlay"],[role="dialog"],[aria-modal="true"]';
  document.querySelectorAll(sel).forEach(el => {
    if(el.style.display!=='none'&&el.offsetParent!==null){ el.dataset.xpopped='1'; el.style.display='none'; }
  });
  document.body.style.overflow='auto'; document.documentElement.style.overflow='auto';
}
function removeEffect() {
  document.querySelectorAll('[data-xpopped]').forEach(el=>{ el.style.display=''; delete el.dataset.xpopped; });
}
${toggleJs('\u2713 Popups blocked', 'Popup blocker inactive')}`;
    contentJs = `(function(){
  let _obs=null;
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) run(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?run():undo(); }});
  function run(){
    block(); setTimeout(block,1500);
    document.body&&(document.body.style.overflow='auto'); document.documentElement.style.overflow='auto';
    if(!_obs){
      _obs=new MutationObserver(()=>block());
      _obs.observe(document.body||document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
    }
  }
  function block(){
    const sel='[class*="modal"],[class*="overlay"],[class*="popup"],[class*="paywall"],[id*="modal"],[id*="popup"],[id*="overlay"],[role="dialog"],[aria-modal="true"]';
    document.querySelectorAll(sel).forEach(el=>{
      if(!el.dataset.xpopped&&el.offsetParent!==null&&el.style.display!=='none'){ el.dataset.xpopped='1'; el.style.display='none'; }
    });
    document.body&&(document.body.style.overflow='auto'); document.documentElement.style.overflow='auto';
  }
  function undo(){
    if(_obs){_obs.disconnect();_obs=null;}
    document.querySelectorAll('[data-xpopped]').forEach(el=>{ el.style.display=''; delete el.dataset.xpopped; });
  }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 5. AD BLOCKER (Enhanced with declarativeNetRequest)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isAdBlock) {
    iconColor = { r: 244, g: 114, b: 182 };
    permissions = ['activeTab', 'scripting', 'storage', 'declarativeNetRequest'];
    manifestExtras = { declarative_net_request: { rule_resources: [{ id: 'block_ads', enabled: true, path: 'rules.json' }] } };
    const rules = JSON.stringify([
      { id: 1, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'doubleclick.net', resourceTypes: ['script','image','xmlhttprequest'] } },
      { id: 2, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'googlesyndication.com', resourceTypes: ['script','image'] } },
      { id: 3, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'adservice.google.com', resourceTypes: ['script','xmlhttprequest'] } },
      { id: 4, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'pagead2.googlesyndication.com', resourceTypes: ['script','image'] } },
      { id: 5, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'ads.pubmatic.com', resourceTypes: ['script','image','xmlhttprequest'] } },
      { id: 6, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'amazon-adsystem.com', resourceTypes: ['script','image'] } },
      { id: 7, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'outbrain.com', resourceTypes: ['script','image'] } },
      { id: 8, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'taboola.com', resourceTypes: ['script','image'] } }
    ], null, 2);
    extraFiles.push({ path: 'rules.json', content: rules });
    const ui = togglePopup('\uD83D\uDEE1\uFE0F', 'Ad Blocker', 'Blocks ads & trackers network-wide', 'Enable Ad Blocking', '#f472b6');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
const adSel=['[class*="ad-"]','[id*="google_ad"]','ins.adsbygoogle','[class*="banner-ad"]','iframe[src*="doubleclick"]','[class*="sponsored"]','[class*="advertisement"]','[class*="ad-slot"]','[id*="advert"]','[class*="adsense"]','.ad-unit','#ad-container'];
function applyEffect(){ adSel.forEach(s=>{ try{document.querySelectorAll(s).forEach(el=>el.remove());}catch(e){} }); }
function removeEffect(){ window.location.reload(); }
${toggleJs('\u2713 Ads blocked on this page', 'Ad blocker inactive')}`;
    contentJs = `(function(){
  const sel=['[class*="ad-"]','[id*="google_ad"]','ins.adsbygoogle','[class*="banner-ad"]','iframe[src*="doubleclick"]','[class*="sponsored"]','[class*="advertisement"]','[class*="ad-slot"]','[id*="advert"]','[class*="adsense"]','.ad-unit','#ad-container'];
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) run(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c&&c.isActive.newValue) run(); });
  function run(){
    clean();
    const obs=new MutationObserver(()=>clean());
    if(document.body) obs.observe(document.body,{childList:true,subtree:true});
  }
  function clean(){ sel.forEach(s=>{ try{document.querySelectorAll(s).forEach(el=>el.remove());}catch(e){} }); }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 6. PRIVACY / TRACKER BLOCKER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isPrivacy) {
    iconColor = { r: 16, g: 185, b: 129 };
    const ui = togglePopup('\uD83D\uDD12', 'Privacy Guard', 'Blocks trackers & fingerprinting scripts', 'Enable Privacy Guard', '#10b981');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  const trackers=['[src*="google-analytics"]','[src*="googletagmanager"]','[src*="facebook.net"]','[src*="hotjar"]','[src*="mixpanel"]','[src*="segment.com"]','[src*="mouseflow"]','[src*="clarity.ms"]'];
  trackers.forEach(s=>{ try{document.querySelectorAll(s).forEach(el=>el.remove());}catch(e){} });
  const badge = document.getElementById('__prv_badge__') || document.createElement('div');
  badge.id='__prv_badge__';
  badge.style.cssText='position:fixed;bottom:12px;right:12px;z-index:2147483647;background:#10b981;color:#fff;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;font-family:sans-serif;pointer-events:none;';
  badge.textContent='\uD83D\uDD12 Privacy Guard Active';
  document.body.appendChild(badge);
}
function removeEffect() { document.getElementById('__prv_badge__')?.remove(); }
${toggleJs('\u2713 Privacy guard active', 'Privacy guard inactive')}`;
    contentJs = `(function(){
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) run(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?run():undo(); }});
  function run(){
    const trackers=['[src*="google-analytics"]','[src*="googletagmanager"]','[src*="facebook.net"]','[src*="hotjar"]','[src*="mixpanel"]','[src*="segment.com"]','[src*="mouseflow"]','[src*="clarity.ms"]','[src*="fullstory"]','[src*="heap.io"]'];
    trackers.forEach(s=>{ try{document.querySelectorAll(s).forEach(el=>el.remove());}catch(e){} });
    const obs=new MutationObserver(()=>{ trackers.forEach(s=>{ try{document.querySelectorAll(s).forEach(el=>el.remove());}catch(e){} }); });
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }
  function undo(){ document.getElementById('__prv_badge__')?.remove(); }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 7. READER / FOCUS MODE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isReaderMode) {
    iconColor = { r: 99, g: 102, b: 241 };
    const ui = togglePopup('\uD83D\uDCDA', 'Reader Mode', 'Clean distraction-free reading view', 'Enable Reader Mode', '#6366f1');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  if(document.getElementById('__ext_reader__'))return;
  const s=document.createElement('style'); s.id='__ext_reader__';
  s.textContent='[class*="sidebar"],[class*="nav"],[class*="menu"],[class*="header"],[class*="footer"],[class*="banner"],[class*="recommend"],[class*="related"],[class*="social"],[id*="sidebar"],[id*="nav"],[id*="header"],[id*="footer"]{display:none!important}body{max-width:720px!important;margin:40px auto!important;font-family:Georgia,serif!important;font-size:18px!important;line-height:1.8!important;color:#1a1a1a!important;background:#fafaf8!important}p{margin-bottom:1.2em!important}img{max-width:100%!important}';
  document.head.appendChild(s);
}
function removeEffect() { document.getElementById('__ext_reader__')?.remove(); }
${toggleJs('\u2713 Reader mode active', 'Reader mode inactive')}`;
    contentJs = `(function(){
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) apply(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?apply():remove(); }});
  function apply(){
    if(document.getElementById('__ext_reader__'))return;
    const s=document.createElement('style'); s.id='__ext_reader__';
    s.textContent='[class*="sidebar"],[class*="nav"],[class*="menu"],[class*="header"],[class*="footer"],[class*="banner"],[class*="recommend"],[class*="related"],[class*="social"],[id*="sidebar"],[id*="nav"],[id*="header"],[id*="footer"]{display:none!important}body{max-width:720px!important;margin:40px auto!important;font-family:Georgia,serif!important;font-size:18px!important;line-height:1.8!important;color:#1a1a1a!important;background:#fafaf8!important}p{margin-bottom:1.2em!important}img{max-width:100%!important}';
    document.head.appendChild(s);
  }
  function remove(){ document.getElementById('__ext_reader__')?.remove(); }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 8. DARK MODE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isDarkMode) {
    iconColor = { r: 139, g: 92, b: 246 };
    const ui = togglePopup('\uD83C\uDF19', 'Dark Mode', 'Applies dark theme to any website', 'Enable Dark Mode', '#7c3aed');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  if(document.getElementById('__ext_dark__'))return;
  const el=document.createElement('style'); el.id='__ext_dark__';
  el.textContent='html{filter:invert(1) hue-rotate(180deg)!important}img,video,canvas,picture,svg{filter:invert(1) hue-rotate(180deg)!important}';
  document.documentElement.appendChild(el);
}
function removeEffect(){ document.getElementById('__ext_dark__')?.remove(); }
${toggleJs('\u2713 Dark mode is active', 'Dark mode inactive')}`;
    contentJs = `(function(){
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) on(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?on():off(); }});
  function on(){
    if(document.getElementById('__ext_dark__'))return;
    const el=document.createElement('style'); el.id='__ext_dark__';
    el.textContent='html{filter:invert(1) hue-rotate(180deg)!important}img,video,canvas,picture,svg{filter:invert(1) hue-rotate(180deg)!important}';
    document.documentElement.appendChild(el);
  }
  function off(){ document.getElementById('__ext_dark__')?.remove(); }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 9. SCROLL TO TOP / SMOOTH SCROLL
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isScrollTop) {
    iconColor = { r: 34, g: 197, b: 94 };
    const ui = togglePopup('\u2B06\uFE0F', 'Scroll Tools', 'Adds scroll-to-top & smooth scroll', 'Enable Scroll Tools', '#22c55e');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  if(document.getElementById('__ext_scrollbtn__'))return;
  const btn=document.createElement('button'); btn.id='__ext_scrollbtn__';
  btn.textContent='\u2B06';
  btn.style.cssText='position:fixed;bottom:24px;right:24px;z-index:2147483647;width:44px;height:44px;border-radius:50%;background:#22c55e;color:#fff;border:none;font-size:20px;cursor:pointer;box-shadow:0 4px 16px rgba(34,197,94,0.4);transition:opacity 0.3s;opacity:0;';
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  document.body.appendChild(btn);
  window.addEventListener('scroll',()=>{ btn.style.opacity=window.scrollY>300?'1':'0'; });
}
function removeEffect(){ document.getElementById('__ext_scrollbtn__')?.remove(); }
${toggleJs('\u2713 Scroll tools active', 'Scroll tools inactive')}`;
    contentJs = `(function(){
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) on(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?on():off(); }});
  function on(){
    if(document.getElementById('__ext_scrollbtn__'))return;
    const btn=document.createElement('button'); btn.id='__ext_scrollbtn__';
    btn.textContent='\u2B06';
    btn.style.cssText='position:fixed;bottom:24px;right:24px;z-index:2147483647;width:44px;height:44px;border-radius:50%;background:#22c55e;color:#fff;border:none;font-size:20px;cursor:pointer;box-shadow:0 4px 16px rgba(34,197,94,0.4);transition:opacity 0.3s;opacity:0;';
    btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    document.body.appendChild(btn);
    window.addEventListener('scroll',()=>{ btn.style.opacity=window.scrollY>300?'1':'0'; });
  }
  function off(){ document.getElementById('__ext_scrollbtn__')?.remove(); }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 10. WORD COUNTER / READING TIME
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isWordCount) {
    iconColor = { r: 59, g: 130, b: 246 };
    host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;padding:18px;}h2{font-size:14px;color:#60a5fa;margin-bottom:14px;}.stat{background:#1e293b;border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;}.stat-label{font-size:12px;color:#94a3b8;}.stat-val{font-size:20px;font-weight:700;color:#60a5fa;font-variant-numeric:tabular-nums;}button{width:100%;padding:10px;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px;}button:hover{background:#2563eb;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>\uD83D\uDCCA Word Counter</h2>
<div class="stat"><span class="stat-label">Words</span><span class="stat-val" id="words">\u2014</span></div>
<div class="stat"><span class="stat-label">Characters</span><span class="stat-val" id="chars">\u2014</span></div>
<div class="stat"><span class="stat-label">Sentences</span><span class="stat-val" id="sents">\u2014</span></div>
<div class="stat"><span class="stat-label">Reading Time</span><span class="stat-val" id="rtime">\u2014</span></div>
<button id="countBtn">\uD83D\uDD04 Count This Page</button>
<script src="popup.js"></script></body></html>`;
    popupJs = `document.getElementById('countBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const text = document.body.innerText || '';
        const words = text.trim().split(/\\s+/).filter(w => w.length > 0).length;
        const chars = text.replace(/\\s/g,'').length;
        const sents = (text.match(/[.!?]+/g)||[]).length;
        return { words, chars, sents, mins: Math.ceil(words/200) };
      }
    }, results => {
      if(results&&results[0]&&results[0].result){
        const d=results[0].result;
        document.getElementById('words').textContent=d.words.toLocaleString();
        document.getElementById('chars').textContent=d.chars.toLocaleString();
        document.getElementById('sents').textContent=d.sents.toLocaleString();
        document.getElementById('rtime').textContent=d.mins+' min';
      }
    });
  });
});`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 11. TEXT SIZE / FONT SIZE CONTROL
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isTextSize) {
    iconColor = { r: 168, g: 85, b: 247 };
    host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:260px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1a0533;color:#e9d5ff;padding:18px;}h2{font-size:14px;color:#a855f7;margin-bottom:14px;}.size-row{display:flex;align-items:center;justify-content:space-between;background:#2d1b4e;border-radius:10px;padding:12px 14px;margin-bottom:10px;}.size-val{font-size:24px;font-weight:700;color:#a855f7;min-width:50px;text-align:center;}.btn{width:36px;height:36px;border:none;border-radius:8px;background:#4c1d95;color:#e9d5ff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;}.btn:hover{background:#5b21b6;}.reset{width:100%;padding:9px;border:none;border-radius:8px;background:#4c1d95;color:#e9d5ff;font-size:13px;cursor:pointer;margin-top:4px;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>\uD83D\uDD21 Text Size Control</h2>
<div class="size-row">
  <button class="btn" id="dec">\u2212</button>
  <span class="size-val" id="sizeVal">100%</span>
  <button class="btn" id="inc">+</button>
</div>
<button class="reset" id="resetBtn">\u21BA Reset to Default</button>
<script src="popup.js"></script></body></html>`;
    popupJs = `let zoom=100;
chrome.storage.local.get('textZoom',({textZoom})=>{ if(textZoom){ zoom=textZoom; document.getElementById('sizeVal').textContent=zoom+'%'; } });
function applyZoom(){
  chrome.storage.local.set({textZoom:zoom});
  document.getElementById('sizeVal').textContent=zoom+'%';
  chrome.tabs.query({active:true,currentWindow:true},tabs=>{
    if(!tabs[0]||/^(chrome|edge|brave|about):/.test(tabs[0].url||''))return;
    chrome.scripting.executeScript({target:{tabId:tabs[0].id},func:(z)=>{ document.documentElement.style.fontSize=(z/100*16)+'px'; },args:[zoom]});
  });
}
document.getElementById('inc').addEventListener('click',()=>{ if(zoom<200){zoom+=10;applyZoom();} });
document.getElementById('dec').addEventListener('click',()=>{ if(zoom>50){zoom-=10;applyZoom();} });
document.getElementById('resetBtn').addEventListener('click',()=>{ zoom=100; applyZoom(); });`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 12. PASSWORD GENERATOR
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isPasswordGen) {
    iconColor = { r: 6, g: 182, b: 212 };
    permissions = ['storage','activeTab','scripting']; host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:300px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c1a2e;color:#cffafe;padding:18px;}h2{font-size:14px;color:#06b6d4;margin-bottom:14px;}.pass-box{background:#0f2744;border:1px solid #164e63;border-radius:10px;padding:12px 14px;font-family:monospace;font-size:14px;word-break:break-all;color:#67e8f9;min-height:44px;margin-bottom:10px;}.row{display:flex;gap:8px;margin-bottom:10px;}.row label{font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:4px;flex:1;}input[type="range"]{width:100%;accent-color:#06b6d4;}.len-val{font-weight:700;color:#06b6d4;min-width:24px;}.btn-row{display:flex;gap:6px;}button{flex:1;padding:9px;border:none;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;}#genBtn{background:#06b6d4;color:#fff;}#copyBtn{background:#0e7490;color:#cffafe;}#copied{font-size:11px;color:#4ade80;text-align:center;margin-top:6px;min-height:14px;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>\uD83D\uDD11 Password Generator</h2>
<div class="pass-box" id="passOut">Click Generate</div>
<div class="row"><label>Length: <span class="len-val" id="lenVal">16</span><input type="range" id="lenSlider" min="8" max="64" value="16"></label></div>
<div class="row"><label><input type="checkbox" id="chkUpper" checked> A-Z</label><label><input type="checkbox" id="chkNum" checked> 0-9</label><label><input type="checkbox" id="chkSym" checked> !@#</label></div>
<div class="btn-row"><button id="genBtn">\u26A1 Generate</button><button id="copyBtn">\uD83D\uDCCB Copy</button></div>
<div id="copied"></div>
<script src="popup.js"></script></body></html>`;
    popupJs = `const slider=document.getElementById('lenSlider'),lenVal=document.getElementById('lenVal');
const passOut=document.getElementById('passOut'),copied=document.getElementById('copied');
slider.addEventListener('input',()=>lenVal.textContent=slider.value);
function generate(){
  let chars='abcdefghijklmnopqrstuvwxyz';
  if(document.getElementById('chkUpper').checked) chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(document.getElementById('chkNum').checked) chars+='0123456789';
  if(document.getElementById('chkSym').checked) chars+='!@#$%^&*()-_=+[]{}|;:,.<>?';
  let pass=''; const arr=new Uint32Array(parseInt(slider.value));
  crypto.getRandomValues(arr); arr.forEach(v=>{ pass+=chars[v%chars.length]; });
  passOut.textContent=pass; chrome.storage.local.set({lastPass:pass});
}
document.getElementById('genBtn').addEventListener('click',generate);
document.getElementById('copyBtn').addEventListener('click',()=>{
  navigator.clipboard.writeText(passOut.textContent).then(()=>{
    copied.textContent='\u2713 Copied!'; setTimeout(()=>copied.textContent='',2000);
  });
});
chrome.storage.local.get('lastPass',({lastPass})=>{ if(lastPass) passOut.textContent=lastPass; });
generate();`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 13. TODO / TASK LIST
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isTodo) {
    iconColor = { r: 34, g: 197, b: 94 };
    permissions = ['storage']; host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:320px;max-height:520px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0d1117;color:#e6edf3;padding:16px;overflow-y:auto;}h2{font-size:14px;color:#22c55e;margin-bottom:12px;}.add-row{display:flex;gap:6px;margin-bottom:12px;}.add-row input{flex:1;background:#161b22;border:1px solid #30363d;border-radius:8px;color:#e6edf3;padding:8px 10px;font-size:13px;}.add-row input:focus{outline:none;border-color:#22c55e;}.add-row button{background:#22c55e;border:none;border-radius:8px;color:#fff;padding:8px 12px;font-weight:700;cursor:pointer;}.task{display:flex;align-items:center;gap:8px;padding:8px;background:#161b22;border-radius:8px;margin-bottom:5px;}.task.done span{text-decoration:line-through;color:#6b7280;}.task input[type="checkbox"]{accent-color:#22c55e;width:15px;height:15px;flex-shrink:0;}.task span{flex:1;font-size:13px;}.del-btn{background:none;border:none;color:#6b7280;cursor:pointer;font-size:16px;padding:0 2px;}.del-btn:hover{color:#ef4444;}#emptyMsg{font-size:12px;color:#6b7280;text-align:center;padding:12px;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>\u2705 Task List</h2>
<div class="add-row"><input type="text" id="taskInput" placeholder="Add a task..."><button id="addBtn">+</button></div>
<div id="taskList"></div><div id="emptyMsg">No tasks yet. Add one above!</div>
<script src="popup.js"></script></body></html>`;
    popupJs = `let tasks=[];
const taskList=document.getElementById('taskList'),emptyMsg=document.getElementById('emptyMsg');
function save(){ chrome.storage.local.set({tasks}); }
function render(){
  taskList.innerHTML=''; emptyMsg.style.display=tasks.length===0?'':'none';
  tasks.forEach((t,i)=>{
    const div=document.createElement('div'); div.className='task'+(t.done?' done':'');
    const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=t.done;
    cb.addEventListener('change',()=>{ tasks[i].done=cb.checked; save(); render(); });
    const span=document.createElement('span'); span.textContent=t.text;
    const del=document.createElement('button'); del.className='del-btn'; del.textContent='\u00D7';
    del.addEventListener('click',()=>{ tasks.splice(i,1); save(); render(); });
    div.append(cb,span,del); taskList.appendChild(div);
  });
}
chrome.storage.local.get('tasks',({tasks:t})=>{ if(t) tasks=t; render(); });
function addTask(){
  const inp=document.getElementById('taskInput');
  const text=inp.value.trim(); if(!text)return;
  tasks.push({text,done:false}); inp.value=''; save(); render();
}
document.getElementById('addBtn').addEventListener('click',addTask);
document.getElementById('taskInput').addEventListener('keydown',e=>{ if(e.key==='Enter') addTask(); });`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 14. CALCULATOR
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isCalculator) {
    iconColor = { r: 99, g: 102, b: 241 };
    permissions = ['storage']; host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:260px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#111827;color:#f9fafb;padding:16px;}h2{font-size:13px;color:#818cf8;margin-bottom:10px;}#display{background:#1f2937;border-radius:10px;padding:12px 14px;text-align:right;font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;color:#f9fafb;margin-bottom:10px;min-height:54px;word-break:break-all;}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}.key{padding:12px 6px;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity 0.15s;}.key:hover{opacity:0.8;}.key-num{background:#1f2937;color:#f9fafb;}.key-op{background:#374151;color:#fbbf24;}.key-eq{background:#6366f1;color:#fff;}.key-clr{background:#dc2626;color:#fff;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>\uD83E\uDDEE Calculator</h2>
<div id="display">0</div>
<div class="keys">
  <button class="key key-clr" data-val="C">C</button><button class="key key-op" data-val="\u00B1">\u00B1</button><button class="key key-op" data-val="%">%</button><button class="key key-op" data-val="\u00F7">\u00F7</button>
  <button class="key key-num" data-val="7">7</button><button class="key key-num" data-val="8">8</button><button class="key key-num" data-val="9">9</button><button class="key key-op" data-val="\u00D7">\u00D7</button>
  <button class="key key-num" data-val="4">4</button><button class="key key-num" data-val="5">5</button><button class="key key-num" data-val="6">6</button><button class="key key-op" data-val="-">-</button>
  <button class="key key-num" data-val="1">1</button><button class="key key-num" data-val="2">2</button><button class="key key-num" data-val="3">3</button><button class="key key-op" data-val="+">+</button>
  <button class="key key-num" style="grid-column:span 2" data-val="0">0</button><button class="key key-num" data-val=".">.</button><button class="key key-eq" data-val="=">=</button>
</div>
<script src="popup.js"></script></body></html>`;
    popupJs = `let expr='',disp=document.getElementById('display');
document.querySelectorAll('.key').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const v=btn.dataset.val;
    if(v==='C'){expr='';disp.textContent='0';return;}
    if(v==='\u00B1'){
      try{const n=parseFloat(disp.textContent);if(!isNaN(n)){expr=String(-n);disp.textContent=expr;}}catch(e){}return;
    }
    if(v==='='){
      try{
        const safe=expr.replace(/\u00D7/g,'*').replace(/\u00F7/g,'/').replace(/%/g,'/100');
        const r=Function('"use strict";return('+safe+')')();
        disp.textContent=parseFloat(r.toFixed(10)).toString();
        expr=disp.textContent;
      }catch(e){disp.textContent='Error';expr='';}
      return;
    }
    expr+=v; disp.textContent=expr;
  });
});`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 15. POMODORO TIMER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isTimer) {
    iconColor = { r: 245, g: 158, b: 11 };
    host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0a09;color:#fef3c7;padding:22px;}h2{font-size:15px;color:#f59e0b;margin-bottom:14px;text-align:center;}.modes{display:flex;gap:6px;justify-content:center;margin-bottom:16px;}.mode-btn{padding:5px 12px;border-radius:20px;border:1px solid #44403c;background:transparent;color:#a8a29e;font-size:11px;cursor:pointer;transition:all 0.2s;}.mode-btn.active{background:#f59e0b;color:#000;border-color:#f59e0b;}.display{font-size:52px;font-weight:700;letter-spacing:2px;text-align:center;margin:8px 0 20px;font-variant-numeric:tabular-nums;}.buttons{display:flex;gap:8px;}button.main{flex:2;padding:11px;border:none;border-radius:9px;font-weight:700;cursor:pointer;font-size:13px;background:#f59e0b;color:#000;}button.reset-btn{flex:1;padding:11px;border:none;border-radius:9px;background:#292524;color:#a8a29e;cursor:pointer;font-size:13px;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>â± Focus Timer</h2>
<div class="modes">
  <button class="mode-btn active" data-time="1500">Pomodoro</button>
  <button class="mode-btn" data-time="300">Short Break</button>
  <button class="mode-btn" data-time="900">Long Break</button>
</div>
<div class="display" id="display">25:00</div>
<div class="buttons">
  <button class="main" id="startBtn">â–¶ Start</button>
  <button class="reset-btn" id="resetBtn">â†º Reset</button>
</div>
<script src="popup.js"></script></body></html>`;
    popupJs = `let interval,running=false,total=1500,left=1500;
const disp=document.getElementById('display'),startBtn=document.getElementById('startBtn');
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
disp.textContent=fmt(left);
document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>{
  clearInterval(interval);running=false;startBtn.textContent='â–¶ Start';
  document.querySelectorAll('.mode-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');total=left=parseInt(b.dataset.time);disp.textContent=fmt(left);
}));
startBtn.addEventListener('click',()=>{
  if(running){clearInterval(interval);running=false;startBtn.textContent='â–¶ Start';}
  else{running=true;startBtn.textContent='â¸ Pause';
    interval=setInterval(()=>{ if(left<=0){clearInterval(interval);running=false;return;} left--;disp.textContent=fmt(left); },1000);}
});
document.getElementById('resetBtn').addEventListener('click',()=>{
  clearInterval(interval);running=false;left=total;disp.textContent=fmt(left);startBtn.textContent='â–¶ Start';
});`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 16. TAB MANAGER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isTabManager) {
    iconColor = { r: 96, g: 165, b: 250 };
    permissions = ['tabs','storage','activeTab']; host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:340px;max-height:520px;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;padding:16px;}h2{font-size:14px;color:#60a5fa;margin-bottom:10px;}.actions{display:flex;gap:6px;margin-bottom:10px;}.actions button{flex:1;padding:7px;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;background:#1e3a5f;color:#93c5fd;}.tab-item{display:flex;align-items:center;gap:8px;padding:8px;background:#1e293b;border-radius:8px;margin-bottom:5px;cursor:pointer;}.tab-item:hover{background:#334155;}.tab-item img{width:16px;height:16px;flex-shrink:0;}.tab-title{flex:1;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.close-btn{background:#ef4444;border:none;color:#fff;border-radius:4px;padding:2px 7px;font-size:11px;cursor:pointer;flex-shrink:0;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>ðŸ“‘ Tab Manager</h2>
<div class="actions"><button id="closeOther">Close Others</button><button id="closeDupe">Remove Dupes</button></div>
<div id="tabList"></div>
<script src="popup.js"></script></body></html>`;
    popupJs = `function loadTabs(){
  const list=document.getElementById('tabList'); list.innerHTML='';
  chrome.tabs.query({currentWindow:true},tabs=>{
    tabs.forEach(t=>{
      const div=document.createElement('div'); div.className='tab-item';
      const img=document.createElement('img'); img.src=t.favIconUrl||'';
      img.onerror=()=>{ img.style.display='none'; };
      const span=document.createElement('span'); span.className='tab-title'; span.textContent=t.title; span.title=t.url;
      const btn=document.createElement('button'); btn.className='close-btn'; btn.textContent='\u2715';
      btn.addEventListener('click',e=>{ e.stopPropagation(); chrome.tabs.remove(t.id,()=>div.remove()); });
      div.addEventListener('click',()=>chrome.tabs.update(t.id,{active:true}));
      div.append(img,span,btn); list.appendChild(div);
    });
  });
}
loadTabs();
document.getElementById('closeOther').addEventListener('click',()=>{
  chrome.tabs.query({currentWindow:true,active:false},tabs=>{ chrome.tabs.remove(tabs.map(t=>t.id),loadTabs); });
});
document.getElementById('closeDupe').addEventListener('click',()=>{
  chrome.tabs.query({currentWindow:true},tabs=>{
    const seen=new Set(); tabs.forEach(t=>{ if(seen.has(t.url)) chrome.tabs.remove(t.id); else seen.add(t.url); });
    setTimeout(loadTabs,300);
  });
});`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 17. QUICK NOTES
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isNotes) {
    iconColor = { r: 167, g: 139, b: 250 };
    permissions = ['storage']; host_permissions = []; content_scripts = [];
    popupCss = `*{box-sizing:border-box;margin:0;padding:0;}body{width:320px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1c1917;color:#fafaf9;padding:16px;}h2{font-size:14px;color:#a78bfa;margin-bottom:10px;}textarea{width:100%;height:190px;background:#292524;border:1px solid #44403c;border-radius:8px;color:#fafaf9;padding:10px;font-size:13px;resize:none;display:block;}textarea:focus{outline:none;border-color:#7c3aed;}.row{display:flex;gap:8px;margin-top:8px;}.row button{flex:1;padding:9px;border:none;border-radius:7px;font-weight:600;font-size:12px;cursor:pointer;}#saveBtn{background:#7c3aed;color:#fff;}#clearBtn{background:#292524;color:#a8a29e;}#statusEl{font-size:11px;color:#4ade80;text-align:center;margin-top:7px;min-height:16px;}`;
    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head><body>
<h2>\uD83D\uDCDD Quick Notes</h2>
<textarea id="note" placeholder="Write anything â€” saved automatically..."></textarea>
<div class="row"><button id="saveBtn">\uD83D\uDCBE Save</button><button id="clearBtn">\uD83D\uDDD1 Clear</button></div>
<div id="statusEl"></div>
<script src="popup.js"></script></body></html>`;
    popupJs = `const note=document.getElementById('note'),statusEl=document.getElementById('statusEl');
chrome.storage.local.get('note',({note:n})=>{ if(n) note.value=n; });
document.getElementById('saveBtn').addEventListener('click',()=>{
  chrome.storage.local.set({note:note.value},()=>{ statusEl.textContent='\u2713 Saved!'; setTimeout(()=>statusEl.textContent='',2000); });
});
document.getElementById('clearBtn').addEventListener('click',()=>{
  note.value=''; chrome.storage.local.remove('note',()=>{ statusEl.textContent='Cleared'; setTimeout(()=>statusEl.textContent='',2000); });
});
note.addEventListener('input',()=>{ clearTimeout(note._t); note._t=setTimeout(()=>chrome.storage.local.set({note:note.value}),800); });`;
    contentJs = '';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 18. LINK HIGHLIGHTER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isHighlight) {
    iconColor = { r: 251, g: 191, b: 36 };
    const ui = togglePopup('\u2728', 'Link Highlighter', 'Highlights all links in yellow', 'Highlight Links', '#fbbf24');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  if(document.getElementById('__ext_hl__'))return;
  const s=document.createElement('style'); s.id='__ext_hl__';
  s.textContent='a{background:#fbbf24!important;color:#000!important;padding:1px 3px!important;border-radius:3px!important;}';
  document.head.appendChild(s);
}
function removeEffect(){ document.getElementById('__ext_hl__')?.remove(); }
${toggleJs('\u2713 Links are highlighted', 'Link highlighting inactive')}`;
    contentJs = `(function(){
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) apply(); });
  chrome.storage.onChanged.addListener((changes)=>{ if('isActive' in changes){ changes.isActive.newValue?apply():remove(); }});
  function apply(){
    if(document.getElementById('__ext_hl__'))return;
    const s=document.createElement('style'); s.id='__ext_hl__';
    s.textContent='a{background:#fbbf24!important;color:#000!important;padding:1px 3px!important;border-radius:3px!important;}';
    document.head.appendChild(s);
  }
  function remove(){ document.getElementById('__ext_hl__')?.remove(); }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 19. ELEMENT ZAPPER (Click-to-Remove)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else if (isZapper) {
    iconColor = { r: 239, g: 68, b: 68 };
    const ui = togglePopup('\u274C', 'Element Zapper', 'Click any element to remove it from the page', 'Enable Zapper', '#ef4444');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() { status.textContent = '\u274C Click any element to zap it'; }
function removeEffect() { status.textContent = 'Zapper is inactive'; }
${toggleJs('\u274C Zapper is active â€” click elements', 'Zapper is inactive')}`;
    contentJs = `(function(){
  let active=false,overlay=null;
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive){active=true;bind();} });
  chrome.storage.onChanged.addListener(c=>{
    if('isActive' in c){ if(c.isActive.newValue){active=true;bind();}else{active=false;unbind();} }
  });
  function bind(){
    document.addEventListener('mouseover',highlight,true);
    document.addEventListener('click',zap,true);
  }
  function unbind(){
    document.removeEventListener('mouseover',highlight,true);
    document.removeEventListener('click',zap,true);
    if(overlay){ overlay.remove(); overlay=null; }
  }
  function highlight(e){
    if(!active)return;
    if(!overlay){
      overlay=document.createElement('div');
      overlay.style.cssText='position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #ef4444;background:rgba(239,68,68,0.1);border-radius:2px;transition:all 0.1s;';
      document.body.appendChild(overlay);
    }
    const r=e.target.getBoundingClientRect();
    overlay.style.top=r.top+'px'; overlay.style.left=r.left+'px';
    overlay.style.width=r.width+'px'; overlay.style.height=r.height+'px';
  }
  function zap(e){
    if(!active)return;
    e.preventDefault(); e.stopPropagation();
    e.target.remove();
    if(overlay){ overlay.remove(); overlay=null; }
  }
})();`;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 20. GENERIC FALLBACK (AI-powered or unnamed prompts)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  } else {
    const ui = togglePopup('\u26A1', extName, shortDesc.slice(0, 55) + (shortDesc.length > 55 ? '...' : ''), 'Activate Extension', '#6366f1');
    popupHtml = ui.html; popupCss = ui.css;
    popupJs = `const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
function applyEffect() {
  if(document.getElementById('__ext_badge__'))return;
  const b=document.createElement('div'); b.id='__ext_badge__';
  b.style.cssText='position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#6366f1;color:#fff;padding:8px 14px;border-radius:999px;font-size:13px;font-weight:600;font-family:system-ui,sans-serif;box-shadow:0 4px 24px rgba(99,102,241,0.5);cursor:pointer;';
  b.textContent='\u26A1 Extension Active';
  b.addEventListener('click',()=>b.remove());
  document.body.appendChild(b);
}
function removeEffect(){ document.getElementById('__ext_badge__')?.remove(); }
${toggleJs('\u2713 Extension is active on this page', 'Inactive â€” toggle to activate')}`;
    contentJs = `(function(){
  chrome.storage.local.get('isActive',({isActive})=>{ if(isActive) applyEffect(); });
  chrome.storage.onChanged.addListener(c=>{ if('isActive' in c){ c.isActive.newValue?applyEffect():removeEffect(); }});
  function applyEffect(){
    if(document.getElementById('__ext_badge__'))return;
    const b=document.createElement('div'); b.id='__ext_badge__';
    b.style.cssText='position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#6366f1;color:#fff;padding:8px 14px;border-radius:999px;font-size:13px;font-weight:600;font-family:system-ui,sans-serif;box-shadow:0 4px 24px rgba(99,102,241,0.5);cursor:pointer;';
    b.textContent='\u26A1 Extension Active';
    b.addEventListener('click',()=>b.remove());
    document.body.appendChild(b);
  }
  function removeEffect(){ document.getElementById('__ext_badge__')?.remove(); }
})();`;
  }

  // â”€â”€â”€ Assemble manifest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Assemble file list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
