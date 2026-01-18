(function() {
  'use strict';

  const VW_SETTINGS_ID = 'vw-settings-shadow-host';

  const SETTINGS_CSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    .vw-gear-btn {
      position: fixed;
      bottom: 14px;
      left: 14px;
      z-index: 2147483647;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.18);
      background: linear-gradient(135deg, #000000, #071033, #1e2be8);
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      color: #cfd6e6;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s, box-shadow 0.2s;
      pointer-events: auto;
    }
    
    .vw-gear-btn:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 12px 40px rgba(30, 43, 232, 0.4);
    }
    
    .vw-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      z-index: 2147483647;
      display: none;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
      pointer-events: auto;
    }
    
    .vw-backdrop.open {
      display: flex;
    }
    
    .vw-panel {
      width: 90%;
      max-width: 480px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.14);
      background: linear-gradient(135deg, #000000 0%, #071033 60%, #1e2be8 100%);
      box-shadow: 0 30px 100px rgba(0,0,0,0.8);
      color: #cfd6e6;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      overflow: hidden;
      animation: vw-slide-in 0.3s ease-out;
      pointer-events: auto;
    }
    
    @keyframes vw-slide-in {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .vw-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
    }
    
    .vw-title {
      font-weight: 900;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #7aa2ff;
    }
    
    .vw-badge {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 950;
      font-size: 12px;
      color: #cfd6e6;
    }
    
    .vw-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(0,0,0,0.18);
      color: #cfd6e6;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .vw-close-btn:hover {
      background: rgba(255,255,255,0.1);
    }
    
    .vw-body {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    
    .vw-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05);
    }
    
    .vw-label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    
    .vw-label-title {
      font-size: 14px;
      font-weight: 900;
      color: #7aa2ff;
    }
    
    .vw-label-desc {
      font-size: 12px;
      color: rgba(207,214,230,0.75);
      font-weight: 600;
    }
    
    .vw-switch {
      position: relative;
      width: 52px;
      height: 28px;
      flex-shrink: 0;
    }
    
    .vw-switch input {
      opacity: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      cursor: pointer;
      z-index: 1;
      margin: 0;
    }
    
    .vw-switch-slider {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 999px;
      background: rgba(255,255,255,0.18);
      transition: 0.3s;
      pointer-events: none;
    }
    
    .vw-switch-slider:before {
      content: "";
      position: absolute;
      top: 4px;
      left: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #cfd6e6;
      transition: 0.3s;
    }
    
    .vw-switch input:checked + .vw-switch-slider {
      background: linear-gradient(90deg, #0f1b4f, #1e2be8);
    }
    
    .vw-switch input:checked + .vw-switch-slider:before {
      transform: translateX(24px);
    }
    
    .vw-input {
      width: 80px;
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      outline: none;
      flex-shrink: 0;
    }
    
    .vw-input:focus {
      border-color: #1e2be8;
      box-shadow: 0 0 0 2px rgba(30, 43, 232, 0.3);
    }
    
    .vw-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 6px;
    }
    
    .vw-btn {
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(0,0,0,0.18);
      color: #cfd6e6;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    
    .vw-btn:hover {
      background: rgba(255,255,255,0.08);
      transform: translateY(-1px);
    }
    
    .vw-btn-primary {
      background: linear-gradient(90deg, #0f1b4f, #1e2be8);
      border: 1px solid rgba(255,255,255,0.14);
    }
    
    .vw-btn-primary:hover {
      background: linear-gradient(90deg, #1a2a6c, #2a3bf8);
    }
    
    .vw-toast {
      position: fixed;
      bottom: 70px;
      left: 14px;
      padding: 10px 16px;
      border-radius: 10px;
      background: linear-gradient(90deg, #0f1b4f, #1e2be8);
      color: #cfd6e6;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      animation: vw-toast-in 0.3s ease-out;
      z-index: 2147483647;
      pointer-events: none;
    }
    
    @keyframes vw-toast-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  function createSettingsUI() {
    const existing = document.getElementById(VW_SETTINGS_ID);
    if (existing) existing.remove();

    const host = document.createElement('div');
    host.id = VW_SETTINGS_ID;
    host.style.cssText = 'all: initial; position: fixed !important; top: 0 !important; left: 0 !important; width: 0 !important; height: 0 !important; z-index: 2147483647 !important; pointer-events: none !important;';
    
    const shadow = host.attachShadow({ mode: 'closed' });

    const keys = {
      lootlinkLocal: 'vw_lootlink_local',
      redirectWaitTime: 'vw_redirect_wait_time'
    };

    let lootlinkLocal = localStorage.getItem(keys.lootlinkLocal);
    if (lootlinkLocal === null) {
      lootlinkLocal = true;
      localStorage.setItem(keys.lootlinkLocal, 'true');
    } else {
      lootlinkLocal = lootlinkLocal === 'true';
    }

    let redirectWaitTime = localStorage.getItem(keys.redirectWaitTime);
    redirectWaitTime = redirectWaitTime !== null ? parseInt(redirectWaitTime, 10) : 5;
    if (isNaN(redirectWaitTime)) redirectWaitTime = 5;

    const style = document.createElement('style');
    style.textContent = SETTINGS_CSS;
    shadow.appendChild(style);

    const gearBtn = document.createElement('div');
    gearBtn.className = 'vw-gear-btn';
    gearBtn.textContent = '⚙️';
    shadow.appendChild(gearBtn);

    const backdrop = document.createElement('div');
    backdrop.className = 'vw-backdrop';
    backdrop.innerHTML = `
      <div class="vw-panel">
        <div class="vw-header">
          <div class="vw-title">
            <div class="vw-badge">VW</div>
            <span>Settings</span>
          </div>
          <button class="vw-close-btn" type="button">✕</button>
        </div>
        <div class="vw-body">
          <div class="vw-row">
            <div class="vw-label">
              <div class="vw-label-title">LootlinkLocal</div>
              <div class="vw-label-desc">Enable local bypass on Loot* domains</div>
            </div>
            <label class="vw-switch">
              <input type="checkbox" id="vwLootlinkToggle" ${lootlinkLocal ? 'checked' : ''}>
              <span class="vw-switch-slider"></span>
            </label>
          </div>
          <div class="vw-row">
            <div class="vw-label">
              <div class="vw-label-title">Redirect Wait Time</div>
              <div class="vw-label-desc">Seconds before auto-redirect (0-60)</div>
            </div>
            <input type="number" class="vw-input" id="vwWaitTimeInput" min="0" max="60" value="${redirectWaitTime}">
          </div>
          <div class="vw-actions">
            <button class="vw-btn" id="vwReloadBtn" type="button">Reload Page</button>
            <button class="vw-btn vw-btn-primary" id="vwApplyBtn" type="button">Apply & Save</button>
          </div>
        </div>
      </div>
    `;
    shadow.appendChild(backdrop);

    const closeBtn = shadow.querySelector('.vw-close-btn');
    const panel = shadow.querySelector('.vw-panel');
    const lootlinkToggle = shadow.querySelector('#vwLootlinkToggle');
    const waitTimeInput = shadow.querySelector('#vwWaitTimeInput');
    const applyBtn = shadow.querySelector('#vwApplyBtn');
    const reloadBtn = shadow.querySelector('#vwReloadBtn');

    function showToast(message) {
      const existingToast = shadow.querySelector('.vw-toast');
      if (existingToast) existingToast.remove();
      
      const toast = document.createElement('div');
      toast.className = 'vw-toast';
      toast.textContent = message;
      shadow.appendChild(toast);
      
      setTimeout(() => toast.remove(), 2500);
    }

    function openPanel() {
      let currentLootlink = localStorage.getItem(keys.lootlinkLocal);
      if (currentLootlink === null) {
        currentLootlink = true;
      } else {
        currentLootlink = currentLootlink === 'true';
      }
      
      let currentWaitTime = localStorage.getItem(keys.redirectWaitTime);
      currentWaitTime = currentWaitTime !== null ? parseInt(currentWaitTime, 10) : 5;
      if (isNaN(currentWaitTime)) currentWaitTime = 5;
      
      lootlinkToggle.checked = currentLootlink;
      waitTimeInput.value = currentWaitTime;
      
      backdrop.classList.add('open');
    }

    function closePanel() {
      backdrop.classList.remove('open');
    }

    gearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPanel();
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePanel();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closePanel();
      }
    });

    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    applyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const newLootlink = lootlinkToggle.checked;
      const newWaitTime = parseInt(waitTimeInput.value, 10);
      
      localStorage.setItem(keys.lootlinkLocal, String(newLootlink));
      
      if (!isNaN(newWaitTime) && newWaitTime >= 0 && newWaitTime <= 60) {
        localStorage.setItem(keys.redirectWaitTime, String(newWaitTime));
      }
      
      if (window.VW_CONFIG) {
        window.VW_CONFIG.lootlinkLocal = newLootlink;
        if (!isNaN(newWaitTime) && newWaitTime >= 0) {
          window.VW_CONFIG.redirectWaitTime = newWaitTime;
        }
      }
      
      showToast('✓ Settings saved!');
      closePanel();
    });

    reloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      location.reload();
    });

    if (document.body) {
      document.body.appendChild(host);
    } else {
      document.documentElement.appendChild(host);
    }
  }

  function init() {
    createSettingsUI();
    
    const observer = new MutationObserver(() => {
      if (!document.getElementById(VW_SETTINGS_ID)) {
        createSettingsUI();
      }
    });
    
    observer.observe(document.documentElement, { 
      childList: true, 
      subtree: false 
    });
    
    setInterval(() => {
      if (!document.getElementById(VW_SETTINGS_ID)) {
        createSettingsUI();
      }
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.addEventListener('load', () => {
    if (!document.getElementById(VW_SETTINGS_ID)) {
      init();
    }
  });
})();
