window.VortixLib = (function() {
    const ASSETS = {
        logo: 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png',
        iconGear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
    };

    const CSS = `
        html.vw-active, body.vw-active { height: 100%; margin: 0; padding: 0; background: linear-gradient(135deg, #020617, #000000); font-family: 'Segoe UI', sans-serif; overflow: hidden; color: #fff; }
        .bh-root { min-height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
        .bh-header-bar { position: fixed; top: 0; left: 0; width: 100%; height: 80px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; background: rgba(2, 6, 23, 0.95); border-bottom: 1px solid #1e293b; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.5); backdrop-filter: blur(10px); box-sizing: border-box; }
        .bh-title { font-weight: 800; font-size: 24px; color: #38bdf8; display: flex; align-items: center; gap: 15px; text-shadow: 0 0 15px rgba(56, 189, 248, 0.4); }
        .bh-header-icon { height: 35px; width: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #38bdf8; }
        .bh-main-content { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 600px; padding: 20px; animation: bh-fade-in 0.6s ease-out; position: relative; z-index: 10; margin-top: 60px; }
        .bh-icon-img { width: 80px; height: 80px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 0 25px rgba(56, 189, 248, 0.25); object-fit: cover; }
        .bh-status { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .bh-substatus { font-size: 15px; color: #94a3b8; text-align: center; margin-bottom: 15px; }
        .bh-spinner-container { position: relative; width: 60px; height: 60px; margin-bottom: 30px; }
        .bh-spinner-outer { position: absolute; width: 100%; height: 100%; border: 4px solid transparent; border-top: 4px solid #38bdf8; border-right: 4px solid #38bdf8; border-radius: 50%; animation: bh-spin 1s linear infinite; }
        .bh-spinner-inner { position: absolute; top: 8px; left: 8px; width: 44px; height: 44px; border: 4px solid transparent; border-bottom: 4px solid #7dd3fc; border-left: 4px solid #7dd3fc; border-radius: 50%; animation: bh-spin-reverse 0.8s linear infinite; }
        .bh-spinner-dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: #38bdf8; border-radius: 50%; animation: bh-pulse 1s ease-in-out infinite; }
        .bh-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; border: none; padding: 16px 20px; border-radius: 8px; font-weight: 800; cursor: pointer; text-decoration: none; display: inline-block; text-transform: uppercase; transition: all 0.2s; font-size: 15px; letter-spacing: 1px; box-shadow: 0 5px 20px rgba(14, 165, 233, 0.3); margin-top: 15px; }
        .bh-btn:hover { background: linear-gradient(135deg, #38bdf8, #0ea5e9); transform: translateY(-2px); }
        @keyframes bh-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes bh-spin-reverse { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes bh-pulse { 0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); } }
        @keyframes bh-fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
        .vw-label { font-weight: 600; font-size: 16px; display:block; text-align:left; }
        .vw-sublabel { font-size: 12px; color: #94a3b8; display: block; text-align: left; margin-top:4px; }
    `;

    const STORAGE_KEY = 'vw_bypass_mode';
    
    function getMode() {
        if (typeof GM_getValue !== 'undefined') return GM_getValue(STORAGE_KEY, 'remote');
        return localStorage.getItem(STORAGE_KEY) || 'remote';
    }

    function setMode(mode) {
        if (typeof GM_setValue !== 'undefined') GM_setValue(STORAGE_KEY, mode);
        else localStorage.setItem(STORAGE_KEY, mode);
    }

    function decodeURI(encodedString, prefixLength = 5) {
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

    return {
        initUI: function() {
            if (!document.getElementById('vw-styles')) {
                const s = document.createElement('style');
                s.id = 'vw-styles';
                s.textContent = CSS;
                document.head.appendChild(s);
            }
            if (!document.getElementById('vw-gear-btn')) {
                const btn = document.createElement('div');
                btn.id = 'vw-gear-btn';
                btn.innerHTML = ASSETS.iconGear;
                btn.title = "VortixWorld Settings";
                btn.onclick = this.openSettings;
                document.body.appendChild(btn);
            }
            if (!document.getElementById('vw-modal-overlay')) {
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
                                <span class="vw-label">Bypass Logic</span>
                                <span class="vw-sublabel" id="vw-mode-text">${isLocal ? 'Using Native Local Logic' : 'Using VortixWorld Redirect'}</span>
                            </div>
                            <label class="vw-switch">
                                <input type="checkbox" id="vw-mode-toggle" ${isLocal ? 'checked' : ''}>
                                <span class="vw-slider"></span>
                            </label>
                        </div>
                        <p style="font-size:12px; color:#64748b; margin-top:20px; line-height:1.4;">
                            <strong>Remote:</strong> Redirects to VortixWorld API (Recommended)<br>
                            <strong>Local:</strong> Runs bypass logic directly on this page
                        </p>
                    </div>
                `;
                document.body.appendChild(modal);
                const toggle = document.getElementById('vw-mode-toggle');
                const text = document.getElementById('vw-mode-text');
                toggle.addEventListener('change', (e) => {
                    const newMode = e.target.checked ? 'local' : 'remote';
                    setMode(newMode);
                    text.innerText = e.target.checked ? 'Using Native Local Logic' : 'Using VortixWorld Redirect';
                    if(confirm("Settings saved. Reload page to apply?")) location.reload();
                });
            }
        },

        openSettings: function() {
            const m = document.getElementById('vw-modal-overlay');
            if(m) m.style.display = 'flex';
        },

        isLocalMode: function() {
            return getMode() === 'local';
        },

        generatePage: function(status, subStatus, showBtn = false, btnLink = '#') {
            document.documentElement.classList.add('vw-active');
            document.body.classList.add('vw-active');
            return `
                <div class="bh-root">
                    <div class="bh-header-bar">
                        <div class="bh-title">
                            <img src="${ASSETS.logo}" class="bh-header-icon" alt="Icon" />
                            VortixWorld
                        </div>
                    </div>
                    <div class="bh-main-content">
                        <img src="${ASSETS.logo}" class="bh-icon-img" alt="VortixWorld" />
                        <div class="bh-spinner-container">
                            <div class="bh-spinner-outer"></div>
                            <div class="bh-spinner-inner"></div>
                            <div class="bh-spinner-dot"></div>
                        </div>
                        <div class="bh-status" id="bhStatus">${status}</div>
                        <div class="bh-substatus" id="bhSubStatus">${subStatus}</div>
                        ${showBtn ? `<a href="${btnLink}" class="bh-btn">Click here to continue</a>` : ''}
                    </div>
                </div>
            `;
        },

        updateStatus: function(main, sub) {
            const m = document.getElementById('bhStatus');
            const s = document.getElementById('bhSubStatus');
            if(m) m.innerText = main;
            if(s) s.innerText = sub;
        },

        executeNativeLootlink: function() {
            let PUBLISHER_LINK = "";
            const INCENTIVE_SERVER_DOMAIN = window.INCENTIVE_SERVER_DOMAIN || "one-zero-zero-one.com";
            const INCENTIVE_SYNCER_DOMAIN = window.INCENTIVE_SYNCER_DOMAIN || "s-y-n-c.com";
            const KEY = window.KEY || ""; 
            const TID = window.TID || ""; 

            const originalFetch = window.fetch;
            window.fetch = function(url, config) {
                if (String(url).includes('/tc') || String(url).includes('incentive-sync')) {
                    return originalFetch(url, config).then(response => {
                        if (!response.ok) return JSON.stringify(response);
                        return response.clone().json().then(data => {
                            let urid = "";
                            let task_id = "";
                            let action_pixel_url = "";
                            if(Array.isArray(data)) {
                                data.forEach(item => {
                                    urid = item.urid;
                                    task_id = 54;
                                    action_pixel_url = item.action_pixel_url;
                                });
                            } else {
                                urid = data.urid;
                                task_id = 54;
                                action_pixel_url = data.action_pixel_url;
                            }
                            const ws = new WebSocket(`wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`);
                            ws.onopen = () => setInterval(() => ws.send('0'), 1000);
                            ws.onmessage = event => {
                                if (event.data.includes('r:')) {
                                    PUBLISHER_LINK = event.data.replace('r:', '');
                                    const finalUrl = decodeURIComponent(decodeURI(PUBLISHER_LINK));
                                    VortixLib.updateStatus("Success!", "Redirecting...");
                                    setTimeout(() => { window.location.href = finalUrl; }, 1000);
                                }
                            };
                            if(urid) navigator.sendBeacon(`https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`);
                            if(action_pixel_url) fetch(action_pixel_url);
                            if(urid) fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`);
                            return new Response(JSON.stringify(data), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers
                            });
                        });
                    });
                }
                return originalFetch(url, config);
            };

            const modifyParentElement = (targetElement) => {
                const parentElement = targetElement.parentElement;
                if (parentElement) {
                    const images = document.querySelectorAll('img');
                    let countdownSeconds = 60;
                    for (let img of images) {
                        if (img.src.includes('eye.png')) { countdownSeconds = 13; break; } 
                        else if (img.src.includes('bell.png')) { countdownSeconds = 30; break; } 
                        else if (img.src.includes('apps.png') || img.src.includes('fire.png')) { countdownSeconds = 60; break; } 
                        else if (img.src.includes('gamers.png')) { countdownSeconds = 90; break; }
                    }
                    parentElement.innerHTML = '';
                    parentElement.style.cssText = 'height: 0px !important; overflow: hidden !important; visibility: hidden !important;';
                    let remaining = countdownSeconds;
                    const countdownTimer = setInterval(() => {
                        remaining--;
                        VortixLib.updateStatus("Bypassing...", `(Estimated ${remaining}s remaining...)`);
                        if (remaining <= 0) clearInterval(countdownTimer);
                    }, 1000);
                }
            };

            const initLocal = () => {
                localStorage.clear();
                for(let i=0; i<100; i++) {
                    if(54 !== i) {
                        const key = "t_" + i;
                        const value = { value: 1, expiry: new Date().getTime() + 6048e5 };
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                }
                const observer = new MutationObserver((mutationsList, obs) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            const foundElement = Array.from(document.querySelectorAll('body *')).find(element => element.textContent && element.textContent.includes("UNLOCK CONTENT"));
                            if (foundElement) {
                                modifyParentElement(foundElement);
                                obs.disconnect();
                                break;
                            }
                        }
                    }
                });
                if (document.body) {
                    observer.observe(document.body, { childList: true, subtree: true });
                } else {
                    window.addEventListener('load', () => {
                        observer.observe(document.body, { childList: true, subtree: true });
                    });
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initLocal);
            } else {
                initLocal();
            }
        }
    };
})();
