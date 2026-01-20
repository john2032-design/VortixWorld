;(function () {
  'use strict'

  const STYLE_ID = 'vwNotificationStyles'
  const CONTAINER_ID = 'vwNotificationContainer'
  const shown = new Set()

  let defaultIconHtml = ''

  const CSS = `
#${CONTAINER_ID}{
  position:fixed !important;
  top:20px !important;
  right:20px !important;
  z-index:2147483647 !important;
  display:flex !important;
  flex-direction:column !important;
  gap:12px !important;
  pointer-events:none !important;
  align-items:flex-end !important;
  transform:translateZ(9999px) !important;
}
.vw-notif-toast{
  background:rgba(10,14,40,0.98) !important;
  border-left:4px solid #1e2be8 !important;
  border-radius:10px !important;
  width:250px !important;
  max-width:90vw !important;
  box-shadow:0 8px 32px rgba(0,0,0,0.55) !important;
  overflow:hidden !important;
  animation:vw-slide-in 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards !important;
  display:flex !important;
  flex-direction:column !important;
  pointer-events:auto !important;
  flex-shrink:0 !important;
  border:1px solid rgba(255,255,255,0.08) !important;
}
.vw-notif-content{
  padding:10px !important;
  display:flex !important;
  align-items:center !important;
  gap:10px !important;
  font-weight:800 !important;
  font-size:13px !important;
  color:#cfd6e6 !important;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif !important;
}
.vw-icon-circle{
  width:26px !important;
  height:26px !important;
  border-radius:50% !important;
  background:rgba(255,255,255,0.05) !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  font-size:14px !important;
  overflow:hidden !important;
}
.vw-notif-bar{
  height:3px !important;
  background:linear-gradient(90deg,#0f1b4f,#1e2be8) !important;
  width:100% !important;
  animation:vw-progress linear forwards !important;
}
@keyframes vw-slide-in{from{transform:translateX(120%);opacity:0;}to{transform:translateX(0);opacity:1;}}
@keyframes vw-fade-out{from{opacity:1;transform:scale(1);}to{opacity:0;transform:scale(0.9);pointer-events:none;}}
@keyframes vw-progress{from{width:100%;}to{width:0%;}}
@media (max-width:480px){
  #${CONTAINER_ID}{top:90px !important; right:10px !important;}
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
    let container = document.getElementById(CONTAINER_ID)
    if (container) return container
    container = document.createElement('div')
    container.id = CONTAINER_ID
    const mountPoint = document.body || document.documentElement
    mountPoint.appendChild(container)
    return container
  }

  function mountSafe(fn) {
    if (document.body) return fn()
    document.addEventListener('DOMContentLoaded', fn, { once: true })
  }

  function show(title, message, type = 'info', timeout = 3500, iconHtml) {
    mountSafe(() => {
      ensureStyles()
      const container = ensureContainer()
      const id = `${title}::${message}::${type}`
      if (shown.has(id)) return
      shown.add(id)

      let iconContent = iconHtml || defaultIconHtml || ''
      if (type === 'success') iconContent = '✔️'
      if (type === 'warning') iconContent = '⚠️'
      if (type === 'error') iconContent = '❌'
      if (!iconContent) iconContent = 'ℹ️'

      const toast = document.createElement('div')
      toast.className = 'vw-notif-toast'
      toast.innerHTML = `
        <div class="vw-notif-content">
          <div class="vw-icon-circle">${iconContent}</div>
          <span style="color:#7aa2ff;font-weight:900">${title}</span>
        </div>
        <div class="vw-notif-bar" style="animation-duration:${timeout}ms;"></div>
      `
      container.appendChild(toast)

      const hide = () => {
        toast.style.animation = 'vw-fade-out 0.5s ease-in forwards'
        setTimeout(() => toast.remove(), 500)
      }

      setTimeout(() => {
        hide()
        shown.delete(id)
      }, timeout)
    })
  }

  function setDefaultIconHtml(html) {
    defaultIconHtml = String(html || '')
  }

  window.VW_Notifications = { show, setDefaultIconHtml }
})()
