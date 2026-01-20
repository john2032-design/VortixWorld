;(function () {
  'use strict'

  const STYLE_ID = 'vwNotificationStyles'
  const CONTAINER_ID = 'vwNotificationContainer'
  const BYPASS_HOST = 'vortix-world-bypass.vercel.app'
  const DISPLAY_MS = 3500
  const GAP_MS = 250
  const shownNonLoop = new Set()

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
  let loopStarted = false
  let loopTimer = null

  const CSS = `
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
  animation:vw-toast-in 280ms cubic-bezier(0.2,0.9,0.2,1) forwards !important;
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
  animation:vw-toast-out 360ms cubic-bezier(0.4,0,0.2,1) forwards !important;
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

  function show(title, message, type = 'info', timeout = DISPLAY_MS, iconHtml) {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => show(title, message, type, timeout, iconHtml), { once: true })
      return
    }

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
      <div class="vw-notif-bar" style="animation-duration:${timeout}ms;"></div>
    `

    container.appendChild(toast)

    const cleanup = () => {
      try {
        toast.remove()
      } catch (_) {}
      if (!loopLike) shownNonLoop.delete(key)
    }

    setTimeout(() => {
      toast.classList.add('vw-toast-out')
      setTimeout(cleanup, 420)
    }, timeout)
  }

  function setDefaultIconHtml(html) {
    defaultIconHtml = String(html || '')
  }

  function startLoop() {
    if (loopStarted) return
    loopStarted = true

    const discordIcon = '<img src="https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png">'
    const crownIcon = '<span>👑</span>'
    const linkIcon = '<span>🔗</span>'

    let step = 0
    let siteIndex = 0

    const tick = () => {
      if (!loopStarted) return

      if (step === 0) show('VortixWorld Bypass', 'Active & Ready', 'info', DISPLAY_MS, defaultIconHtml || '<span>V</span>')
      if (step === 1) {
        const site = MATCH_HOSTS_SORTED[siteIndex % MATCH_HOSTS_SORTED.length]
        siteIndex++
        show('Supported Site', site, 'info', DISPLAY_MS, linkIcon)
      }
      if (step === 2) show('Join Discord', 'https://discord.gg/vortex-x-sideload-bypass-1355388445509288047', 'info', DISPLAY_MS, discordIcon)
      if (step === 3) show('Created By', 'afk.l0l', 'info', DISPLAY_MS, crownIcon)

      step = (step + 1) % 4
      loopTimer = setTimeout(tick, DISPLAY_MS + GAP_MS)
    }

    loopTimer = setTimeout(tick, 900)
  }

  function stopLoop() {
    loopStarted = false
    if (loopTimer) {
      clearTimeout(loopTimer)
      loopTimer = null
    }
  }

  window.VW_Notifications = { show, setDefaultIconHtml, startLoop, stopLoop }
})()
