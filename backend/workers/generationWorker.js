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

function buildExtensionFiles(prompt) {
  const p = prompt.toLowerCase();

  const isDarkMode = p.includes('dark') || p.includes('night');
  const isAdBlock = p.includes('ad') && (p.includes('block') || p.includes('remov'));
  const isTabManager = p.includes('tab') && (p.includes('manag') || p.includes('sav') || p.includes('close') || p.includes('group'));
  const isTimer = p.includes('timer') || p.includes('pomodoro') || p.includes('focus') || p.includes('break');
  const isTranslate = p.includes('translat') || p.includes('language');
  const isHighlight = p.includes('highlight') || p.includes('mark') || p.includes('color');
  const isPassword = p.includes('password') || (p.includes('generat') && p.includes('pass'));
  const isNotes = p.includes('note') || p.includes('sticky') || p.includes('memo');
  const isScrollTop = p.includes('scroll') && (p.includes('top') || p.includes('back'));
  const isWordCount = p.includes('word') && (p.includes('count') || p.includes('stat'));
  const isRedSquare = (p.includes('block') && p.includes('image')) || (p.includes('red') && p.includes('square'));

  const nameParts = prompt.split(' ').slice(0, 4).join(' ') || 'Custom Extension';
  const extName = (nameParts.charAt(0).toUpperCase() + nameParts.slice(1)).trim() || 'Extensio Project';
  const shortDesc = prompt.length > 80 ? prompt.slice(0, 77) + '...' : prompt;

  const manifest = {
    manifest_version: 3,
    name: extName,
    version: '1.0.0',
    description: shortDesc,
    action: { default_popup: 'popup.html', default_title: extName },
    icons: { '16': 'icons/icon16.png', '48': 'icons/icon48.png', '128': 'icons/icon128.png' },
    permissions: [],
    host_permissions: [],
    content_scripts: []
  };

  let popupHtml = '';
  let popupJs = '';
  let contentJs = '';
  let backgroundJs = '';

  if (isDarkMode) {
    manifest.permissions = ['activeTab', 'scripting', 'storage'];
    manifest.host_permissions = ['<all_urls>'];

    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{width:280px;padding:20px;font-family:system-ui,sans-serif;background:#1a1a2e;color:#e0e0e0;margin:0;}
h2{margin:0 0 16px;font-size:16px;color:#a78bfa;}
.toggle-row{display:flex;align-items:center;justify-content:space-between;background:#16213e;border-radius:10px;padding:12px 16px;}
.toggle{position:relative;width:48px;height:26px;cursor:pointer;}
.toggle input{opacity:0;width:0;height:0;}
.slider{position:absolute;inset:0;background:#444;border-radius:26px;transition:.3s;}
.slider:before{content:'';position:absolute;width:20px;height:20px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s;}
input:checked+.slider{background:#6366f1;}
input:checked+.slider:before{transform:translateX(22px);}
p.hint{font-size:11px;color:#888;margin-top:12px;text-align:center;}
</style></head><body>
<h2>🌙 Dark Mode Toggle</h2>
<div class="toggle-row"><span>Enable Dark Mode</span>
<label class="toggle"><input type="checkbox" id="toggle"><span class="slider"></span></label></div>
<p class="hint">Applies to current tab</p>
<script src="popup.js"></script></body></html>`;

    popupJs = `const toggle=document.getElementById('toggle');
chrome.storage.local.get('darkEnabled',({darkEnabled})=>{toggle.checked=!!darkEnabled;});
toggle.addEventListener('change',()=>{
  const on=toggle.checked;
  chrome.storage.local.set({darkEnabled:on});
  chrome.tabs.query({active:true,currentWindow:true},tabs=>{
    chrome.scripting.executeScript({target:{tabId:tabs[0].id},func:(enable)=>{
      let el=document.getElementById('__ag_dark__');
      if(enable){if(!el){el=document.createElement('style');el.id='__ag_dark__';el.textContent='html{filter:invert(1) hue-rotate(180deg)!important;}img,video{filter:invert(1) hue-rotate(180deg)!important;}';document.head.appendChild(el);}}
      else{if(el)el.remove();}
    },args:[on]});
  });
});`;
    contentJs = `// Dark mode extension by Extensio.ai\n(function(){chrome.storage.local.get('darkEnabled',({darkEnabled})=>{if(darkEnabled){const s=document.createElement('style');s.id='__ag_dark__';s.textContent='html{filter:invert(1) hue-rotate(180deg)!important;}img,video{filter:invert(1) hue-rotate(180deg)!important;}';document.head.appendChild(s);}});})();`;
    manifest.content_scripts = [{ matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_end' }];

  } else if (isAdBlock) {
    manifest.permissions = ['declarativeNetRequest', 'storage'];
    manifest.host_permissions = ['<all_urls>'];
    manifest.declarative_net_request = { rule_resources: [{ id: 'block_ads', enabled: true, path: 'rules.json' }] };

    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{width:260px;padding:20px;font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;text-align:center;}
h2{font-size:15px;color:#f472b6;margin:0 0 12px;}
.badge{background:#1e293b;border-radius:12px;padding:16px;font-size:28px;font-weight:700;color:#4ade80;margin-bottom:10px;}
p{font-size:11px;color:#64748b;margin:0;}
</style></head><body>
<h2>🛡️ Ad Blocker Active</h2>
<div class="badge" id="count">0</div>
<p>Ads blocked this session</p>
<script src="popup.js"></script></body></html>`;
    popupJs = `chrome.storage.local.get('blocked',({blocked})=>{document.getElementById('count').textContent=blocked||0;});`;
    contentJs = `// Extensio.ai Ad Blocker content script\n(function(){const selectors=['[class*="ad-"]','[id*="google_ad"]','ins.adsbygoogle','[class*="banner-ad"]','iframe[src*="doubleclick"]'];selectors.forEach(s=>{document.querySelectorAll(s).forEach(el=>el.remove());});})();`;

    const rules = JSON.stringify([
      { id: 1, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'doubleclick.net', resourceTypes: ['script', 'image', 'xmlhttprequest'] } },
      { id: 2, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'googlesyndication.com', resourceTypes: ['script', 'image'] } },
      { id: 3, priority: 1, action: { type: 'block' }, condition: { urlFilter: 'adservice.google.com', resourceTypes: ['script', 'xmlhttprequest'] } }
    ], null, 2);
    manifest._rules = rules; // stored separately

  } else if (isTimer) {
    manifest.permissions = ['storage', 'notifications', 'alarms'];

    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{width:280px;padding:24px;font-family:system-ui,sans-serif;background:#0c0a09;color:#fef3c7;margin:0;text-align:center;}
h2{font-size:16px;color:#f59e0b;margin:0 0 16px;}
.timer-display{font-size:48px;font-weight:700;letter-spacing:2px;margin:8px 0;}
.btn-row{display:flex;gap:8px;justify-content:center;margin-top:16px;}
button{flex:1;padding:10px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;}
#startBtn{background:#f59e0b;color:#000;}
#resetBtn{background:#292524;color:#fff;}
.mode-row{display:flex;gap:6px;justify-content:center;margin-bottom:14px;}
.mode-btn{padding:4px 12px;border-radius:20px;border:1px solid #44403c;background:transparent;color:#a8a29e;font-size:11px;cursor:pointer;}
.mode-btn.active{background:#f59e0b;color:#000;border-color:#f59e0b;}
</style></head><body>
<h2>⏱ Focus Timer</h2>
<div class="mode-row">
  <button class="mode-btn active" data-time="1500">Pomodoro</button>
  <button class="mode-btn" data-time="300">Short Break</button>
  <button class="mode-btn" data-time="900">Long Break</button>
</div>
<div class="timer-display" id="display">25:00</div>
<div class="btn-row">
  <button id="startBtn">▶ Start</button>
  <button id="resetBtn">↺ Reset</button>
</div>
<script src="popup.js"></script></body></html>`;

    popupJs = `let interval,running=false,total=1500,left=1500;
const disp=document.getElementById('display');
const fmt=s=>\`\${String(Math.floor(s/60)).padStart(2,'0')}:\${String(s%60).padStart(2,'0')}\`;
disp.textContent=fmt(left);
document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>{
  clearInterval(interval);running=false;document.getElementById('startBtn').textContent='▶ Start';
  document.querySelectorAll('.mode-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  total=left=parseInt(b.dataset.time);disp.textContent=fmt(left);
}));
document.getElementById('startBtn').addEventListener('click',()=>{
  if(running){clearInterval(interval);running=false;document.getElementById('startBtn').textContent='▶ Start';}
  else{running=true;document.getElementById('startBtn').textContent='⏸ Pause';
    interval=setInterval(()=>{if(left<=0){clearInterval(interval);running=false;return;}left--;disp.textContent=fmt(left);},1000);}
});
document.getElementById('resetBtn').addEventListener('click',()=>{clearInterval(interval);running=false;left=total;disp.textContent=fmt(left);document.getElementById('startBtn').textContent='▶ Start';});`;

  } else if (isTabManager) {
    manifest.permissions = ['tabs', 'storage'];

    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{width:340px;max-height:500px;overflow-y:auto;padding:16px;font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;}
h2{font-size:15px;color:#60a5fa;margin:0 0 12px;}
.tab-item{display:flex;align-items:center;gap:8px;padding:8px;background:#1e293b;border-radius:8px;margin-bottom:6px;cursor:pointer;}
.tab-item:hover{background:#334155;}
.tab-item img{width:16px;height:16px;}
.tab-title{flex:1;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.close-btn{background:#ef4444;border:none;color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;cursor:pointer;}
.action-row{display:flex;gap:6px;margin-bottom:10px;}
.action-row button{flex:1;padding:6px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;background:#1e3a5f;color:#93c5fd;}
</style></head><body>
<h2>📑 Tab Manager</h2>
<div class="action-row">
  <button id="closeOther">Close Others</button>
  <button id="closeDupe">Remove Dupes</button>
</div>
<div id="tabList"></div>
<script src="popup.js"></script></body></html>`;

    popupJs = `chrome.tabs.query({currentWindow:true},tabs=>{
  const list=document.getElementById('tabList');
  tabs.forEach(t=>{
    const div=document.createElement('div');div.className='tab-item';
    const img=document.createElement('img');img.src=t.favIconUrl||'';
    const span=document.createElement('span');span.className='tab-title';span.textContent=t.title;span.title=t.title;
    const btn=document.createElement('button');btn.className='close-btn';btn.textContent='✕';
    btn.addEventListener('click',e=>{e.stopPropagation();chrome.tabs.remove(t.id,()=>div.remove());});
    div.addEventListener('click',()=>chrome.tabs.update(t.id,{active:true}));
    div.append(img,span,btn);list.appendChild(div);
  });
});
document.getElementById('closeOther').addEventListener('click',()=>{
  chrome.tabs.query({currentWindow:true,active:false},tabs=>chrome.tabs.remove(tabs.map(t=>t.id)));
});
document.getElementById('closeDupe').addEventListener('click',()=>{
  chrome.tabs.query({currentWindow:true},tabs=>{
    const seen=new Set();tabs.forEach(t=>{if(seen.has(t.url))chrome.tabs.remove(t.id);else seen.add(t.url);});
  });
});`;

  } else if (isNotes) {
    manifest.permissions = ['storage'];

    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{width:320px;padding:16px;font-family:system-ui,sans-serif;background:#1c1917;color:#fafaf9;margin:0;}
h2{font-size:15px;color:#a78bfa;margin:0 0 10px;}
textarea{width:100%;height:200px;background:#292524;border:1px solid #44403c;border-radius:8px;color:#fafaf9;padding:10px;font-size:13px;resize:none;box-sizing:border-box;}
.row{display:flex;gap:8px;margin-top:8px;}
button{flex:1;padding:8px;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;}
#saveBtn{background:#7c3aed;color:#fff;}
#clearBtn{background:#292524;color:#a8a29e;}
#status{font-size:11px;color:#4ade80;text-align:center;margin-top:6px;min-height:16px;}
</style></head><body>
<h2>📝 Quick Notes</h2>
<textarea id="note" placeholder="Write anything..."></textarea>
<div class="row"><button id="saveBtn">💾 Save</button><button id="clearBtn">🗑 Clear</button></div>
<p id="status"></p>
<script src="popup.js"></script></body></html>`;

    popupJs = `const note=document.getElementById('note'),status=document.getElementById('status');
chrome.storage.local.get('note',({note:n})=>{if(n)note.value=n;});
document.getElementById('saveBtn').addEventListener('click',()=>{
  chrome.storage.local.set({note:note.value},()=>{status.textContent='Saved!';setTimeout(()=>status.textContent='',2000);});
});
document.getElementById('clearBtn').addEventListener('click',()=>{
  note.value='';chrome.storage.local.remove('note',()=>{status.textContent='Cleared';setTimeout(()=>status.textContent='',2000);});
});`;

  } else if (isRedSquare) {
    manifest.permissions = ['activeTab', 'scripting', 'storage'];
    manifest.host_permissions = ['<all_urls>'];
    manifest.content_scripts = [{ matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_start' }];

    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{width:280px;padding:20px;font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;margin:0;text-align:center;}
h2{margin:0 0 10px;font-size:16px;color:#f43f5e;}
p{font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:16px;}
.status-badge{background:#fda4af;color:#9f1239;padding:6px 12px;border-radius:20px;font-weight:600;font-size:11px;display:inline-block;}
</style></head><body>
<h2>🛡️ Red Square Blocker</h2>
<p>All images on this website have been blocked and replaced with high-contrast red squares to save bandwidth and maximize focus.</p>
<div class="status-badge">Blocking Active</div>
</body></html>`;

    contentJs = `// Extensio.ai Image Blocker & Red Square Replacer content script
(function(){
  const style = document.createElement('style');
  style.id = '__extensio_red_square__';
  style.textContent = \`
    img, picture, svg, [style*="background-image"] {
      content: "" !important;
      background-color: #f43f5e !important;
      background-image: none !important;
      width: 100px !important;
      height: 100px !important;
      display: inline-block !important;
    }
  \`;
  document.documentElement.appendChild(style);

  // Monitor dynamic images
  const observer = new MutationObserver(() => {
    document.querySelectorAll('img').forEach(img => {
      if (!img.dataset.blocked) {
        img.style.setProperty('content', '""', 'important');
        img.style.setProperty('background-color', '#f43f5e', 'important');
        img.style.setProperty('width', img.width ? img.width + 'px' : '100px', 'important');
        img.style.setProperty('height', img.height ? img.height + 'px' : '100px', 'important');
        img.dataset.blocked = 'true';
      }
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  console.log('[Extensio.ai] Image to Red Square blocker initialized.');
})();`;

  } else {
    manifest.permissions = ['activeTab', 'storage', 'scripting'];
    manifest.host_permissions = ['<all_urls>'];

    popupHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{width:300px;padding:24px;font-family:system-ui,sans-serif;background:#0b0b0f;color:#e2e8f0;margin:0;text-align:center;}
.logo{font-size:32px;margin-bottom:8px;}
h2{font-size:16px;font-weight:700;color:#a78bfa;margin:0 0 8px;}
p{font-size:12px;color:#64748b;margin:0 0 16px;line-height:1.6;}
button{width:100%;padding:10px;background:#6366f1;border:none;color:#fff;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;}
button:hover{background:#4f46e5;}
#status{margin-top:10px;font-size:12px;color:#4ade80;min-height:18px;}
</style></head><body>
<div class="logo">⚡</div>
<h2>${extName}</h2>
<p>${shortDesc}</p>
<button id="actionBtn">Activate</button>
<div id="status"></div>
<script src="popup.js"></script></body></html>`;

    popupJs = `document.getElementById('actionBtn').addEventListener('click',()=>{
  chrome.tabs.query({active:true,currentWindow:true},tabs=>{
    chrome.scripting.executeScript({
      target:{tabId:tabs[0].id},
      func:()=>{ console.log('Extensio.ai extension activated on '+window.location.hostname); }
    });
    const s=document.getElementById('status');
    s.textContent='✓ Activated!';setTimeout(()=>s.textContent='',2500);
  });
});`;

    contentJs = `// Extensio.ai Extension — Content Script\n(function(){\n  console.log('[Extensio.ai] Extension loaded on: ' + window.location.hostname);\n})();`;
    manifest.content_scripts = [{ matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_end' }];
  }

  const files = [
    { path: 'manifest.json', content: JSON.stringify({ ...manifest, _rules: undefined }, null, 2) },
    { path: 'popup.html', content: popupHtml },
    { path: 'popup.js', content: popupJs },
  ];

  if (contentJs) files.push({ path: 'content.js', content: contentJs });
  if (backgroundJs) files.push({ path: 'background.js', content: backgroundJs });

  if (isAdBlock && manifest._rules) {
    files.push({ path: 'rules.json', content: manifest._rules });
  }

  // Assign beautifully matching solid gradient colored PNG icons dynamically
  let r = 99, g = 102, b = 241;
  if (isDarkMode) { r = 139; g = 92; b = 246; }
  else if (isAdBlock) { r = 244; g = 114; b = 182; }
  else if (isTimer) { r = 245; g = 158; b = 11; }
  else if (isRedSquare) { r = 244; g = 63; b = 94; }
  else if (isTabManager) { r = 96; g = 165; b = 250; }
  else if (isNotes) { r = 167; g = 139; b = 250; }

  files.push({ path: 'icons/icon16.png', content: generatePng(16, 16, r, g, b) });
  files.push({ path: 'icons/icon48.png', content: generatePng(48, 48, r, g, b) });
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
    if (!job) throw new Error('Job not found');
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
