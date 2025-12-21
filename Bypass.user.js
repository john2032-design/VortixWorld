// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      1.2.1
// @description  Bypass 💩
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
// @match        *://bstlar.com/*
// @match        *://rekonise.com/*
// @match        *://www.rekonise.com/*
// @match        *://mboost.me/*
// @match        *://socialwolvez.com/*
// @match        *://scwz.me/*
// @match        *://adfoc.us/*
// @match        *://unlocknow.net/*
// @match        *://sub2get.com/*
// @match        *://sub4unlock.com/*
// @match        *://sub2unlock.net/*
// @match        *://sub2unlock.com/*
// @match        *://paste-drop.com/paste/*
// @match        *://pastebin.com/*
// @match        *://rb.gy/*
// @match        *://is.gd/*
// @match        *://rebrand.ly/*
// @match        *://6x.work/*
// @match        *://boost.ink/*
// @match        *://booo.st/*
// @match        *://bst.gg/*
// @match        *://bst.wtf/*
// @match        *://linkunlocker.com/*
// @match        *://unlk.link/*
// @match        *://cuty.io/*
// @match        *://cutynow.com/*
// @match        *://cuttty.com/*
// @match        *://cuttlinks.com/*
// @match        *://shrinkme.click/*
// @match        *://direct-link.net/*
// @match        *://link-target.net/*
// @match        *://link-to.net/*
// @match        *://link-center.net/*
// @match        *://link-hub.net/*
// @match        *://up-to-down.net/*
// @match        *://linkvertise.com/*
// @icon         https://i.ibb.co/4RNS0jJk/A4-EE3695-AC86-4449-941-E-CF701-A019-D4-F.png
// @grant        none
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/john2032-design/VortixWorld/refs/heads/main/LootLabBypass.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const ABYSM_API_BASE = 'https://api.abysm.lat/v2/free/bypass?url=';
    const API_HOSTS = [
        'socialwolvez.com','scwz.me','adfoc.us','unlocknow.net','sub2get.com','sub4unlock.com',
        'sub2unlock.net','sub2unlock.com','paste-drop.com','pastebin.com','rb.gy',
        'is.gd','rebrand.ly','6x.work','boost.ink','booo.st','bst.gg','bst.wtf','linkunlocker.com',
        'unlk.link','cuty.io','cutynow.com','cuttty.com','cuttlinks.com','shrinkme.click',
        'direct-link.net','link-target.net','link-to.net','link-center.net','link-hub.net',
        'up-to-down.net','linkvertise.com'
    ];

    function isHostMatch(hostname, short) {
        if (!hostname || !short) return false;
        if (hostname === short) return true;
        return hostname.endsWith('.' + short);
    }

    function createTopRightNotification() {
        if (document.getElementById('afkBypass-notification')) return;
        const n = document.createElement('div');
        n.id = 'afkBypass-notification';
        n.style.position = 'fixed';
        n.style.top = '12px';
        n.style.right = '12px';
        n.style.zIndex = 2147483647;
        n.style.background = 'linear-gradient(90deg,#000000,#111111)';
        n.style.color = '#fff';
        n.style.padding = '8px 10px';
        n.style.borderRadius = '8px';
        n.style.boxShadow = '0 6px 18px rgba(0,0,0,0.6)';
        n.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
        n.style.display = 'flex';
        n.style.alignItems = 'center';
        n.style.gap = '8px';
        n.style.minWidth = '240px';
        n.style.maxWidth = '360px';
        n.style.border = '1px solid rgba(255,255,255,0.04)';
        const icon = document.createElement('div');
        icon.style.fontSize = '18px';
        icon.textContent = '🌪️';
        const textWrap = document.createElement('div');
        textWrap.style.display = 'flex';
        textWrap.style.flexDirection = 'column';
        textWrap.style.gap = '1px';
        const title = document.createElement('div');
        title.style.fontWeight = 700;
        title.style.fontSize = '13px';
        title.textContent = 'Successfully Loaded Userscript!';
        const subtitle = document.createElement('div');
        subtitle.style.fontSize = '11px';
        subtitle.style.opacity = '0.9';
        subtitle.innerHTML = '<span style="color:#fff">Made By</span> <span style="color:#ff3b30;font-weight:700">afk.l0l</span>';
        textWrap.appendChild(title);
        textWrap.appendChild(subtitle);
        n.appendChild(icon);
        n.appendChild(textWrap);
        document.documentElement.appendChild(n);
        setTimeout(() => {
            const el = document.getElementById('afkBypass-notification');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }, 3500);
    }

    function showTopRightStatus(titleText, subtitleText, keep) {
        let n = document.getElementById('afkBypass-notification');
        if (!n) createTopRightNotification();
        n = document.getElementById('afkBypass-notification');
        if (!n) return;
        const textWrap = n.querySelector('div:nth-child(2)');
        if (textWrap) {
            textWrap.children[0].textContent = titleText || '';
            textWrap.children[1].textContent = subtitleText || '';
        }
        if (!keep) {
            setTimeout(() => {
                const el = document.getElementById('afkBypass-notification');
                if (el && el.parentNode) el.parentNode.removeChild(el);
            }, 3000);
        }
    }

    function copyToClipboard(text) {
        if (!text && text !== '') return false;
        const trimmed = String(text);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(trimmed).then(() => true).catch(() => {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = trimmed;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    const ok = document.execCommand('copy');
                    ta.remove();
                    return ok;
                } catch (e) {
                    return false;
                }
            });
        } else {
            try {
                const ta = document.createElement('textarea');
                ta.value = trimmed;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const ok = document.execCommand('copy');
                ta.remove();
                return ok;
            } catch (e) {
                return false;
            }
        }
    }

    function showModalBox(title, content, primaryText, onPrimary) {
        if (document.getElementById('afkBypass-modal')) return;
        const wrap = document.createElement('div');
        wrap.id = 'afkBypass-modal';
        wrap.style.position = 'fixed';
        wrap.style.top = '0';
        wrap.style.left = '0';
        wrap.style.width = '100%';
        wrap.style.height = '100%';
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.justifyContent = 'center';
        wrap.style.zIndex = 2147483647;
        wrap.style.background = 'rgba(0,0,0,0.6)';
        const box = document.createElement('div');
        box.style.width = 'min(760px,94%)';
        box.style.maxHeight = '86vh';
        box.style.overflow = 'auto';
        box.style.background = 'linear-gradient(180deg,#000,#0b0b0b)';
        box.style.color = '#fff';
        box.style.borderRadius = '10px';
        box.style.padding = '16px';
        box.style.boxShadow = '0 14px 60px rgba(0,0,0,0.6)';
        box.style.border = '2px solid';
        box.style.borderImage = 'linear-gradient(90deg,#ff3b30,#ffffff) 1';
        box.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
        const h = document.createElement('div');
        h.style.fontSize = '16px';
        h.style.fontWeight = 800;
        h.style.marginBottom = '8px';
        h.style.textAlign = 'center';
        h.textContent = title || '';
        const c = document.createElement('div');
        c.style.fontSize = '13px';
        c.style.marginBottom = '12px';
        c.style.whiteSpace = 'pre-wrap';
        let textToCopy = null;
        if (typeof content === 'string') {
            const ta = document.createElement('textarea');
            ta.readOnly = true;
            ta.style.width = '100%';
            ta.style.height = '200px';
            ta.style.padding = '10px';
            ta.style.borderRadius = '8px';
            ta.style.background = '#070707';
            ta.style.color = '#fff';
            ta.style.border = '1px solid rgba(255,255,255,0.04)';
            ta.value = content;
            textToCopy = content;
            c.appendChild(ta);
        } else {
            c.appendChild(content);
        }
        const btnWrap = document.createElement('div');
        btnWrap.style.display = 'flex';
        btnWrap.style.gap = '8px';
        btnWrap.style.justifyContent = 'center';
        btnWrap.style.alignItems = 'center';
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.padding = '10px 14px';
        copyBtn.style.borderRadius = '8px';
        copyBtn.style.border = 'none';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.fontWeight = 800;
        copyBtn.style.background = 'linear-gradient(90deg,#ff3b30,#ff6b61)';
        copyBtn.style.color = 'white';
        copyBtn.addEventListener('click', () => {
            if (textToCopy !== null) {
                const res = copyToClipboard(textToCopy);
                if (res && typeof res.then === 'function') {
                    res.then(ok => {
                        showTopRightStatus(ok ? 'Copied!' : 'Copy failed', '', false);
                    });
                } else {
                    showTopRightStatus(res ? 'Copied!' : 'Copy failed', '', false);
                }
            } else {
                showTopRightStatus('Nothing to copy', '', false);
            }
        });
        const primaryBtn = document.createElement('button');
        primaryBtn.textContent = primaryText || 'Close';
        primaryBtn.style.padding = '10px 14px';
        primaryBtn.style.borderRadius = '8px';
        primaryBtn.style.border = 'none';
        primaryBtn.style.cursor = 'pointer';
        primaryBtn.style.fontWeight = 800;
        primaryBtn.style.background = 'linear-gradient(90deg,#ff3b30,#ff6b61)';
        primaryBtn.style.color = 'white';
        primaryBtn.addEventListener('click', () => {
            try { if (onPrimary) onPrimary(); } catch (e) {}
            const el = document.getElementById('afkBypass-modal');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
        btnWrap.appendChild(copyBtn);
        btnWrap.appendChild(primaryBtn);
        box.appendChild(h);
        box.appendChild(c);
        box.appendChild(btnWrap);
        wrap.appendChild(box);
        document.documentElement.appendChild(wrap);
    }

    function findFirstUrlInObj(obj) {
        if (!obj) return null;
        if (typeof obj === 'string') {
            const m = obj.match(/https?:\/\/[^\s"'<>]+/);
            return m ? m[0] : null;
        }
        if (typeof obj === 'object') {
            try {
                for (const k in obj) {
                    if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
                    const v = obj[k];
                    const res = findFirstUrlInObj(v);
                    if (res) return res;
                }
            } catch (e) { }
        }
        return null;
    }

    function hasCloudflare() {
        const pageText = document.body && document.body.innerText ? document.body.innerText : '';
        const pageHTML = document.documentElement && document.documentElement.innerHTML ? document.documentElement.innerHTML : '';
        return pageText.includes('Just a moment') || pageHTML.includes('Just a moment');
    }

    function handleAbysmApiForCurrent() {
        try {
            const host = window.location.hostname || '';
            const matched = API_HOSTS.some(h => isHostMatch(host, h));
            if (!matched) return false;
            const currentFullUrl = location.href.startsWith('http') ? location.href : `https://${location.href}`;
            const apiUrl = ABYSM_API_BASE + encodeURIComponent(currentFullUrl);
            fetch(apiUrl, { method: 'GET' })
                .then(r => r.json().catch(() => ({ status: 'error', message: 'invalid json' })))
                .then(json => {
                    const s = (json && (json.status || json.success));
                    if (s === 'fail' || s === 'error' || s === false) {
                        showTopRightStatus('bypass failed', '', false);
                        return;
                    }
                    let resultVal = null;
                    if (json && typeof json === 'object') {
                        if (json.data && typeof json.data === 'object' && (typeof json.data.result !== 'undefined')) {
                            resultVal = json.data.result;
                        } else if (json.result) {
                            resultVal = json.result;
                        } else if (json.url) {
                            resultVal = json.url;
                        } else {
                            resultVal = findFirstUrlInObj(json) || JSON.stringify(json);
                        }
                    } else if (typeof json === 'string') {
                        resultVal = json;
                    }
                    if (typeof resultVal === 'string' && resultVal.match(/^https?:\/\//i)) {
                        showTopRightStatus('Redirecting...', '', false);
                        setTimeout(() => { try { location.href = resultVal; } catch (e) { showModalBox('🤑Bypassed Successfully🤑', resultVal, 'Close'); } }, 200);
                        return;
                    }
                    if (typeof resultVal === 'string' && resultVal.trim().length > 0) {
                        showModalBox('🤑Bypassed Successfully🤑', resultVal, 'Close');
                        return;
                    }
                    showModalBox('🤑Bypassed Successfully🤑', JSON.stringify(json, null, 2), 'Close');
                })
                .catch(() => {
                    showTopRightStatus('bypass failed', '', false);
                });
            return true;
        } catch (e) {
            return false;
        }
    }

    function afkBypass_showModal(link) {
        if (typeof link === 'string' && link.match(/^https?:\/\//i)) {
            try { location.href = link; } catch (e) { showModalBox('🤑Bypassed Successfully🤑', link, 'Redirect', () => { try { location.href = link; } catch (e) {} }); }
            return;
        }
        showModalBox('🤑Bypassed Successfully🤑', typeof link === 'string' ? link : JSON.stringify(link, null, 2), 'Close');
    }

    function handleBstlar() {
        if (hasCloudflare()) return;
        const path = new URL(window.location.href).pathname.substring(1);
        fetch(`https://bstlar.com/api/link?url=${encodeURIComponent(path)}`, {
            method: 'GET',
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                authorization: 'null',
                Referer: window.location.href,
                'Referrer-Policy': 'same-origin'
            }
        })
        .then(r => r.json().catch(() => ({})))
        .then(data => {
            if (data && data.tasks && data.tasks.length > 0) {
                const linkId = data.tasks[0].link_id;
                return fetch('https://bstlar.com/api/link-completed', {
                    method: 'POST',
                    headers: {
                        accept: 'application/json, text/plain, */*',
                        'content-type': 'application/json;charset=UTF-8',
                        authorization: 'null',
                        Referer: window.location.href,
                        'Referrer-Policy': 'same-origin'
                    },
                    body: JSON.stringify({ link_id: linkId })
                }).then(r => r.text().catch(() => ''));
            } else {
                throw new Error('No tasks found');
            }
        })
        .then(finalText => {
            let parsed = null;
            try { parsed = JSON.parse(finalText); } catch (e) { parsed = null; }
            if (parsed && parsed.destination_url !== undefined) {
                if (String(parsed.destination_url) === 'null' || parsed.destination_url === null) {
                    showModalBox('🤑Bypassed Successfully🤑', 'Failed No Result Found Result Expired / Invalid', 'Close');
                    return;
                }
                if (String(parsed.destination_url).match(/^https?:\/\//i)) {
                    try { location.href = parsed.destination_url; } catch (e) { afkBypass_showModal(parsed.destination_url); }
                    return;
                }
            }
            if (typeof finalText === 'string' && finalText.match(/^https?:\/\//i)) {
                try { location.href = finalText; } catch (e) { afkBypass_showModal(finalText); }
                return;
            }
            afkBypass_showModal(finalText || 'No final link returned');
        })
        .catch(() => {
            showTopRightStatus('bypass failed', '', false);
        });
    }

    function handleRekonise() {
        if (hasCloudflare()) return;
        fetch(`https://api.rekonise.com/social-unlocks${location.pathname}/unlock`, {
            method: 'GET',
            headers: {
                accept: 'application/json, text/plain, */*',
                'content-type': 'application/json;charset=UTF-8',
                authorization: 'null',
                Referer: window.location.href,
                'Referrer-Policy': 'same-origin'
            }
        })
        .then(r => r.json().catch(() => ({})))
        .then(data => {
            const txt = JSON.stringify(data);
            const url = findFirstUrlInObj(data) || (txt.match(/https?:\/\/[^\s"']+/) || [null])[0];
            if (url && typeof url === 'string' && url.match(/^https?:\/\//i)) {
                try { location.href = url; } catch (e) { afkBypass_showModal(url); }
            } else if (typeof data === 'string' && data.trim().length > 0) {
                showModalBox('🤑Bypassed Successfully🤑', data, 'Close');
            } else {
                showModalBox('🤑Bypassed Successfully🤑', 'Error, please join Discord Server in the Greasyfork script.', 'Close');
            }
        })
        .catch(() => {
            showTopRightStatus('bypass failed', '', false);
        });
    }

    function handleMboost() {
        try {
            const pageContent = document.documentElement.outerHTML || '';
            const matches = [...pageContent.matchAll(/"targeturl\\":\\"(https?:\/\/[^\\"]+)/g)];
            if (matches.length > 0) {
                const first = matches[0][1];
                if (first && first.match(/^https?:\/\//i)) {
                    try { location.href = first; } catch (e) { afkBypass_showModal(first); }
                    return;
                }
                afkBypass_showModal(first);
                return;
            } else {
                const urlFromObj = findFirstUrlInObj(pageContent);
                if (urlFromObj && urlFromObj.match(/^https?:\/\//i)) {
                    try { location.href = urlFromObj; } catch (e) { afkBypass_showModal(urlFromObj); }
                    return;
                }
                if (urlFromObj) {
                    showModalBox('🤑Bypassed Successfully🤑', urlFromObj, 'Close');
                    return;
                }
                showModalBox('🤑Bypassed Successfully🤑', 'Could not find destination! Please join our Discord.', 'Close');
            }
        } catch (e) {
            showTopRightStatus('bypass failed', '', false);
        }
    }

    const hostname = window.location.hostname || '';
    const allowedLootHosts = ['loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co', 'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com', 'linksloot.net'];

    if (allowedLootHosts.includes(hostname)) {
        (function() {
            'use strict';
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
<div id="tm-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;display:flex;justify-content:center;align-items:center;overflow:hidden;background:linear-gradient(180deg,#000,#0b0b0b);backdrop-filter:blur(6px);">
    <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:100%;padding:20px;">
        <div id="tm-popup" style="width:min(720px,94%);max-width:920px;padding:22px;border-radius:12px;background:linear-gradient(180deg,#000,#0b0b0b);border:2px solid;border-image:linear-gradient(90deg,#ff3b30,#ffffff) 1;box-shadow:0 10px 40px rgba(0,0,0,0.9);color:#fff;font-family:system-ui, -apple-system, 'Segoe UI', Roboto;text-align:center;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                <div style="width:120px;height:120px;border-radius:12px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.6);background:#020617;display:flex;align-items:center;justify-content:center;">
                    <img src="https://i.ibb.co/4RNS0jJk/A4-EE3695-AC86-4449-941-E-CF701-A019-D4-F.png" alt="logo" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div id="spinnerWrap" style="margin-top:6px;">
                    <div class="loader" aria-hidden="true" style="width:40px;height:40px;border-width:4px;"></div>
                </div>
                <div style="font-size:18px;font-weight:700;color:#fff;margin-top:6px;">Please Wait While We Prepare Your Link</div>
                <div id="countdown" style="font-size:14px;font-weight:600;color:#ddd;margin-top:6px;">Estimated ${countdownSeconds} seconds remaining</div>
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
  border: 5px solid rgba(255,255,255,0.06);
  border-top-color: #ff3b30;
  border-radius: 50%;
  animation: tm-spin 0.9s linear infinite;
  margin: 0 auto;
  box-sizing: border-box;
}
@keyframes tm-spin {
  to { transform: rotate(360deg); }
}
                        `;
                        try { localStorage.clear(); } catch (e) {}
                        for(let i=0;i<100;i++)if(54!==i){try{var $="t_"+i;var t={value:1,expiry:new Date().getTime()+6048e5};localStorage.setItem($,JSON.stringify(t))}catch(e){}}
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
                    if (url && url.includes && url.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
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
                                try {
                                    const ws = new WebSocket(`wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`);
                                    ws.onopen = () => setInterval(() => { try { ws.send('0'); } catch(e) {} }, 1000);
                                    ws.onmessage = event => {
                                        if (event.data && event.data.includes('r:')) {
                                            PUBLISHER_LINK = event.data.replace('r:', '');
                                        }
                                    };
                                    try { navigator.sendBeacon(`https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`); } catch(e) {}
                                    try { fetch(action_pixel_url); } catch(e) {}
                                    try { fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`); } catch(e) {}
                                    ws.onclose = () => { try { window.location.href = decodeURIComponent(decodeURI(PUBLISHER_LINK)); } catch(e) {} };
                                } catch(e) {}
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
        return;
    }

    (function () {
        const originalFetch = window.fetch;
        window.fetch = function (url, config) {
            try {
                if (typeof url === 'string' && typeof INCENTIVE_SYNCER_DOMAIN !== 'undefined' && url.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
                    return originalFetch(url, config).then(response => {
                        if (!response || !response.ok) return response;
                        return response.clone().json().then(data => {
                            let urid = "";
                            let task_id = "";
                            let action_pixel_url = "";
                            if (Array.isArray(data)) {
                                data.forEach(item => {
                                    urid = item.urid || urid;
                                    task_id = 54;
                                    action_pixel_url = item.action_pixel_url || action_pixel_url;
                                });
                            }
                            if (urid) {
                                try {
                                    const ws = new WebSocket(`wss://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`);
                                    ws.onopen = () => setInterval(() => { try { ws.send('0'); } catch (e) {} }, 1000);
                                    ws.onmessage = event => {
                                        try {
                                            if (event.data && event.data.includes('r:')) {
                                                PUBLISHER_LINK = event.data.replace('r:', '');
                                            }
                                        } catch (e) {}
                                    };
                                    try { navigator.sendBeacon(`https://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`); } catch (e) {}
                                    try { fetch(action_pixel_url); } catch (e) {}
                                    try { fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`); } catch (e) {}
                                    ws.onclose = () => { try { window.location.href = decodeURIComponent(decodeURI(PUBLISHER_LINK)); } catch (e) {} };
                                } catch (e) {}
                            }
                            return new Response(JSON.stringify(data), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers
                            });
                        }).catch(() => response);
                    });
                }
            } catch (e) {}
            return originalFetch(url, config);
        };
    })();

    function run() {
        try { createTopRightNotification(); } catch (e) {}
        try {
            const host = window.location.hostname || '';
            const apiMatched = API_HOSTS.some(h => isHostMatch(host, h));
            if (apiMatched) {
                const used = handleAbysmApiForCurrent();
                if (used) return;
            }
            if (isHostMatch(host, 'bstlar.com')) {
                handleBstlar();
                return;
            }
            if (isHostMatch(host, 'rekonise.com')) {
                handleRekonise();
                return;
            }
            if (isHostMatch(host, 'mboost.me')) {
                handleMboost();
                return;
            }
        } catch (e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

})();
