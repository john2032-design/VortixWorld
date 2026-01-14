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

const CONFIG = Object.freeze({
WS_TIMEOUT: 90000,
HEARTBEAT_INTERVAL: 1000,
MAX_RECONNECT_DELAY: 30000,
INITIAL_RECONNECT_DELAY: 1000,
FETCH_TIMEOUT: 30000,
COUNTDOWN_INTERVAL: 1000,
NOTIFICATION_TIMEOUT: 3500,
MAX_DECODE_RETRIES: 3,
MAX_FETCH_RETRIES: 3
});

const Logger = {
info: (m, d = '') => console.info(`[INFO] [VortixBypass] ${m}`, d || ''),
warn: (m, d = '') => console.warn(`[WARN] [VortixBypass] ${m}`, d || ''),
error: (m, d = '') => console.error(`[ERROR] [VortixBypass] ${m}`, d || '')
};

Logger.info('Script start and initialization time', new Date().toISOString());

const hostname = window.location.hostname || '';
Logger.info('Current hostname and full page url', `${hostname} - ${window.location.href}`);

const isLootHost = ALLOWED_HOSTS.includes(hostname);
Logger.info('Allowed host check result', isLootHost ? 'Loot host confirmed' : 'Not a loot host');

if (!isLootHost) {
Logger.info('Reason for early exit', 'Hostname not in allowed list - exiting script');
return;
}

const DOMCache = new Map();
const perf = {
marks: new Map(),
mark(name) {
this.marks.set(name, performance.now());
},
measure(start, end) {
return this.marks.get(end) - this.marks.get(start);
}
};

const state = {
uiInjected: false,
bypassSuccessful: false,
decodedUrl: null,
processStartTime: Date.now()
};

function getCachedElement(selector, context = document) {
const key = `${context}-${selector}`;
if (!DOMCache.has(key)) {
DOMCache.set(key, context.querySelector(selector));
}
return DOMCache.get(key);
}

function clearDOMCache() {
DOMCache.clear();
}

const cleanupManager = {
intervals: new Set(),
timeouts: new Set(),
listeners: new Map(),
setInterval: function(fn, delay, ...args) {
const id = setInterval(fn, delay, ...args);
this.intervals.add(id);
return id;
},
setTimeout: function(fn, delay, ...args) {
const id = setTimeout(() => {
this.timeouts.delete(id);
fn(...args);
}, delay);
this.timeouts.add(id);
return id;
},
clearAll: function() {
this.intervals.forEach(id => clearInterval(id));
this.timeouts.forEach(id => clearTimeout(id));
this.intervals.clear();
this.timeouts.clear();
clearDOMCache();
Logger.info('Observer disconnected cleanly', 'All resources cleaned');
}
};

let isShutdown = false;

function shutdown() {
if (isShutdown) return;
isShutdown = true;
cleanupManager.clearAll();
if (window.bypassObserver) {
window.bypassObserver.disconnect();
window.bypassObserver = null;
Logger.info('MutationObserver stopped', 'Clean shutdown');
}
if (window.activeWebSocket) {
window.activeWebSocket.disconnect();
window.activeWebSocket = null;
Logger.info('WebSocket disconnected', 'Clean shutdown');
}
Logger.info('Shutdown complete', 'All processes stopped');
}

class RobustWebSocket {
constructor(url, options = {}) {
this.url = url;
this.reconnectDelay = options.initialDelay || CONFIG.INITIAL_RECONNECT_DELAY;
this.maxDelay = options.maxDelay || CONFIG.MAX_RECONNECT_DELAY;
this.heartbeatInterval = options.heartbeat || CONFIG.HEARTBEAT_INTERVAL;
this.maxRetries = options.maxRetries || 5;
this.ws = null;
this.reconnectTimeout = null;
this.heartbeatTimer = null;
this.retryCount = 0;
}

connect() {
if (isShutdown) return;
try {
this.ws = new WebSocket(this.url);
this.ws.onopen = () => this.onOpen();
this.ws.onmessage = (e) => this.onMessage(e);
this.ws.onclose = () => this.handleReconnect();
this.ws.onerror = (e) => this.onError(e);
} catch (e) {
Logger.error('Unhandled exception thrown', e);
Logger.error('WebSocket fatal error', e);
this.handleReconnect();
}
}

onOpen() {
if (isShutdown) return;
Logger.info('WebSocket connection opened', this.url);
this.retryCount = 0;
this.reconnectDelay = CONFIG.INITIAL_RECONNECT_DELAY;
if (this.reconnectTimeout) {
clearTimeout(this.reconnectTimeout);
cleanupManager.timeouts.delete(this.reconnectTimeout);
this.reconnectTimeout = null;
}
this.sendHeartbeat();
this.heartbeatTimer = cleanupManager.setInterval(() => {
if (this.ws && this.ws.readyState === WebSocket.OPEN) {
this.sendHeartbeat();
} else {
clearInterval(this.heartbeatTimer);
}
}, this.heartbeatInterval);
}

sendHeartbeat() {
if (this.ws && this.ws.readyState === WebSocket.OPEN) {
this.ws.send('0');
Logger.info('WebSocket heartbeat sent', 'Keepalive');
}
}

handleReconnect() {
if (isShutdown) return;
if (this.heartbeatTimer) {
clearInterval(this.heartbeatTimer);
cleanupManager.intervals.delete(this.heartbeatTimer);
this.heartbeatTimer = null;
}
if (this.retryCount >= this.maxRetries) {
Logger.error('WebSocket fatal error', 'Max retries exceeded');
Logger.error('Bypass failed with no result', 'WebSocket exhausted all retries');
return;
}
this.retryCount++;
const delay = Math.min(this.reconnectDelay * Math.pow(2, this.retryCount - 1), this.maxDelay);
Logger.warn('WebSocket connection slow to open', `Retry ${this.retryCount} in ${delay}ms`);
Logger.warn('Retry attempt triggered', 'Reconnecting...');
this.reconnectTimeout = cleanupManager.setTimeout(() => {
Logger.info('WebSocket url opened', this.url);
this.connect();
}, delay);
}

onMessage(event) {
if (isShutdown) return;
Logger.info('WebSocket message received preview', event.data?.substring(0, 100));
Logger.info('WebSocket message length', event.data?.length);
if (event.data && event.data.includes('r:')) {
const PUBLISHER_LINK = event.data.replace('r:', '');
Logger.info('PUBLISHER_LINK received via WS', PUBLISHER_LINK.substring(0, 50) + '...');
if (PUBLISHER_LINK) {
perf.mark('decodeStart');
try {
Logger.info('Decode input length', PUBLISHER_LINK.length);
Logger.info('Decode prefix length', '5');
const finalUrl = decodeURIComponent(decodeURIxor(PUBLISHER_LINK));
perf.mark('decodeEnd');
Logger.info('Decode completed successfully', 'URL decoded successfully');
Logger.info('Decoded url preview masked', `${finalUrl.substring(0, 30)}...`);
Logger.info('Total bypass duration', `${perf.measure('decodeStart', 'decodeEnd').toFixed(2)}ms`);
this.disconnect();
const endTime = Date.now();
const duration = ((endTime - state.processStartTime) / 1000).toFixed(2);
state.decodedUrl = finalUrl;
updateUI();
handleBypassSuccess(finalUrl, duration);
} catch (e) {
Logger.error('Critical decode failure', e);
Logger.warn('Potential malformed encoded data', PUBLISHER_LINK);
NotificationSystem.show('Decode Error', 'Falling back to alternate method', 'warning', 3000);
}
}
}
}

onError(error) {
Logger.error('WebSocket fatal error', error);
Logger.warn('Network instability detected', 'WebSocket error occurred');
}

disconnect() {
if (this.heartbeatTimer) {
clearInterval(this.heartbeatTimer);
cleanupManager.intervals.delete(this.heartbeatTimer);
this.heartbeatTimer = null;
}
if (this.reconnectTimeout) {
clearTimeout(this.reconnectTimeout);
cleanupManager.timeouts.delete(this.reconnectTimeout);
this.reconnectTimeout = null;
}
if (this.ws) {
this.ws.close();
Logger.info('Observer disconnected cleanly', 'WebSocket disconnected');
}
}
}

function decodeURIxor(encodedString, prefixLength = 5) {
Logger.info('Decode process started', 'Starting XOR decode');
Logger.info('Decode input length', encodedString.length);
Logger.info('Decode prefix length', prefixLength);
try {
const base64Decoded = atob(encodedString);
const prefix = base64Decoded.substring(0, prefixLength);
const encodedPortion = base64Decoded.substring(prefixLength);
const prefixLen = prefix.length;
const decodedChars = new Array(encodedPortion.length);
for (let i = 0; i < encodedPortion.length; i++) {
const encodedChar = encodedPortion.charCodeAt(i);
const prefixChar = prefix.charCodeAt(i % prefixLen);
decodedChars[i] = String.fromCharCode(encodedChar ^ prefixChar);
}
const result = decodedChars.join('');
return result;
} catch (e) {
Logger.error('Critical decode failure', e);
Logger.warn('Potential malformed encoded data', encodedString.substring(0, 50));
throw e;
}
}

const modernCSS = `:root{--primary:#8b5cf6;--accent:#fbbf24;--darker:#0f172a;--light:#f8fafc;--gray:#94a3b8;--success:#10b981;--warning:#f59c00}*{box-sizing:border-box}#modern-bypass-overlay{position:fixed;inset:0;background:rgba(15,23,42,.95);backdrop-filter:blur(12px);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;animation:fadeIn .4s cubic-bezier(.16,1,.3,1);padding:20px;overflow:hidden}@keyframes fadeIn{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}.bypass-container{background:linear-gradient(145deg,#2e1065 0%,#4c1d95 100%);border:1px solid rgba(139,92,246,.3);border-radius:24px;padding:clamp(20px,5vw,32px);max-width:480px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,.5),0 0 30px rgba(139,92,246,.15);text-align:center;position:relative;display:flex;flex-direction:column;align-items:center}.bypass-container::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--primary),var(--accent));opacity:.9}.logo-section{z-index:1;margin-bottom:1.5rem;display:flex;flex-direction:column;align-items:center;gap:12px;flex-shrink:0}.logo-icon{width:clamp(56px,12vw,72px);height:clamp(56px,12vw,72px);display:flex;align-items:center;justify-content:center;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,var(--primary) 0%,var(--accent) 100%);padding:0;flex-shrink:0;box-shadow:0 10px 15px -3px rgba(139,92,246,.4)}.logo-icon img{width:60%;height:60%;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2))}.logo-text{font-size:clamp(18px,4vw,24px);font-weight:800;background:linear-gradient(to right,#fff,#e9d5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-.5px;text-transform:uppercase}.status-text{color:#e9d5ff;font-size:clamp(14px,2.5vw,16px);margin:12px 0;line-height:1.5;font-weight:500}.progress-ring{width:clamp(120px,35vw,190px);height:clamp(120px,35vw,190px);margin:20px auto;position:relative;filter:drop-shadow(0 0 10px rgba(139,92,246,.3));flex-shrink:0;transition:opacity .3s ease}.progress-ring.hidden{opacity:0;pointer-events:none;display:none}.progress-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.progress-ring-circle{fill:none;stroke:rgba(255,255,255,.05);stroke-width:10}.progress-ring-circle-progress{fill:none;stroke:url(#gradient);stroke-width:10;stroke-linecap:round;stroke-dasharray:565.48;stroke-dashoffset:565.48;transition:stroke-dashoffset .4s linear,stroke .3s ease}.progress-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:clamp(24px,7vw,42px);font-weight:800;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.3)}.progress-label{position:absolute;top:72%;left:50%;transform:translateX(-50%);font-size:clamp(11px,2.5vw,14px);color:var(--accent);text-transform:uppercase;letter-spacing:1px;font-weight:600}.task-type{background:rgba(255,255,255,.03);border:1px solid rgba(251,191,36,.2);border-radius:16px;padding:14px;margin:16px 0;display:flex;align-items:center;gap:16px;justify-content:center;width:100%;box-sizing:border-box}.task-icon{width:44px;height:44px;background:rgba(139,92,256,.15);border:1px solid rgba(139,92,246,.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}.task-info h4{color:#fff;font-size:15px;font-weight:700;margin-bottom:2px}.task-info p{color:var(--gray);font-size:13px;margin:0}.loading-dots{display:inline-flex;gap:4px;margin-left:6px}.loading-dots span{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:dotPulse 1.2s infinite ease-in-out}.loading-dots span:nth-child(1){animation-delay:0s}.loading-dots span:nth-child(2){animation-delay:.2s}.loading-dots span:nth-child(3){animation-delay:.4s}@keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1.2);opacity:1}}.footer-note{color:var(--gray);font-size:12px;margin-top:16px;opacity:.7}.bypass-notification{position:fixed !important;top:calc(16px + env(safe-area-inset-top,0px));right:16px;max-width:calc(100% - 32px);min-width:280px;z-index:2147483647 !important;border-radius:16px;padding:16px;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;box-shadow:0 20px 25px -5px rgba(0,0,0,.5),0 10px 10px -5px rgba(0,0,0,.3);color:white;backdrop-filter:blur(8px);transform:translateX(120%);opacity:0;transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s ease;border:1px solid var(--primary);margin-bottom:8px}.notification-container{position:fixed !important;top:calc(16px + env(safe-area-inset-top,0px));right:16px;z-index:2147483647 !important;display:flex;flex-direction:column;gap:8px;pointer-events:none}.notification-container .bypass-notification{pointer-events:all;margin-bottom:0}.result-container{display:none;flex-direction:column;width:100%;margin-top:20px;animation:slideUp .5s ease forwards}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.result-time{color:var(--accent);font-weight:700;margin-bottom:10px;font-size:14px}.url-display-box{background:rgba(0,0,0,.3);border:1px solid rgba(139,92,246,.5);border-radius:8px;padding:12px;color:#fff;font-family:'Courier New',monospace;font-size:13px;word-break:break-all;text-align:left;max-height:100px;overflow-y:auto;margin-bottom:12px;line-height:1.4}.action-btn{background:linear-gradient(90deg,var(--primary),var(--accent));color:#fff;border:none;padding:12px 24px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;width:100%;transition:transform .2s,opacity .2s;box-shadow:0 4px 12px rgba(139,92,246,.3)}.action-btn:hover{opacity:.9;transform:translateY(-1px)}.action-btn:active{transform:translateY(1px)}.link-display{background:rgba(255,255,255,.05);border:1px solid rgba(139,92,246,.3);border-radius:12px;padding:12px;margin:16px 0;word-break:break-all;text-align:left;font-family:'Courier New',monospace;font-size:12px;color:var(--accent);max-height:100px;overflow-y:auto}.copy-button{background:linear-gradient(135deg,var(--primary) 0%,var(--accent) 100%);border:none;border-radius:12px;padding:12px 24px;color:white;font-weight:700;cursor:pointer;margin-top:8px;transition:all .3s ease;display:inline-flex;align-items:center;gap:8px}.copy-button:hover{transform:translateY(-2px);box-shadow:0 10px 15px -3px rgba(139,92,246,.4)}.copy-button:active{transform:translateY(0)}.copy-button.copied{background:var(--success)}.timer-display{color:var(--accent);font-size:14px;margin-top:8px;font-weight:600}.lshfglg > *:not(#modern-bypass-overlay){display:none !important}.rew_loader{display:none !important}@media (max-width:480px){.bypass-container{border-radius:20px;padding:24px 16px}.logo-text{font-size:18px}.task-type{gap:12px;padding:12px}.task-info h4{font-size:14px}.progress-text{font-size:32px}}`;

(function insertStyle() {
try {
const s = document.createElement('style');
s.id = 'vortix-modern-style';
s.textContent = modernCSS;
if (document && document.head) {
document.head.appendChild(s);
Logger.info('Style injection success and style size', `${modernCSS.length} characters`);
}
} catch (e) {
Logger.warn('Style injection failed but continuing', e);
}
})();

const NotificationSystem = {
show: function (title, message, type = 'info', timeout = CONFIG.NOTIFICATION_TIMEOUT) {
try {
let container = getCachedElement('.notification-container');
if (!container) {
container = document.createElement('div');
container.className = 'notification-container';
document.body.appendChild(container);
DOMCache.set('notification-container', container);
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
const firstTimeout = cleanupManager.setTimeout(() => {
el.style.transform = 'translateX(120%)';
el.style.opacity = '0';
const secondTimeout = cleanupManager.setTimeout(() => el.remove(), 400);
}, timeout);
Logger.info('Notification shown to user', `${title} — ${message}`);
} catch (e) {
Logger.error('UI overlay failed to render', e);
}
}
};

function copyToClipboard(text) {
Logger.info('Clipboard copy attempt', text);
if (navigator.clipboard && window.isSecureContext) {
navigator.clipboard.writeText(text).then(() => {
Logger.info('Clipboard copy success', 'Copied to clipboard');
NotificationSystem.show('Copied!', 'Link copied to clipboard', 'success', 2000);
}).catch(err => {
Logger.error('Clipboard copy failed completely', err);
Logger.warn('Clipboard api unavailable using fallback', 'Falling back to textarea method');
fallbackCopy(text);
});
} else {
Logger.warn('Clipboard api unavailable using fallback', 'Secure context or API not available');
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
Logger.info('Clipboard copy success', 'Copied via fallback');
NotificationSystem.show('Copied!', 'Link copied to clipboard', 'success', 2000);
} else {
Logger.error('Clipboard copy failed completely', 'execCommand returned false');
NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
}
} catch (err) {
Logger.error('Clipboard copy failed completely', err);
NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
}
document.body.removeChild(textArea);
}

function handleBypassSuccess(url, time) {
Logger.info('Bypass completed successfully', { url, time });
Logger.info('UI state updated', 'Rendering success UI');
const overlay = getCachedElement('#modern-bypass-overlay');
if (!overlay) {
Logger.warn('UI element not found using primary selector', 'modern-bypass-overlay not found');
return;
}
const ring = getCachedElement('.progress-ring', overlay);
if (ring) ring.classList.add('hidden');
const status = getCachedElement('.status-text', overlay);
if (status) status.innerHTML = '🎉 Link Decoded Successfully!';
const dots = getCachedElement('.loading-dots', overlay);
if (dots) dots.style.display = 'none';
const taskInfo = getCachedElement('.task-type', overlay);
if (taskInfo) taskInfo.style.display = 'none';
const footer = getCachedElement('.footer-note', overlay);
if (footer) footer.textContent = 'Your link is ready below';
let resultDiv = getCachedElement('.result-container', overlay);
if (!resultDiv) {
resultDiv = document.createElement('div');
resultDiv.className = 'result-container';
const container = getCachedElement('.bypass-container', overlay);
if (container) container.appendChild(resultDiv);
DOMCache.set(`${overlay}-.result-container`, resultDiv);
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
shutdown();
}

function updateUI() {
Logger.info('UI state updated', 'Updating UI with decoded URL');
try {
const overlay = getCachedElement('#modern-bypass-overlay');
if (!overlay) {
Logger.warn('UI element not found using primary selector', 'modern-bypass-overlay not found');
return;
}
const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2);
const status = getCachedElement('.status-text', overlay);
if (status) status.innerHTML = '🎉 Link Decoded Successfully!';
const dots = getCachedElement('.loading-dots', overlay);
if (dots) dots.style.display = 'none';
const footer = getCachedElement('.footer-note', overlay);
if (footer) footer.textContent = 'Your link is ready below';
const ring = getCachedElement('.progress-ring', overlay);
if (ring) ring.classList.add('hidden');
const taskInfo = getCachedElement('.task-type', overlay);
if (taskInfo) taskInfo.style.display = 'none';
let resultDiv = getCachedElement('.result-container', overlay);
if (!resultDiv) {
resultDiv = document.createElement('div');
resultDiv.className = 'result-container';
const container = getCachedElement('.bypass-container', overlay);
if (container) container.appendChild(resultDiv);
DOMCache.set(`${overlay}-.result-container`, resultDiv);
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
Logger.error('UI overlay failed to render', e);
Logger.warn('Non fatal error recovered', 'UI update failed but continuing');
}
}

function updateUIStatus(text, icon = '🔓') {
Logger.info('UI state updated', `Status: ${text}, Icon: ${icon}`);
try {
const statusEl = getCachedElement('#modern-bypass-overlay .status-text');
if (statusEl) {
statusEl.innerHTML = `${text} <span class="loading-dots"><span></span><span></span><span></span></span>`;
}
const iconEl = getCachedElement('.task-type div[style*="font-size: 22px"]');
if (iconEl) {
iconEl.textContent = icon;
}
const taskNameEl = getCachedElement('.task-type h4');
if (taskNameEl) {
taskNameEl.textContent = text;
}
} catch (e) {
Logger.error('Type error accessing undefined value', e);
}
}

(function fetchOverride() {
const originalFetch = window.fetch;
Logger.info('Fetch request intercepted', 'Fetch override initialized');
window.fetch = function (url, config) {
try {
if (isShutdown) {
Logger.info('Bypass already completed, skipping fetch override');
return originalFetch(url, config);
}
const urlStr = (typeof url === 'string') ? url : (url && url.url) ? url.url : '';
Logger.info('Fetch request url summary', urlStr);
if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined') {
Logger.warn('Missing non critical global variable', 'INCENTIVE_SYNCER_DOMAIN or INCENTIVE_SERVER_DOMAIN undefined');
return originalFetch(url, config);
}
if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
return originalFetch(url, config).then(response => {
Logger.info('Fetch response status code', response.status);
Logger.info('Fetch response content type', response.headers.get('content-type'));
if (!response.ok) {
Logger.warn('Fetch returned non ok status', response.status);
return response;
}
return response.clone().json().then(data => {
Logger.info('Partial data parsed successfully', `Items: ${data?.length || 0}`);
let urid = '';
let task_id = '';
let action_pixel_url = '';
try {
data.forEach(item => {
urid = item.urid;
task_id = 54;
action_pixel_url = item.action_pixel_url;
});
} catch (e) {
Logger.warn('Unexpected json structure received', e);
}
try {
if (typeof KEY === 'undefined' || typeof TID === 'undefined') {
Logger.error('Required global variable missing', 'KEY or TID undefined');
Logger.error('Logic cannot continue execution', 'Missing required globals');
return response;
}
const wsUrl = `wss://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`;
Logger.info('WebSocket url opened', wsUrl);
const ws = new RobustWebSocket(wsUrl, {
initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
maxDelay: CONFIG.MAX_RECONNECT_DELAY,
heartbeat: CONFIG.HEARTBEAT_INTERVAL,
maxRetries: 3
});
window.activeWebSocket = ws;
ws.connect();
try {
const beaconUrl = `https://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`;
Logger.info('Beacon request attempted', beaconUrl);
navigator.sendBeacon(beaconUrl);
} catch (e) {
Logger.error('Beacon request failed critically', e);
Logger.error('Fatal initialization failure', 'Beacon failed');
}
if (action_pixel_url) {
Logger.info('Pixel request attempted', action_pixel_url);
fetch(action_pixel_url).catch(() => {
Logger.error('Pixel request failed critically', action_pixel_url);
Logger.error('Fatal initialization failure', 'Pixel request failed');
});
}
const tdUrl = `https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`;
Logger.info('Fetch request url summary', tdUrl);
fetch(tdUrl).catch(() => {
Logger.warn('Fetch timeout occurred', 'TD endpoint failed');
});
} catch (e) {
Logger.error('Unhandled exception thrown', e);
}
return new Response(JSON.stringify(data), {
status: response.status,
statusText: response.statusText,
headers: response.headers
});
}).catch(err => {
Logger.warn('Json parsing failed for required data', err);
Logger.warn('Partial data parsed successfully', 'JSON parse error but continuing');
return response;
});
}).catch(err => {
Logger.error('Fetch failed completely', err);
Logger.warn('Network instability detected', 'Fetch failed');
return originalFetch(url, config);
});
}
} catch (e) {
Logger.error('Unhandled exception thrown', e);
}
return originalFetch(url, config);
};
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
Logger.info('Detected task name', taskName);
Logger.info('Detected task icon', taskIcon);
Logger.info('Detected countdown duration', `${countdownSeconds} seconds`);
Logger.warn('Heuristic detection used', 'Task info detected from images');
if (window.self !== window.top) {
Logger.warn('Iframe or sandbox environment detected', 'Running in iframe');
}
} catch (e) {
Logger.warn('Error detecting task info', e);
Logger.error('Type error accessing undefined value', e);
}
return { countdownSeconds, taskName, taskIcon };
}

function modifyParentElement(targetElement) {
const parentElement = targetElement.parentElement;
if (!parentElement) {
Logger.warn('UI element not found using primary selector', 'Parent element not found');
Logger.warn('Fallback selector activated', 'No parent to inject into');
return;
}
Logger.info('UI overlay injected successfully', targetElement);
Logger.info('Parent element replaced for UI', parentElement);
const { countdownSeconds, taskName, taskIcon } = detectTaskInfo();
state.processStartTime = Date.now();
parentElement.innerHTML = '';
const popupHTML = `
<div id="modern-bypass-overlay">
<div class="bypass-container" role="dialog" aria-modal="true">
<div class="logo-section">
<div class="logo-icon">
<img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png " alt="logo">
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
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg ">
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
const progressCircle = getCachedElement('#progress-circle');
const countdownDisplay = getCachedElement('#countdown-display');
const radius = 90;
const circumference = 2 * Math.PI * radius;
if (progressCircle) progressCircle.style.strokeDasharray = circumference.toString();
let remaining = countdownSeconds;
if (countdownDisplay) countdownDisplay.textContent = remaining;
Logger.info('Countdown started', `${countdownSeconds} seconds`);
const timer = cleanupManager.setInterval(() => {
remaining--;
Logger.info('Countdown progress snapshot', `${remaining} seconds remaining`);
if (countdownDisplay) countdownDisplay.textContent = remaining > 0 ? remaining : '0';
if (progressCircle) {
const progress = Math.max(0, Math.min(1, (countdownSeconds - remaining) / countdownSeconds));
const offset = circumference - (progress * circumference);
progressCircle.style.strokeDashoffset = offset;
}
if (remaining <= 0) {
clearInterval(timer);
cleanupManager.intervals.delete(timer);
Logger.info('Countdown finished', 'Timer completed');
}
}, CONFIG.COUNTDOWN_INTERVAL);
} catch (e) {
Logger.error('UI overlay failed to render', e);
}
}

function setupOptimizedObserver() {
const targetContainer = getCachedElement('.content-wrapper') || document.body;
const observer = new MutationObserver((mutationsList, observerRef) => {
if (isShutdown) {
observerRef.disconnect();
Logger.info('MutationObserver stopped', 'Shutdown detected');
return;
}
const records = observerRef.takeRecords();
const allMutations = [...mutationsList, ...records];
const hasRelevantMutation = allMutations.some(m => m.type === 'childList' && m.addedNodes.length > 0);
if (!hasRelevantMutation) return;
for (const mutation of allMutations) {
if (mutation.type !== 'childList') continue;
const unlockText = ['UNLOCK CONTENT', 'Unlock Content'];
const addedElements = Array.from(mutation.addedNodes).filter(n => n.nodeType === 1);
const directMatch = addedElements.find(node => {
const text = node.textContent;
return text && unlockText.some(t => text.includes(t));
});
if (directMatch) {
handleUnlockElement(directMatch, observerRef);
return;
}
const nestedMatch = addedElements
.flatMap(el => Array.from(el.querySelectorAll('*')))
.find(el => {
const text = el.textContent;
return text && unlockText.some(t => text.includes(t));
});
if (nestedMatch) {
handleUnlockElement(nestedMatch, observerRef);
return;
}
}
});
window.bypassObserver = observer;
observer.observe(targetContainer, {
childList: true,
subtree: true
});
Logger.info('MutationObserver started', 'Monitoring for unlock content');
const unlockText = ['UNLOCK CONTENT', 'Unlock Content'];
const existing = Array.from(document.querySelectorAll('*')).find(el => {
const text = el.textContent;
return text && unlockText.some(t => text.includes(t));
});
if (existing) {
Logger.info('Unlock content element already present', existing);
handleUnlockElement(existing, observer);
}

function handleUnlockElement(element, observerRef) {
Logger.info('Unlock content element detected', element);
modifyParentElement(element);
observerRef.disconnect();
Logger.info('MutationObserver stopped');
}
}

function initUIAndObserver() {
Logger.info('DOM Loaded. Initializing UI and Observer.');
setupOptimizedObserver();
}

Logger.info('VortixWorld Bypass script initialized on loot host.');
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initUIAndObserver);
} else {
initUIAndObserver();
}

Logger.info('Summary metrics counts and durations', `UI Injected: ${state.uiInjected}, Bypass Successful: ${state.bypassSuccessful}, Decoded URL: ${state.decodedUrl ? 'Yes' : 'No'}`);

window.addEventListener('beforeunload', () => cleanupManager.clearAll());
})();
