// ==UserScript==
// @name         VortixWorld Lootlinks Bypass
// @namespace    afklolbypasser
// @version      7.5
// @description  Bypass lootllinks with integrated features
// @author       afk.l0l
// @match        *://loot-link.com/s?*
// @match        *://loot-links.com/s?*
// @match        *://lootlink.org/s?*
// @match        *://lootlinks.co/s?*
// @match        *://lootdest.info/s?*
// @match        *://lootdest.org/s?*
// @match        *://lootdest.com/s?*
// @match        *://links-loot.com/s?*
// @match        *://linksloot.net/s?*
// @match        *://*/*
// @icon         https://i.ibb.co/cKy9ztXL/IMG-3412.png
// @grant        none
// @license      MIT
// @run-at       document-start
// ==/UserScript==

(function () {
'use strict';

const ALLOWED_HOSTS = [
'loot-link.com',
'loot-links.com',
'lootlink.org',
'lootlinks.co',
'lootdest.info',
'lootdest.org',
'lootdest.com',
'links-loot.com',
'linksloot.net'
];

const hostname = window.location.hostname || '';
const isLootHost = ALLOWED_HOSTS.includes(hostname);

if (!isLootHost) {
return;
}

const Logger = {
log: (m, d = '') => console.log(`[VortixBypass] ${m}`, d || ''),
info: (m, d = '') => console.info(`[VortixBypass] ${m}`, d || ''),
warn: (m, d = '') => console.warn(`[VortixBypass] ${m}`, d || ''),
error: (m, d = '') => console.error(`[VortixBypass] ${m}`, d || '')
};

const state = {
uiInjected: false,
bypassSuccessful: false,
decodedUrl: null,
processStartTime: Date.now()
};

function decodeURIxor(encodedString, prefixLength = 5) {
let decodedString = '';
const base64Decoded = atob(encodedString);
const prefix = base64Decoded.substring(0, prefixLength);
const encodedPortion = base64Decoded.substring(prefixLength);

for (let i = 0; i < encodedPortion.length; i++) {
const encodedChar = encodedPortion.charCodeAt(i);
const prefixChar = prefix.charCodeAt(i % prefix.length);
const decodedChar = encodedChar ^ prefixChar;
decodedString += String.fromCharCode(decodedChar);
}
return decodedString;
}

const modernCSS = `:root{--primary:#8b5cf6;--accent:#fbbf24;--darker:#0f172a;--light:#f8fafc;--gray:#94a3b8;--success:#10b981;--warning:#f59c00}*{box-sizing:border-box}#modern-bypass-overlay{position:fixed;inset:0;background:rgba(15,23,42,.95);backdrop-filter:blur(12px);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;animation:fadeIn .4s cubic-bezier(.16,1,.3,1);padding:20px;overflow:hidden}@keyframes fadeIn{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}.bypass-container{background:linear-gradient(145deg,#2e1065 0%,#4c1d95 100%);border:1px solid rgba(139,92,246,.3);border-radius:24px;padding:clamp(20px,5vw,32px);max-width:480px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,.5),0 0 30px rgba(139,92,246,.15);text-align:center;position:relative;display:flex;flex-direction:column;align-items:center}.bypass-container::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--primary),var(--accent));opacity:.9}.logo-section{z-index:1;margin-bottom:1.5rem;display:flex;flex-direction:column;align-items:center;gap:12px;flex-shrink:0}.logo-icon{width:clamp(56px,12vw,72px);height:clamp(56px,12vw,72px);display:flex;align-items:center;justify-content:center;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,var(--primary) 0%,var(--accent) 100%);padding:0;flex-shrink:0;box-shadow:0 10px 15px -3px rgba(139,92,246,.4)}.logo-icon img{width:60%;height:60%;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2))}.logo-text{font-size:clamp(18px,4vw,24px);font-weight:800;background:linear-gradient(to right,#fff,#e9d5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-.5px;text-transform:uppercase}.status-text{color:#e9d5ff;font-size:clamp(14px,2.5vw,16px);margin:12px 0;line-height:1.5;font-weight:500}.progress-ring{width:clamp(120px,35vw,190px);height:clamp(120px,35vw,190px);margin:20px auto;position:relative;filter:drop-shadow(0 0 10px rgba(139,92,246,.3));flex-shrink:0;transition:opacity .3s ease}.progress-ring.hidden{opacity:0;pointer-events:none;display:none}.progress-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.progress-ring-circle{fill:none;stroke:rgba(255,255,255,.05);stroke-width:10}.progress-ring-circle-progress{fill:none;stroke:url(#gradient);stroke-width:10;stroke-linecap:round;stroke-dasharray:565.48;stroke-dashoffset:565.48;transition:stroke-dashoffset .4s linear,stroke .3s ease}.progress-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:clamp(24px,7vw,42px);font-weight:800;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.3)}.progress-label{position:absolute;top:72%;left:50%;transform:translateX(-50%);font-size:clamp(11px,2.5vw,14px);color:var(--accent);text-transform:uppercase;letter-spacing:1px;font-weight:600}.task-type{background:rgba(255,255,255,.03);border:1px solid rgba(251,191,36,.2);border-radius:16px;padding:14px;margin:16px 0;display:flex;align-items:center;gap:16px;justify-content:center;width:100%;box-sizing:border-box}.task-icon{width:44px;height:44px;background:rgba(139,92,256,.15);border:1px solid rgba(139,92,246,.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}.task-info h4{color:#fff;font-size:15px;font-weight:700;margin-bottom:2px}.task-info p{color:var(--gray);font-size:13px;margin:0}.loading-dots{display:inline-flex;gap:4px;margin-left:6px}.loading-dots span{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:dotPulse 1.2s infinite ease-in-out}.loading-dots span:nth-child(1){animation-delay:0s}.loading-dots span:nth-child(2){animation-delay:.2s}.loading-dots span:nth-child(3){animation-delay:.4s}@keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1.2);opacity:1}}.footer-note{color:var(--gray);font-size:12px;margin-top:16px;opacity:.7}.bypass-notification{position:fixed !important;top:calc(16px + env(safe-area-inset-top,0px));right:16px;max-width:calc(100% - 32px);min-width:280px;z-index:2147483647 !important;border-radius:16px;padding:16px;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;box-shadow:0 20px 25px -5px rgba(0,0,0,.5),0 10px 10px -5px rgba(0,0,0,.3);color:white;backdrop-filter:blur(8px);transform:translateX(120%);opacity:0;transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s ease;border:1px solid var(--primary);margin-bottom:8px}.notification-container{position:fixed !important;top:calc(16px + env(safe-area-inset-top,0px));right:16px;z-index:2147483647 !important;display:flex;flex-direction:column;gap:8px;pointer-events:none}.notification-container .bypass-notification{pointer-events:all;margin-bottom:0}.result-container{display:none;flex-direction:column;width:100%;margin-top:20px;animation:slideUp .5s ease forwards}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.result-time{color:var(--accent);font-weight:700;margin-bottom:10px;font-size:14px}.url-display-box{background:rgba(0,0,0,.3);border:1px solid rgba(139,92,246,.5);border-radius:8px;padding:12px;color:#fff;font-family:'Courier New',monospace;font-size:13px;word-break:break-all;text-align:left;max-height:100px;overflow-y:auto;margin-bottom:12px;line-height:1.4}.action-btn{background:linear-gradient(90deg,var(--primary),var(--accent));color:#fff;border:none;padding:12px 24px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;width:100%;transition:transform .2s,opacity .2s;box-shadow:0 4px 12px rgba(139,92,246,.3)}.action-btn:hover{opacity:.9;transform:translateY(-1px)}.action-btn:active{transform:translateY(1px)}.link-display{background:rgba(255,255,255,.05);border:1px solid rgba(139,92,246,.3);border-radius:12px;padding:12px;margin:16px 0;word-break:break-all;text-align:left;font-family:'Courier New',monospace;font-size:12px;color:var(--accent);max-height:100px;overflow-y:auto}.copy-button{background:linear-gradient(135deg,var(--primary) 0%,var(--accent) 100%);border:none;border-radius:12px;padding:12px 24px;color:white;font-weight:700;cursor:pointer;margin-top:8px;transition:all .3s ease;display:inline-flex;align-items:center;gap:8px}.copy-button:hover{transform:translateY(-2px);box-shadow:0 10px 15px -3px rgba(139,92,246,.4)}.copy-button:active{transform:translateY(0)}.copy-button.copied{background:var(--success)}.timer-display{color:var(--accent);font-size:14px;margin-top:8px;font-weight:600}.lshfglg > *:not(#modern-bypass-overlay){display:none !important}.rew_loader{display:none !important}@media (max-width:480px){.bypass-container{border-radius:20px;padding:24px 16px}.logo-text{font-size:18px}.task-type{gap:12px;padding:12px}.task-info h4{font-size:14px}.progress-text{font-size:32px}}`;

(function insertStyle() {
try {
const s = document.createElement('style');
s.id = 'vortix-modern-style';
s.textContent = modernCSS;
if (document && document.head) {
document.head.appendChild(s);
}
} catch (e) {
Logger.warn('Could not insert CSS', e);
}
})();

const NotificationSystem = {
show: function (title, message, type = 'info', timeout = 3500) {
try {
let container = document.querySelector('.notification-container');
if (!container) {
container = document.createElement('div');
container.className = 'notification-container';
document.body.appendChild(container);
}

const colors = {
info: { bg: 'rgba(30, 27, 75, 0.95)', border: '#8b5cf6' },
success: { bg: 'rgba(6, 78, 59, 0.95)', border: '#10b981' },
warning: { bg: 'rgba(113, 63, 18, 0.95)', border: '#f59c00' },
error: { bg: 'rgba(127, 29, 29, 0.95)', border: '#ef4444' }
};
const c = colors[type] || colors.info;
const id = 'bypass-notif-' + Date.now();

const html = `
<div id="${id}" class="bypass-notification" style="background:${c.bg}; border:1px solid ${c.border};">
<div style="display:flex;gap:12px;align-items:center;">
<div style="font-weight:700; font-size:15px; min-width: 80px;">${title}</div>
<div style="flex:1;color:rgba(255,255,255,0.9);font-weight:400;text-align:right; font-size:14px;">${message}</div>
</div>
</div>
`;

container.insertAdjacentHTML('beforeend', html);
const el = document.getElementById(id);

requestAnimationFrame(() => {
el.style.transform = 'translateX(0)';
el.style.opacity = '1';
});

setTimeout(() => {
el.style.transform = 'translateX(120%)';
el.style.opacity = '0';
setTimeout(() => el.remove(), 400);
}, timeout);

Logger.info(`Notification: ${title} — ${message}`);
} catch (e) {
Logger.error('Notification failed', e);
}
}
};

function copyToClipboard(text) {
if (navigator.clipboard && window.isSecureContext) {
navigator.clipboard.writeText(text).then(() => {
NotificationSystem.show('Copied!', 'Link copied to clipboard', 'success', 2000);
}).catch(err => {
Logger.error('Clipboard API failed', err);
fallbackCopy(text);
});
} else {
fallbackCopy(text);
}
}

function fallbackCopy(text) {
const textArea = document.createElement("textarea");
textArea.value = text;
textArea.style.position = "fixed";
textArea.style.left = "-9999px";
textArea.style.top = "0";
document.body.appendChild(textArea);
textArea.focus();
textArea.select();
try {
const successful = document.execCommand('copy');
if (successful) {
NotificationSystem.show('Copied!', 'Link copied to clipboard', 'success', 2000);
} else {
NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
}
} catch (err) {
Logger.error('Fallback copy failed', err);
NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
}
document.body.removeChild(textArea);
}

function handleBypassSuccess(url, time) {
const overlay = document.getElementById('modern-bypass-overlay');
if (!overlay) return;

const ring = overlay.querySelector('.progress-ring');
if (ring) ring.classList.add('hidden');

const status = overlay.querySelector('.status-text');
if (status) status.innerHTML = '🎉 Link Decoded Successfully!';

const dots = overlay.querySelector('.loading-dots');
if (dots) dots.style.display = 'none';

const taskInfo = overlay.querySelector('.task-type');
if (taskInfo) taskInfo.style.display = 'none';

const footer = overlay.querySelector('.footer-note');
if (footer) footer.textContent = 'Your link is ready below';

let resultDiv = overlay.querySelector('.result-container');
if (!resultDiv) {
resultDiv = document.createElement('div');
resultDiv.className = 'result-container';
const container = overlay.querySelector('.bypass-container');
if (container) container.appendChild(resultDiv);
}

resultDiv.innerHTML = `
<div class="result-time">Time Taken: ${time}s</div>
<div class="url-display-box">${url}</div>
<button class="action-btn" id="copy-link-btn">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>
Copy Link
</button>
`;
resultDiv.style.display = 'flex';

const btn = resultDiv.querySelector('#copy-link-btn');
if (btn) {
btn.onclick = () => copyToClipboard(url);
}

state.decodedUrl = url;
state.bypassSuccessful = true;
}

function updateUI() {
try {
const overlay = document.getElementById('modern-bypass-overlay');
if (!overlay) return;

const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2);

const status = overlay.querySelector('.status-text');
if (status) status.innerHTML = '🎉 Link Decoded Successfully!';

const dots = overlay.querySelector('.loading-dots');
if (dots) dots.style.display = 'none';

const footer = overlay.querySelector('.footer-note');
if (footer) footer.textContent = 'Your link is ready below';

const ring = overlay.querySelector('.progress-ring');
if (ring) ring.classList.add('hidden');

const taskInfo = overlay.querySelector('.task-type');
if (taskInfo) taskInfo.style.display = 'none';

let resultDiv = overlay.querySelector('.result-container');
if (!resultDiv) {
resultDiv = document.createElement('div');
resultDiv.className = 'result-container';
const container = overlay.querySelector('.bypass-container');
if (container) container.appendChild(resultDiv);
}

resultDiv.innerHTML = `
<div class="result-time">Time Taken: ${duration}s</div>
<div class="url-display-box">${state.decodedUrl}</div>
<button class="action-btn" id="copy-link-btn">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>
Copy Link
</button>
`;
resultDiv.style.display = 'flex';

const btn = resultDiv.querySelector('#copy-link-btn');
if (btn) {
btn.onclick = () => copyToClipboard(state.decodedUrl);
}
} catch (e) {
Logger.error('UI update failed', e);
}
}

function updateUIStatus(text, icon = '🔓') {
try {
const statusEl = document.querySelector('#modern-bypass-overlay .status-text');
if (statusEl) {
statusEl.innerHTML = `${text} <span class="loading-dots"><span></span><span></span><span></span></span>`;
}

const iconEl = document.querySelector('.task-type div[style*="font-size: 22px"]');
if (iconEl) {
iconEl.textContent = icon;
}

const taskNameEl = document.querySelector('.task-type h4');
if (taskNameEl) {
taskNameEl.textContent = text;
}
} catch (e) {
Logger.error('updateUIStatus error', e);
}
}

(function fetchOverride() {
const originalFetch = window.fetch;

window.fetch = function (url, config) {
try {
const urlStr = (typeof url === 'string') ? url : (url && url.url) ? url.url : '';

if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined') {
return originalFetch(url, config);
}

if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
Logger.log('Intercepted incentive syncer fetch', urlStr);

return originalFetch(url, config).then(response => {
if (!response.ok) return response;

return response.clone().json().then(data => {
let urid = '';
let task_id = '';
let action_pixel_url = '';

try {
data.forEach(item => {
urid = item.urid;
task_id = 54;
action_pixel_url = item.action_pixel_url;
});
} catch (e) { Logger.warn('Incentive fetch JSON shape unexpected', e); }

try {
if (typeof KEY === 'undefined' || typeof TID === 'undefined') {
Logger.warn('Required global variables (KEY, or TID) are missing. Aborting custom logic.');
return response;
}

const wsUrl = `wss://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`;
Logger.log('Opening WebSocket to', wsUrl);

const ws = new WebSocket(wsUrl);
let wsTimeout;

ws.onopen = () => {
ws.send('0');
wsTimeout = setTimeout(() => {
Logger.warn('WebSocket timed out waiting for link. Closing connection.');
ws.close();
}, 90000);
setInterval(() => ws.send('0'), 1000);
};

ws.onmessage = event => {
if (event.data && event.data.includes('r:')) {
const PUBLISHER_LINK = event.data.replace('r:', '');
Logger.info('PUBLISHER_LINK received via WS', PUBLISHER_LINK);

if (typeof PUBLISHER_LINK !== 'undefined' && PUBLISHER_LINK) {
try {
const finalUrl = decodeURIComponent(decodeURIxor(PUBLISHER_LINK));
clearTimeout(wsTimeout);
ws.close();

const endTime = Date.now();
const duration = ((endTime - state.processStartTime) / 1000).toFixed(2);

state.decodedUrl = finalUrl;
updateUI();
handleBypassSuccess(finalUrl, duration);
} catch (e) {
Logger.error('Error processing bypass result', e);
NotificationSystem.show('Decode Error', 'Falling back to alternate method', 'warning', 3000);
}
}
}
};

try {
navigator.sendBeacon(`https://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`);
} catch (e) {}

if (action_pixel_url) fetch(action_pixel_url).catch(() => { });
fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`).catch(() => { });

ws.onclose = () => {
clearTimeout(wsTimeout);
};

} catch (e) { Logger.error('WebSocket handling failed', e); }

return new Response(JSON.stringify(data), {
status: response.status,
statusText: response.statusText,
headers: response.headers
});
}).catch(err => {
Logger.warn('Failed to parse incentive fetch response JSON', err);
return response;
});
}).catch(err => {
Logger.warn('Original fetch for incentive endpoint failed', err);
return originalFetch(url, config);
});
}
} catch (e) { Logger.error('Error in custom fetch override check', e); }

return originalFetch(url, config);
};

Logger.log('Fetch overridden to intercept incentive endpoints.');
})();

function detectTaskInfo() {
let countdownSeconds = 60;
let taskName = 'Processing';
let taskIcon = '🔓';

try {
const images = document.querySelectorAll('img');
for (let img of images) {
const src = (img.src || '').toLowerCase();
if (src.includes('eye.png')) {
countdownSeconds = 13; taskName = 'View Content'; taskIcon = '👁️'; break;
} else if (src.includes('bell.png')) {
countdownSeconds = 30; taskName = 'Notification'; taskIcon = '🔔'; break;
} else if (src.includes('apps.png') || src.includes('fire.png')) {
countdownSeconds = 60; taskName = 'App Install'; taskIcon = '⬇️'; break;
} else if (src.includes('gamers.png')) {
countdownSeconds = 90; taskName = 'Gaming Offer'; taskIcon = '🎮'; break;
}
}
} catch (e) {
Logger.warn('Error detecting task info', e);
}
return { countdownSeconds, taskName, taskIcon };
}

function modifyParentElement(targetElement) {
const parentElement = targetElement.parentElement;
if (!parentElement) return;

Logger.log('Modifying parent element to show modern UI', targetElement);
const { countdownSeconds, taskName, taskIcon } = detectTaskInfo();

state.processStartTime = Date.now();

parentElement.innerHTML = '';

const popupHTML = `
<div id="modern-bypass-overlay">
<div class="bypass-container" role="dialog" aria-modal="true">
<div class="logo-section">
<div class="logo-icon">
<img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="logo">
</div>
<div class="logo-text">LootLabs Bypass</div>
</div>
<div class="status-text">Processing your request <span class="loading-dots"><span></span><span></span><span></span></span></div>
<div class="task-type">
<div class="task-icon">${taskIcon}</div>
<div class="task-info">
<h4>${taskName}</h4>
<p>Estimated wait time: ${countdownSeconds} seconds</p>
</div>
</div>
<div class="progress-ring" aria-hidden="true">
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stop-color="var(--primary)"/>
<stop offset="100%" stop-color="var(--accent)"/>
</linearGradient>
</defs>
<circle class="progress-ring-circle" cx="100" cy="100" r="90"></circle>
<circle class="progress-ring-circle-progress" id="progress-circle" cx="100" cy="100" r="90"></circle>
</svg>
<div class="progress-text" id="countdown-display">${countdownSeconds}</div>
<div class="progress-label">seconds</div>
</div>
<div class="result-container"></div>
<div class="footer-note">Please wait while we process your request</div>
</div>
</div>
`;
parentElement.insertAdjacentHTML('afterbegin', popupHTML);

try {
const progressCircle = document.getElementById('progress-circle');
const countdownDisplay = document.getElementById('countdown-display');
const radius = 90;
const circumference = 2 * Math.PI * radius;

if (progressCircle) progressCircle.style.strokeDasharray = circumference.toString();

let remaining = countdownSeconds;
const updateInterval = 1000;

if (countdownDisplay) countdownDisplay.textContent = remaining;

const timer = setInterval(() => {
remaining--;
if (countdownDisplay) countdownDisplay.textContent = remaining > 0 ? remaining : '0';

if (progressCircle) {
const progress = Math.max(0, Math.min(1, (countdownSeconds - remaining) / countdownSeconds));
const offset = circumference - (progress * circumference);
progressCircle.style.strokeDashoffset = offset;
}

if (remaining <= 0) {
clearInterval(timer);
}
}, updateInterval);

} catch (e) {
Logger.error('Countdown logic failed', e);
}
}

function initUIAndObserver() {
Logger.info('DOM Loaded. Initializing UI and Observer.');

const setupObserver = () => {
const observer = new MutationObserver((mutationsList, observerRef) => {
for (const mutation of mutationsList) {
if (mutation.type === 'childList' && mutation.addedNodes.length) {
for (const node of mutation.addedNodes) {
if (node.nodeType === 1) {
if (node.textContent && (node.textContent.includes('UNLOCK CONTENT') || node.textContent.includes('Unlock Content'))) {
Logger.info('Unlock content element found in added node - showing UI', node);
modifyParentElement(node);
observerRef.disconnect();
return;
}
const foundChild = Array.from(node.querySelectorAll('*')).find(el =>
el.textContent && (el.textContent.includes('UNLOCK CONTENT') || el.textContent.includes('Unlock Content'))
);
if (foundChild) {
Logger.info('Unlock content element found in child node - showing UI', foundChild);
modifyParentElement(foundChild);
observerRef.disconnect();
return;
}
}
}
}
}
});

observer.observe(document.body, { childList: true, subtree: true });
Logger.info('MutationObserver started, monitoring for unlock content...');
};

setupObserver();
}

Logger.info('VortixWorld Bypass script initialized on loot host.');

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initUIAndObserver);
} else {
initUIAndObserver();
}

})();
