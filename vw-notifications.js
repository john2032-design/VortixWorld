;(function () {
  'use strict'
  const STYLE_ID = 'vwNotificationStyles'
  const CONTAINER_ID = 'vwNotificationContainer'
  const BYPASS_HOST = 'vortix-world-bypass.vercel.app'
  const DEFAULT_DISPLAY_MS = 3500
  const DEFAULT_GAP_MS = 250
  const shownNonLoop = new Set()
  const pendingQueue = []
  const MATCH_HOSTS_SORTED = [
    'airflowscript.com',
    'auth.platorelay.com',
    'best-links.org',
    'blox-script.com',
    'cuttlinks.com',
    'cuttty.com',
    'cuty.io',
    'cutynow.com',
    'keyrblx.com',
    'linkvertise.com',
    'links-loot.com',
    'linksloot.net',
    'loot-labs.com',
    'loot-link.com',
    'loot-links.com',
    'lootdest.com',
    'lootdest.info',
    'lootdest.org',
    'lootlabs.com',
    'lootlink.org',
    'lootlinks.co',
    'lootlinks.com',
    'mboost.me',
    'neoxsoftworks.eu',
    'pandadevelopment.net',
    'work.ink'
  ]
  let defaultIconHtml = ''
  let loopRunning = false
  let loopIndex = 0
  let loopStep = 0
  let containerReady = false
  const CSS = `
#${CONTAINER_ID}{
  position:fixed !important;
  top:18px !important;
  right:18px !important;
  z-index:2147483690 !important;
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
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = CSS
    ;(document.head || document.documentElement).appendChild(style)
  }
  function ensureContainer() {
    let c = document.getElementById(CONTAINER_ID)
    if (c) return c
    c = document.createElement('div')
    c.id = CONTAINER_ID
    ;(document.body || document.documentElement).appendChild(c)
    containerReady = true
    return c
  }
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
  function createToastElement(title, message, type, barDuration, iconHtml) {
    const toast = document.createElement('div')
    toast.className = 'vw-notif-toast'
    const icon = normalizeIcon(iconHtml || defaultIconHtml, type)
    toast.innerHTML = `
      <div class="vw-notif-content">
        <div class="vw-notif-icon">${icon}</div>
        <div class="vw-notif-text">
          <div class="vw-notif-title">${String(title)}</div>
          <div class="vw-notif-message">${String(message)}</div>
        </div>
      </div>
      <div class="vw-notif-bar" style="animation-duration:${barDuration}ms;"></div>
    `
    return toast
  }
  const activeTimers = new WeakMap()
  function scheduleRemoval(el, timeout) {
    try {
      if (!el) return
      if (activeTimers.has(el)) return
      const t = setTimeout(() => {
        try { el.classList.add('vw-toast-out') } catch (_) {}
        setTimeout(() => {
          try { el.remove() } catch (_) {}
        }, 260)
        activeTimers.delete(el)
      }, timeout)
      activeTimers.set(el, t)
    } catch (_) {}
  }
  function clearPendingRemoval(el) {
    try {
      if (!el) return
      const t = activeTimers.get(el)
      if (t) {
        clearTimeout(t)
        activeTimers.delete(el)
      }
    } catch (_) {}
  }
  function renderToast(title, message, type, timeout, iconHtml) {
    if (String(title).includes('Unsupported Site') && hostIsIgnoredForUnsupported()) return
    ensureStyles()
    const container = ensureContainer()
    const loopLike =
      String(title) === 'VortixWorld Bypass' ||
      String(title) === 'Supported Site' ||
      String(title) === 'Join Discord' ||
      String(title) === 'Created By'
    const key = `${title}::${message}::${type}`
    if (!loopLike) {
      if (shownNonLoop.has(key)) return
      shownNonLoop.add(key)
    }
    timeout = Number.isFinite(timeout) ? Math.max(0, timeout) : DEFAULT_DISPLAY_MS
    const barDuration = Math.max(300, timeout)
    if (!loopLike) {
      const toast = createToastElement(title, message, type, barDuration, iconHtml)
      container.appendChild(toast)
      scheduleRemoval(toast, timeout)
      setTimeout(() => { try { shownNonLoop.delete(key) } catch (_) {} }, timeout + 400)
      return
    }
    const existing = container.querySelector('.vw-notif-toast')
    if (existing) {
      pendingQueue.push({ title, message, type, timeout, iconHtml })
      return
    }
    const toast = createToastElement(title, message, type, barDuration, iconHtml)
    container.appendChild(toast)
    scheduleRemoval(toast, timeout)
    setTimeout(() => {
      const next = pendingQueue.shift()
      if (next) {
        setTimeout(() => renderToast(next.title, next.message, next.type, next.timeout, next.iconHtml), DEFAULT_GAP_MS)
      }
    }, timeout + 300)
  }
  function init() {
    if (containerReady) return
    ensureStyles()
    ensureContainer()
  }
  function show(title, message, type = 'info', timeout = DEFAULT_DISPLAY_MS, iconHtml) {
    if (!document.documentElement) {
      pendingQueue.push({ title, message, type, timeout, iconHtml })
      return
    }
    if (!containerReady) init()
    renderToast(title, message, type, timeout, iconHtml)
  }
  function setDefaultIconHtml(html) {
    defaultIconHtml = String(html || '')
  }
  function startLoop() {
    if (loopRunning) return
    loopRunning = true
    loopIndex = 0
    loopStep = 0
    const discordIcon = '<img src="https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png">'
    const crownIcon = '<span>👑</span>'
    const linkIcon = '<span>🔗</span>'
    const showNextLoop = () => {
      if (!loopRunning) return
      if (loopStep === 0) {
        renderToast('VortixWorld Bypass', 'Active & Ready', 'info', DEFAULT_DISPLAY_MS, defaultIconHtml || '<span>V</span>')
      } else if (loopStep === 1) {
        const site = MATCH_HOSTS_SORTED[loopIndex % MATCH_HOSTS_SORTED.length]
        loopIndex++
        renderToast('Supported Site', site, 'info', DEFAULT_DISPLAY_MS, linkIcon)
      } else if (loopStep === 2) {
        renderToast('Join Discord', 'https://discord.gg/vortex-x-sideload-bypass-1355388445509288047', 'info', DEFAULT_DISPLAY_MS, discordIcon)
      } else {
        renderToast('Created By', 'afk.l0l', 'info', DEFAULT_DISPLAY_MS, crownIcon)
      }
      loopStep = (loopStep + 1) % 4
      setTimeout(() => {
        if (!loopRunning) return
        showNextLoop()
      }, DEFAULT_DISPLAY_MS + DEFAULT_GAP_MS)
    }
    setTimeout(() => showNextLoop(), 300)
  }
  function stopLoop() {
    loopRunning = false
    pendingQueue.length = 0
    try {
      const c = document.getElementById(CONTAINER_ID)
      if (c) {
        const els = Array.from(c.querySelectorAll('.vw-notif-toast'))
        els.forEach(el => {
          try { el.remove() } catch (_) {}
        })
      }
    } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
  window.VW_Notifications = { show, setDefaultIconHtml, startLoop, stopLoop }
})()