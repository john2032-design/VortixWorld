// ==UserScript==
// @name         VortixWorld BYPASSER
// @namespace    https://vortix-world-bypass.vercel.app/
// @version      1.0.3
// @author       You
// @description  Bypass ad-links using the VortixWorld API and go to the destination without ad pages
// @match        *://linkvertise.com/*
// @match        *://*.linkvertise.com/*
// @match        *://lootlink.org/*
// @match        *://*.lootlink.org/*
// @match        *://lootlinks.co/*
// @match        *://*.lootlinks.co/*
// @match        *://lootdest.info/*
// @match        *://*.lootdest.info/*
// @match        *://lootdest.org/*
// @match        *://*.lootdest.org/*
// @match        *://lootdest.com/*
// @match        *://*.lootdest.com/*
// @match        *://links-loot.com/*
// @match        *://*.links-loot.com/*
// @match        *://loot-links.com/*
// @match        *://*.loot-links.com/*
// @match        *://best-links.org/*
// @match        *://*.best-links.org/*
// @match        *://lootlinks.com/*
// @match        *://*.lootlinks.com/*
// @match        *://loot-labs.com/*
// @match        *://*.loot-labs.com/*
// @match        *://lootlabs.com/*
// @match        *://*.lootlabs.com/*
// @match        *://loot-link.com/*
// @match        *://*.loot-link.com/*
// @match        *://work.ink/*
// @match        *://*.work.ink/*
// @match        *://auth.platorelay.com/*
// @match        *://*.auth.platorelay.com/*
// @match        *://keyrblx.com/*
// @match        *://*.keyrblx.com/*
// @match        *://pandadevelopment.net/*
// @match        *://*.pandadevelopment.net/*
// @exclude      *://vortix-world-bypass.vercel.app/*
// @downloadURL  https://raw.githubusercontent.com/john2032-design/VortixWorld/refs/heads/main/Bypass.user.js
// @updateURL    https://raw.githubusercontent.com/john2032-design/VortixWorld/refs/heads/main/Bypass.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
(async function () {
  'use strict'
  const config = { time: 10 }
  const SITE_HOST = 'vortix-world-bypass.vercel.app'
  const TARGET = 'https://' + SITE_HOST + '/userscript.html'
  const ALLOWED_SHORT_HOSTS = [
    'linkvertise.com','lootlink.org','lootlinks.co','lootdest.info','lootdest.org','lootdest.com',
    'links-loot.com','loot-links.com','best-links.org','lootlinks.com','loot-labs.com','lootlabs.com',
    'loot-link.com','work.ink','auth.platorelay.com','keyrblx.com','pandadevelopment.net'
  ]
  const originalCreateElement = document.createElement.bind(document)
  document.createElement = function (elementName) {
    const el = originalCreateElement(elementName)
    if (elementName && elementName.toLowerCase() === 'script') {
      el.setAttribute('type', 'text/plain')
    }
    return el
  }
  function isAllowedHost(host) {
    if (!host) return false
    const h = host.toLowerCase().replace(/^www\./, '')
    return ALLOWED_SHORT_HOSTS.includes(h)
  }
  const params = new URLSearchParams(location.search)
  const redirectParam = params.get('redirect')
  if (redirectParam) {
    if (redirectParam.includes('https://flux.li/android/external/main.php')) {
      document.documentElement.innerHTML = '<html><head><title>VortixWorld USERSCRIPT</title><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="height:100%;margin:0;padding:0;background:linear-gradient(135deg,#000000 0%,#071033 60%,#1e2be8 100%);color:#ffffff;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;"><div style="max-width:760px;padding:28px;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.06));box-shadow:0 20px 60px rgba(0,0,0,0.6);"><h1 style="margin:0 0 12px 0">VortixWorld USERSCRIPT</h1><h2 style="margin:0 0 8px 0;font-size:16px">Target requires manual redirect due to extra security checks</h2><div style="margin-top:12px"><a href="' + redirectParam + '" style="color:#ffffff;background:linear-gradient(90deg,#0f1b4f,#1e2be8);padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:700">Click here to continue</a></div></div></body></html>'
    } else {
      try {
        location.href = redirectParam
      } catch (e) {
        window.open(redirectParam, '_blank', 'noopener,noreferrer')
      }
    }
    return
  }
  if (!isAllowedHost(location.hostname)) {
    setTimeout(() => {
      location.href = TARGET + '?url=' + encodeURIComponent(location.href) + '&time=' + encodeURIComponent(config.time)
    }, 1200)
    return
  }
  document.documentElement.innerHTML = '<html><head><title>VortixWorld USERSCRIPT</title><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="height:100%;margin:0;padding:0;background:linear-gradient(135deg,#000000 0%,#071033 60%,#1e2be8 100%);color:#ffffff;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;"><div style="max-width:760px;padding:28px;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.06));box-shadow:0 20px 60px rgba(0,0,0,0.6);"><div style="margin-bottom:18px;"><svg width=\"84\" height=\"84\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"border-radius:12px;background:rgba(255,255,255,0.03);padding:10px;box-shadow:0 6px 18px rgba(0,0,0,0.4)\"><path d=\"M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z\" fill=\"white\" opacity=\"0.96\"></path></svg></div><div style=\"font-weight:800;font-size:22px;margin-bottom:8px\">Redirecting...</div><div style=\"color:rgba(255,255,255,0.9);margin-bottom:18px;font-size:14px\">Please wait while VortixWorld prepares the bypass page.</div><div style=\"margin:0 auto 14px auto;width:56px;height:56px;border-radius:50%;border:6px solid rgba(255,255,255,0.08);border-top-color:rgba(255,255,255,0.95);animation:vbspin 1s linear infinite\"></div><div style=\"height:8px;border-radius:999px;background:linear-gradient(90deg,#000 0%,#0f1b4f 40%,#1e2be8 100%);margin-top:18px;box-shadow:0 6px 24px rgba(30,43,232,0.24)\"></div></div><style>@keyframes vbspin{100%{transform:rotate(360deg)}}</style></body></html>'
  setTimeout(() => {
    location.href = TARGET + '?url=' + encodeURIComponent(location.href) + '&time=' + encodeURIComponent(config.time)
  }, 850)
})()
