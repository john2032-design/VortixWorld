window.VortixLootlink = (function() {
    const CUSTOM_ICON = "https://i.ibb.co/cKy9ztXL/IMG-3412.png";
    const CUSTOM_ICON_HTML = `<img src="${CUSTOM_ICON}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    const BYPASS_SITE_URL = "https://vortix-world-bypass.vercel.app/userscript.html?time=10&url=";

    const styles = `
        .text-gradient {
            background: linear-gradient(90deg, #000000, #0000ff) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            color: #0000ff !important;
        }

        #vwOverlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #ffffff !important;
            z-index: 2147483640 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            box-sizing: border-box !important;
        }
        #vwOverlay * { box-sizing: border-box !important; }

        .vw-header-bar {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 80px !important;
            padding: 0 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            background: rgba(255, 255, 255, 0.95) !important;
            border-bottom: 2px solid #e0e0e0 !important;
            z-index: 2147483642 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
            backdrop-filter: blur(10px) !important;
        }

        .vw-title {
            font-weight: 800 !important;
            font-size: 24px !important;
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
        }
        
        .vw-header-icon {
            height: 35px !important;
            width: 35px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            border: 2px solid #0000ff !important;
        }

        .vw-main-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            max-width: 600px !important;
            animation: vw-fade-in 0.6s ease-out !important;
            position: relative !important;
            z-index: 2147483641 !important;
            padding-top: 60px !important; 
        }

        .vw-icon-img {
            width: 80px !important;
            height: 80px !important;
            border-radius: 16px !important;
            margin-bottom: 25px !important;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1) !important;
            object-fit: cover !important;
        }

        .vw-spinner-container {
            position: relative !important;
            width: 60px !important;
            height: 60px !important;
            margin-bottom: 30px !important;
        }
        .vw-spinner-outer {
            position: absolute !important;
            width: 100% !important; height: 100% !important;
            border: 4px solid transparent !important;
            border-top: 4px solid #0000ff !important;
            border-right: 4px solid #0000ff !important;
            border-radius: 50% !important;
            animation: vw-spin 1s linear infinite !important;
        }
        .vw-spinner-inner {
            position: absolute !important;
            top: 8px !important; left: 8px !important;
            width: 44px !important; height: 44px !important;
            border: 4px solid transparent !important;
            border-bottom: 4px solid #000000 !important;
            border-left: 4px solid #000000 !important;
            border-radius: 50% !important;
            animation: vw-spin-reverse 0.8s linear infinite !important;
        }
        
        @keyframes vw-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes vw-spin-reverse { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes vw-fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .vw-status { 
            font-size: 22px !important; 
            font-weight: 800 !important; 
            text-align: center !important; 
            margin-bottom: 10px !important;
        }
        .vw-substatus { 
            font-size: 15px !important; 
            color: #666 !important; 
            text-align: center !important;
            font-weight: 500 !important;
        }

        .vw-result-area {
            width: 80% !important;
            display: none !important;
            flex-direction: column !important;
            gap: 15px !important;
            margin-top: 30px !important;
        }
        .vw-input {
            width: 100% !important;
            background: #f5f5f5 !important;
            border: 2px solid #0000ff !important;
            color: #000 !important;
            padding: 16px !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            outline: none !important;
            font-family: monospace !important;
            text-align: center !important;
        }
        .vw-btn {
            background: linear-gradient(135deg, #000000, #0000ff) !important;
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
        }
        .vw-btn:hover { opacity: 0.9 !important; transform: translateY(-2px) !important; }

        .vw-alt-btn {
            background: transparent !important;
            color: #0000ff !important;
            border: 2px solid #0000ff !important;
            padding: 10px 20px !important;
            border-radius: 8px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            margin-top: 15px !important;
            font-size: 14px !important;
            transition: all 0.2s !important;
        }
        .vw-alt-btn:hover { background: rgba(0,0,255,0.05) !important; }

        .vw-toggle-container { 
            display: flex !important; 
            align-items: center !important; 
            gap: 15px !important; 
            font-size: 14px !important; 
            color: #000 !important; 
            font-weight: 700 !important;
            background: #f0f0f0 !important;
            padding: 10px 20px !important;
            border-radius: 30px !important;
            border: 1px solid #ddd !important;
            cursor: pointer !important;
            z-index: 2147483650 !important;
            pointer-events: auto !important;
            user-select: none !important;
        }
        .vw-switch { 
            position: relative !important; 
            display: inline-block !important; 
            width: 46px !important; 
            height: 24px !important; 
            pointer-events: auto !important;
        }
        .vw-switch input { 
            opacity: 0 !important; 
            width: 100% !important; 
            height: 100% !important; 
            position: absolute !important; 
            top: 0 !important; left: 0 !important; 
            cursor: pointer !important;
            z-index: 2147483651 !important;
            margin: 0 !important;
        }
        .vw-slider { 
            position: absolute !important; 
            cursor: pointer !important; 
            top: 0 !important; 
            left: 0 !important; 
            right: 0 !important; 
            bottom: 0 !important; 
            background-color: #ccc !important; 
            transition: 0.4s !important; 
            border-radius: 34px !important; 
            pointer-events: none !important;
        }
        .vw-slider:before { position: absolute !important; content: "" !important; height: 16px !important; width: 16px !important; left: 3px !important; bottom: 3px !important; background-color: #fff !important; transition: 0.4s !important; border-radius: 50% !important; }
        .vw-switch input:checked + .vw-slider { background: linear-gradient(135deg, #000000, #0000ff) !important; }
        .vw-switch input:checked + .vw-slider:before { transform: translateX(22px) !important; }
        
        #vwNotificationContainer {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 2147483647 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            pointer-events: none !important;
            align-items: flex-end !important;
            transform: translateZ(9999px) !important;
        }
        .vw-notif-toast {
            background: #ffffff !important;
            border-left: 5px solid #0000ff !important;
            border-radius: 8px !important;
            width: 250px !important;
            max-width: 90vw !important;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15) !important;
            overflow: hidden !important;
            animation: vw-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
            display: flex !important;
            flex-direction: column !important;
            pointer-events: auto !important;
            flex-shrink: 0 !important;
            border: 1px solid #eee !important;
        }
        .vw-notif-content {
            padding: 10px !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            font-weight: 800 !important;
            font-size: 13px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        }
        .vw-icon-circle {
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
        .vw-notif-bar {
            height: 3px !important;
            background: linear-gradient(90deg, #000000, #0000ff) !important;
            width: 100% !important;
            animation: vw-progress linear forwards !important;
        }
        @keyframes vw-slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes vw-fade-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); pointer-events: none; } }
        @keyframes vw-progress { from { width: 100%; } to { width: 0%; } }

        @media (max-width: 480px) {
            .vw-header-bar { padding: 0 15px !important; }
            .vw-title { font-size: 18px !important; }
            .vw-toggle-container span { display: block !important; font-size: 12px !important; } 
            .vw-result-area { width: 90% !important; }
            #vwNotificationContainer { top: 90px !important; right: 10px !important; }
        }
    `;

    const uiHTML = `
        <div id="vwOverlay">
            <div class="vw-header-bar">
                <div class="vw-title text-gradient">
                    <img src="${CUSTOM_ICON}" class="vw-header-icon" alt="Icon">
                    VortixWorld
                </div>
                <div class="vw-toggle-container">
                    <span>AutoRedirect</span>
                    <label class="vw-switch">
                        <input type="checkbox" id="vwAutoToggle">
                        <span class="vw-slider"></span>
                    </label>
                </div>
            </div>
            <div class="vw-main-content">
                <img src="${CUSTOM_ICON}" class="vw-icon-img" alt="VortixWorld">
                <div id="vwSpinnerContainer" class="vw-spinner-container">
                    <div class="vw-spinner-outer"></div>
                    <div class="vw-spinner-inner"></div>
                </div>
                <div id="vwStatus" class="vw-status text-gradient">Initializing...</div>
                <div id="vwSubStatus" class="vw-substatus">Waiting for page to load</div>
                
                <button id="vwBypassSiteBtn" class="vw-alt-btn">Use Bypass Site</button>
                
                <div id="vwResult" class="vw-result-area">
                    <input type="text" id="vwUrlInput" class="vw-input" readonly placeholder="URL will appear here">
                    <button id="vwCopyBtn" class="vw-btn">📋 Copy URL</button>
                </div>
            </div>
        </div>
    `;

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

    let uiInjected = false;
    let isAutoRedirect = localStorage.getItem('vw_auto_redirect') !== 'false'; 
    let PUBLISHER_LINK = "";

    function injectStyles() {
        if (document.getElementById('vwStyles')) return;
        const styleSheet = document.createElement("style");
        styleSheet.id = 'vwStyles';
        styleSheet.innerText = styles;
        (document.head || document.documentElement).appendChild(styleSheet);
    }

    function spawnNotification(text, iconContent = CUSTOM_ICON_HTML, duration = 5000) {
        let container = document.getElementById('vwNotificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'vwNotificationContainer';
            (document.documentElement).appendChild(container);
        }

        const notif = document.createElement('div');
        notif.className = 'vw-notif-toast';
        notif.style.zIndex = "2147483648"; 
        
        notif.innerHTML = `
            <div class="vw-notif-content">
                <div class="vw-icon-circle">${iconContent}</div>
                <span class="text-gradient">${text}</span>
            </div>
            <div class="vw-notif-bar" style="animation-duration: ${duration}ms;"></div>
        `;

        container.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'vw-fade-out 0.5s ease-in forwards';
            setTimeout(() => notif.remove(), 500);
        }, duration);
    }

    const notifMessages = [
        { icon: CUSTOM_ICON_HTML, text: "VortixWorld" },
        { icon: "👑", text: "Created By @afk.l0l" },
        { icon: CUSTOM_ICON_HTML, text: "Lootlink Bypasser" }
    ];
    let msgIndex = 0;

    function startNotificationLoop() {
        const showNext = () => {
            const msg = notifMessages[msgIndex];
            spawnNotification(msg.text, msg.icon, 3500);
            msgIndex = (msgIndex + 1) % notifMessages.length;
            setTimeout(showNext, 4000); 
        };
        setTimeout(showNext, 1000);
    }

    function injectUI() {
        if (uiInjected && document.getElementById('vwOverlay')) return;
        
        const existing = document.getElementById('vwOverlay');
        if (existing) existing.remove();
        
        injectStyles();

        const wrapper = document.createElement('div');
        wrapper.innerHTML = uiHTML;
        
        const overlay = wrapper.querySelector('#vwOverlay');
        const mountPoint = document.documentElement;

        let notifContainer = document.getElementById('vwNotificationContainer');
        if (!notifContainer) {
            notifContainer = document.createElement('div');
            notifContainer.id = 'vwNotificationContainer';
            mountPoint.appendChild(notifContainer);
        }

        if (mountPoint) {
            mountPoint.appendChild(overlay);
        }

        uiInjected = true;

        spawnNotification("VortixWorld Userscript Loaded!", CUSTOM_ICON_HTML, 5000);
        startNotificationLoop();

        const toggle = document.getElementById('vwAutoToggle');
        if (toggle) {
            toggle.checked = isAutoRedirect;
            toggle.addEventListener('change', (e) => {
                isAutoRedirect = e.target.checked;
                localStorage.setItem('vw_auto_redirect', isAutoRedirect);
            });
        }
        
        const bypassBtn = document.getElementById('vwBypassSiteBtn');
        if(bypassBtn) {
            bypassBtn.addEventListener('click', () => {
                const currentUrl = window.location.href;
                window.location.href = BYPASS_SITE_URL + encodeURIComponent(currentUrl);
            });
        }

        const copyBtn = document.getElementById('vwCopyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const copyText = document.getElementById("vwUrlInput");
                if (!copyText) return;
                copyText.select();
                copyText.setSelectionRange(0, 99999);
                try {
                    navigator.clipboard.writeText(copyText.value).then(() => {
                        copyBtn.innerText = "✔️ Copied!";
                        setTimeout(() => copyBtn.innerText = "📋 Copy URL", 2000);
                    }).catch(() => fallbackCopy(copyText, copyBtn));
                } catch(e) {
                    fallbackCopy(copyText, copyBtn);
                }
            });
        }
    }

    function fallbackCopy(inputElement, button) {
        inputElement.focus();
        inputElement.select();
        try {
            document.execCommand('copy');
            button.innerText = "✔️ Copied!";
        } catch (err) {
            button.innerText = "❌ Failed";
        }
        setTimeout(() => button.innerText = "📋 Copy URL", 2000);
    }

    function keepUIAlive() {
        setInterval(() => {
            if (!document.getElementById('vwOverlay')) {
                uiInjected = false;
                injectUI();
            }
            const nc = document.getElementById('vwNotificationContainer');
            if (!nc) {
                const newNc = document.createElement('div');
                newNc.id = 'vwNotificationContainer';
                (document.documentElement).appendChild(newNc);
            }
        }, 500);
    }

    function updateStatus(main, sub) {
        if(!document.getElementById('vwOverlay')) injectUI();
        const m = document.getElementById('vwStatus');
        const s = document.getElementById('vwSubStatus');
        if (m) m.innerText = main;
        if (s) s.innerText = sub;
    }

    function showResult(url) {
        if(!document.getElementById('vwOverlay')) injectUI();
        const spinner = document.getElementById('vwSpinnerContainer');
        const status = document.getElementById('vwStatus');
        const sub = document.getElementById('vwSubStatus');
        const resultArea = document.getElementById('vwResult');
        const input = document.getElementById('vwUrlInput');
        
        if (spinner) spinner.style.display = 'none';
        
        if (status) {
            status.innerText = "✔️ Bypass Complete!";
        }
        
        if (sub) sub.style.display = 'none';
        
        if (resultArea) {
            resultArea.style.setProperty('display', 'flex', 'important');
        }
        
        if (input) {
            input.value = url;
        }
        
        spawnNotification("Bypass Complete 🥳", "✔️", 10000);
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
                    const resultArea = document.getElementById('vwResult');
                    const isResultVisible = resultArea && window.getComputedStyle(resultArea).display !== 'none';
                    if (!isResultVisible) {
                        updateStatus("🔄 Bypassing...", `(Estimated ${remaining} seconds remaining..)`);
                    }
                    if (remaining <= 0) clearInterval(countdownTimer);
                }, 1000);
            }
        };

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
                    const foundElement = Array.from(document.querySelectorAll('body *')).find(element => element.textContent.includes("UNLOCK CONTENT"));
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

    function initializeUI() {
        injectUI();
        keepUIAlive();
        waitForElementAndModifyParent();
        updateStatus("⏳ Loading...", "Preparing bypass");
    }

    return {
        execute: function() {
            setTimeout(function() {
                console.log("%c[INFO] VortixWorld Bypass", "color: #0000ff; font-weight: bold; font-size: 14px;");
            }, 0);

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeUI);
                window.addEventListener('load', () => {
                    if(!uiInjected) initializeUI();
                });
            } else {
                initializeUI();
            }

            const originalFetch = window.fetch;
            window.fetch = function(url, config) {
                if (url.includes(`${window.INCENTIVE_SYNCER_DOMAIN}/tc`)) {
                    return originalFetch(url, config).then(response => {
                        if (!response.ok) return JSON.stringify(response);
                        return response.clone().json().then(data => {
                            let urid = "";
                            let task_id = "";
                            let action_pixel_url = "";
                            data.forEach(item => {
                                urid = item.urid;
                                task_id = 54;
                                action_pixel_url = item.action_pixel_url;
                            });
                            const ws = new WebSocket(`wss://${urid.substr(-5) % 3}.${window.INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${window.KEY}`);
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
                                if(!PUBLISHER_LINK) {
                                    updateStatus("❌ Error", "Could not retrieve link");
                                    return;
                                }
                                const finalUrl = decodeURIComponent(decodeURI(PUBLISHER_LINK));
                                if (isAutoRedirect) {
                                    updateStatus("🚀 Redirecting...", "Target URL acquired");
                                    spawnNotification("Bypass Complete 🥳", "✔️", 10000);
                                    setTimeout(() => {
                                        window.location.href = finalUrl;
                                    }, 1000);
                                } else {
                                    showResult(finalUrl);
                                }
                            };
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
        }
    };
})();