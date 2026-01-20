;(function () {
  'use strict'

  const LOG_STYLE = {
    base: 'font-weight:800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
    info: 'color:#22c55e;',
    warn: 'color:#f59e0b;',
    error: 'color:#ef4444;',
    debug: 'color:#60a5fa;',
    dim: 'color:#94a3b8;'
  }

  const LOOT_HOSTS = [
    'best-links.org',
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
    'lootlinks.com'
  ]

  const ALLOWED_SHORT_HOSTS = [
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

  const logStacks = {
    heartbeat: { count: 0, last: 0 },
    countdown: { lastRemaining: null }
  }

  const Logger = {
    info: (m, d = '') => {
      if (m === 'WebSocket heartbeat sent') {
        const now = Date.now()
        const st = logStacks.heartbeat
        st.count++
        if (st.count === 1 || st.count % 5 === 0 || now - st.last > 5000) {
          console.info(`%c[INFO]%c [VortixBypass] ${m} (x${st.count})`, LOG_STYLE.base + LOG_STYLE.info, LOG_STYLE.base + LOG_STYLE.dim, d || '')
          st.last = now
        }
        return
      }
      console.info(`%c[INFO]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.info, LOG_STYLE.base + LOG_STYLE.dim, d || '')
    },
    warn: (m, d = '') => console.warn(`%c[WARN]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.warn, LOG_STYLE.base + LOG_STYLE.dim, d || ''),
    error: (m, d = '') => console.error(`%c[ERROR]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.error, LOG_STYLE.base + LOG_STYLE.dim, d || ''),
    debug: (m, d = '') => console.debug(`%c[DEBUG]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.debug, LOG_STYLE.base + LOG_STYLE.dim, d || '')
  }

  window.VW_Utils = window.VW_Utils || {}
  window.VW_Utils.LOG_STYLE = LOG_STYLE
  window.VW_Utils.LOOT_HOSTS = LOOT_HOSTS
  window.VW_Utils.ALLOWED_SHORT_HOSTS = ALLOWED_SHORT_HOSTS
  window.VW_Utils.Logger = Logger
  window.VW_Utils.logStacks = logStacks
})()
