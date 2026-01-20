;(function () {
  'use strict'

  const SITE_HOST = 'vortix-world-bypass.vercel.app'

  const LOOT_HOSTS = [
    'loot-link.com',
    'loot-links.com',
    'lootlink.org',
    'lootlinks.co',
    'lootdest.info',
    'lootdest.org',
    'lootdest.com',
    'links-loot.com',
    'linksloot.net',
    'best-links.org',
    'loot-labs.com',
    'lootlabs.com',
    'lootlinks.com'
  ]
    .map(x => x.toLowerCase())
    .sort()

  const ALLOWED_SHORT_HOSTS = [
    'linkvertise.com',
    'lootlink.org',
    'lootlinks.co',
    'lootdest.info',
    'lootdest.org',
    'lootdest.com',
    'links-loot.com',
    'loot-links.com',
    'best-links.org',
    'lootlinks.com',
    'loot-labs.com',
    'lootlabs.com',
    'loot-link.com',
    'work.ink',
    'auth.platorelay.com',
    'keyrblx.com',
    'pandadevelopment.net',
    'mboost.me',
    'airflowscript.com',
    'blox-script.com',
    'neoxsoftworks.eu',
    'cuty.io',
    'cutynow.com',
    'cuttty.com',
    'cuttlinks.com'
  ]
    .map(x => x.toLowerCase())
    .sort()

  const LOG_STYLE = {
    base: 'font-weight:800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
    info: 'color:#22c55e;',
    warn: 'color:#f59e0b;',
    error: 'color:#ef4444;',
    dim: 'color:#94a3b8;'
  }

  const Logger = {
    info: (m, d = '') =>
      console.info(`%c[INFO]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.info, LOG_STYLE.base + LOG_STYLE.dim, d || ''),
    warn: (m, d = '') =>
      console.warn(`%c[WARN]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.warn, LOG_STYLE.base + LOG_STYLE.dim, d || ''),
    error: (m, d = '') =>
      console.error(`%c[ERROR]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.error, LOG_STYLE.base + LOG_STYLE.dim, d || '')
  }

  function hostMatchesAny(host, list) {
    const h = String(host || '').toLowerCase().replace(/^www\./, '')
    for (const base of list) {
      if (h === base) return true
      if (h.endsWith('.' + base)) return true
    }
    return false
  }

  function isLuarmorUrl(url) {
    try {
      const u = new URL(String(url), location.href)
      const h = (u.hostname || '').toLowerCase()
      return h === 'ads.luarmor.net' || h.endsWith('.ads.luarmor.net')
    } catch (_) {
      return String(url).includes('ads.luarmor.net')
    }
  }

  function isBypassHost() {
    return String(location.hostname || '').toLowerCase().replace(/^www\./, '') === SITE_HOST
  }

  function shouldIgnoreUnsupported() {
    if (isBypassHost()) return true
    const h = String(location.hostname || '').toLowerCase()
    if (h === 'ads.luarmor.net' || h.endsWith('.ads.luarmor.net')) return true
    return false
  }

  function showUnsupportedOnce(notifyFn) {
    if (shouldIgnoreUnsupported()) return
    const host = String(location.hostname || '').toLowerCase().replace(/^www\./, '')
    const key = `vw_unsupported_once::${host}`
    try {
      if (sessionStorage.getItem(key) === '1') return
      sessionStorage.setItem(key, '1')
    } catch (_) {}
    notifyFn('ℹ️ Unsupported Site', `${location.hostname} is not supported by this userscript.`, 'info', 3500)
  }

  function startNotificationLoop() {
    if (!window.VW_Notifications || typeof window.VW_Notifications.startLoop !== 'function') return

    const ICON_URL = 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png'
    const iconHtml = `<img src="${ICON_URL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    const discordIconHtml = `<img src="https://cdn.simpleicons.org/discord/5865F2" style="width:70%;height:70%;object-fit:contain;">`

    const matchHosts = Array.from(new Set([...LOOT_HOSTS, ...ALLOWED_SHORT_HOSTS])).sort()
    const matchMsgs = matchHosts.map(h => `🔗 ${h}`)

    const items = [
      { title: 'VortixWorld Bypass', message: 'VortixWorld Bypass', type: 'info', iconHtml },
      ...matchMsgs.map(m => ({ title: 'VortixWorld Bypass', message: m, type: 'info', iconHtml })),
      {
        title: 'VortixWorld Bypass',
        message: 'https://discord.gg/vortex-x-sideload-bypass-1355388445509288047',
        type: 'info',
        iconHtml: discordIconHtml
      },
      { title: 'VortixWorld Bypass', message: '👑Created By afk.l0l', type: 'info', iconHtml }
    ]

    window.VW_Notifications.setDefaultIconHtml(iconHtml)
    window.VW_Notifications.startLoop(items)
  }

  window.VW_LOGIC = {
    SITE_HOST,
    LOOT_HOSTS,
    ALLOWED_SHORT_HOSTS,
    LOG_STYLE,
    Logger,
    hostMatchesAny,
    isLuarmorUrl,
    isBypassHost,
    showUnsupportedOnce,
    startNotificationLoop
  }
})()
