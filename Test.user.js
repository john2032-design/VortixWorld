// ==UserScript==
// @name         VortixWorld BYPASSER
// @namespace    https://vortix-world-bypass.vercel.app/
// @version      1.0.11
// @author       VortixWorld
// @description  Bypass 💩 Fr
// @match        *://ads.luarmor.net/*
// @match        *://*.ads.luarmor.net/*
// @icon         https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function(){
'use strict'
if(!location.hostname.includes('ads.luarmor.net')) return
let lastClickTime=0
const CLICK_DELAY=20000
let notificationPermission='default'
try{notificationPermission=Notification&&Notification.permission||'default'}catch(e){notificationPermission='default'}
function ensureToastContainer(){
  if(document.getElementById('vortix-toast-container')) return
  const c=document.createElement('div')
  c.id='vortix-toast-container'
  c.style.position='fixed'
  c.style.right='12px'
  c.style.top='12px'
  c.style.zIndex='2147483647'
  c.style.display='flex'
  c.style.flexDirection='column'
  c.style.gap='8px'
  document.documentElement.appendChild(c)
}
function showToast(msg,ttl=6000){
  try{
    ensureToastContainer()
    const cont=document.getElementById('vortix-toast-container')
    const t=document.createElement('div')
    t.textContent=msg
    t.style.background='rgba(0,0,0,0.8)'
    t.style.color='#fff'
    t.style.padding='8px 12px'
    t.style.borderRadius='8px'
    t.style.boxShadow='0 6px 20px rgba(0,0,0,0.4)'
    t.style.fontSize='13px'
    t.style.maxWidth='320px'
    t.style.fontFamily='system-ui,Segoe UI,Roboto,Arial'
    cont.appendChild(t)
    setTimeout(()=>{t.style.transition='opacity 300ms';t.style.opacity='0'},ttl-300)
    setTimeout(()=>{try{cont.removeChild(t)}catch(e){}},ttl)
  }catch(e){}
}
function showNotification(title,body){
  try{
    if(typeof Notification!=='undefined'&&notificationPermission==='granted'){
      new Notification(title,{body:body})
      return
    }
    if(typeof Notification!=='undefined'&&notificationPermission==='default'){
      Notification.requestPermission().then(p=>{
        notificationPermission=p
        try{if(p==='granted') new Notification(title,{body:body})}catch(e){}
      }).catch(()=>{})
    }
  }catch(e){}
  try{showToast(title+': '+body,6000)}catch(e){}
}
function logNotify(level,msg){
  try{console.log('[VORTIX]['+level.toUpperCase()+']',msg)}catch(e){}
  try{showNotification('VortixWorld '+level,msg)}catch(e){}
  try{showToast('['+level.toUpperCase()+'] '+msg,5000)}catch(e){}
}
function isLikelyAdUrl(u){
  try{
    if(!u||typeof u!=='string') return false
    const url=new URL(u,location.href)
    const h=url.hostname.toLowerCase()
    if(h.includes('ads.')||h.includes('adservice')||h.includes('doubleclick')||h.includes('googlesyndication')||h.includes('googleadservices')||h.includes('pagead2')||h.includes('adclick')||h.includes('adnetwork')) return true
    return false
  }catch(e){return false}
}
function extractUrlFromElement(el){
  try{
    if(!el) return null
    if(el.tagName==='A'&&el.href) return el.href
    const attrs=['data-url','data-href','data-link','data-target','href','data-destination']
    for(const k of attrs){
      try{
        const v=el.getAttribute&&el.getAttribute(k)
        if(v&&v.startsWith('http')) return v
      }catch(e){}
    }
    try{
      const onclick=el.getAttribute&&el.getAttribute('onclick')
      if(onclick){
        const m=onclick.match(/https?:\/\/[^\s'"]+/)
        if(m) return m[0]
      }
    }catch(e){}
    try{
      const html=el.innerHTML||''
      const m2=html.match(/https?:\/\/[^\s'"]+/)
      if(m2) return m2[0]
    }catch(e){}
    try{
      const closestA=el.closest&&el.closest('a[href]')
      if(closestA&&closestA.href) return closestA.href
    }catch(e){}
    return null
  }catch(e){return null}
}
function tryNavigateTo(url){
  try{
    if(!url) return false
    if(isLikelyAdUrl(url)){
      logNotify('warn','Blocked likely ad url: '+url)
      return false
    }
    try{location.href=url; logNotify('info','Navigating to '+url); return true}catch(e){}
    try{window.open(url,'_blank','noopener,noreferrer'); logNotify('info','Opened new tab '+url); return true}catch(e){return false}
  }catch(e){return false}
}
const origOpen=window.open
window.open=function(url){
  try{
    if(url&&!isLikelyAdUrl(url)){
      tryNavigateTo(url)
      return null
    }
  }catch(e){}
  try{return origOpen.apply(this,arguments)}catch(e){return null}
}
function tap(el){
  try{
    if(!el) return
    const now=Date.now()
    if(now-lastClickTime<CLICK_DELAY) { logNotify('debug','Click throttled'); return }
    const rect=el.getBoundingClientRect()
    if(el.disabled||rect.width===0||rect.height===0){ logNotify('debug','Element not clickable or invisible'); return }
    try{el.focus({preventScroll:true})}catch(e){}
    try{el.scrollIntoView({block:'center',inline:'center',behavior:'instant'})}catch(e){}
    const preUrl=extractUrlFromElement(el)
    if(preUrl&&!isLikelyAdUrl(preUrl)){
      if(tryNavigateTo(preUrl)){ lastClickTime=now; logNotify('success','Direct navigated via element url: '+preUrl); return }
    }
    let clicked=false
    try{el.click(); clicked=true; logNotify('debug','Dispatched el.click()')}catch(e){}
    try{
      const opts={bubbles:true,cancelable:true,composed:true}
      el.dispatchEvent(new PointerEvent('pointerdown',opts))
      el.dispatchEvent(new PointerEvent('pointerup',opts))
      el.dispatchEvent(new MouseEvent('mousedown',opts))
      el.dispatchEvent(new MouseEvent('mouseup',opts))
      el.dispatchEvent(new MouseEvent('click',opts))
      clicked=true
      logNotify('debug','Dispatched pointer/mouse events')
    }catch(e){}
    try{
      const touches=[ new Touch({identifier:Date.now()%100000,target:el,clientX:Math.max(0,rect.left+1),clientY:Math.max(0,rect.top+1),pageX:Math.max(0,rect.left+1),pageY:Math.max(0,rect.top+1)}) ]
      const evStart=new TouchEvent('touchstart',{touches,targetTouches:touches,changedTouches:touches,bubbles:true,cancelable:true})
      const evEnd=new TouchEvent('touchend',{touches:[],targetTouches:[],changedTouches:touches,bubbles:true,cancelable:true})
      el.dispatchEvent(evStart)
      el.dispatchEvent(evEnd)
      clicked=true
      logNotify('debug','Dispatched touch events')
    }catch(e){}
    lastClickTime=now
    if(clicked){
      logNotify('info','Clicked element, scanning for final link')
      scanForFinalLinkAndNavigate()
    }else{
      logNotify('warn','Click attempts failed for element')
    }
  }catch(e){
    logNotify('error','tap error: '+(e&&e.message?e.message:e))
  }
}
function scanForFinalLinkAndNavigate(){
  try{
    const candidates=[]
    try{
      document.querySelectorAll('a[href]').forEach(a=>{
        try{
          const href=a.href
          if(!href) return
          if(isLikelyAdUrl(href)) return
          if(href.includes('javascript:')) return
          candidates.push(href)
        }catch(e){}
      })
    }catch(e){}
    if(candidates.length){
      const uniq=Array.from(new Set(candidates))
      for(const u of uniq){
        if(tryNavigateTo(u)) return
      }
    }
    const possible=[]
    try{
      const nodes=Array.from(document.querySelectorAll('button,div,span'))
      nodes.forEach(n=>{
        try{
          const u=extractUrlFromElement(n)
          if(u&&!isLikelyAdUrl(u)) possible.push(u)
        }catch(e){}
      })
    }catch(e){}
    if(possible.length){
      const uniq2=Array.from(new Set(possible))
      for(const u of uniq2){
        if(tryNavigateTo(u)) return
      }
    }
    try{
      Array.from(document.querySelectorAll('iframe')).forEach(iframe=>{
        try{
          const src=iframe.src
          if(src&&!isLikelyAdUrl(src)&&tryNavigateTo(src)) throw 'navigated'
        }catch(e){}
      })
    }catch(e){}
    let attempts=0
    const poll=setInterval(()=>{
      attempts++
      try{
        document.querySelectorAll('a[href]').forEach(a=>{
          try{
            const href=a.href
            if(!href) return
            if(isLikelyAdUrl(href)) return
            if(href.includes('javascript:')) return
            if(tryNavigateTo(href)) throw 'done'
          }catch(e){}
        })
      }catch(e){}
      if(attempts>20) clearInterval(poll)
    },150)
  }catch(e){
    logNotify('error','scan error: '+(e&&e.message?e.message:e))
  }
}
const observer=new MutationObserver(mutations=>{
  try{
    for(const m of mutations){
      for(const node of m.addedNodes){
        try{
          if(node.nodeType!==1) continue
          const text=(node.textContent||'').toLowerCase()
          if(node.matches?.('.swal2-confirm, .swal2-styled')||text.includes('i accept')||text.includes('accept')||text.includes('continue')||text.includes('next')||text.includes('proceed')||text.includes('start')){
            setTimeout(()=>{ logNotify('debug','Observed candidate node, attempting tap'); tap(node) },50)
          }
          try{
            node.querySelectorAll?.('.swal2-confirm, .swal2-styled, button[class*="confirm"], button[class*="btn"], [role="button"]').forEach(btn=>{
              setTimeout(()=>{ logNotify('debug','Observed candidate button, attempting tap'); tap(btn) },50)
            })
          }catch(e){}
        }catch(e){}
      }
    }
  }catch(e){}
})
observer.observe(document.documentElement,{childList:true,subtree:true})
let clicked=false
const interval=setInterval(()=>{
  try{
    if(clicked) return
    const btn=document.getElementById('nextbtn')||document.querySelector('#nextbtn, button#nextbtn, button.next, .nextbtn')
    if(!btn||btn.disabled) return
    const text=(btn.innerText||'').toLowerCase()
    if(!text.includes('start')&&!text.includes('next')) return
    clicked=true
    logNotify('info','Found nextbtn, tapping')
    tap(btn)
    clearInterval(interval)
  }catch(e){}
},150)
})();
