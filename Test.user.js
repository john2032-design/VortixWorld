// ==UserScript==
// @name         VortixWorld Lootlinks Bypass
// @namespace    afklolbypasser
// @version      8.0
// @description  Bypass lootllinks
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
// @connect      *
// @icon         https://i.ibb.co/cKy9ztXL/IMG-3412.png 
// @grant        none
// @license      MIT
// @run-at       document-start
// ==/UserScript==

(function () {
'use strict';

if (window.__VORTIX_BYPASS_INSTALLED) return;
window.__VORTIX_BYPASS_INSTALLED = true;

const ALLOWED_HOSTS = ['loot-link.com','loot-links.com','lootlink.org','lootlinks.co','lootdest.info','lootdest.org','lootdest.com','links-loot.com','linksloot.net'];
const UNLOCK_TEXTS = ['UNLOCK CONTENT', 'Unlock Content'];
const TASK_IMAGES = {eye:'eye.png',bell:'bell.png',apps:'apps.png',fire:'fire.png',gamers:'gamers.png'};

const CONFIG = Object.freeze({WS_TIMEOUT:90000,HEARTBEAT_INTERVAL:1000,MAX_RECONNECT_DELAY:30000,INITIAL_RECONNECT_DELAY:1000,FETCH_TIMEOUT:30000,COUNTDOWN_INTERVAL:1000,MAX_DECODE_RETRIES:3,MAX_FETCH_RETRIES:3});

const DEBUG = true;

const Logger = {
    info:  (m, d = '') => { if(DEBUG){ console.info(`%c[VortixBypass] ${m}`, 'color:#60a5fa;font-weight:700', d || ''); } },
    warn:  (m, d = '') => { if(DEBUG){ console.warn(`%c[VortixBypass] ${m}`, 'color:#fbbf24;font-weight:700', d || ''); } },
    error: (m, d = '') => { console.error(`%c[VortixBypass] ${m}`, 'color:#ef4444;font-weight:700', d || ''); }
};

Logger.info(`VortixWorld Lootlinks Bypass v8.0 initialized`, new Date().toISOString());

const pageURL = new URL(window.location.href);
const hostname = pageURL.hostname || '';
Logger.info('Current hostname and full page url', `${hostname} - ${window.location.href}`);

const isLootHost = ALLOWED_HOSTS.includes(hostname);
Logger.info('Allowed host check result', isLootHost ? 'Loot host confirmed' : 'Not a loot host');

if (!isLootHost) {
    Logger.info('Reason for early exit', 'Hostname not in allowed list - exiting script');
    return;
}

let originalFetch;
const DOMCache = new Map();
const perf = {marks: new Map(), mark(name) { this.marks.set(name, performance.now()); }, measure(start, end) { return this.marks.get(end) - this.marks.get(start); }};

const state = {uiInjected: false,bypassSuccessful: false,decodedUrl: null,processStartTime: Date.now()};

function getCachedElement(selector, context = document) {
    const key = context === document ? selector : `${selector}@${context.id || 'non-id'}`;
    if (!DOMCache.has(key)) DOMCache.set(key, context.querySelector(selector));
    return DOMCache.get(key);
}

function clearDOMCache() { DOMCache.clear(); }

const cleanupManager = {
    intervals: new Set(),
    timeouts: new Set(),
    setInterval: function(fn, delay, ...args) { const id = setInterval(fn, delay, ...args); this.intervals.add(id); return id; },
    setTimeout: function(fn, delay, ...args) { const id = setTimeout(() => { this.timeouts.delete(id); fn(...args); }, delay); this.timeouts.add(id); return id; },
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
    if (window.bypassObserver) { window.bypassObserver.disconnect(); window.bypassObserver = null; Logger.info('MutationObserver stopped', 'Clean shutdown'); }
    if (window.activeWebSocket) { window.activeWebSocket.disconnect(); window.activeWebSocket = null; Logger.info('WebSocket disconnected', 'Clean shutdown'); }
    if (originalFetch) { window.fetch = originalFetch; Logger.info('Original fetch restored', 'Clean shutdown'); }
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
        this.intentionallyClosed = false;
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
        if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); cleanupManager.timeouts.delete(this.reconnectTimeout); this.reconnectTimeout = null; }
        this.sendHeartbeat();
        this.heartbeatTimer = cleanupManager.setInterval(() => { if (this.ws && this.ws.readyState === WebSocket.OPEN) this.sendHeartbeat(); else clearInterval(this.heartbeatTimer); }, this.heartbeatInterval);
    }
    sendHeartbeat() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) { this.ws.send('0'); Logger.info('WebSocket heartbeat sent', 'Keepalive'); }
    }
    handleReconnect() {
        if (isShutdown || this.intentionallyClosed) return;
        if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); cleanupManager.intervals.delete(this.heartbeatTimer); this.heartbeatTimer = null; }
        if (this.retryCount >= this.maxRetries) {
            Logger.error('WebSocket fatal error', 'Max retries exceeded');
            Logger.error('Bypass failed with no result', 'WebSocket exhausted all retries');
            return;
        }
        this.retryCount++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.retryCount - 1), this.maxDelay);
        Logger.warn('WebSocket connection slow to open', `Retry ${this.retryCount} in ${delay}ms`);
        this.reconnectTimeout = cleanupManager.setTimeout(() => { Logger.info('WebSocket url opened', this.url); this.connect(); }, delay);
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
                    let result = decodeURIComponent(decodeURIxor(PUBLISHER_LINK));
                    if (/^https?:\/\/ads\.luarmor\.net\//i.test(result)) {
                        result = `https://vortixworld-luarmor.vercel.app/redirect?to=${result}`;
                        this.disconnect();
                        Logger.info('Auto-redirecting to modified URL', result);
                        window.location.href = result;
                        return;
                    }
                    perf.mark('decodeEnd');
                    Logger.info('Decode completed successfully', 'URL decoded successfully');
                    Logger.info('Decoded url preview masked', `${result.substring(0, 30)}...`);
                    Logger.info('Total bypass duration', `${perf.measure('decodeStart', 'decodeEnd').toFixed(2)}ms`);
                    this.disconnect();
                    const endTime = Date.now();
                    const duration = ((endTime - state.processStartTime) / 1000).toFixed(2);
                    state.decodedUrl = result;
                    renderSuccessUI(result, duration);
                } catch (e) {
                    Logger.error('Critical decode failure', e);
                    Logger.warn('Potential malformed encoded data', PUBLISHER_LINK);
                }
            }
        }
    }
    onError(error) { Logger.error('WebSocket fatal error', error); Logger.warn('Network instability detected', 'WebSocket error occurred'); }
    disconnect() {
        this.intentionallyClosed = true;
        if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); cleanupManager.intervals.delete(this.heartbeatTimer); this.heartbeatTimer = null; }
        if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); cleanupManager.timeouts.delete(this.reconnectTimeout); this.reconnectTimeout = null; }
        if (this.ws) { this.ws.close(); Logger.info('Observer disconnected cleanly', 'WebSocket disconnected'); }
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
        return decodedChars.join('');
    } catch (e) {
        Logger.error('Critical decode failure', e);
        Logger.warn('Potential malformed encoded data', encodedString.substring(0, 50));
        throw e;
    }
}

const modernCSS = `:root{--primary:#a855f7;--accent:#eab308;--glass:linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.92));--glow:#c4b5fd}*{box-sizing:border-box}#modern-bypass-overlay{position:fixed;inset:0;background:linear-gradient(180deg, rgba(2,6,23,0.96), rgba(30,41,59,0.96));backdrop-filter:blur(32px);z-index:2147483645;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:24px}#modern-bypass-overlay .bypass-container{background:var(--glass);border:1px solid rgba(192,181,253,0.5);border-radius:24px;padding:48px 32px;max-width:540px;width:100%;box-shadow:0 0 120px rgba(168,85,247,0.6),inset 0 0 80px rgba(234,179,8,0.15);text-align:center;position:relative;display:flex;flex-direction:column;align-items:center;gap:32px;overflow:hidden}.bypass-container::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 20%, rgba(168,85,247,0.12), transparent 70%);pointer-events:none}.logo-section{display:flex;flex-direction:column;align-items:center;gap:18px}.logo-icon{width:128px;height:128px;background:radial-gradient(circle, #a855f7 20%, #eab308 80%);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 80px #a855f7,0 0 140px #eab308}.logo-icon img{width:66px;height:66px;filter:drop-shadow(0 0 20px #fff)}.logo-text{font-size:36px;font-weight:900;letter-spacing:-2px;background:linear-gradient(90deg,#f3e8ff,#fef3c7); -webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 50px #a855f7}.status-text{font-size:19px;color:#e0f2fe;font-weight:700}.task-type{background:linear-gradient(135deg, rgba(168,85,247,0.12), rgba(234,179,8,0.12));border:2px solid #eab308;border-radius:9999px;padding:16px 36px;display:flex;align-items:center;gap:26px;width:100%}.task-icon{font-size:40px;width:70px;height:70px;background:linear-gradient(135deg, #0f172a, #1e293b);border-radius:50%;display:flex;align-items:center;justify-content:center;border:5px solid #eab308}.task-info h4{margin:0;font-size:20px;color:#f1f5f9;font-weight:800}.task-info p{margin:6px 0 0;color:#94a3b8;font-size:14.5px}.progress-ring{position:relative;width:188px;height:188px}.progress-ring svg{width:100%;height:100%;transform:rotate(-90deg);filter:drop-shadow(0 0 50px #a855f7)}.progress-ring-circle{fill:none;stroke:#1e2937;stroke-width:20}.progress-ring-circle-progress{fill:none;stroke:url(#progress-gradient);stroke-width:20;stroke-linecap:round;transition:stroke-dashoffset .4s linear}.progress-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:46px;font-weight:900;color:#fff;text-shadow:0 0 40px #eab308}.progress-label{position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);font-size:13px;color:#eab308;letter-spacing:4px;font-weight:700;text-transform:uppercase}.footer-note{color:#94a3b8;font-size:14.5px}.result-container{display:none;flex-direction:column;gap:24px;width:100%;margin-top:20px}.result-time{color:#eab308;font-size:17px;font-weight:700}.url-display-box{background:linear-gradient(135deg, #020617, #1e293b);border:2px solid #a855f7;border-radius:16px;padding:20px;color:#e0f2fe;font-family:monospace;font-size:15px;word-break:break-all;max-height:140px;overflow-y:auto}.action-btn{background:linear-gradient(135deg, #a855f7, #7e22ce);color:#fff;border:none;padding:18px 40px;border-radius:9999px;font-size:18px;font-weight:800;cursor:pointer;width:100%;box-shadow:0 12px 0 #eab308;transition:all .25s}.action-btn:active{transform:translateY(6px);box-shadow:0 6px 0 #eab308}.progress-ring svg defs{linearGradient{id:progress-gradient, x1:0%, y1:0%, x2:100%, y2:100%} stop{offset:0%, stop-color:#a855f7} stop{offset:100%, stop-color:#eab308}} @media (max-width:480px){#modern-bypass-overlay{padding:12px}.bypass-container{padding:32px 20px;max-width:100%}.logo-icon{width:100px;height:100px}.logo-icon img{width:50px;height:50px}.logo-text{font-size:28px}.status-text{font-size:16px}.task-type{padding:12px 24px;gap:18px}.task-icon{font-size:32px;width:50px;height:50px}.task-info h4{font-size:18px}.task-info p{font-size:13px}.progress-ring{width:150px;height:150px}.progress-text{font-size:36px}.progress-label{font-size:12px;bottom:-24px}.result-time{font-size:15px}.url-display-box{font-size:14px;padding:16px}.action-btn{padding:14px 32px;font-size:16px}}`;

(function insertStyle() {
    if (document.getElementById('vortix-modern-style')) return;
    try {
        const s = document.createElement('style');
        s.id = 'vortix-modern-style';
        s.textContent = modernCSS;
        document.head.appendChild(s);
        Logger.info('Style injection success and style size', `${modernCSS.length} characters`);
    } catch (e) {
        Logger.warn('Style injection failed but continuing', e);
    }
})();

function copyToClipboard(text) {
    Logger.info('Clipboard copy attempt', text);
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            Logger.info('Clipboard copy success', 'Copied to clipboard');
        }).catch(() => fallbackCopy(text));
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
            Logger.info('Clipboard copy success', 'Copied via fallback');
        } else {
        }
    } catch (err) {
        Logger.error('Clipboard copy failed completely', err);
    }
    document.body.removeChild(textArea);
}

function renderSuccessUI(url, time) {
    Logger.info('Bypass completed successfully', { url: url.substring(0, 50) + '...', time });
    Logger.info('UI state updated', 'Rendering success UI');
    const overlay = getCachedElement('#modern-bypass-overlay');
    if (!overlay) { Logger.warn('UI element not found using primary selector', 'modern-bypass-overlay not found'); return; }
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
    resultDiv.innerHTML = `<div class="result-time">Time Taken: ${time}s</div><div class="url-display-box">${url}</div><button class="action-btn" id="copy-link-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy Link</button>`;
    resultDiv.style.display = 'flex';
    const btn = resultDiv.querySelector('#copy-link-btn');
    if (btn) btn.onclick = () => copyToClipboard(url);
    state.decodedUrl = url;
    state.bypassSuccessful = true;
    state.uiInjected = true;
    if (window.vortixCountdownTimer) { clearInterval(window.vortixCountdownTimer); cleanupManager.intervals.delete(window.vortixCountdownTimer); window.vortixCountdownTimer = null; }
    shutdown();
}

const BYPASS_HTML_TEMPLATE = `<div id="modern-bypass-overlay"><div class="bypass-container"><div class="logo-section"><div class="logo-icon"><img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="logo"></div><div class="logo-text">Lootlabs Bypass</div></div><div class="status-text">Processing your request <span class="loading-dots"><span></span><span></span><span></span></span></div><div class="task-type"><div class="task-icon">🔓</div><div class="task-info"><h4>Processing</h4><p>Estimated wait time: 60 seconds</p></div></div><div class="progress-ring"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#eab308"/></linearGradient></defs><circle class="progress-ring-circle" cx="100" cy="100" r="84"></circle><circle class="progress-ring-circle-progress" id="progress-circle" cx="100" cy="100" r="84"></circle></svg><div class="progress-text" id="countdown-display">60</div><div class="progress-label">seconds</div></div><div class="result-container"></div><div class="footer-note">Please wait while we process your request</div></div></div>`;

(function fetchOverride() {
    originalFetch = window.fetch;
    Logger.info('Fetch request intercepted', 'Fetch override initialized');
    window.fetch = function (url, config) {
        try {
            if (isShutdown) return originalFetch(url, config);
            const urlStr = (typeof url === 'string') ? url : (url && url.url) ? url.url : '';
            if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined' || typeof KEY === 'undefined' || typeof TID === 'undefined') {
                Logger.warn('Missing required globals – skipping WS setup');
                return originalFetch(url, config);
            }
            if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
                return originalFetch(url, config).then(response => {
                    if (!response.ok) return response;
                    return response.clone().json().then(data => {
                        let urid = '', task_id = 54, action_pixel_url = '';
                        try { data.forEach(item => { urid = item.urid; action_pixel_url = item.action_pixel_url; }); } catch (e) {}
                        const wsUrl = `wss://${(urid.slice(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`;
                        Logger.info('WebSocket url opened', wsUrl);
                        const ws = new RobustWebSocket(wsUrl, { maxRetries: 3 });
                        window.activeWebSocket = ws;
                        ws.connect();
                        try { navigator.sendBeacon(`https://${(urid.slice(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`); } catch (e) {}
                        if (action_pixel_url) fetch(action_pixel_url).catch(() => {});
                        fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`).catch(() => {});
                        return new Response(JSON.stringify(data), { status: response.status, statusText: response.statusText, headers: response.headers });
                    }).catch(() => response);
                }).catch(err => {
                    Logger.error('Fetch failed completely', err);
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
            if (src.includes(TASK_IMAGES.eye)) { countdownSeconds = 13; taskName = 'View Content'; taskIcon = '👁️'; break; }
            else if (src.includes(TASK_IMAGES.bell)) { countdownSeconds = 30; taskName = 'Notification'; taskIcon = '🔔'; break; }
            else if (src.includes(TASK_IMAGES.apps) || src.includes(TASK_IMAGES.fire)) { countdownSeconds = 60; taskName = 'App Install'; taskIcon = '⬇️'; break; }
            else if (src.includes(TASK_IMAGES.gamers)) { countdownSeconds = 90; taskName = 'Gaming Offer'; taskIcon = '🎮'; break; }
        }
        Logger.info('Detected task name', taskName);
        Logger.info('Detected task icon', taskIcon);
        Logger.info('Detected countdown duration', `${countdownSeconds} seconds`);
    } catch (e) {
        Logger.warn('Error detecting task info', e);
    }
    return { countdownSeconds, taskName, taskIcon };
}

function modifyParentElement(targetElement) {
    const parentElement = targetElement.parentElement;
    if (!parentElement) return;
    Logger.info('UI overlay injected successfully', targetElement);
    const { countdownSeconds, taskName, taskIcon } = detectTaskInfo();
    state.processStartTime = Date.now();
    parentElement.innerHTML = '';
    parentElement.insertAdjacentHTML('afterbegin', BYPASS_HTML_TEMPLATE);
    const taskIconEl = getCachedElement('.task-icon');
    if (taskIconEl) taskIconEl.textContent = taskIcon;
    const taskNameEl = getCachedElement('.task-info h4');
    if (taskNameEl) taskNameEl.textContent = taskName;
    const taskP = getCachedElement('.task-info p');
    if (taskP) taskP.textContent = `Estimated wait time: ${countdownSeconds} seconds`;
    const progressCircle = getCachedElement('#progress-circle');
    const countdownDisplay = getCachedElement('#countdown-display');
    const radius = 84;
    const circumference = 2 * Math.PI * radius;
    if (progressCircle) progressCircle.style.strokeDasharray = circumference.toString();
    let remaining = countdownSeconds;
    if (countdownDisplay) countdownDisplay.textContent = remaining;
    const timer = cleanupManager.setInterval(() => {
        remaining--;
        if (countdownDisplay) countdownDisplay.textContent = remaining > 0 ? remaining : '0';
        if (progressCircle) {
            const progress = Math.max(0, Math.min(1, (countdownSeconds - remaining) / countdownSeconds));
            const offset = circumference - (progress * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
        if (remaining <= 0) {
            clearInterval(timer);
            cleanupManager.intervals.delete(timer);
        }
    }, CONFIG.COUNTDOWN_INTERVAL);
    window.vortixCountdownTimer = timer;
    state.uiInjected = true;
}

function setupOptimizedObserver() {
    try {
        const targetContainer = getCachedElement('.content-wrapper') || document.body;
        const observer = new MutationObserver((mutationsList, observerRef) => {
            if (isShutdown) { observerRef.disconnect(); return; }
            const hasRelevantMutation = mutationsList.some(m => m.type === 'childList' && m.addedNodes.length > 0);
            if (!hasRelevantMutation) return;
            for (const mutation of mutationsList) {
                if (mutation.type !== 'childList') continue;
                const addedElements = Array.from(mutation.addedNodes).filter(n => n.nodeType === 1);
                const directMatch = addedElements.find(node => {
                    const text = node.textContent || '';
                    return UNLOCK_TEXTS.some(t => text.includes(t));
                });
                if (directMatch) { handleUnlockElement(directMatch, observerRef); return; }
                const nestedMatch = addedElements.flatMap(el => Array.from(el.querySelectorAll('*'))).find(el => {
                    const text = el.textContent || '';
                    return UNLOCK_TEXTS.some(t => text.includes(t));
                });
                if (nestedMatch) { handleUnlockElement(nestedMatch, observerRef); return; }
            }
        });
        window.bypassObserver = observer;
        observer.observe(targetContainer, {childList:true,subtree:true,attributes:false,characterData:false});
        Logger.info('MutationObserver started', 'Monitoring for unlock content');
        const existing = Array.from(document.querySelectorAll('*')).find(el => {
            const text = el.textContent || '';
            return UNLOCK_TEXTS.some(t => text.includes(t));
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
    } catch (e) {
        Logger.error('Observer setup failed', e);
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

window.addEventListener('beforeunload', () => cleanupManager.clearAll());
})();
