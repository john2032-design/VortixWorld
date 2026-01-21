;(function () {
  'use strict'

  const HOST_ID = 'vw-notification-shadow-host'
  const STYLE_ID = 'vwNotificationStyles'
  const CONTAINER_ID = 'vwNotificationContainer'
  const BYPASS_HOST = 'vortix-world-bypass.vercel.app'

  let defaultIconHtml = ''
  let initDone = false
  const queue = []

  const CSS = `
:host{all:initial;}
#${CONTAINER_ID}{
  position:fixed !important;
  top:18px !important;
  right:18px !important;
  z-index:2147483647 !important;
  display:flex !important;
  flex-direction:column !important;
  gap:12px !important;
  pointer-events:none !important;
  align-items:flex-end !important;
}
.vw-notif-toast{
  width:320px !important;
  max-width:92vw !important;
  background:rgba(10,14,40,0.96) !important;
  border:1px solid rgba(255,255,255,0.10) !important;
  border-left:4px solid #1e2be8 !important;
  border-radius:12px !important;
  box-shadow:0 18px 60px rgba(0,0,0,0.60) !important;
  overflow:hidden !important;
  pointer-events:auto !important;
  transform:translateX(120%) !important;
  opacity:0 !important;
  animation:vw-toast-in 250ms cubic-bezier(0.2,0.9,0.2,1) forwards !important;
}
.vw-notif-content{
  display:flex !important;
  gap:12px !important;
  padding:12px 12px !important;
  align-items:flex-start !important;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif !important;
}
.vw-notif-icon{
  width:34px !important;
  height:34px !important;
  border-radius:50% !important;
  overflow:hidden !important;
  background:rgba(255,255,255,0.06) !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  flex-shrink:0 !important;
  border:1px solid rgba(255,255,255,0.10) !important;
}
.vw-notif-icon img{
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
}
.vw-notif-text{
  display:flex !important;
  flex-direction:column !important;
  gap:3px !important;
  min-width:0 !important;
}
.vw-notif-title{
  font-weight:900 !important;
  font-size:14px !important;
  color:#7aa2ff !important;
  letter-spacing:0.2px !important;
  line-height:1.2 !important;
}
.vw-notif-message{
  font-weight:700 !important;
  font-size:12px !important;
  color:rgba(207,214,230,0.85) !important;
  line-height:1.35 !important;
  word-break:break-word !important;
}
.vw-notif-bar{
  height:3px !important;
  width:100% !important;
  background:linear-gradient(90deg,#0f1b4f,#1e2be8) !important;
  transform-origin:left center !important;
  animation:vw-bar linear forwards !important;
}
.vw-toast-out{
  animation:vw-toast-out 250ms cubic-bezier(0.4,0,0.2,1) forwards !important;
}
@keyframes vw-toast-in{
  from{transform:translateX(120%);opacity:0;}
  to{transform:translateX(0);opacity:1;}
}
@keyframes vw-toast-out{
  from{transform:translateX(0);opacity:1;}
  to{transform:translateX(30%);opacity:0;}
}
@keyframes vw-bar{
  from{transform:scaleX(1);}
  to{transform:scaleX(0);}
}
@media (max-width:480px){
  #${CONTAINER_ID}{top:88px !important; right:10px !important;}
  .vw-notif-toast{width:300px !important;}
}
`

  function hostIsIgnoredForUnsupported() {
    const h = (location.hostname || '').toLowerCase()
    if (h === BYPASS_HOST || h.endsWith('.' + BYPASS_HOST)) return true
    if (h === 'ads.luarmor.net' || h.endsWith('.ads.luarmor.net')) return true
    return false
  }

  function normalizeIcon(iconHtml, type) {
    const s = String(iconHtml || '').trim()
    if (s) return s
    if (type === 'success') return '<span>✔️</span>'
    if (type === 'warning') return '<span>⚠️</span>'
    if (type === 'error') return '<span>❌</span>'
    return '<span>ℹ️</span>'
  }

  function ensureHost() {
    let host = document.getElementById(HOST_ID)
    if (host && host.__vwShadow) return host

    if (host) {
      try { host.remove() } catch (_) {}
    }

    host = document.createElement('div')
    host.id = HOST_ID
    host.style.cssText = 'all: initial !important; position: fixed !important; inset: 0 !important; width: 0 !important; height: 0 !important; z-index: 2147483647 !important; pointer-events: none !important;'

    const root = host.attachShadow({ mode: 'open' })
    host.__vwShadow = root

    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = CSS
    root.appendChild(style)

    const container = document.createElement('div')
    container.id = CONTAINER_ID
    root.appendChild(container)

    ;(document.documentElement || document).appendChild(host)
    return host
  }

  function getContainer() {
    const host = ensureHost()
    const root = host.__vwShadow
    const c = root && root.getElementById ? root.getElementById(CONTAINER_ID) : root.querySelector('#' + CONTAINER_ID)
    return c || null
  }

  function renderToast(title, message, type, timeout, iconHtml) {
    if (String(title).includes('Unsupported Site') && hostIsIgnoredForUnsupported()) return

    const container = getContainer()
    if (!container) return

    const msRaw = Number(timeout)
    const ms = Number.isFinite(msRaw) ? Math.max(800, msRaw) : 3500

    const toast = document.createElement('div')
    toast.className = 'vw-notif-toast'

    const icon = normalizeIcon(iconHtml || defaultIconHtml, type)
    toast.innerHTML = `
      <div class="vw-notif-content">
        <div class="vw-notif-icon">${icon}</div>
        <div class="vw-notif-text">
          <div class="vw-notif-title"></div>
          <div class="vw-notif-message"></div>
        </div>
      </div>
      <div class="vw-notif-bar"></div>
    `

    const tEl = toast.querySelector('.vw-notif-title')
    const mEl = toast.querySelector('.vw-notif-message')
    if (tEl) tEl.textContent = String(title)
    if (mEl) mEl.textContent = String(message)

    const bar = toast.querySelector('.vw-notif-bar')
    if (bar) bar.style.animationDuration = ms + 'ms'

    container.appendChild(toast)

    const cleanup = () => {
      try { toast.remove() } catch (_) {}
    }

    const startOut = () => {
      toast.classList.add('vw-toast-out')
      setTimeout(cleanup, 260)
    }

    setTimeout(startOut, ms)
  }

  function flushQueue() {
    while (queue.length) {
      const x = queue.shift()
      renderToast(x.title, x.message, x.type, x.timeout, x.iconHtml)
    }
  }

  function init() {
    if (initDone) return
    initDone = true
    ensureHost()
    flushQueue()
    const mo = new MutationObserver(() => {
      if (!document.getElementById(HOST_ID)) {
        try { initDone = false } catch (_) {}
        init()
      }
    })
    try {
      mo.observe(document.documentElement || document, { childList: true, subtree: true })
    } catch (_) {}
  }

  function show(title, message, type = 'info', timeout = 3500, iconHtml) {
    const payload = { title, message, type, timeout, iconHtml }
    if (!document.documentElement) {
      queue.push(payload)
      return
    }
    if (!initDone) {
      queue.push(payload)
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
      else init()
      return
    }
    renderToast(title, message, type, timeout, iconHtml)
  }

  function setDefaultIconHtml(html) {
    defaultIconHtml = String(html || '')
  }

  function startLoop() {}
  function stopLoop() {}

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()

  window.VW_Notifications = { show, setDefaultIconHtml, startLoop, stopLoop }
})()
