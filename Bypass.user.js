// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      1.2.10
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
// @match        *://linkvertise.com/*
// @match        *://link-target.net/*
// @match        *://link-center.net/*
// @match        *://link-to.net/*
// @match        *://bit.ly/*
// @match        *://t.ly/*
// @match        *://jpeg.ly/*
// @match        *://tiny.cc/*
// @match        *://tinyurl.com/*
// @match        *://tinylink.onl/*
// @match        *://shorter.me/*
// @match        *://is.gd/*
// @match        *://v.gd/*
// @match        *://rebrand.ly/*
// @match        *://bst.gg/*
// @match        *://bst.wtf/*
// @match        *://boost.ink/*
// @match        *://sub2get.com/*
// @match        *://sub4unlock.io/*
// @match        *://sub4unlock.com/*
// @match        *://sub4unlock.net/*
// @match        *://subfinal.com/*
// @match        *://unlocknow.net/*
// @match        *://ytsubme.com/*
// @match        *://cuty.io/*
// @match        *://cuty.me/*
// @match        *://adfoc.us/*
// @match        *://justpaste.it/*
// @match        *://paste-drop.com/*
// @match        *://pastebin.com/*
// @match        *://pastecanyon.com/*
// @match        *://pastehill.com/*
// @match        *://pastemode.com/*
// @match        *://rentry.org/*
// @match        *://paster.so/*
// @match        https://work.ink/*
// @icon         https://i.ibb.co/4RNS0jJk/A4-EE3695-AC86-4449-941-E-CF701-A019-D4-F.png
// @grant        GM_xmlhttpRequest
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/john2032-design/VortixWorld/refs/heads/main/LootLabBypass.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    let notificationCounter = 0;
    let notificationStack = [];

    function isHostMatch(hostname, short) {
        if (!hostname || !short) return false;
        if (hostname === short) return true;
        return hostname.endsWith('.' + short);
    }

    function updateNotificationPositions() {
        const wrappers = document.querySelectorAll('div[id^="afkBypass-notification-"][id$="-wrap"]');
        let topPosition = 12;
        wrappers.forEach(wrapper => {
            wrapper.style.top = `${topPosition}px`;
            wrapper.style.right = '12px';
            wrapper.style.position = 'fixed';
            wrapper.style.zIndex = 2147483647;
            topPosition += wrapper.offsetHeight + 8;
        });
    }

    function extractEdgeEmojis(text) {
        if (!text) return { leading: '', core: '', trailing: '' };
        const s = String(text);
        const startMatch = s.match(/^(\p{Extended_Pictographic}+)/u);
        const endMatch = s.match(/(\p{Extended_Pictographic}+)$/u);
        let leading = '';
        let trailing = '';
        let core = s;
        if (startMatch) {
            leading = startMatch[1];
            core = core.slice(leading.length);
        }
        if (endMatch) {
            trailing = endMatch[1];
            core = core.slice(0, core.length - trailing.length);
        }
        core = core.trim();
        return { leading, core, trailing };
    }

    function ensureStyles() {
        if (document.getElementById('afkBypass-styles')) return;
        const s = document.createElement('style');
        s.id = 'afkBypass-styles';
        s.textContent = `
.afkBypass-timer-indeterminate{background: linear-gradient(90deg, rgba(255,31,31,0.15), #ff1f1f 40%, rgba(255,31,31,0.15)); background-size: 200% 100%; animation: afkBypass-indeterminate 1.6s linear infinite;}
@keyframes afkBypass-indeterminate {0%{background-position:0% 50%}100%{background-position:200% 50%}}
.afkBypass-countdown-number { font-weight: 800; font-size: 20px; margin-left: 8px; }
`;
        document.head.appendChild(s);
    }

    function createTopRightNotification(titleText, subtitleText, icon, opts) {
        opts = opts || {};
        notificationCounter++;
        const notificationId = `afkBypass-notification-${notificationCounter}`;
        if (document.getElementById(`${notificationId}-wrap`)) return notificationId;

        const autoRemove = opts.autoRemove !== false;
        const duration = (typeof opts.duration === 'number') ? opts.duration : 5000;
        const timerDuration = (typeof opts.timerDuration === 'number') ? opts.timerDuration : duration;
        const timerAnimated = !!opts.timerAnimated;

        ensureStyles();

        const wrap = document.createElement('div');
        wrap.id = `${notificationId}-wrap`;
        wrap.style.position = 'fixed';
        wrap.style.top = '12px';
        wrap.style.right = '12px';
        wrap.style.zIndex = 2147483647;
        wrap.style.display = 'inline-block';
        wrap.style.opacity = '1';
        wrap.style.transition = 'opacity 0.3s ease';
        wrap.style.pointerEvents = 'auto';

        const n = document.createElement('div');
        n.id = notificationId;
        n.style.position = 'relative';
        n.style.background = 'linear-gradient(90deg,#000000,#111111)';
        n.style.color = 'white';
        n.style.padding = '8px 12px 18px 12px';
        n.style.borderRadius = '8px';
        n.style.boxShadow = '0 6px 18px rgba(0,0,0,0.6)';
        n.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
        n.style.display = 'flex';
        n.style.alignItems = 'center';
        n.style.gap = '10px';
        n.style.minWidth = '240px';
        n.style.maxWidth = '400px';
        n.style.border = '1px solid rgba(255,255,255,0.04)';
        n.style.transition = 'opacity 0.3s ease';
        n.style.boxSizing = 'border-box';
        n.style.overflow = 'hidden';

        const iconWrapper = document.createElement('div');
        iconWrapper.style.width = '28px';
        iconWrapper.style.height = '28px';
        iconWrapper.style.borderRadius = '50%';
        iconWrapper.style.background = 'linear-gradient(135deg,#fff6f6,#ff4d4d)';
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.justifyContent = 'center';
        iconWrapper.style.flexShrink = '0';

        const iconElement = document.createElement('div');
        iconElement.style.fontSize = '14px';
        iconElement.textContent = icon || '🌪️';
        iconWrapper.appendChild(iconElement);

        const textWrap = document.createElement('div');
        textWrap.style.display = 'flex';
        textWrap.style.flexDirection = 'column';
        textWrap.style.gap = '4px';
        textWrap.style.flex = '1';
        textWrap.style.minWidth = '0';

        const titleContainer = document.createElement('div');
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.gap = '8px';
        titleContainer.style.overflow = 'hidden';

        const parts = extractEdgeEmojis(titleText || '');
        const leadingSpan = document.createElement('span');
        leadingSpan.textContent = parts.leading || '';
        leadingSpan.style.fontSize = '18px';
        leadingSpan.style.lineHeight = '1';
        leadingSpan.style.flex = '0 0 auto';
        leadingSpan.style.color = '#ffffff';

        const coreSpan = document.createElement('span');
        coreSpan.style.fontWeight = 800;
        coreSpan.style.fontSize = '15px';
        coreSpan.style.color = 'transparent';
        coreSpan.style.backgroundImage = 'linear-gradient(90deg,#ffffff,#ff4d4d)';
        coreSpan.style.webkitBackgroundClip = 'text';
        coreSpan.style.backgroundClip = 'text';
        coreSpan.style.textOverflow = 'ellipsis';
        coreSpan.style.whiteSpace = 'nowrap';
        coreSpan.style.overflow = 'hidden';
        coreSpan.textContent = parts.core || '';

        const trailingSpan = document.createElement('span');
        trailingSpan.textContent = parts.trailing || '';
        trailingSpan.style.fontSize = '18px';
        trailingSpan.style.lineHeight = '1';
        trailingSpan.style.flex = '0 0 auto';
        trailingSpan.style.color = '#ffffff';

        titleContainer.appendChild(leadingSpan);
        titleContainer.appendChild(coreSpan);
        titleContainer.appendChild(trailingSpan);

        const subtitle = document.createElement('div');
        subtitle.style.fontSize = '12px';
        subtitle.style.opacity = '0.95';
        subtitle.style.color = 'transparent';
        subtitle.style.backgroundImage = 'linear-gradient(90deg,#f8f8f8,#ff6b6b)';
        subtitle.style.webkitBackgroundClip = 'text';
        subtitle.style.backgroundClip = 'text';
        subtitle.style.textDecoration = 'none';
        subtitle.style.overflow = 'hidden';
        subtitle.style.textOverflow = 'ellipsis';
        subtitle.style.whiteSpace = 'nowrap';
        if (subtitleText) {
            subtitle.textContent = subtitleText;
        } else {
            subtitle.innerHTML = 'Made By <span style="font-weight:700;color:transparent;background-image:linear-gradient(90deg,#ffffff,#ff4d4d);-webkit-background-clip:text;background-clip:text">afk.l0l</span>';
        }

        textWrap.appendChild(titleContainer);
        textWrap.appendChild(subtitle);

        n.appendChild(iconWrapper);
        n.appendChild(textWrap);

        const timerBar = document.createElement('div');
        timerBar.id = `${notificationId}-timer-bar`;
        timerBar.style.position = 'absolute';
        timerBar.style.left = '12px';
        timerBar.style.right = '12px';
        timerBar.style.bottom = '10px';
        timerBar.style.height = '2.5px';
        timerBar.style.borderRadius = '3px';
        timerBar.style.transformOrigin = 'left center';
        timerBar.style.pointerEvents = 'none';
        timerBar.style.boxSizing = 'border-box';
        if (timerAnimated) {
            timerBar.classList.add('afkBypass-timer-indeterminate');
            timerBar.style.transform = 'scaleX(1)';
            timerBar.style.transition = 'none';
        } else {
            timerBar.style.background = '#ff1f1f';
            timerBar.style.transform = 'scaleX(1)';
            timerBar.style.transition = (timerDuration > 0) ? `transform ${timerDuration}ms linear` : 'none';
        }

        n.appendChild(timerBar);
        wrap.appendChild(n);
        document.body.appendChild(wrap);

        if (!timerAnimated && timerDuration > 0) {
            setTimeout(() => {
                timerBar.style.transform = 'scaleX(0)';
            }, 10);
        }

        if (autoRemove) {
            setTimeout(() => {
                const wrapEl = document.getElementById(`${notificationId}-wrap`);
                if (wrapEl) {
                    wrapEl.style.opacity = '0';
                    setTimeout(() => {
                        if (wrapEl.parentNode) wrapEl.parentNode.removeChild(wrapEl);
                        updateNotificationPositions();
                    }, 300);
                }
            }, duration);
        }

        notificationStack.push(notificationId);
        updateNotificationPositions();

        return notificationId;
    }

    function showTopRightStatus(titleText, subtitleText, icon) {
        const notificationId = createTopRightNotification(titleText, subtitleText, icon);
        return notificationId;
    }

    function createTimerNotification() {
        const notificationId = createTopRightNotification('Processing Please Wait <3', 'Starting timer...', '⏰', { autoRemove: false, timerAnimated: true });
        const notif = document.getElementById(notificationId);
        const textWrap = notif.querySelector('div:nth-child(2)');
        const subtitleEl = textWrap.children[1];

        let startTime = Date.now();
        let timerInterval;

        const updateTimer = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            subtitleEl.textContent = `Time elapsed: ${elapsed.toFixed(2)}s`;
        };

        timerInterval = setInterval(updateTimer, 100);
        updateTimer();

        return {
            id: notificationId,
            update: (newTitle, newSubtitle) => {
                const notifEl = document.getElementById(notificationId);
                if (notifEl) {
                    const textWrapLocal = notifEl.querySelector('div:nth-child(2)');
                    const titleContainer = textWrapLocal.children[0];
                    const subtitleLocal = textWrapLocal.children[1];
                    if (newTitle) {
                        const partsN = extractEdgeEmojis(newTitle);
                        if (titleContainer && titleContainer.children.length === 3) {
                            titleContainer.children[0].textContent = partsN.leading || '';
                            titleContainer.children[1].textContent = partsN.core || '';
                            titleContainer.children[2].textContent = partsN.trailing || '';
                        }
                    }
                    if (newSubtitle) subtitleLocal.textContent = newSubtitle;
                }
            },
            stop: () => {
                clearInterval(timerInterval);
                const elapsed = (Date.now() - startTime) / 1000;
                const notifEl = document.getElementById(notificationId);
                if (notifEl) {
                    const textWrapLocal = notifEl.querySelector('div:nth-child(2)');
                    const subtitleLocal = textWrapLocal.children[1];
                    subtitleLocal.textContent = `Completed in: ${elapsed.toFixed(2)}s`;
                    const bar = document.getElementById(`${notificationId}-timer-bar`);
                    if (bar) {
                        bar.classList.remove('afkBypass-timer-indeterminate');
                        bar.style.background = '#ff1f1f';
                        bar.style.transition = 'transform 200ms linear';
                        setTimeout(() => {
                            bar.style.transform = 'scaleX(0)';
                        }, 10);
                    }
                }
            },
            remove: () => {
                clearInterval(timerInterval);
                const wrap = document.getElementById(`${notificationId}-wrap`);
                if (wrap) {
                    wrap.style.opacity = '0';
                    setTimeout(() => {
                        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
                        updateNotificationPositions();
                    }, 300);
                }
            }
        };
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
        box.style.color = 'white';
        box.style.borderRadius = '10px';
        box.style.padding = '16px';
        box.style.boxShadow = '0 14px 60px rgba(0,0,0,0.6)';
        box.style.border = '2px solid #000000';
        box.style.outline = '2px solid #000000';
        box.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
        const h = document.createElement('div');
        h.style.fontSize = '16px';
        h.style.fontWeight = 800;
        h.style.marginBottom = '8px';
        h.style.textAlign = 'center';
        h.style.display = 'flex';
        h.style.alignItems = 'center';
        h.style.justifyContent = 'center';
        h.style.gap = '8px';
        const parts = extractEdgeEmojis(title || '');
        const hEmoji = document.createElement('span');
        hEmoji.textContent = parts.leading || parts.trailing || '';
        hEmoji.style.fontSize = '18px';
        hEmoji.style.lineHeight = '1';
        hEmoji.style.color = '#ffffff';
        const hText = document.createElement('span');
        hText.style.color = 'transparent';
        hText.style.backgroundImage = 'linear-gradient(90deg,#ffffff,#ff4d4d)';
        hText.style.webkitBackgroundClip = 'text';
        hText.style.backgroundClip = 'text';
        hText.textContent = parts.core || (parts.leading && parts.trailing ? '' : (parts.leading || parts.trailing) ) || '';
        h.appendChild(hEmoji);
        h.appendChild(hText);
        const c = document.createElement('div');
        c.style.fontSize = '13px';
        c.style.marginBottom = '12px';
        c.style.whiteSpace = 'pre-wrap';
        c.style.color = 'white';
        let textToCopy = null;
        if (typeof content === 'string') {
            const ta = document.createElement('textarea');
            ta.readOnly = true;
            ta.style.width = '100%';
            ta.style.height = '200px';
            ta.style.padding = '10px';
            ta.style.borderRadius = '8px';
            ta.style.background = '#070707';
            ta.style.color = 'white';
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
        copyBtn.style.background = 'linear-gradient(90deg,#ff4d4d,#ff7373)';
        copyBtn.style.color = 'white';
        copyBtn.addEventListener('click', () => {
            if (textToCopy !== null) {
                const res = copyToClipboard(textToCopy);
                if (res && typeof res.then === 'function') {
                    res.then(ok => {
                        showTopRightStatus(ok ? 'Copied!' : 'Copy failed', '', '📋');
                    });
                } else {
                    showTopRightStatus(res ? 'Copied!' : 'Copy failed', '', '📋');
                }
            } else {
                showTopRightStatus('Nothing to copy', '', '📋');
            }
        });
        const primaryBtn = document.createElement('button');
        primaryBtn.textContent = primaryText || 'Close';
        primaryBtn.style.padding = '10px 14px';
        primaryBtn.style.borderRadius = '8px';
        primaryBtn.style.border = 'none';
        primaryBtn.style.cursor = 'pointer';
        primaryBtn.style.fontWeight = 800;
        primaryBtn.style.background = 'linear-gradient(90deg,#ff4d4d,#ff7373)';
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
        document.body.appendChild(wrap);
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

    function extractAdsLuarmorUrl(value) {
        try {
            const s = typeof value === 'string' ? value : JSON.stringify(value || '');
            const m = s.match(/https:\/\/ads\.luarmor\.net[^\s"'<>]*/i);
            return m ? m[0] : null;
        } catch (e) {
            return null;
        }
    }

    function hasCloudflare() {
        const pageText = document.body && document.body.innerText ? document.body.innerText : '';
        const pageHTML = document.documentElement && document.documentElement.innerHTML ? document.documentElement.innerHTML : '';
        return pageText.includes('Just a moment') || pageHTML.includes('Just a moment');
    }

    function easBypass(url) {
        return new Promise((resolve, reject) => {
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            if (typeof GM_xmlhttpRequest !== 'undefined') {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: EAS_API_URL,
                    headers: {
                        'accept': 'application/json',
                        'eas-api-key': EAS_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({ url: fullUrl }),
                    onload: function(response) {
                        try {
                            const data = JSON.parse(response.responseText);
                            resolve(data);
                        } catch (e) {
                            reject(new Error('Invalid JSON response'));
                        }
                    },
                    onerror: function(error) {
                        reject(error);
                    },
                    ontimeout: function() {
                        reject(new Error('Request timeout'));
                    }
                });
            } else {
                fetch(EAS_API_URL, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'eas-api-key': EAS_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: fullUrl })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => resolve(data))
                .catch(error => reject(error));
            }
        });
    }

    function showCountdownRedirect(url, waitSeconds = 8) {
        if (document.getElementById('afkBypass-countdown-modal')) return;
        ensureStyles();

        const wrap = document.createElement('div');
        wrap.id = 'afkBypass-countdown-modal';
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
        box.style.width = 'min(520px,94%)';
        box.style.background = 'linear-gradient(180deg,#000,#0b0b0b)';
        box.style.color = 'white';
        box.style.borderRadius = '10px';
        box.style.padding = '18px';
        box.style.boxShadow = '0 14px 60px rgba(0,0,0,0.6)';
        box.style.border = '2px solid #000000';
        box.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
        box.style.textAlign = 'center';

        const title = document.createElement('div');
        title.style.fontSize = '16px';
        title.style.fontWeight = 800;
        title.style.marginBottom = '8px';
        title.textContent = 'Wait to Redirect';

        const msg = document.createElement('div');
        msg.style.fontSize = '14px';
        msg.style.marginBottom = '12px';
        msg.style.color = 'white';
        msg.textContent = 'Wait ';

        const countdownNumber = document.createElement('span');
        countdownNumber.className = 'afkBypass-countdown-number';
        countdownNumber.textContent = String(waitSeconds);

        const msgSuffix = document.createElement('span');
        msgSuffix.textContent = ' seconds then click Next to redirect';

        msg.appendChild(countdownNumber);
        msg.appendChild(msgSuffix);

        const btnWrap = document.createElement('div');
        btnWrap.style.display = 'flex';
        btnWrap.style.justifyContent = 'center';
        btnWrap.style.gap = '10px';
        btnWrap.style.marginTop = '12px';

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = true;
        nextBtn.style.padding = '10px 16px';
        nextBtn.style.borderRadius = '8px';
        nextBtn.style.fontWeight = 800;
        nextBtn.style.cursor = 'not-allowed';
        nextBtn.style.border = 'none';
        nextBtn.style.background = 'linear-gradient(90deg,#999,#b5b5b5)';
        nextBtn.style.color = '#111';

        btnWrap.appendChild(nextBtn);

        box.appendChild(title);
        box.appendChild(msg);
        box.appendChild(btnWrap);
        wrap.appendChild(box);
        document.body.appendChild(wrap);

        let remaining = parseInt(waitSeconds, 10) || 8;
        countdownNumber.textContent = String(remaining);
        const interval = setInterval(() => {
            remaining -= 1;
            if (remaining < 0) remaining = 0;
            countdownNumber.textContent = String(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                nextBtn.disabled = false;
                nextBtn.style.cursor = 'pointer';
                nextBtn.style.background = 'linear-gradient(90deg,#ff4d4d,#ff7373)';
            }
        }, 1000);

        nextBtn.addEventListener('click', () => {
            if (nextBtn.disabled) return;
            clearInterval(interval);
            try {
                window.location.href = url;
            } catch (e) {
                showModalBox('🤑Bypassed Successfully', url, 'Close');
            }
            const el = document.getElementById('afkBypass-countdown-modal');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    }

    function handleWorkInk() {
        if (hasCloudflare()) return;
        const currentFullUrl = window.location.href;
        const apiUrl = WORKINK_API_BASE + encodeURIComponent(currentFullUrl);
        const timerNotification = createTimerNotification();
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        }).then(r => r.json().catch(() => ({}))).then(data => {
            timerNotification.stop();
            try {
                if (data && (data.status === 'success' || data.success === true)) {
                    const resultVal = data.result;
                    const adsUrl = extractAdsLuarmorUrl(resultVal);
                    if (adsUrl) {
                        showCountdownRedirect(adsUrl, 8);
                        return;
                    }
                    if (typeof resultVal === 'string' && resultVal.trim().length > 0) {
                        const trimmed = resultVal.trim();
                        if (trimmed.match(/^https?:\/\//i)) {
                            try { window.location.href = trimmed; } catch (e) { showModalBox('🤑Bypassed Successfully', trimmed, 'Close'); }
                            return;
                        }
                        showModalBox('🤑Bypassed Successfully', trimmed, 'Close');
                        return;
                    }
                    showModalBox('🤑Bypassed Successfully', JSON.stringify(resultVal, null, 2), 'Close');
                } else {
                    const errMsg = (data && (data.message || data.error || JSON.stringify(data))) || 'Unknown error';
                    showModalBox('⚠️WorkInk API Error', String(errMsg), 'Close');
                }
            } finally {
                setTimeout(() => {
                    timerNotification.remove();
                }, 800);
            }
        }).catch(err => {
            timerNotification.stop();
            setTimeout(() => {
                timerNotification.remove();
                showTopRightStatus('bypass failed', '', '❌');
            }, 800);
        });
    }

    function handleEasApiForCurrent() {
        try {
            const host = window.location.hostname || '';
            const matched = EAS_API_HOSTS.some(h => isHostMatch(host, h));
            if (!matched) return false;
            const currentFullUrl = window.location.href;
            const timerNotification = createTimerNotification();
            easBypass(currentFullUrl).then(result => {
                timerNotification.stop();
                setTimeout(() => {
                    timerNotification.remove();
                    if (result && (result.status === 'success' || result.success === true) && result.result) {
                        const resultVal = result.result;
                        const adsUrl = extractAdsLuarmorUrl(resultVal);
                        if (adsUrl) {
                            showCountdownRedirect(adsUrl, 8);
                            return;
                        }
                        if (typeof resultVal === 'string' && resultVal.trim().length > 0) {
                            const trimmed = resultVal.trim();
                            if (trimmed.match(/^https?:\/\//i)) {
                                showTopRightStatus('Redirecting...', '', '↪️');
                                setTimeout(() => {
                                    try {
                                        window.location.href = trimmed;
                                    } catch (e) {
                                        showModalBox('🤑Bypassed Successfully', trimmed, 'Close');
                                    }
                                }, 200);
                                return;
                            }
                        }
                        if (typeof resultVal === 'string' && resultVal.trim().length > 0) {
                            showModalBox('🤑Bypassed Successfully', resultVal, 'Close');
                            return;
                        }
                        showModalBox('🤑Bypassed Successfully', JSON.stringify(result, null, 2), 'Close');
                    } else if (result && result.status === 'error') {
                        const errorMsg = result.message || result.error || result.result || 'Unknown error';
                        showModalBox('⚠️Error', errorMsg, 'Close');
                    } else {
                        showTopRightStatus('Invalid response from EAS API', '', '❌');
                    }
                }, 1000);
            }).catch(error => {
                timerNotification.stop();
                setTimeout(() => {
                    timerNotification.remove();
                    showTopRightStatus('bypass failed', '', '❌');
                }, 1000);
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    function afkBypass_showModal(link) {
        if (typeof link === 'string' && link.match(/^https?:\/\//i)) {
            try { window.location.href = link; } catch (e) { showModalBox('🤑Bypassed Successfully', link, 'Redirect', () => { try { window.location.href = link; } catch (e) {} }); }
            return;
        }
        showModalBox('🤑Bypassed Successfully', typeof link === 'string' ? link : JSON.stringify(link, null, 2), 'Close');
    }

    function handleBstlar() {
        if (hasCloudflare()) return;
        const path = window.location.pathname.substring(1);
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
                    showModalBox('🤑Bypassed Successfully', 'Failed No Result Found Result Expired / Invalid', 'Close');
                    return;
                }
                if (String(parsed.destination_url).match(/^https?:\/\//i)) {
                    try { window.location.href = parsed.destination_url; } catch (e) { afkBypass_showModal(parsed.destination_url); }
                    return;
                }
            }
            if (typeof finalText === 'string' && finalText.match(/^https?:\/\//i)) {
                try { window.location.href = finalText; } catch (e) { afkBypass_showModal(finalText); }
                return;
            }
            afkBypass_showModal(finalText || 'No final link returned');
        })
        .catch(() => {
            showTopRightStatus('bypass failed', '', '❌');
        });
    }

    function handleRekonise() {
        if (hasCloudflare()) return;
        fetch(`https://api.rekonise.com/social-unlocks${window.location.pathname}/unlock`, {
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
                try { window.location.href = url; } catch (e) { afkBypass_showModal(url); }
            } else if (typeof data === 'string' && data.trim().length > 0) {
                showModalBox('🤑Bypassed Successfully', data, 'Close');
            } else {
                showModalBox('🤑Bypassed Successfully', 'Error, please join Discord Server in the Greasyfork script.', 'Close');
            }
        })
        .catch(() => {
            showTopRightStatus('bypass failed', '', '❌');
        });
    }

    function handleMboost() {
        try {
            const pageContent = document.documentElement.outerHTML || '';
            const matches = [...pageContent.matchAll(/"targeturl\\":\\"(https?:\/\/[^\\"]+)/g)];
            if (matches.length > 0) {
                const first = matches[0][1];
                if (first && first.match(/^https?:\/\//i)) {
                    try { window.location.href = first; } catch (e) { afkBypass_showModal(first); }
                    return;
                }
                afkBypass_showModal(first);
                return;
            } else {
                const urlFromObj = findFirstUrlInObj(pageContent);
                if (urlFromObj && urlFromObj.match(/^https?:\/\//i)) {
                    try { window.location.href = urlFromObj; } catch (e) { afkBypass_showModal(urlFromObj); }
                    return;
                }
                if (urlFromObj) {
                    showModalBox('🤑Bypassed Successfully', urlFromObj, 'Close');
                    return;
                }
                showModalBox('🤑Bypassed Successfully', 'Could not find destination! Please join our Discord.', 'Close');
            }
        } catch (e) {
            showTopRightStatus('bypass failed', '', '❌');
        }
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

    const EAS_API_HOSTS = [
        "bit.ly","t.ly","jpeg.ly","tiny.cc","tinyurl.com","tinylink.onl",
        "shorter.me","is.gd","v.gd","rebrand.ly","bst.gg","bst.wtf",
        "boost.ink","sub2get.com","sub4unlock.io","sub4unlock.com",
        "sub4unlock.net","subfinal.com","unlocknow.net","ytsubme.com",
        "cuty.io","cuty.me","adfoc.us","justpaste.it","paste-drop.com",
        "pastebin.com","pastecanyon.com","pastehill.com","pastemode.com",
        "rentry.org","paster.so","loot-link.com","loot-links.com",
        "lootlink.org","lootlinks.co","lootdest.info","lootdest.org",
        "lootdest.com","links-loot.com","linksloot.net","bstlar.com",
        "rekonise.com","mboost.me","socialwolvez.com","scwz.me"
    ];

    const WORKINK_HOSTS = [
        "work.ink",
        "direct-link.net","link-target.net","link-to.net","link-center.net",
        "link-hub.net","up-to-down.net","linkvertise.com",
        "auth.platorelay.com","auth.platoboost.me","auth.platoboost.app"
    ];

    const EAS_API_KEY = ".john2032-3253f-3262k-3631f-2626j-9078k";
    const EAS_API_URL = "https://api.eas-x.com/v3/bypass";
    const WORKINK_API_BASE = "https://api-workink.vercel.app/bypass?url=";

    function run() {
        try { showTopRightStatus('Successfully Loaded Userscript!', '', '🌪️'); } catch (e) {}
        try {
            const host = window.location.hostname || '';

            const workinkMatched = WORKINK_HOSTS.some(h => isHostMatch(host, h));
            if (workinkMatched) {
                handleWorkInk();
                return;
            }

            const easMatched = EAS_API_HOSTS.some(h => isHostMatch(host, h));
            if (easMatched) {
                const used = handleEasApiForCurrent();
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
