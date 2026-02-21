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

  const CONFIG = Object.freeze({WS_TIMEOUT:90000,HEARTBEAT_INTERVAL:1000,MAX_RECONNECT_DELAY:30000,INITIAL_RECONNECT_DELAY:1000,FETCH_TIMEOUT:30000,COUNTDOWN_INTERVAL:1000,NOTIFICATION_TIMEOUT:3500,MAX_DECODE_RETRIES:3,MAX_FETCH_RETRIES:3});

  const DEBUG = true;

  const liveLogs = [];
  let logPanelVisible = false;
  let logContainer = null;

  const Logger = {
      info:  (m, d = '') => { if(DEBUG){ console.info(`%c[VortixBypass] ${m}`, 'color:#60a5fa;font-weight:700', d || ''); liveLogs.push({type:'info',msg:m,data:d,time:new Date().toISOString()}); if(logPanelVisible) appendLogToPanel('info',m,d); } },
      warn:  (m, d = '') => { if(DEBUG){ console.warn(`%c[VortixBypass] ${m}`, 'color:#fbbf24;font-weight:700', d || ''); liveLogs.push({type:'warn',msg:m,data:d,time:new Date().toISOString()}); if(logPanelVisible) appendLogToPanel('warn',m,d); } },
      error: (m, d = '') => { console.error(`%c[VortixBypass] ${m}`, 'color:#ef4444;font-weight:700', d || ''); liveLogs.push({type:'error',msg:m,data:d,time:new Date().toISOString()}); if(logPanelVisible) appendLogToPanel('error',m,d); }
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
                      const finalUrl = decodeURIComponent(decodeURIxor(PUBLISHER_LINK));
                      perf.mark('decodeEnd');
                      Logger.info('Decode completed successfully', 'URL decoded successfully');
                      Logger.info('Decoded url preview masked', `${finalUrl.substring(0, 30)}...`);
                      Logger.info('Total bypass duration', `${perf.measure('decodeStart', 'decodeEnd').toFixed(2)}ms`);
                      this.disconnect();
                      const endTime = Date.now();
                      const duration = ((endTime - state.processStartTime) / 1000).toFixed(2);
                      state.decodedUrl = finalUrl;
                      renderSuccessUI(finalUrl, duration);
                  } catch (e) {
                      Logger.error('Critical decode failure', e);
                      Logger.warn('Potential malformed encoded data', PUBLISHER_LINK);
                      NotificationSystem.show('Decode Error', 'Falling back to alternate method', 'warning', 3000);
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

  const modernCSS = `@keyframes glitch{0%,100%{text-shadow:2px 0 #ff00ff,-2px 0 #00ffff}25%{text-shadow:-2px 0 #ff00ff,2px 0 #00ffff}50%{text-shadow:1px 0 #ff00ff,-1px 0 #00ffff}75%{text-shadow:-1px 0 #ff00ff,1px 0 #00ffff}}@keyframes borderPulse{0%,100%{border-color:rgba(168,85,247,0.6)}50%{border-color:rgba(234,179,8,0.8)}}@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes dataStream{0%{background-position:0 0}100%{background-position:0 100%}}@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes fadeOut{from{transform:translateX(0);opacity:1}to{transform:translateX(120%);opacity:0}}:root{--cp-primary:#a855f7;--cp-secondary:#eab308;--cp-dark:#0a0a0f;--cp-darker:#050508;--cp-accent-pink:#ff00ff;--cp-accent-cyan:#00ffff;--cp-text:#e0e0e0;--cp-text-dim:#888}*{box-sizing:border-box;margin:0;padding:0}#cyber-bypass-overlay{position:fixed;inset:0;background:var(--cp-darker);z-index:2147483645;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',system-ui,sans-serif;overflow:hidden}#cyber-bypass-overlay::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.1) 50%);background-size:100% 4px;pointer-events:none;opacity:0.3;z-index:1}#cyber-bypass-overlay::after{content:'';position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,rgba(168,85,247,0.08),transparent);pointer-events:none}.cyber-container{position:relative;background:linear-gradient(145deg,rgba(10,10,15,0.98),rgba(20,10,30,0.95));border:2px solid;border-image:linear-gradient(135deg,var(--cp-primary),var(--cp-secondary),var(--cp-primary)) 1;padding:40px 32px;max-width:520px;width:95%;text-align:center;display:flex;flex-direction:column;align-items:center;gap:28px;animation:borderPulse 3s ease-in-out infinite;clip-path:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))}.cyber-container::before{content:'';position:absolute;top:0;left:0;right:0;height:100%;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(168,85,247,0.03) 2px,rgba(168,85,247,0.03) 4px);pointer-events:none;animation:dataStream 20s linear infinite}.corner-accent{position:absolute;width:20px;height:20px;border:2px solid var(--cp-secondary)}.corner-accent.tl{top:-1px;left:-1px;border-right:none;border-bottom:none}.corner-accent.tr{top:-1px;right:-1px;border-left:none;border-bottom:none}.corner-accent.bl{bottom:-1px;left:-1px;border-right:none;border-top:none}.corner-accent.br{bottom:-1px;right:-1px;border-left:none;border-top:none}.cyber-logo{display:flex;flex-direction:column;align-items:center;gap:16px;animation:float 4s ease-in-out infinite}.cyber-logo-icon{width:100px;height:100px;background:linear-gradient(135deg,var(--cp-dark),rgba(168,85,247,0.2));border:2px solid var(--cp-primary);display:flex;align-items:center;justify-content:center;position:relative;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)}.cyber-logo-icon::before{content:'';position:absolute;inset:4px;background:var(--cp-darker);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)}.cyber-logo-icon img{width:50px;height:50px;position:relative;z-index:2;filter:drop-shadow(0 0 8px var(--cp-primary))}.cyber-title{font-size:28px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;animation:glitch 2s ease-in-out infinite;background:linear-gradient(90deg,var(--cp-accent-cyan),var(--cp-primary),var(--cp-accent-pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.cyber-status{font-size:16px;color:var(--cp-text);font-weight:600;display:flex;align-items:center;gap:8px}.cyber-status::before,.cyber-status::after{content:'//';color:var(--cp-secondary);font-weight:400}.loading-dots{display:inline-flex;gap:4px}.loading-dots span{width:6px;height:6px;background:var(--cp-primary);animation:float 1s ease-in-out infinite}.loading-dots span:nth-child(2){animation-delay:0.2s}.loading-dots span:nth-child(3){animation-delay:0.4s}.cyber-task{background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);padding:16px 24px;display:flex;align-items:center;gap:20px;width:100%;position:relative;clip-path:polygon(0 0,calc(100% - 15px) 0,100% 15px,100% 100%,15px 100%,0 calc(100% - 15px))}.cyber-task::before{content:'';position:absolute;top:0;right:0;width:15px;height:15px;background:var(--cp-secondary)}.cyber-task-icon{font-size:32px;width:56px;height:56px;background:var(--cp-darker);border:2px solid var(--cp-secondary);display:flex;align-items:center;justify-content:center;clip-path:polygon(15% 0,85% 0,100% 15%,100% 85%,85% 100%,15% 100%,0 85%,0 15%)}.cyber-task-info{text-align:left;flex:1}.cyber-task-info h4{margin:0;font-size:16px;color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:1px}.cyber-task-info p{margin:4px 0 0;color:var(--cp-text-dim);font-size:13px}.cyber-progress{position:relative;width:180px;height:180px}.cyber-progress svg{width:100%;height:100%;transform:rotate(-90deg)}.cyber-progress-bg{fill:none;stroke:rgba(168,85,247,0.15);stroke-width:8}.cyber-progress-bar{fill:none;stroke:url(#cyberGradient);stroke-width:8;stroke-linecap:square;transition:stroke-dashoffset 0.5s ease}.cyber-progress-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}.cyber-progress-number{font-size:48px;font-weight:900;color:#fff;font-family:'Courier New',monospace;text-shadow:0 0 20px var(--cp-primary)}.cyber-progress-label{font-size:11px;color:var(--cp-secondary);letter-spacing:4px;text-transform:uppercase;margin-top:4px}.cyber-footer{color:var(--cp-text-dim);font-size:13px;letter-spacing:1px}.cyber-result{display:none;flex-direction:column;gap:20px;width:100%}.cyber-result-time{color:var(--cp-secondary);font-size:15px;font-weight:700;font-family:'Courier New',monospace}.cyber-url-box{background:var(--cp-darker);border:1px solid var(--cp-primary);padding:16px;color:var(--cp-text);font-family:'Courier New',monospace;font-size:13px;word-break:break-all;max-height:120px;overflow-y:auto;text-align:left;position:relative;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}.cyber-url-box::before{content:'> OUTPUT:';display:block;color:var(--cp-secondary);margin-bottom:8px;font-size:11px}.cyber-btn{background:linear-gradient(135deg,var(--cp-primary),#7c3aed);color:#fff;border:none;padding:16px 32px;font-size:15px;font-weight:800;cursor:pointer;width:100%;text-transform:uppercase;letter-spacing:2px;position:relative;clip-path:polygon(0 0,calc(100% - 15px) 0,100% 15px,100% 100%,15px 100%,0 calc(100% - 15px));transition:all 0.3s ease}.cyber-btn:hover{background:linear-gradient(135deg,#9333ea,var(--cp-primary));transform:scale(1.02)}.cyber-btn:active{transform:scale(0.98)}.cyber-btn::before{content:'';position:absolute;top:0;right:0;width:15px;height:15px;background:var(--cp-secondary)}.notification-container{position:fixed;top:20px;right:20px;display:flex;flex-direction:column;gap:12px;z-index:2147483650;pointer-events:none}.cyber-notification{background:linear-gradient(135deg,rgba(10,10,15,0.98),rgba(20,10,30,0.95));border:1px solid;padding:16px 20px;min-width:300px;max-width:400px;pointer-events:auto;position:relative;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));animation:slideIn 0.4s ease-out forwards}.cyber-notification.removing{animation:fadeOut 0.4s ease-out forwards}.cyber-notification::before{content:'';position:absolute;top:0;right:0;width:12px;height:12px}.cyber-notification.info{border-color:var(--cp-primary)}.cyber-notification.info::before{background:var(--cp-primary)}.cyber-notification.success{border-color:#10b981}.cyber-notification.success::before{background:#10b981}.cyber-notification.warning{border-color:var(--cp-secondary)}.cyber-notification.warning::before{background:var(--cp-secondary)}.cyber-notification.error{border-color:#ef4444}.cyber-notification.error::before{background:#ef4444}.cyber-notification-content{display:flex;gap:12px;align-items:flex-start}.cyber-notification-title{font-weight:700;font-size:14px;color:#fff;text-transform:uppercase;letter-spacing:1px;min-width:80px}.cyber-notification-msg{flex:1;color:var(--cp-text);font-size:13px;text-align:right}.debug-btn{position:fixed;bottom:20px;right:20px;background:var(--cp-darker);color:#fff;border:2px solid var(--cp-primary);padding:12px 24px;font-weight:800;font-size:13px;cursor:pointer;z-index:2147483660;text-transform:uppercase;letter-spacing:2px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));transition:all 0.3s ease}.debug-btn:hover{background:rgba(168,85,247,0.2);border-color:var(--cp-secondary)}.debug-btn:active{transform:scale(0.95)}.debug-btn::before{content:'';position:absolute;top:0;right:0;width:10px;height:10px;background:var(--cp-secondary)}.debug-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:700px;height:80%;background:linear-gradient(145deg,rgba(10,10,15,0.99),rgba(20,10,30,0.98));border:2px solid var(--cp-primary);z-index:2147483661;display:none;flex-direction:column;overflow:hidden;clip-path:polygon(0 15px,15px 0,calc(100% - 15px) 0,100% 15px,100% calc(100% - 15px),calc(100% - 15px) 100%,15px 100%,0 calc(100% - 15px))}.debug-panel::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(168,85,247,0.02) 2px,rgba(168,85,247,0.02) 4px);pointer-events:none}.debug-panel-header{background:rgba(168,85,247,0.1);padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--cp-primary)}.debug-panel-title{color:#fff;font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:2px}.debug-panel-close{color:var(--cp-secondary);font-size:28px;cursor:pointer;line-height:1;transition:color 0.2s}.debug-panel-close:hover{color:#fff}.debug-logs{flex:1;overflow-y:auto;padding:20px;font-family:'Courier New',monospace;font-size:13px;line-height:1.6;background:var(--cp-darker);color:var(--cp-text)}.debug-log-entry{margin-bottom:8px;padding:4px 0;border-bottom:1px solid rgba(168,85,247,0.1)}.debug-log-time{opacity:0.5;margin-right:8px}.debug-log-info{color:#60a5fa}.debug-log-warn{color:#fbbf24}.debug-log-error{color:#ef4444}.debug-panel-footer{padding:16px;background:rgba(168,85,247,0.1);border-top:1px solid var(--cp-primary);display:flex;justify-content:center}.debug-copy-btn{background:var(--cp-darker);color:#fff;border:2px solid var(--cp-secondary);padding:12px 32px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));transition:all 0.3s}.debug-copy-btn:hover{background:rgba(234,179,8,0.2)}@media (max-width:480px){.cyber-container{padding:28px 20px;gap:20px}.cyber-title{font-size:22px}.cyber-progress{width:150px;height:150px}.cyber-progress-number{font-size:40px}.debug-panel{width:96%;height:90%}}`;

  (function insertStyle() {
      if (document.getElementById('vortix-cyber-style')) return;
      try {
          const s = document.createElement('style');
          s.id = 'vortix-cyber-style';
          s.textContent = modernCSS;
          document.head.appendChild(s);
          Logger.info('Style injection success and style size', `${modernCSS.length} characters`);
      } catch (e) {
          Logger.warn('Style injection failed but continuing', e);
      }
  })();

  function createDebugUI() {
      const btn = document.createElement('div');
      btn.className = 'debug-btn';
      btn.textContent = '[ DEBUG ]';
      btn.onclick = toggleDebugPanel;
      document.body.appendChild(btn);

      const panel = document.createElement('div');
      panel.className = 'debug-panel';
      panel.innerHTML = `<div class="debug-panel-header"><div class="debug-panel-title">// SYSTEM LOGS</div><div class="debug-panel-close">×</div></div><div class="debug-logs" id="debug-logs"></div><div class="debug-panel-footer"><button class="debug-copy-btn">[ COPY ALL LOGS ]</button></div>`;
      document.body.appendChild(panel);

      logContainer = panel.querySelector('#debug-logs');
      panel.querySelector('.debug-panel-close').onclick = () => { panel.style.display = 'none'; logPanelVisible = false; };
      panel.querySelector('.debug-copy-btn').onclick = copyAllLogs;

      return panel;
  }

  function appendLogToPanel(type, msg, data) {
      if (!logContainer) return;
      const entry = document.createElement('div');
      entry.className = 'debug-log-entry';
      let colorClass = 'debug-log-info';
      if (type === 'warn') colorClass = 'debug-log-warn';
      if (type === 'error') colorClass = 'debug-log-error';
      entry.innerHTML = `<span class="debug-log-time">[${new Date().toLocaleTimeString()}]</span><span class="${colorClass}">[${type.toUpperCase()}]</span> ${msg} ${data ? `<span style="opacity:.6">→ ${typeof data === 'object' ? JSON.stringify(data).slice(0,150) : data}</span>` : ''}`;
      logContainer.appendChild(entry);
      logContainer.scrollTop = logContainer.scrollHeight;
  }

  function toggleDebugPanel() {
      const panel = document.querySelector('.debug-panel');
      if (!panel) return;
      logPanelVisible = !logPanelVisible;
      panel.style.display = logPanelVisible ? 'flex' : 'none';
      if (logPanelVisible) {
          logContainer.innerHTML = '';
          liveLogs.forEach(l => appendLogToPanel(l.type, l.msg, l.data));
      }
  }

  function copyAllLogs() {
      if (!liveLogs.length) {
          NotificationSystem.show('No Logs', 'Nothing to copy', 'warning', 1500);
          return;
      }
      let text = '// VORTIX BYPASS SYSTEM LOGS\n// ========================\n';
      liveLogs.forEach(l => {
          text += `${l.time} [${l.type.toUpperCase()}] ${l.msg} ${l.data ? '→ ' + (typeof l.data === 'object' ? JSON.stringify(l.data) : l.data) : ''}\n`;
      });
      copyToClipboard(text);
  }

  const NotificationSystem = {
      show: function (title, message, type = 'info', timeout = CONFIG.NOTIFICATION_TIMEOUT) {
          try {
              let container = document.querySelector('.notification-container');
              if (!container) {
                  container = document.createElement('div');
                  container.className = 'notification-container';
                  document.body.appendChild(container);
              }
              const id = 'cyber-notif-' + Date.now();
              const html = `<div id="${id}" class="cyber-notification ${type}"><div class="cyber-notification-content"><div class="cyber-notification-title">${title}</div><div class="cyber-notification-msg">${message}</div></div></div>`;
              container.insertAdjacentHTML('beforeend', html);
              const el = document.getElementById(id);
              cleanupManager.setTimeout(() => {
                  el.classList.add('removing');
                  cleanupManager.setTimeout(() => el.remove(), 400);
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
              NotificationSystem.show('Copied', 'Link copied to clipboard', 'success', 2000);
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
              NotificationSystem.show('Copied', 'Link copied to clipboard', 'success', 2000);
          } else {
              NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
          }
      } catch (err) {
          Logger.error('Clipboard copy failed completely', err);
          NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
      }
      document.body.removeChild(textArea);
  }

  function renderSuccessUI(url, time) {
      Logger.info('Bypass completed successfully', { url: url.substring(0, 50) + '...', time });
      Logger.info('UI state updated', 'Rendering success UI');
      const overlay = getCachedElement('#cyber-bypass-overlay');
      if (!overlay) { Logger.warn('UI element not found using primary selector', 'cyber-bypass-overlay not found'); return; }
      const progress = getCachedElement('.cyber-progress', overlay);
      if (progress) progress.style.display = 'none';
      const status = getCachedElement('.cyber-status', overlay);
      if (status) status.innerHTML = '// LINK DECODED SUCCESSFULLY';
      const dots = getCachedElement('.loading-dots', overlay);
      if (dots) dots.style.display = 'none';
      const taskInfo = getCachedElement('.cyber-task', overlay);
      if (taskInfo) taskInfo.style.display = 'none';
      const footer = getCachedElement('.cyber-footer', overlay);
      if (footer) footer.textContent = '// OUTPUT READY';
      let resultDiv = getCachedElement('.cyber-result', overlay);
      if (!resultDiv) {
          resultDiv = document.createElement('div');
          resultDiv.className = 'cyber-result';
          const container = getCachedElement('.cyber-container', overlay);
          if (container) container.appendChild(resultDiv);
          DOMCache.set(`${overlay}-.cyber-result`, resultDiv);
      }
      resultDiv.innerHTML = `<div class="cyber-result-time">// ELAPSED: ${time}s</div><div class="cyber-url-box">${url}</div><button class="cyber-btn" id="copy-link-btn">[ COPY LINK ]</button>`;
      resultDiv.style.display = 'flex';
      const btn = resultDiv.querySelector('#copy-link-btn');
      if (btn) btn.onclick = () => copyToClipboard(url);
      state.decodedUrl = url;
      state.bypassSuccessful = true;
      state.uiInjected = true;
      if (window.vortixCountdownTimer) { clearInterval(window.vortixCountdownTimer); cleanupManager.intervals.delete(window.vortixCountdownTimer); window.vortixCountdownTimer = null; }
      shutdown();
  }

  const BYPASS_HTML_TEMPLATE = `<div id="cyber-bypass-overlay"><div class="cyber-container"><div class="corner-accent tl"></div><div class="corner-accent tr"></div><div class="corner-accent bl"></div><div class="corner-accent br"></div><div class="cyber-logo"><div class="cyber-logo-icon"><img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="logo"></div><div class="cyber-title">Lootlabs Bypass</div></div><div class="cyber-status">Processing Request <span class="loading-dots"><span></span><span></span><span></span></span></div><div class="cyber-task"><div class="cyber-task-icon">🔓</div><div class="cyber-task-info"><h4>Processing</h4><p>Estimated wait: 60 seconds</p></div></div><div class="cyber-progress"><svg viewBox="0 0 180 180"><defs><linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a855f7"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle class="cyber-progress-bg" cx="90" cy="90" r="80"></circle><circle class="cyber-progress-bar" id="progress-circle" cx="90" cy="90" r="80"></circle></svg><div class="cyber-progress-text"><div class="cyber-progress-number" id="countdown-display">60</div><div class="cyber-progress-label">seconds</div></div></div><div class="cyber-result"></div><div class="cyber-footer">// Please wait while processing</div></div></div>`;

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
      const taskIconEl = getCachedElement('.cyber-task-icon');
      if (taskIconEl) taskIconEl.textContent = taskIcon;
      const taskNameEl = getCachedElement('.cyber-task-info h4');
      if (taskNameEl) taskNameEl.textContent = taskName;
      const taskP = getCachedElement('.cyber-task-info p');
      if (taskP) taskP.textContent = `Estimated wait: ${countdownSeconds} seconds`;
      const progressCircle = getCachedElement('#progress-circle');
      const countdownDisplay = getCachedElement('#countdown-display');
      const radius = 80;
      const circumference = 2 * Math.PI * radius;
      if (progressCircle) {
          progressCircle.style.strokeDasharray = circumference.toString();
          progressCircle.style.strokeDashoffset = circumference.toString();
      }
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
      createDebugUI();
  }

  Logger.info('VortixWorld Bypass script initialized on loot host.');

  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initUIAndObserver);
  } else {
      initUIAndObserver();
  }

  window.addEventListener('beforeunload', () => cleanupManager.clearAll());
  })();