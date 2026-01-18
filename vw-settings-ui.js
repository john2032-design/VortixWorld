;(function () {
  'use strict'

  const VW_KEYS = {
    lootlinkLocal: 'vw_lootlink_local',
    autoRedirect: 'vw_auto_redirect',
    redirectWait: 'vw_redirect_wait'
  }

  function ensureGlobalSettingsUI() {
    if (document.getElementById('vwGlobalGearBtn')) return

    const styles = document.createElement('style')
    styles.id = 'vwGlobalGearStyles'
    styles.textContent = `
#vwGlobalGearBtn{position:fixed!important;bottom:14px!important;left:14px!important;z-index:2147483647!important;width:44px!important;height:44px!important;border-radius:12px!important;border:1px solid rgba(255,255,255,0.18)!important;background:linear-gradient(135deg,#000000,#071033,#1e2be8)!important;box-shadow:0 18px 60px rgba(0,0,0,0.55)!important;color:#cfd6e6!important;font:900 18px/1 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;user-select:none!important}
#vwGlobalGearBtn:hover{opacity:0.92!important;transform:translateY(-1px)!important}
#vwGlobalSettingsBackdrop{position:fixed!important;inset:0!important;background:rgba(0,0,0,0.70)!important;z-index:2147483647!important;display:none!important;align-items:center!important;justify-content:center!important}
#vwGlobalSettingsPanel{width:min(560px,92vw)!important;border-radius:14px!important;border:1px solid rgba(255,255,255,0.14)!important;background:linear-gradient(135deg,#000000 0%,#071033 60%,#1e2be8 100%)!important;box-shadow:0 26px 90px rgba(0,0,0,0.7)!important;color:#cfd6e6!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;overflow:hidden!important;position:relative!important;z-index:2147483648!important}
.vwGHead{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:14px 16px!important;border-bottom:1px solid rgba(255,255,255,0.12)!important;background:rgba(255,255,255,0.04)!important}
.vwGTitle{font-weight:950!important;letter-spacing:0.2px!important;display:flex!important;align-items:center!important;gap:10px!important;color:#7aa2ff!important}
.vwGBadge{width:34px!important;height:34px!important;border-radius:12px!important;border:1px solid rgba(255,255,255,0.14)!important;background:rgba(255,255,255,0.06)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:950!important;color:#cfd6e6!important}
.vwGClose{width:36px!important;height:36px!important;border-radius:10px!important;border:1px solid rgba(255,255,255,0.16)!important;background:rgba(0,0,0,0.18)!important;color:#cfd6e6!important;cursor:pointer!important;font-weight:950!important}
.vwGBody{padding:14px 16px!important;display:flex!important;flex-direction:column!important;gap:12px!important}
.vwGRow{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:12px!important;border-radius:12px!important;border:1px solid rgba(255,255,255,0.12)!important;background:rgba(255,255,255,0.05)!important}
.vwGLabel{display:flex!important;flex-direction:column!important;gap:4px!important;color:#cfd6e6!important}
.vwGLabel b{font-size:14px!important;font-weight:950!important;color:#7aa2ff!important}
.vwGLabel span{font-size:12px!important;color:rgba(207,214,230,0.80)!important;font-weight:700!important}
.vwGSwitch{position:relative!important;width:54px!important;height:28px!important}
.vwGSwitch input{opacity:0!important;width:100%!important;height:100%!important;margin:0!important;position:absolute!important;inset:0!important;cursor:pointer!important}
.vwGSlider{position:absolute!important;inset:0!important;border-radius:999px!important;background:rgba(255,255,255,0.18)!important;transition:0.25s!important}
.vwGSlider:before{content:""!important;position:absolute!important;top:4px!important;left:4px!important;width:20px!important;height:20px!important;border-radius:50%!important;background:#cfd6e6!important;transition:0.25s!important}
.vwGSwitch input:checked + .vwGSlider{background:linear-gradient(90deg,#0f1b4f,#1e2be8)!important}
.vwGSwitch input:checked + .vwGSlider:before{transform:translateX(26px)!important}
.vwGInput{width:120px!important;max-width:40vw!important;background:rgba(0,0,0,0.22)!important;border:1px solid rgba(255,255,255,0.18)!important;color:#cfd6e6!important;padding:10px 12px!important;border-radius:10px!important;outline:none!important;font-weight:900!important}
.vwGInput::placeholder{color:rgba(207,214,230,0.55)!important}
.vwGActionRow{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:10px!important}
.vwGBtn{padding:10px 12px!important;border-radius:12px!important;border:1px solid rgba(255,255,255,0.16)!important;background:rgba(0,0,0,0.18)!important;color:#cfd6e6!important;font-weight:950!important;cursor:pointer!important}
.vwGBtn2{padding:10px 12px!important;border-radius:12px!important;border:1px solid rgba(255,255,255,0.14)!important;background:linear-gradient(90deg,#0f1b4f,#1e2be8)!important;color:#cfd6e6!important;font-weight:950!important;cursor:pointer!important}
    `
    ;(document.head || document.documentElement).appendChild(styles)

    const gear = document.createElement('div')
    gear.id = 'vwGlobalGearBtn'
    gear.textContent = '⚙️'
    ;(document.documentElement || document.body).appendChild(gear)

    const backdrop = document.createElement('div')
    backdrop.id = 'vwGlobalSettingsBackdrop'
    backdrop.innerHTML = `
<div id="vwGlobalSettingsPanel" role="dialog" aria-modal="true">
  <div class="vwGHead">
    <div class="vwGTitle"><div class="vwGBadge">VW</div><div>Settings</div></div>
    <button class="vwGClose" id="vwGlobalSettingsClose" type="button">✕</button>
  </div>
  <div class="vwGBody">
    <div class="vwGRow">
      <div class="vwGLabel">
        <b>LootlinkLocal</b>
        <span>true = use Lootlinks local bypass on Loot* domains, false = use redirect bypass on Loot* domains</span>
      </div>
      <label class="vwGSwitch">
        <input id="vwGlobalLootlinkLocalToggle" type="checkbox">
        <span class="vwGSlider"></span>
      </label>
    </div>

    <div class="vwGRow">
      <div class="vwGLabel">
        <b>Change Redirect waitTime</b>
        <span>Seconds before redirect (e.g. 1 = 1s, 5 = 5s)</span>
      </div>
      <input id="vwGlobalRedirectWaitInput" class="vwGInput" type="number" min="1" step="1" inputmode="numeric" placeholder="5">
    </div>

    <div class="vwGActionRow">
      <button class="vwGBtn" id="vwGlobalSettingsReload" type="button">Reload</button>
      <button class="vwGBtn2" id="vwGlobalSettingsApply" type="button">Apply</button>
    </div>
  </div>
</div>
    `
    document.documentElement.appendChild(backdrop)

    function getLootlinkLocalValue() {
      const saved = localStorage.getItem(VW_KEYS.lootlinkLocal)
      if (saved === null) return typeof window.LootlinkLocal === 'boolean' ? window.LootlinkLocal : true
      return saved === 'true'
    }

    function getRedirectWaitValue() {
      const saved = localStorage.getItem(VW_KEYS.redirectWait)
      const n = Number(saved)
      if (!Number.isFinite(n) || n <= 0) return 5
      return Math.floor(n)
    }

    function open() {
      const t = document.getElementById('vwGlobalLootlinkLocalToggle')
      if (t) t.checked = !!getLootlinkLocalValue()
      const w = document.getElementById('vwGlobalRedirectWaitInput')
      if (w) w.value = String(getRedirectWaitValue())
      backdrop.style.display = 'flex'
    }

    function close() {
      backdrop.style.display = 'none'
    }

    gear.addEventListener('click', open)
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) close()
    })

    const closeBtn = document.getElementById('vwGlobalSettingsClose')
    if (closeBtn) closeBtn.addEventListener('click', close)

    const applyBtn = document.getElementById('vwGlobalSettingsApply')
    if (applyBtn)
      applyBtn.addEventListener('click', () => {
        const t = document.getElementById('vwGlobalLootlinkLocalToggle')
        if (t) {
          window.LootlinkLocal = !!t.checked
          localStorage.setItem(VW_KEYS.lootlinkLocal, String(!!t.checked))
        }

        const w = document.getElementById('vwGlobalRedirectWaitInput')
        if (w) {
          const n = Math.floor(Number(w.value))
          if (Number.isFinite(n) && n > 0) localStorage.setItem(VW_KEYS.redirectWait, String(n))
        }

        close()
      })

    const reloadBtn = document.getElementById('vwGlobalSettingsReload')
    if (reloadBtn) reloadBtn.addEventListener('click', () => location.reload())
  }

  function bootGlobalSettingsUI() {
    const mount = () => ensureGlobalSettingsUI()
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount, { once: true })
      window.addEventListener('load', mount, { once: true })
    } else {
      mount()
    }
  }

  bootGlobalSettingsUI()
})()
