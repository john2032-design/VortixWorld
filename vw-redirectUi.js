;(function () {
  'use strict'

  const ICON_URL = 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png'

  function copyTextSilent(text) {
    try {
      if (!text) return Promise.resolve(false)
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(String(text)).then(() => true).catch(() => false)
      }
    } catch (_) {}
    return new Promise(resolve => {
      try {
        const ta = document.createElement('textarea')
        ta.value = String(text)
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        ta.style.top = '0'
        ;(document.body || document.documentElement).appendChild(ta)
        ta.focus()
        ta.select()
        const ok = document.execCommand('copy')
        ta.remove()
        resolve(!!ok)
      } catch (_) {
        resolve(false)
      }
    })
  }

  function getReturnUrl() {
    try {
      const p = new URLSearchParams(location.search)
      const r = p.get('return')
      if (r) return r
    } catch (_) {}
    try {
      const r = sessionStorage.getItem('vw_bypass_return_url')
      if (r) return r
    } catch (_) {}
    return ''
  }

  function setReturnUrl(url) {
    try {
      sessionStorage.setItem('vw_bypass_return_url', String(url))
    } catch (_) {}
  }

  function buildReturnWithRedirect(returnUrl, target) {
    const base = String(returnUrl || '')
    if (!base) return ''
    try {
      const u = new URL(base)
      u.searchParams.set('redirect', String(target))
      return u.toString()
    } catch (_) {
      const join = base.includes('?') ? '&' : '?'
      return base + join + 'redirect=' + encodeURIComponent(String(target))
    }
  }

  const SHARED_UI_CSS = `
    #vortixWorldOverlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #000000 0%, #071033 60%, #1e2be8 100%) !important;
      z-index: 2147483640 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
      color: #cfd6e6 !important;
      box-sizing: border-box !important;
    }
    .vw-header-bar{
      position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:72px !important;
      padding:0 26px !important; display:flex !important; align-items:center !important; justify-content:space-between !important;
      background:rgba(255,255,255,0.06) !important; border-bottom:2px solid rgba(255,255,255,0.12) !important;
      box-shadow:0 4px 18px rgba(0,0,0,0.35) !important; backdrop-filter: blur(10px) !important;
    }
    .vw-title{ font-weight:900 !important; font-size:22px !important; display:flex !important; align-items:center !important; gap:12px !important; color:#7aa2ff !important; }
    .vw-header-icon{ height:34px !important; width:34px !important; border-radius:50% !important; object-fit:cover !important; border:2px solid #1e2be8 !important; }
    .vw-main{ width:100% !important; max-width:600px !important; padding-top:56px !important; display:flex !important; flex-direction:column !important; align-items:center !important; }
    .vw-status{ font-size:22px !important; font-weight:900 !important; margin:10px 0 !important; color:#7aa2ff !important; text-align:center !important;}
    .vw-sub{ font-size:15px !important; color:rgba(207,214,230,0.82) !important; text-align:center !important; font-weight:600 !important;}
    .vw-btn{
      background: linear-gradient(135deg, #0f1b4f, #1e2be8) !important;
      color: #cfd6e6 !important;
      border: 1px solid rgba(255,255,255,0.14) !important;
      padding: 14px 18px !important;
      border-radius: 10px !important;
      font-weight: 900 !important;
      cursor: pointer !important;
      width: 100% !important;
      text-transform: uppercase !important;
      transition: all 0.2s !important;
      font-size: 14px !important;
      letter-spacing: 1px !important;
    }
    .vw-btn:disabled{opacity:0.45 !important; cursor:not-allowed !important;}
  `

  function renderLuarmorManualContinue(targetUrl, waitSeconds) {
    const secs = Number.isFinite(waitSeconds) ? Math.max(0, Math.floor(waitSeconds)) : 20
    document.documentElement.innerHTML = `
      <html><head>
        <title>VortixWorld USERSCRIPT</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>${SHARED_UI_CSS}</style>
      </head><body>
        <div id="vortixWorldOverlay">
          <div class="vw-header-bar">
            <div class="vw-title">
              <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
              VortixWorld
            </div>
          </div>
          <div class="vw-main">
            <img src="${ICON_URL}" style="width:80px;height:80px;border-radius:16px;margin:20px 0 10px 0;object-fit:cover;box-shadow:0 10px 36px rgba(0,0,0,0.35);" alt="VortixWorld">
            <div class="vw-status">Luarmor Manual Continue</div>
            <div id="vwLuarmorSub" class="vw-sub">Next will unlock in ${secs} seconds...</div>
            <div style="width:80%;max-width:420px;margin-top:18px;">
              <button id="vwLuarmorNextBtn" class="vw-btn" disabled>Next</button>
            </div>
          </div>
        </div>
      </body></html>
    `
    const btn = document.getElementById('vwLuarmorNextBtn')
    const sub = document.getElementById('vwLuarmorSub')

    let remaining = secs
    const iv = setInterval(() => {
      remaining = Math.max(0, remaining - 1)
      if (sub) sub.textContent = remaining > 0 ? `Next will unlock in ${remaining} seconds...` : 'You may continue now.'
      if (remaining <= 0) {
        if (btn) btn.disabled = false
        clearInterval(iv)
      }
    }, 1000)

    if (btn) {
      btn.addEventListener('click', () => {
        location.href = String(targetUrl)
      })
    }
  }

  function installBypassSiteFetchInterceptor(getLuarmorWaitTimeSeconds) {
    const API_MARK = '/api/proxy?url='
    const origFetch = window.fetch
    if (window.__VW_BYPASS_FETCH_HOOK__) return
    window.__VW_BYPASS_FETCH_HOOK__ = true

    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : input && input.url ? input.url : ''
      const isProxy = typeof url === 'string' && url.includes(API_MARK)
      if (!isProxy) return origFetch(input, init)

      return origFetch(input, init).then(async res => {
        try {
          const clone = res.clone()
          const json = await clone.json().catch(() => null)
          const result = json && json.result ? String(json.result) : ''

          if (window.VW_LOGIC && typeof window.VW_LOGIC.isLuarmorUrl === 'function' && window.VW_LOGIC.isLuarmorUrl(result)) {
            const returnUrl = getReturnUrl()
            await copyTextSilent(result)

            if (returnUrl) {
              const backUrl = buildReturnWithRedirect(returnUrl, result)
              setTimeout(() => {
                location.href = backUrl
              }, 0)
              return new Response(JSON.stringify({ status: 'result', result: 'Luarmor handled by userscript' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              })
            }

            const wait = Number.isFinite(getLuarmorWaitTimeSeconds()) ? getLuarmorWaitTimeSeconds() : 20
            renderLuarmorManualContinue(result, wait)
            return new Response(JSON.stringify({ status: 'result', result: 'Luarmor handled by userscript' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            })
          }
        } catch (_) {}
        return res
      })
    }
  }

  window.VW_REDIRECT_UI = {
    copyTextSilent,
    getReturnUrl,
    setReturnUrl,
    buildReturnWithRedirect,
    renderLuarmorManualContinue,
    installBypassSiteFetchInterceptor
  }
})()
