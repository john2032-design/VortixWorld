window.VortixLootlink = (function() {
    const CUSTOM_ICON = "https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png";
    const CUSTOM_ICON_HTML = `<img src="${CUSTOM_ICON}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 2px solid #38bdf8;">`;
    const BYPASS_SITE_URL = "https://vortix-world-bypass.vercel.app/userscript.html?time=10&url=";

    const CSS = `
        .text-gradient {
            background: linear-gradient(90deg, #38bdf8, #0ea5e9) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            color: #38bdf8 !important;
        }

        #baconHubOverlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: linear-gradient(135deg, #020617, #000000) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            box-sizing: border-box !important;
            color: #fff !important;
        }
        #baconHubOverlay * { box-sizing: border-box !important; }

        .bh-header-bar {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 80px !important;
            padding: 0 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            background: rgba(2, 6, 23, 0.95) !important;
            border-bottom: 1px solid #1e293b !important;
            z-index: 2147483649 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            backdrop-filter: blur(10px) !important;
        }

        .bh-title {
            font-weight: 800 !important;
            font-size: 24px !important;
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
            color: #38bdf8 !important;
        }
        
        .bh-header-icon {
            height: 35px !important;
            width: 35px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            border: 2px solid #38bdf8 !important;
        }

        .bh-toggle-container { 
            display: flex !important; 
            align-items: center !important; 
            gap: 10px !important; 
            font-size: 14px !important; 
            color: #fff !important; 
            font-weight: 700 !important;
            background: rgba(255,255,255,0.05) !important;
            padding: 8px 16px !important;
            border-radius: 30px !important;
            border: 1px solid #334155 !important;
        }
        .bh-switch { 
            position: relative !important; 
            display: inline-block !important; 
            width: 40px !important; 
            height: 20px !important; 
        }
        .bh-switch input { opacity: 0 !important; width: 0 !important; height: 0 !important; }
        .bh-slider { 
            position: absolute !important; 
            cursor: pointer !important; 
            top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; 
            background-color: #334155 !important; 
            transition: .4s !important; 
            border-radius: 34px !important; 
        }
        .bh-slider:before { 
            position: absolute !important; 
            content: "" !important; 
            height: 14px !important; 
            width: 14px !important; 
            left: 3px !important; 
            bottom: 3px !important; 
            background-color: white !important; 
            transition: .4s !important; 
            border-radius: 50% !important; 
        }
        .bh-switch input:checked + .bh-slider { background: linear-gradient(135deg, #0ea5e9, #0284c7) !important; }
        .bh-switch input:checked + .bh-slider:before { transform: translateX(20px) !important; }

        .bh-main-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            max-width: 600px !important;
            animation: bh-fade-in 0.6s ease-out !important;
            position: relative !important;
            z-index: 2147483648 !important;
            padding-top: 60px !important; 
        }

        .bh-icon-img {
            width: 80px !important;
            height: 80px !important;
            border-radius: 16px !important;
            margin-bottom: 25px !important;
            box-shadow: 0 0 25px rgba(56, 189, 248, 0.25) !important;
            object-fit: cover !important;
        }

        .bh-spinner-container {
            position: relative !important;
            width: 60px !important;
            height: 60px !important;
            margin-bottom: 30px !important;
        }
        .bh-spinner-outer {
            position: absolute !important;
            width: 100% !important; height: 100% !important;
            border: 4px solid transparent !important;
            border-top: 4px solid #38bdf8 !important;
            border-right: 4px solid #38bdf8 !important;
            border-radius: 50% !important;
            animation: bh-spin 1s linear infinite !important;
        }
        .bh-spinner-inner {
            position: absolute !important;
            top: 8px !important; left: 8px !important;
            width: 44px !important; height: 44px !important;
            border: 4px solid transparent !important;
            border-bottom: 4px solid #7dd3fc !important;
            border-left: 4px solid #7dd3fc !important;
            border-radius: 50% !important;
            animation: bh-spin-reverse 0.8s linear infinite !important;
        }
        
        @keyframes bh-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes bh-spin-reverse { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes bh-fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .bh-status { 
            font-size: 22px !important; 
            font-weight: 800 !important; 
            text-align: center !important; 
            margin-bottom: 10px !important;
            color: #fff !important;
        }
        .bh-substatus { 
            font-size: 15px !important; 
            color: #94a3b8 !important; 
            text-align: center !important;
            font-weight: 500 !important;
            margin-bottom: 20px !important;
        }

        .bh-result-area {
            width: 80% !important;
            display: none !important;
            flex-direction: column !important;
            gap: 15px !important;
            margin-top: 30px !important;
        }
        .bh-input {
            width: 100% !important;
            background: #1e293b !important;
            border: 2px solid #38bdf8 !important;
            color: #fff !important;
            padding: 16px !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            outline: none !important;
            font-family: monospace !important;
            text-align: center !important;
        }
        .bh-btn {
            background: linear-gradient(135deg, #0ea5e9, #0284c7) !important;
            color: #fff !important;
            border: none !important;
            padding: 16px 20px !important;
            border-radius: 8px !important;
            font-weight: 800 !important;
            cursor: pointer !important;
            width: 100% !important;
            text-transform: uppercase !important;
            transition: all 0.2s !important;
            font-size: 15px !important;
            letter-spacing: 1px !important;
            box-shadow: 0 5px 20px rgba(14, 165, 233, 0.3) !important;
        }
        .bh-btn:hover { opacity: 0.9 !important; transform: translateY(-2px) !important; }

        .bh-alt-btn {
            background: transparent !important;
            color: #38bdf8 !important;
            border: 2px solid #38bdf8 !important;
            padding: 10px 20px !important;
            border-radius: 8px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            margin-top: 15px !important;
            font-size: 14px !important;
            transition: all 0.2s !important;
        }
        .bh-alt-btn:hover { background: rgba(56, 189, 248, 0.1) !important; }
        
        #bhNotificationContainer {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 2147483650 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            pointer-events: none !important;
            align-items: flex-end !important;
            transform: translateZ(9999px) !important;
        }
        .bh-notif-toast {
            background: #0f172a !important;
            border-left: 5px solid #38bdf8 !important;
            border-radius: 8px !important;
            width: 250px !important;
            max-width: 90vw !important;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5) !important;
            overflow: hidden !important;
            animation: bh-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
            display: flex !important;
            flex-direction: column !important;
            pointer-events: auto !important;
            flex-shrink: 0 !important;
            border: 1px solid #1e293b !important;
        }
        .bh-notif-content {
            padding: 10px !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            font-weight: 800 !important;
            font-size: 13px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            color: #fff !important;
        }
        .bh-icon-circle {
            width: 26px !important;
            height: 26px !important;
            border-radius: 50% !important;
            background: transparent !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            overflow: hidden !important;
        }
        .bh-notif-bar {
            height: 3px !important;
            background: linear-gradient(90deg, #38bdf8, #0ea5e9) !important;
            width: 100% !important;
            animation: bh-progress linear forwards !important;
        }
        @keyframes bh-slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes bh-fade-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); pointer-events: none; } }
        @keyframes bh-progress { from { width: 100%; } to { width: 0%; } }

        @media (max-width: 480px) {
            .bh-header-bar { padding: 0 15px !important; }
            .bh-title { font-size: 18px !important; }
            #bhNotificationContainer { top: 90px !important; right: 10px !important; }
        }
    `;

    const uiHTML = `
        <div id="baconHubOverlay">
            <div class="bh-header-bar">
                <div class="bh-title text-gradient">
                    <img src="${CUSTOM_ICON}" class="bh-header-icon" alt="Icon">
                    VortixWorld
                </div>
                <div class="bh-toggle-container">
                    <span>AutoRedirect</span>
                    <label class="bh-switch">
                        <input type="checkbox" id="bhAutoToggle">
                        <span class="bh-slider"></span>
                    </label>
                </div>
            </div>
            <div class="bh-main-content">
                <img src="${CUSTOM_ICON}" class="bh-icon-img" alt="VortixWorld">
                <div id="bhSpinnerContainer" class="bh-spinner-container">
                    <div class="bh-spinner-outer"></div>
                    <div class="bh-spinner-inner"></div>
                </div>
                <div id="bhStatus" class="bh-status text-gradient">Initializing...</div>
                <div id="bhSubStatus" class="bh-substatus">Waiting for page to load</div>
                
                <button id="bhBypassSiteBtn" class="bh-alt-btn">Use Bypass Site</button>

                <div id="bhResult" class="bh-result-area">
                    <input type="text" id="bhUrlInput" class="bh-input" readonly placeholder="URL will appear here">
                    <button id="bhCopyBtn" class="bh-btn">📋 Copy URL</button>
                </div>
            </div>
        </div>
    `;

    function injectStyles() {
        if (document.getElementById('baconHubStyles')) return;
        const styleSheet = document.createElement("style");
        styleSheet.id = 'baconHubStyles';
        styleSheet.innerText = CSS;
        (document.head || document.documentElement).appendChild(styleSheet);
    }

    function spawnNotification(text, iconContent = CUSTOM_ICON_HTML, duration = 5000) {
        let container = document.getElementById('bhNotificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'bhNotificationContainer';
            (document.documentElement).appendChild(container);
        }

        const notif = document.createElement('div');
        notif.className = 'bh-notif-toast';
        notif.innerHTML = `
            <div class="bh-notif-content">
                <div class="bh-icon-circle">${iconContent}</div>
                <span class="text-gradient">${text}</span>
            </div>
            <div class="bh-notif-bar" style="animation-duration: ${duration}ms;"></div>
        `;
        container.appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'bh-fade-out 0.5s ease-in forwards';
            setTimeout(() => notif.remove(), 500);
        }, duration);
    }

    function updateStatus(main, sub) {
        const m = document.getElementById('bhStatus');
        const s = document.getElementById('bhSubStatus');
        if (m) m.innerText = main;
        if (s) s.innerText = sub;
    }

    function decodeURI(encodedString, prefixLength = 5) {
        let decodedString = '';
        const base64Decoded = atob(encodedString);
        const prefix = base64Decoded.substring(0, prefixLength);
        const encodedPortion = base64Decoded.substring(prefixLength);
        for (let i = 0; i < encodedPortion.length; i++) {
            decodedString += String.fromCharCode(encodedPortion.charCodeAt(i) ^ prefix.charCodeAt(i % prefix.length));
        }
        return decodedString;
    }

    function notifLoop() {
        const msgs = [
            { icon: CUSTOM_ICON_HTML, text: "VortixWorld" },
            { icon: "👑", text: "Created By @afk.l0l" },
            { icon: CUSTOM_ICON_HTML, text: "Lootlink Bypasser" }
        ];
        let idx = 0;
        const show = () => {
            spawnNotification(msgs[idx].text, msgs[idx].icon, 3500);
            idx = (idx + 1) % msgs.length;
            setTimeout(show, 4000);
        }
        setTimeout(show, 1000);
    }

    function waitForElementAndModifyParent() {
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
                    const resultArea = document.getElementById('bhResult');
                    const isResultVisible = resultArea && window.getComputedStyle(resultArea).display !== 'none';
                    if (!isResultVisible) {
                        updateStatus("🔄 Bypassing...", `(Estimated ${remaining} seconds remaining..)`);
                    }
                    if (remaining <= 0) clearInterval(countdownTimer);
                }, 1000);
            }
        };

        localStorage.clear();
        for(let i=0;i<100;i++)if(54!==i){var e,$="t_"+i,t={value:1,expiry:new Date().getTime()+6048e5};localStorage.setItem($,JSON.stringify(t))}

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
    }

    return {
        execute: function() {
            injectStyles();
            
            const existing = document.getElementById('baconHubOverlay');
            if (existing) existing.remove();

            const wrapper = document.createElement('div');
            wrapper.innerHTML = uiHTML;
            document.documentElement.appendChild(wrapper.firstElementChild);

            spawnNotification("VortixWorld Loaded!", CUSTOM_ICON_HTML, 5000);
            notifLoop();

            const savedAuto = localStorage.getItem('vw_loot_auto');
            const isAuto = savedAuto !== null ? (savedAuto === 'true') : true;
            const toggle = document.getElementById('bhAutoToggle');
            if(toggle) {
                toggle.checked = isAuto;
                toggle.addEventListener('change', (e) => {
                    localStorage.setItem('vw_loot_auto', e.target.checked);
                });
            }

            const bypassBtn = document.getElementById('bhBypassSiteBtn');
            if(bypassBtn) {
                bypassBtn.addEventListener('click', () => {
                    const currentUrl = window.location.href;
                    window.location.href = BYPASS_SITE_URL + encodeURIComponent(currentUrl);
                });
            }

            const copyBtn = document.getElementById('bhCopyBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const copyText = document.getElementById("bhUrlInput");
                    if (!copyText) return;
                    copyText.select();
                    try {
                        navigator.clipboard.writeText(copyText.value).then(() => {
                            copyBtn.innerText = "✔️ Copied!";
                            setTimeout(() => copyBtn.innerText = "📋 Copy URL", 2000);
                        });
                    } catch(e) {
                        document.execCommand('copy');
                        copyBtn.innerText = "✔️ Copied!";
                        setTimeout(() => copyBtn.innerText = "📋 Copy URL", 2000);
                    }
                });
            }

            waitForElementAndModifyParent();

            const originalFetch = window.fetch;
            window.fetch = function(url, config) {
                if (String(url).includes(`${window.INCENTIVE_SYNCER_DOMAIN}/tc`)) {
                    return originalFetch(url, config).then(response => {
                        if (!response.ok) return JSON.stringify(response);
                        return response.clone().json().then(data => {
                            let urid = "", task_id = "54", action_pixel_url = "";
                            
                            data.forEach(item => { 
                                urid = item.urid; 
                                task_id = 54;
                                action_pixel_url = item.action_pixel_url; 
                            });

                            updateStatus("Resolving...", "Connecting to verification server");

                            const ws = new WebSocket(`wss://${urid.substr(-5) % 3}.${window.INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${window.KEY}`);
                            let PUBLISHER_LINK = "";
                            
                            ws.onopen = () => setInterval(() => ws.send('0'), 1000);
                            ws.onmessage = event => {
                                if (event.data.includes('r:')) {
                                    PUBLISHER_LINK = event.data.replace('r:', '');
                                }
                            };
                            
                            navigator.sendBeacon(`https://${urid.substr(-5) % 3}.${window.INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`);
                            fetch(action_pixel_url);
                            fetch(`https://${window.INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${window.TID}`);

                            ws.onclose = () => {
                                const finalUrl = decodeURIComponent(decodeURI(PUBLISHER_LINK));
                                updateStatus("Success!", "Bypass Complete");
                                spawnNotification("Bypass Complete 🥳", "✔️", 10000);
                                
                                const spinner = document.getElementById('bhSpinnerContainer');
                                const resArea = document.getElementById('bhResult');
                                const subStatus = document.getElementById('bhSubStatus');
                                const inp = document.getElementById('bhUrlInput');
                                const bypassBtn = document.getElementById('bhBypassSiteBtn');

                                if(spinner) spinner.style.display = 'none';
                                if(subStatus) subStatus.style.display = 'none';
                                if(bypassBtn) bypassBtn.style.display = 'none';
                                if(resArea) resArea.style.setProperty('display', 'flex', 'important');
                                if(inp) inp.value = finalUrl;

                                const autoRedirect = localStorage.getItem('vw_loot_auto') !== 'false';
                                if(autoRedirect) {
                                    setTimeout(() => { window.location.href = finalUrl; }, 1000);
                                }
                            };

                            return new Response(JSON.stringify(data), { status: response.status, headers: response.headers });
                        });
                    });
                }
                return originalFetch(url, config);
            };
        }
    };
})();
