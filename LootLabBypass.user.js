// ==UserScript==
// @name         VortixWorld Lootlab Bypass
// @namespace    afklolbypasser
// @version      0.3
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
// @downloadURL  https://raw.githubusercontent.com/john2032-design/VortixWorld/refs/heads/main/LootLabBypass.user.js
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const hostname = window.location.hostname || '';
    const allowedHosts = ['loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co', 'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com', 'linksloot.net'];

    if (!allowedHosts.includes(hostname)) {
        return;
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

    (function() {
        'use strict';

        const waitForElementAndModifyParent = () => {
            const modifyParentElement = (targetElement) => {
                const parentElement = targetElement.parentElement;
                if (!parentElement) return;

                const images = document.querySelectorAll('img');
                let countdownSeconds = 60;
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
        <div id="tm-popup" style="width:min(720px,94%);max-width:920px;padding:28px;border-radius:14px;background:linear-gradient(180deg,#0b1220, #0f1a2b);box-shadow:0 10px 40px rgba(2,6,20,0.8);color:#e6f0ff;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;text-align:center;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                <div style="width:140px;height:140px;border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(2,6,20,0.6);background:#020617;display:flex;align-items:center;justify-content:center;">
                    <img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="logo" style="width:100%;height:100%;object-fit:cover;">
                </div>

                <div id="spinnerWrap" style="margin-top:6px;">
                    <div class="loader" aria-hidden="true" style="width:48px;height:48px;border-width:5px;"></div>
                </div>

                <div style="font-size:20px;font-weight:700;color:#d8ecff;margin-top:6px;">Please Wait While We Prepare Your Link</div>

                <div id="countdown" style="font-size:16px;font-weight:600;color:#bfe9ff;margin-top:4px;">Estimated ${countdownSeconds} seconds remaining</div>
            </div>
        </div>
    </div>
</div>
                `;

                parentElement.insertAdjacentHTML('afterbegin', popupHTML);

                const startCountdown = (duration, onTick, onFinish) => {
                    let remaining = duration;
                    const countdownEl = document.getElementById('countdown');

                    const updateDisplay = () => {
                        if (countdownEl) {
                            countdownEl.textContent = `Estimated ${remaining} seconds remaining`;
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
                    }, 1200);

                    return { stop: () => clearInterval(intervalId) };
                };

                const spinnerCSS = `
.loader {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(255,255,255,0.08);
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: tm-spin 0.9s linear infinite;
  margin: 0 auto;
  box-sizing: border-box;
}
@keyframes tm-spin {
  to { transform: rotate(360deg); }
}
                `;

                localStorage.clear();for(let i=0;i<100;i++)if(54!==i){var e,$="t_"+i,t={value:1,expiry:new Date().getTime()+6048e5};localStorage.setItem($,JSON.stringify(t))}

                startCountdown(countdownSeconds, null, () => {});

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
            if (url.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
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
                        const ws = new WebSocket(`wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`);
                        ws.onopen = () => setInterval(() => ws.send('0'), 1000);
                        ws.onmessage = event => {
                            if (event.data.includes('r:')) {
                                PUBLISHER_LINK = event.data.replace('r:', '');
                            }
                        };
                        navigator.sendBeacon(`https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`);
                        fetch(action_pixel_url);
                        fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`);
                        ws.onclose = () => window.location.href = decodeURIComponent(decodeURI(PUBLISHER_LINK));
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
    })();
})();
