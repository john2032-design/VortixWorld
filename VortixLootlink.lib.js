window.VortixLootlink = (function() {
    const LOGO_SRC = 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png';

    const CSS = `
        #vw-loot-overlay {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            background: linear-gradient(135deg, #020617, #000000) !important;
            z-index: 2147483640 !important;
            display: flex !important; flex-direction: column !important;
            align-items: center !important; justify-content: center !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            color: #fff !important;
        }
        .bh-header-bar { position: fixed; top: 0; left: 0; width: 100%; height: 80px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; background: rgba(2, 6, 23, 0.95); border-bottom: 1px solid #1e293b; z-index: 2147483642; box-shadow: 0 4px 15px rgba(0,0,0,0.5); backdrop-filter: blur(10px); box-sizing: border-box; }
        .bh-title { font-weight: 800; font-size: 24px; color: #38bdf8; display: flex; align-items: center; gap: 15px; }
        .bh-header-icon { height: 35px; width: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #38bdf8; }
        .bh-icon-img { width: 80px; height: 80px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 0 25px rgba(56, 189, 248, 0.25); object-fit: cover; }
        .bh-status { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 10px; }
        .bh-substatus { font-size: 15px; color: #94a3b8; text-align: center; margin-bottom: 15px; }
        .bh-spinner-container { position: relative; width: 60px; height: 60px; margin-bottom: 30px; }
        .bh-spinner-outer { position: absolute; width: 100%; height: 100%; border: 4px solid transparent; border-top: 4px solid #38bdf8; border-right: 4px solid #38bdf8; border-radius: 50%; animation: bh-spin 1s linear infinite; }
        .bh-spinner-inner { position: absolute; top: 8px; left: 8px; width: 44px; height: 44px; border: 4px solid transparent; border-bottom: 4px solid #7dd3fc; border-left: 4px solid #7dd3fc; border-radius: 50%; animation: bh-spin-reverse 0.8s linear infinite; }
        .bh-spinner-dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: #38bdf8; border-radius: 50%; animation: bh-pulse 1s ease-in-out infinite; }
        @keyframes bh-spin { 100% { transform: rotate(360deg); } }
        @keyframes bh-spin-reverse { 100% { transform: rotate(-360deg); } }
        @keyframes bh-pulse { 50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); } }
    `;

    function updateStatus(main, sub) {
        const m = document.getElementById('bhStatus');
        const s = document.getElementById('bhSubStatus');
        if(m) m.innerText = main;
        if(s) s.innerText = sub;
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

    return {
        execute: function() {
            const style = document.createElement('style');
            style.textContent = CSS;
            document.head.appendChild(style);

            const overlay = document.createElement('div');
            overlay.id = 'vw-loot-overlay';
            overlay.innerHTML = `
                <div class="bh-header-bar">
                    <div class="bh-title">
                        <img src="${LOGO_SRC}" class="bh-header-icon" alt="Icon" />
                        VortixWorld
                    </div>
                </div>
                <img src="${LOGO_SRC}" class="bh-icon-img" alt="VortixWorld" />
                <div class="bh-spinner-container">
                    <div class="bh-spinner-outer"></div>
                    <div class="bh-spinner-inner"></div>
                    <div class="bh-spinner-dot"></div>
                </div>
                <div class="bh-status" id="bhStatus">VortixWorld Local</div>
                <div class="bh-substatus" id="bhSubStatus">Initializing native bypass...</div>
            `;
            (document.body || document.documentElement).appendChild(overlay);

            const originalFetch = window.fetch;
            window.fetch = function(url, config) {
                const u = String(url);
                if (u.includes('/tc') || u.includes('incentive-sync') || u.includes('syncer')) {
                    return originalFetch(url, config).then(response => {
                        if (!response.ok) return JSON.stringify(response);
                        return response.clone().json().then(data => {
                            let urid = "", task_id = "54", action_pixel_url = "";
                            const SERVER_DOMAIN = window.INCENTIVE_SERVER_DOMAIN || "one-zero-zero-one.com";
                            
                            if(Array.isArray(data)) {
                                data.forEach(item => { urid = item.urid; action_pixel_url = item.action_pixel_url; });
                            } else {
                                urid = data.urid; action_pixel_url = data.action_pixel_url;
                            }

                            updateStatus("Resolving...", "Connecting to verification server");

                            const key = window.KEY || ""; 
                            const wsUrl = `wss://${urid.substr(-5) % 3}.${SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${key}`;
                            const ws = new WebSocket(wsUrl);
                            
                            ws.onopen = () => setInterval(() => ws.send('0'), 1000);
                            ws.onmessage = event => {
                                if (event.data.includes('r:')) {
                                    const finalUrl = decodeURIComponent(decodeURI(event.data.replace('r:', '')));
                                    updateStatus("Success!", "Redirecting...");
                                    setTimeout(() => { window.location.href = finalUrl; }, 1000);
                                }
                            };
                            
                            if(action_pixel_url) fetch(action_pixel_url);
                            return new Response(JSON.stringify(data), { status: response.status, headers: response.headers });
                        });
                    });
                }
                return originalFetch(url, config);
            };

            const clearJunk = () => {
                localStorage.clear();
                for(let i=0; i<100; i++) {
                    if(54 !== i) localStorage.setItem("t_" + i, JSON.stringify({ value: 1, expiry: Date.now() + 6048e5 }));
                }
                const s = document.createElement('style');
                s.innerHTML = 'div[class*="overlay"], div[class*="blur"] { display: none !important; z-index: -1 !important; }';
                document.head.appendChild(s);
            };
            
            if(document.readyState === 'loading') window.addEventListener('load', clearJunk);
            else clearJunk();
        }
    };
})();
