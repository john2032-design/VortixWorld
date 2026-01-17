window.VortixSettings = (function() {
    const STORAGE_KEY = 'vw_bypass_mode';
    
    const ASSETS = {
        gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
    };

    const CSS = `
        #vw-gear-btn { 
            position: fixed !important; 
            bottom: 20px !important; 
            right: 20px !important; 
            width: 50px !important; 
            height: 50px !important; 
            background: #0f172a !important; 
            border: 2px solid #38bdf8 !important; 
            border-radius: 50% !important; 
            color: #38bdf8 !important; 
            cursor: pointer !important; 
            display: flex !important; 
            align-items: center !important; 
            justify-content: center !important; 
            z-index: 2147483647 !important; 
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.4) !important; 
            transition: transform 0.3s !important; 
            pointer-events: auto !important;
        }
        #vw-gear-btn:hover { 
            transform: rotate(90deg) scale(1.1) !important; 
            background: #1e293b !important; 
        }
        #vw-gear-btn svg { 
            width: 28px !important; 
            height: 28px !important; 
        }
        #vw-modal-overlay { 
            position: fixed !important; 
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important; 
            height: 100% !important; 
            background: rgba(0,0,0,0.7) !important; 
            backdrop-filter: blur(5px) !important; 
            z-index: 2147483647 !important; 
            display: none; 
            align-items: center !important; 
            justify-content: center !important; 
        }
        .vw-modal { 
            background: #020617 !important; 
            border: 1px solid #1e293b !important; 
            width: 90% !important; 
            max-width: 400px !important; 
            border-radius: 16px !important; 
            padding: 25px !important; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.8) !important; 
            text-align: center !important; 
            color: #fff !important; 
            font-family: 'Segoe UI', sans-serif !important; 
            position: relative !important; 
        }
        .vw-modal h2 { 
            margin: 0 0 20px 0 !important; 
            color: #38bdf8 !important; 
            font-size: 22px !important; 
        }
        .vw-close-btn { 
            position: absolute !important; 
            top: 15px !important; 
            right: 15px !important; 
            background: none !important; 
            border: none !important; 
            color: #64748b !important; 
            font-size: 20px !important; 
            cursor: pointer !important; 
        }
        .vw-close-btn:hover { 
            color: #fff !important; 
        }
        .vw-toggle-row { 
            display: flex !important; 
            align-items: center !important; 
            justify-content: space-between !important; 
            margin-bottom: 20px !important; 
            background: rgba(255,255,255,0.03) !important; 
            padding: 15px !important; 
            border-radius: 10px !important; 
        }
        .vw-switch { 
            position: relative !important; 
            display: inline-block !important; 
            width: 50px !important; 
            height: 26px !important; 
        }
        .vw-switch input { 
            opacity: 0 !important; 
            width: 0 !important; 
            height: 0 !important; 
        }
        .vw-slider { 
            position: absolute !important; 
            cursor: pointer !important; 
            top: 0 !important; 
            left: 0 !important; 
            right: 0 !important; 
            bottom: 0 !important; 
            background-color: #334155 !important; 
            transition: .4s !important; 
            border-radius: 34px !important; 
            border: 1px solid #475569 !important; 
        }
        .vw-slider:before { 
            position: absolute !important; 
            content: "" !important; 
            height: 18px !important; 
            width: 18px !important; 
            left: 3px !important; 
            bottom: 3px !important; 
            background-color: white !important; 
            transition: .4s !important; 
            border-radius: 50% !important; 
        }
        input:checked + .vw-slider { 
            background: linear-gradient(135deg, #0ea5e9, #0284c7) !important; 
            border-color: #38bdf8 !important; 
        }
        input:checked + .vw-slider:before { 
            transform: translateX(24px) !important; 
        }
        .vw-label { 
            font-weight: 600 !important; 
            font-size: 16px !important; 
            display: block !important; 
            text-align: left !important; 
            color: #fff !important; 
        }
        .vw-sublabel { 
            font-size: 12px !important; 
            color: #94a3b8 !important; 
            display: block !important; 
            text-align: left !important; 
            margin-top: 4px !important; 
        }
    `;

    function getMode() {
        if (typeof GM_getValue !== 'undefined') {
            return GM_getValue(STORAGE_KEY, 'local');
        }
        return localStorage.getItem(STORAGE_KEY) || 'local';
    }

    function setMode(mode) {
        if (typeof GM_setValue !== 'undefined') {
            GM_setValue(STORAGE_KEY, mode);
        } else {
            localStorage.setItem(STORAGE_KEY, mode);
        }
    }

    function injectGearButton() {
        if (document.getElementById('vw-gear-btn')) return;
        
        const btn = document.createElement('div');
        btn.id = 'vw-gear-btn';
        btn.innerHTML = ASSETS.gear;
        btn.title = "VortixWorld Settings";
        btn.onclick = function() {
            VortixSettings.open();
        };
        
        (document.body || document.documentElement).appendChild(btn);
    }

    function keepGearOnTop() {
        setInterval(function() {
            let btn = document.getElementById('vw-gear-btn');
            if (!btn) {
                injectGearButton();
                btn = document.getElementById('vw-gear-btn');
            }
            if (btn && btn.parentNode !== document.body && document.body) {
                document.body.appendChild(btn);
            }
        }, 500);
    }

    return {
        init: function() {
            if (document.getElementById('vw-settings-css')) return;
            
            const style = document.createElement('style');
            style.id = 'vw-settings-css';
            style.textContent = CSS;
            (document.head || document.documentElement).appendChild(style);

            if (document.body) {
                injectGearButton();
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    injectGearButton();
                });
            }

            this.buildModal();
            keepGearOnTop();
        },

        buildModal: function() {
            if (document.getElementById('vw-modal-overlay')) return;
            
            const modal = document.createElement('div');
            modal.id = 'vw-modal-overlay';
            const currentMode = getMode();
            const isLocal = currentMode === 'local';

            modal.innerHTML = '<div class="vw-modal"><button class="vw-close-btn" id="vw-close-modal-btn">✕</button><h2>⚙️ Settings</h2><div class="vw-toggle-row"><div><span class="vw-label">LootLink Bypass Logic</span><span class="vw-sublabel">Turn Off To Redirect To Bypass Site Instead</span></div><label class="vw-switch"><input type="checkbox" id="vw-mode-toggle" ' + (isLocal ? 'checked' : '') + '><span class="vw-slider"></span></label></div><div style="font-size:12px; color:#64748b; margin-top:20px; line-height:1.4; text-align:left; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px;"><div style="margin-bottom:6px;"><strong style="color:#e2e8f0">Off:</strong> Redirects to VortixWorld Bypass Site</div><div><strong style="color:#e2e8f0">On:</strong> Runs Local Lootlinks Bypass Logic</div></div></div>';
            
            (document.body || document.documentElement).appendChild(modal);

            document.getElementById('vw-close-modal-btn').addEventListener('click', function() {
                document.getElementById('vw-modal-overlay').style.display = 'none';
            });

            var toggle = document.getElementById('vw-mode-toggle');
            toggle.addEventListener('change', function(e) {
                var newMode = e.target.checked ? 'local' : 'remote';
                setMode(newMode);
                if(confirm("Mode changed. Reload page to apply?")) {
                    location.reload();
                }
            });
        },

        open: function() {
            var m = document.getElementById('vw-modal-overlay');
            if(m) {
                m.style.display = 'flex';
            } else {
                VortixSettings.buildModal();
                document.getElementById('vw-modal-overlay').style.display = 'flex';
            }
        },

        isLocalMode: function() {
            return getMode() === 'local';
        }
    };
})();