window.VortixSettings = (function() {
    const STORAGE_KEY = 'vw_bypass_mode';
    
    const ASSETS = {
        gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
    };

    const CSS = `
        #vw-gear-btn { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: #0f172a; border: 2px solid #38bdf8; border-radius: 50%; color: #38bdf8; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2147483647; box-shadow: 0 0 20px rgba(56, 189, 248, 0.2); transition: transform 0.3s; }
        #vw-gear-btn:hover { transform: rotate(90deg) scale(1.1); background: #1e293b; }
        #vw-gear-btn svg { width: 28px; height: 28px; }
        #vw-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 2147483647; display: none; align-items: center; justify-content: center; }
        .vw-modal { background: #020617; border: 1px solid #1e293b; width: 90%; max-width: 400px; border-radius: 16px; padding: 25px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align: center; color: #fff; font-family: 'Segoe UI', sans-serif; position: relative; }
        .vw-modal h2 { margin: 0 0 20px 0; color: #38bdf8; font-size: 22px; }
        .vw-close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #64748b; font-size: 20px; cursor: pointer; }
        .vw-close-btn:hover { color: #fff; }
        .vw-toggle-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; }
        .vw-switch { position: relative; display: inline-block; width: 50px; height: 26px; }
        .vw-switch input { opacity: 0; width: 0; height: 0; }
        .vw-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 34px; border: 1px solid #475569; }
        .vw-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .vw-slider { background: linear-gradient(135deg, #0ea5e9, #0284c7); border-color: #38bdf8; }
        input:checked + .vw-slider:before { transform: translateX(24px); }
        .vw-label { font-weight: 600; font-size: 16px; display:block; text-align:left; color: #fff; }
        .vw-sublabel { font-size: 12px; color: #94a3b8; display: block; text-align: left; margin-top:4px; }
    `;

    function getMode() {
        if (typeof GM_getValue !== 'undefined') return GM_getValue(STORAGE_KEY, 'local');
        return localStorage.getItem(STORAGE_KEY) || 'local';
    }

    function setMode(mode) {
        if (typeof GM_setValue !== 'undefined') GM_setValue(STORAGE_KEY, mode);
        else localStorage.setItem(STORAGE_KEY, mode);
    }

    return {
        init: function() {
            if (document.getElementById('vw-settings-css')) return;
            const style = document.createElement('style');
            style.id = 'vw-settings-css';
            style.textContent = CSS;
            (document.head || document.documentElement).appendChild(style);

            const btn = document.createElement('div');
            btn.id = 'vw-gear-btn';
            btn.innerHTML = ASSETS.gear;
            btn.title = "VortixWorld Settings";
            btn.onclick = this.open;
            document.body.appendChild(btn);

            this.buildModal();
        },

        buildModal: function() {
            if (document.getElementById('vw-modal-overlay')) return;
            const modal = document.createElement('div');
            modal.id = 'vw-modal-overlay';
            const currentMode = getMode();
            const isLocal = currentMode === 'local';

            modal.innerHTML = `
                <div class="vw-modal">
                    <button class="vw-close-btn" onclick="document.getElementById('vw-modal-overlay').style.display='none'">✕</button>
                    <h2>⚙️ Settings</h2>
                    <div class="vw-toggle-row">
                        <div>
                            <span class="vw-label">LootLink Bypass Logic</span>
                            <span class="vw-sublabel">Turn Off To Redirect To Bypass Site Instead</span>
                        </div>
                        <label class="vw-switch">
                            <input type="checkbox" id="vw-mode-toggle" ${isLocal ? 'checked' : ''}>
                            <span class="vw-slider"></span>
                        </label>
                    </div>
                    <div style="font-size:12px; color:#64748b; margin-top:20px; line-height:1.4; text-align:left; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px;">
                        <div style="margin-bottom:6px;"><strong style="color:#e2e8f0">Off:</strong> Redirects to VortixWorld Bypass Site</div>
                        <div><strong style="color:#e2e8f0">On:</strong> Runs Local Lootlinks Bypass Logic</div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const toggle = document.getElementById('vw-mode-toggle');
            toggle.addEventListener('change', (e) => {
                const newMode = e.target.checked ? 'local' : 'remote';
                setMode(newMode);
                if(confirm("Mode changed. Reload page to apply?")) {
                    location.reload();
                }
            });
        },

        open: function() {
            const m = document.getElementById('vw-modal-overlay');
            if(m) m.style.display = 'flex';
            else VortixSettings.buildModal();
        },

        isLocalMode: function() {
            return getMode() === 'local';
        }
    };
})();
