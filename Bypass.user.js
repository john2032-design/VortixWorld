// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    https://vortix-world-bypass.vercel.app/
// @version      1.2
// @description  Bypass 💩Fr
// @author       You
// @icon         https://i.ibb.co/pvbSKgsL/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png
// @match        *://*.linkvertise.com/*
// @match        *://linkvertise.com/*
// @match        *://*.lootlink.org/*
// @match        *://lootlink.org/*
// @match        *://*.lootlinks.co/*
// @match        *://lootlinks.co/*
// @match        *://*.lootdest.info/*
// @match        *://lootdest.info/*
// @match        *://*.lootdest.org/*
// @match        *://lootdest.org/*
// @match        *://*.lootdest.com/*
// @match        *://lootdest.com/*
// @match        *://*.links-loot.com/*
// @match        *://links-loot.com/*
// @match        *://*.loot-links.com/*
// @match        *://loot-links.com/*
// @match        *://*.best-links.org/*
// @match        *://best-links.org/*
// @match        *://*.lootlinks.com/*
// @match        *://lootlinks.com/*
// @match        *://*.loot-labs.com/*
// @match        *://loot-labs.com/*
// @match        *://*.lootlabs.com/*
// @match        *://lootlabs.com/*
// @match        *://*.work.ink/*
// @match        *://work.ink/*
// @match        *://keyrblx.com/*
// @match        *://auth.platorelay.com/*
// @match        *://pandadevelopment.net/*
// @match        https://vortix-world-bypass.vercel.app/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const BYPASS_SITE = 'https://vortix-world-bypass.vercel.app';
  const BYPASS_HOST = (new URL(BYPASS_SITE)).hostname;
  const REDIRECT_DELAY_MS = 5000;

  function createStyles() {
    if (document.getElementById('vortix-style')) return;
    const style = document.createElement('style');
    style.id = 'vortix-style';
    style.textContent = `
#vortix-overlay { position: fixed; inset: 0; background: rgba(4,4,10,0.86); display:flex; align-items:center; justify-content:center; z-index:2147483646; backdrop-filter: blur(3px); }
#vortix-overlay .panel { width: 420px; max-width:90%; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border-radius:16px; padding:18px; text-align:center; color: #eef2ff; box-shadow: 0 8px 40px rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.04); }
#vortix-overlay .title { font-size:18px; margin-bottom:8px; font-weight:700; }
#vortix-overlay .sub { font-size:13px; color: rgba(255,255,255,0.7); margin-bottom:12px; }
#vortix-overlay .count { font-size:28px; font-weight:800; margin-bottom:12px; }
#vortix-overlay .progress { height:8px; background: rgba(255,255,255,0.06); border-radius:8px; overflow:hidden; margin-bottom:14px; }
#vortix-overlay .progress > i { display:block; height:100%; width:0%; background: linear-gradient(90deg, #7f8aff, #3b2be8); transition: width 0.15s linear; }
#vortix-overlay .btns { display:flex; gap:10px; justify-content:center; }
#vortix-overlay .btn { padding:8px 12px; border-radius:10px; border:none; cursor:pointer; font-weight:700; }
#vortix-overlay .btn.go { background: linear-gradient(90deg,#27d3a1,#1fb07f); color: #061412; }
#vortix-overlay .btn.cancel { background: rgba(255,255,255,0.03); color:#eef2ff; border:1px solid rgba(255,255,255,0.04); }
#vortix-toast-wrap { position: fixed; right: 18px; top: 18px; display:flex; flex-direction:column; gap:10px; z-index: 9999999999999999 !important; pointer-events:none; align-items: flex-end; }
.vortix-toast { pointer-events:auto; display:flex; gap:12px; align-items:center; background: linear-gradient(180deg, rgba(0,0,0,0.98), rgba(10,10,10,0.98)); border-radius:12px; padding:10px 12px; min-width:260px; max-width:360px; color:#ffffff; box-shadow:0 10px 30px rgba(0,0,0,0.6), 0 0 8px rgba(255,0,0,0.06); border:1px solid rgba(255,0,0,0.22); }
.vortix-toast .avatar { width:44px; height:44px; border-radius:50%; flex:0 0 44px; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; background: #000000; color: #ffffff; border:2px solid #ff2b2b; box-shadow: 0 2px 8px rgba(255,0,0,0.08); }
.vortix-toast .content { flex:1; display:flex; flex-direction:column; gap:6px; }
.vortix-toast .msg { font-weight:800; font-size:14px; color:#ffffff; }
.vortix-toast .sub { font-size:12px; color: rgba(255,255,255,0.85); }
.vortix-toast .timer { height:3px; background: rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; margin-top:8px; }
.vortix-toast .timer > i { display:block; height:100%; width:100%; background: linear-gradient(90deg,#ff2b2b,#ffffff); transform-origin: left; transition: width 0.12s linear; width:100%; }
`;
    document.head.appendChild(style);
  }

  function makeToast(emoji, title, subtitle, duration = 3500) {
    createStyles();
    let wrap = document.getElementById('vortix-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'vortix-toast-wrap';
      try {
        document.documentElement.appendChild(wrap);
      } catch (e) {
        document.body.appendChild(wrap);
      }
    }
    const box = document.createElement('div');
    box.className = 'vortix-toast';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = emoji;
    const content = document.createElement('div');
    content.className = 'content';
    const msg = document.createElement('div');
    msg.className = 'msg';
    msg.textContent = title;
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = subtitle || '';
    const timer = document.createElement('div');
    timer.className = 'timer';
    const timerBar = document.createElement('i');
    timer.appendChild(timerBar);
    content.appendChild(msg);
    content.appendChild(sub);
    content.appendChild(timer);
    box.appendChild(avatar);
    box.appendChild(content);
    wrap.appendChild(box);

    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 1 - elapsed / duration);
      timerBar.style.width = (pct * 100) + '%';
      if (elapsed >= duration) {
        clearInterval(id);
        if (box.parentNode) box.parentNode.removeChild(box);
      }
    }, 100);
    return box;
  }

  function waitFor(selector, timeout = 20000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const iv = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(iv);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(iv);
          reject(new Error('timeout waiting for ' + selector));
        }
      }, 250);
    });
  }

  function startOverlayAndMaybeRedirect(originalUrl) {
    createStyles();
    if (document.getElementById('vortix-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'vortix-overlay';
    overlay.innerHTML = `
      <div class="panel">
        <div class="title">Redirecting to VortixWorld Bypass</div>
        <div class="sub">We will redirect you to the bypass site in</div>
        <div class="count">5s</div>
        <div class="progress"><i></i></div>
        <div class="btns">
          <button class="btn go">Go Now</button>
          <button class="btn cancel">Cancel</button>
        </div>
      </div>
    `;
    try {
      document.body.appendChild(overlay);
    } catch (e) {
      document.documentElement.appendChild(overlay);
    }
    const countEl = overlay.querySelector('.count');
    const progBar = overlay.querySelector('.progress > i');
    const goBtn = overlay.querySelector('.btn.go');
    const cancelBtn = overlay.querySelector('.btn.cancel');

    let start = Date.now();
    let redirected = false;
    let canceled = false;
    const total = REDIRECT_DELAY_MS;
    const interval = 50;
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, total - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      countEl.textContent = `${seconds}s`;
      const pct = Math.min(1, elapsed / total);
      progBar.style.width = (pct * 100) + '%';
      if (elapsed >= total && !redirected && !canceled) {
        redirected = true;
        clearInterval(iv);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        sessionStorage.setItem('vortix_orig', originalUrl);
        const target = BYPASS_SITE + '?u=' + encodeURIComponent(originalUrl);
        makeToast('🔁', 'Redirecting', originalUrl, 2500);
        location.href = target;
      }
    }, interval);

    goBtn.addEventListener('click', () => {
      if (redirected || canceled) return;
      redirected = true;
      clearInterval(iv);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      sessionStorage.setItem('vortix_orig', originalUrl);
      const target = BYPASS_SITE + '?u=' + encodeURIComponent(originalUrl);
      makeToast('▶️', 'Redirecting now', originalUrl, 2500);
      location.href = target;
    });

    cancelBtn.addEventListener('click', () => {
      if (redirected || canceled) return;
      canceled = true;
      clearInterval(iv);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      makeToast('❌', 'Redirect canceled', '', 2500);
    });
  }

  function pageIsSupportedHost() {
    const hn = location.hostname.toLowerCase();
    return !hn.includes(BYPASS_HOST);
  }

  (function runOnSupportedSites() {
    if (!pageIsSupportedHost()) return;
    const origin = location.href;
    startOverlayAndMaybeRedirect(origin);
  })();

  async function runOnBypassSite() {
    if (location.hostname !== BYPASS_HOST) return;
    createStyles();
    const params = new URLSearchParams(location.search);
    const incoming = params.get('u') || params.get('url') || sessionStorage.getItem('vortix_orig') || '';
    if (sessionStorage.getItem('vortix_orig')) sessionStorage.removeItem('vortix_orig');
    if (!incoming) return;

    makeToast('📥', 'Received URL', incoming, 3000);

    try {
      const inputSelector = 'input[aria-label="URL to bypass"]';
      const inputEl = await waitFor(inputSelector, 10000);
      inputEl.focus();
      const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSet) {
        nativeSet.call(inputEl, incoming);
      } else {
        inputEl.value = incoming;
      }
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      makeToast('📋', 'URL pasted into box', '', 2500);
    } catch (e) {
      makeToast('⛔️', 'Failed to auto-fill input', '', 3500);
      return;
    }

    try {
      const submitBtn = await waitFor('button.btn[type="submit"], button.btn', 10000);
      const startTokenPoll = Date.now();
      const maxTokenWait = 60000;
      const pollInterval = 700;
      const p = setInterval(() => {
        let token = '';
        try {
          const widgetId = window.__vortix_hcaptcha_widget;
          if (typeof widgetId !== 'undefined' && window.hcaptcha && typeof window.hcaptcha.getResponse === 'function') {
            token = window.hcaptcha.getResponse(widgetId) || '';
          } else if (window.hcaptcha && typeof window.hcaptcha.getResponse === 'function') {
            for (let i = 0; i < 10; i++) {
              try {
                const t = window.hcaptcha.getResponse(i);
                if (t && t.length) {
                  token = t;
                  break;
                }
              } catch (err) {}
            }
          }
        } catch (err) {}

        if (token && token.length > 0) {
          clearInterval(p);
          makeToast('🧩', 'Captcha solved — submitting', '', 2500);
          setTimeout(() => {
            try {
              submitBtn.click();
              makeToast('✔️', 'Bypass submitted', '', 2500);
            } catch (err) {
              makeToast('❗', 'Failed to click Bypass', '', 3000);
            }
          }, 350);
          return;
        }
        if (Date.now() - startTokenPoll > maxTokenWait) {
          clearInterval(p);
          makeToast('⚠️', 'Captcha not detected, please solve manually', '', 5000);
        }
      }, pollInterval);
    } catch (err) {
      makeToast('⚠️', 'Submit button not found', '', 3500);
    }
  }

  runOnBypassSite();

})();
