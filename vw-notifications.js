;(function () {
  'use strict'

  if (window.top !== window.self) return

  const NOTIF_CSS = `
    #vw-notif-container{position:fixed!important;z-index:2147483647!important;right:20px!important;display:flex!important;flex-direction:column!important;gap:12px!important;max-width:320px!important;pointer-events:none!important}
    .vw-notif{display:flex!important;align-items:flex-start!important;gap:12px!important;padding:16px!important;border-radius:16px!important;background:linear-gradient(135deg,#000000 0%,#071033 60%,#a855f7 100%)!important;border:1px solid rgba(255,255,255,0.14)!important;box-shadow:0 10px 30px rgba(0,0,0,0.6)!important;color:#cfd6e6!important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif!important;animation:vw-notif-slide 0.4s cubic-bezier(0.34,1.56,0.64,1)!important;pointer-events:auto!important;cursor:pointer!important;min-width:280px!important}
    @keyframes vw-notif-slide{0%{transform:translateX(120%);opacity:0}100%{transform:translateX(0);opacity:1}}
    .vw-notif-icon{font-size:24px!important;flex-shrink:0!important}
    .vw-notif-content{flex:1!important}
    .vw-notif-title{font-weight:900!important;font-size:15px!important;margin-bottom:2px!important;color:#a855f7!important}
    .vw-notif-msg{font-size:13px!important;font-weight:600!important;opacity:0.9!important}
    .vw-notif.success .vw-notif-icon{color:#22c55e!important}
    .vw-notif.error .vw-notif-icon{color:#ef4444!important}
    .vw-notif.info .vw-notif-icon{color:#eab308!important}
  `

  const container = document.createElement('div')
  container.id = 'vw-notif-container'

  const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  if (isMobile) {
    container.style.top = '20px'
    container.style.bottom = 'auto'
  } else {
    container.style.bottom = '20px'
    container.style.top = 'auto'
  }

  const style = document.createElement('style')
  style.textContent = NOTIF_CSS
  document.documentElement.appendChild(style)
  document.documentElement.appendChild(container)

  function createNotif(type, title, msg) {
    const notif = document.createElement('div')
    notif.className = `vw-notif ${type}`
    let icon = ''
    if (type === 'success') icon = '✅'
    else if (type === 'error') icon = '❌'
    else if (type === 'info') icon = '🔧'
    else icon = '📢'
    notif.innerHTML = `
      <div class="vw-notif-icon">${icon}</div>
      <div class="vw-notif-content">
        <div class="vw-notif-title">${title}</div>
        <div class="vw-notif-msg">${msg}</div>
      </div>
    `
    container.appendChild(notif)
    notif.addEventListener('click', () => notif.remove())
    setTimeout(() => {
      if (notif.parentNode) notif.remove()
    }, 5000)
  }

  window.VWNotifications = {
    show: function (type, title, message) {
      createNotif(type || 'info', title || 'VortixWorld', message || '')
    },
    success: function (message) {
      createNotif('success', 'Bypass Success', message)
    },
    error: function (message) {
      createNotif('error', 'Bypass Failed', message)
    }
  }
})()