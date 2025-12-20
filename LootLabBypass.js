// ==UserScript==
// @name         VortixWorld Lootlab Bypass
// @namespace    afklolbypasser
// @version      0.1
// @description  Bypass lootlabs
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
// @icon         https://i.ibb.co/cKy9ztXL/IMG-3412.png
// @grant        none
// @license      MIT
// @downloadURL  https://update.greasyfork.org/scripts/520333/NBTHUB%20Bypass%20Native%20Key.user.js
// @updateURL    https://update.greasyfork.org/scripts/520333/NBTHUB%20Bypass%20Native%20Key.meta.js
// ==/UserScript==

(function() {
    'use strict';
    
    const hostname = window.location.hostname || '';
    const allowedHosts = ['loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co', 'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com', 'linksloot.net'];
    
    if (!allowedHosts.includes(hostname)) {
        return;
    }
    
    function xorBase64Decode(encodedString) {
        try {
            let decoded = atob(encodedString);
            const key = decoded.substring(0, 5);
            const data = decoded.substring(5);
            let result = '';
            
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode ^ keyChar);
            }
            
            try {
                return decodeURIComponent(result);
            } catch (e) {
                return result;
            }
        } catch (e) {
            return encodedString;
        }
    }

    (function() {
        'use strict';
        
        const waitForElementAndModifyParent = () => {
            const modifyParentElement = (targetElement) => {
                const parentElement = targetElement.parentElement;
                if (!parentElement) return;
                
                const images = document.querySelectorAll('img');
                let countdownSeconds = 10;
                
                for (let img of images) {
                    const src = (img.src || '').toLowerCase();
                    if (src.includes('eye.png')) {
                        countdownSeconds = 13;
                        break;
                    } else if (src.includes('bell.png')) {
                        countdownSeconds = 30;
                        break;
                    } else if (src.includes('apps.png') || src.includes('fire.png')) {
                        countdownSeconds = 60;
                        break;
                    } else if (src.includes('gamers.png')) {
                        countdownSeconds = 90;
                        break;
                    }
                }
                
                let fallbackHref = null;
                try {
                    const anchor = parentElement.querySelector('a[href]');
                    if (anchor && anchor.href) fallbackHref = anchor.href;
                } catch (e) {}
                
                parentElement.innerHTML = '';
                
                const popupHTML = `
<div id="tm-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;display:flex;justify-content:center;align-items:center;overflow:hidden;background:linear-gradient(180deg,rgba(3,7,18,0.85),rgba(10,14,28,0.9));backdrop-filter:blur(6px);">
    <video autoplay loop muted playsinline style="position:absolute;object-fit:cover;width:100%;height:100%;opacity:0.18;">
        <source src="https://nbthub.netlify.app/background.mp4" type="video/mp4">
    </video>
    <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:100%;padding:20px;">
        <div id="tm-popup" style="width:min(720px,94%);max-width:920px;padding:28px;border-radius:14px;background:linear-gradient(180deg,#0b1220, #0f1a2b);box-shadow:0 10px 40px rgba(2,6,20,0.8);color:#e6f0ff;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
            <div style="display:flex;align-items:center;gap:18px;">
                <div style="width:84px;height:84px;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(15,70,90,0.35);background:#020617;">
                    <img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="logo" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div style="flex:1;">
                    <div style="font-size:18px;font-weight:600;color:#d8ecff;margin-bottom:6px;">Please wait while we prepare your link</div>
                    <div id="countdown" style="font-size:22px;font-weight:700;color:#bfe9ff">(${countdownSeconds} seconds)</div>
                </div>
            </div>
            <div style="margin-top:18px;">
                <div id="progressContainer" style="width:100%;height:12px;background:linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));border-radius:8px;overflow:hidden;">
                    <div id="progressBar" style="width:0%;height:100%;background:linear-gradient(90deg,#2dd4bf,#06b6d4);transition:width 200ms ease;"></div>
                </div>
            </div>
            <div style="margin-top:18px;display:flex;align-items:center;justify-content:flex-end;gap:12px;">
                <div style="color:#9fcfe8;font-size:13px;opacity:0.95;">Automatically continuing when the timer ends</div>
            </div>
        </div>
    </div>
</div>
                `;
                
                parentElement.insertAdjacentHTML('afterbegin', popupHTML);
                
                const startCountdown = (duration, onTick, onFinish) => {
                    let remaining = duration;
                    const countdownEl = document.getElementById('countdown');
                    const progressBar = document.getElementById('progressBar');
                    const total = duration;
                    
                    const updateDisplay = () => {
                        if (countdownEl) countdownEl.textContent = `(${remaining} seconds)`;
                        if (progressBar) {
                            const percent = Math.max(0, Math.min(100, Math.round(((total - remaining) / total) * 100)));
                            progressBar.style.width = `${percent}%`;
                        }
                    };
                    
                    updateDisplay();
                    const intervalId = setInterval(() => {
                        remaining--;
                        try { if (onTick) onTick(remaining); } catch (e) {}
                        updateDisplay();
                        if (remaining <= 0) {
                            clearInterval(intervalId);
                            try { if (onFinish) onFinish(); } catch (e) {}
                        }
                    }, 1000);
                    
                    return { stop: () => clearInterval(intervalId) };
                };
                
                const spinnerCSS = `
.wheel-and-hamster{--dur:1s;position:relative;width:12em;height:12em;margin:auto}.wheel,.hamster,.hamster div,.spoke{position:absolute}.wheel,.spoke{border-radius:50%;top:0;left:0;width:100%;height:100%}.wheel{background:radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,hsl(0,0%,60%) 48%);z-index:2}.hamster{animation:hamster var(--dur) ease-in-out infinite;top:50%;left:calc(50% - 3.5em);width:7em;height:3.75em;transform:rotate(4deg) translate(-0.8em,1.85em);transform-origin:50% 0;z-index:1}.hamster__head{animation:hamsterHead var(--dur) ease-in-out infinite;background:hsl(30,90%,55%);border-radius:70% 30% 0 100% / 40% 25% 25% 60%;box-shadow:0 -0.25em 0 hsl(30,90%,80%) inset,0.75em -1.55em 0 hsl(30,90%,90%) inset;top:0;left:-2em;width:2.75em;height:2.5em;transform-origin:100% 50%}.hamster__ear{animation:hamsterEar var(--dur) ease-in-out infinite;background:hsl(0,90%,85%);border-radius:50%;box-shadow:-0.25em 0 hsl(30,90%,55%) inset;top:-0.25em;right:-0.25em;width:0.75em;height:0.75em;transform-origin:50% 75%}.hamster__eye{animation:hamsterEye var(--dur) linear infinite;background-color:hsl(0,0%,0%);border-radius:50%;top:0.375em;left:1.25em;width:0.5em;height:0.5em}.hamster__nose{background:hsl(0,90%,75%);border-radius:35% 65% 85% 15% / 70% 50% 50% 30%;top:0.75em;left:0;width:0.2em;height:0.25em}.hamster__body{animation:hamsterBody var(--dur) ease-in-out infinite;background:hsl(30,90%,90%);border-radius:50% 30% 50% 30% / 15% 60% 40% 40%;box-shadow:0.1em 0.75em 0 hsl(30,90%,55%) inset,0.15em -0.5em 0 hsl(30,90%,80%) inset;top:0.25em;left:2em;width:4.5em;height:3em;transform-origin:17% 50%;transform-style:preserve-3d}.hamster__limb--fr,.hamster__limb--fl{clip-path:polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);top:2em;left:0.5em;width:1em;height:1.5em;transform-origin:50% 0}.hamster__limb--fr{animation:hamsterFRLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);transform:rotate(15deg) translateZ(-1px)}.hamster__limb--fl{animation:hamsterFLLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);transform:rotate(15deg)}.hamster__limb--br,.hamster__limb--bl{border-radius:0.75em 0.75em 0 0;clip-path:polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);top:1em;left:2.8em;width:1.5em;height:2.5em;transform-origin:50% 30%}.hamster__limb--br{animation:hamsterBRLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);transform:rotate(-25deg) translateZ(-1px)}.hamster__limb--bl{animation:hamsterBLLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);transform:rotate(-25deg)}.hamster__tail{animation:hamsterTail var(--dur) linear infinite;background:hsl(0,90%,85%);border-radius:0.25em 50% 50% 0.25em;box-shadow:0 -0.2em 0 hsl(0,90%,75%) inset;top:1.5em;right:-0.5em;width:1em;height:0.5em;transform:rotate(30deg) translateZ(-1px);transform-origin:0.25em 0.25em}.spoke{animation:spoke var(--dur) linear infinite;background:radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50 / 99% 99 no-repeat}@keyframes hamster{from,to{transform:rotate(4deg) translate(-0.8em,1.85em)}50%{transform:rotate(0) translate(-0.8em,1.85em)}}@keyframes hamsterHead{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(8deg)}}@keyframes hamsterEye{from,90%,to{transform:scaleY(1)}95%{transform:scaleY(0)}}@keyframes hamsterEar{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(12deg)}}@keyframes hamsterBody{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-2deg)}}@keyframes hamsterFRLimb{from,25%,50%,75%,to{transform:rotate(50deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-30deg) translateZ(-1px)}}@keyframes hamsterFLLimb{from,25%,50%,75%,to{transform:rotate(-30deg)}12.5%,37.5%,62.5%,87.5%{transform:rotate(50deg)}}@keyframes hamsterBRLimb{from,25%,50%,75%,to{transform:rotate(-60deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(20deg) translateZ(-1px)}}@keyframes hamsterBLLimb{from,25%,50%,75%,to{transform:rotate(20deg)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-60deg)}}@keyframes hamsterTail{from,25%,50%,75%,to{transform:rotate(30deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(10deg) translateZ(-1px)}}@keyframes spoke{from{transform:rotate(0)}to{transform:rotate(-1turn)}}
                `;
                
                try {
                    localStorage.clear();
                    for (let i = 0; i < 100; i++) {
                        if (54 !== i) {
                            var $ = "t_" + i;
                            var t = { value: 1, expiry: new Date().getTime() + 6048e5 };
                            localStorage.setItem($, JSON.stringify(t));
                        }
                    }
                } catch (e) {}
                
                startCountdown(countdownSeconds, null, () => {
                    try {
                        if (typeof PUBLISHER_LINK === 'string' && PUBLISHER_LINK) {
                            try {
                                const decoded = xorBase64Decode(PUBLISHER_LINK);
                                window.location.href = decoded;
                                return;
                            } catch (e) {
                                try {
                                    window.location.href = PUBLISHER_LINK;
                                    return;
                                } catch (e2) {}
                            }
                        }
                    } catch (e) {}
                    
                    if (fallbackHref) {
                        window.location.href = fallbackHref;
                        return;
                    }
                    
                    const trySelectors = ['#nextbtn', 'button[id^="next"]', 'a#next', 'a.next', '.next-btn', 'a[href]'];
                    for (const sel of trySelectors) {
                        const el = document.querySelector(sel);
                        if (el) {
                            try {
                                el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                try { el.click(); } catch (e) {}
                                return;
                            } catch (e) {}
                        }
                    }
                    
                    try {
                        window.location.reload();
                    } catch (e) {}
                });
                
                const style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = spinnerCSS;
                document.getElementsByTagName('head')[0].appendChild(style);
            };
            
            const observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        const foundElement = Array.from(document.querySelectorAll('body *')).find(element => element.textContent && element.textContent.includes("UNLOCK CONTENT"));
                        if (foundElement) {
                            modifyParentElement(foundElement);
                            observer.disconnect();
                            break;
                        }
                    }
                }
            });
            
            observer.observe(document.body, { childList: true, subtree: true });
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForElementAndModifyParent);
        } else {
            waitForElementAndModifyParent();
        }
    })();
    
    (function() {
        const originalFetch = window.fetch;
        
        window.fetch = function(url, config) {
            try {
                const urlStr = (typeof url === 'string') ? url : (url && url.url) ? url.url : '';
                
                if (typeof urlStr === 'string' && 
                    typeof INCENTIVE_SYNCER_DOMAIN !== 'undefined' && 
                    urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
                    
                    return originalFetch(url, config).then(response => {
                        if (!response.ok) return response;
                        
                        return response.clone().json().then(data => {
                            try {
                                let urid = "";
                                let task_id = "";
                                let action_pixel_url = "";
                                
                                if (Array.isArray(data)) {
                                    data.forEach(item => {
                                        urid = item.urid || urid;
                                        task_id = 54;
                                        action_pixel_url = item.action_pixel_url || action_pixel_url;
                                    });
                                } else if (data && typeof data === 'object') {
                                    urid = data.urid || urid;
                                    task_id = 54;
                                    action_pixel_url = data.action_pixel_url || action_pixel_url;
                                }
                                
                                if (typeof INCENTIVE_SERVER_DOMAIN === 'undefined' || 
                                    typeof INCENTIVE_SYNCER_DOMAIN === 'undefined') {
                                    return new Response(JSON.stringify(data), { 
                                        status: response.status, 
                                        statusText: response.statusText, 
                                        headers: response.headers 
                                    });
                                }
                                
                                let serverIndex = 0;
                                if (urid && typeof urid === 'string' && urid.length >= 5) {
                                    try {
                                        const lastFive = urid.substr(-5);
                                        const num = parseInt(lastFive, 10);
                                        if (!isNaN(num)) {
                                            serverIndex = num % 3;
                                        }
                                    } catch (e) {}
                                }
                                
                                const wsUrl = `wss://${serverIndex}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${(typeof KEY !== 'undefined' ? KEY : '')}`;
                                let ws = null;
                                
                                try {
                                    ws = new WebSocket(wsUrl);
                                    
                                    ws.onopen = () => {
                                        const heartbeat = setInterval(() => {
                                            try {
                                                if (ws.readyState === WebSocket.OPEN) {
                                                    ws.send('0');
                                                } else {
                                                    clearInterval(heartbeat);
                                                }
                                            } catch (e) {
                                                clearInterval(heartbeat);
                                            }
                                        }, 1000);
                                    };
                                    
                                    ws.onmessage = (event) => {
                                        try {
                                            if (event.data && typeof event.data === 'string') {
                                                if (event.data.startsWith('r:')) {
                                                    window.PUBLISHER_LINK = event.data.substring(2);
                                                    try {
                                                        ws.close();
                                                    } catch (e) {}
                                                }
                                            }
                                        } catch (e) {}
                                    };
                                    
                                    ws.onclose = () => {
                                        try {
                                            if (window.PUBLISHER_LINK) {
                                                const decoded = xorBase64Decode(window.PUBLISHER_LINK);
                                                window.location.href = decoded;
                                            }
                                        } catch (e) {
                                            try {
                                                if (window.PUBLISHER_LINK) {
                                                    window.location.href = window.PUBLISHER_LINK;
                                                }
                                            } catch (e2) {}
                                        }
                                    };
                                    
                                    ws.onerror = () => {
                                        try {
                                            ws.close();
                                        } catch (e) {}
                                    };
                                    
                                } catch (e) {}
                                
                                try {
                                    navigator.sendBeacon(`https://${serverIndex}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`);
                                } catch (e) {}
                                
                                try {
                                    if (action_pixel_url) {
                                        fetch(action_pixel_url).catch(() => {});
                                    }
                                } catch (e) {}
                                
                                try {
                                    if (typeof TID !== 'undefined') {
                                        fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&cat=${task_id}&tid=${TID}`).catch(() => {});
                                    }
                                } catch (e) {}
                                
                                return new Response(JSON.stringify(data), { 
                                    status: response.status, 
                                    statusText: response.statusText, 
                                    headers: response.headers 
                                });
                                
                            } catch (e) {
                                return new Response(JSON.stringify(data), { 
                                    status: response.status, 
                                    statusText: response.statusText, 
                                    headers: response.headers 
                                });
                            }
                        });
                    });
                }
            } catch (e) {}
            
            return originalFetch(url, config);
        };
    })();
})();
