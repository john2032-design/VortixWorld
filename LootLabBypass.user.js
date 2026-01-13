// ==UserScript==
// @name         VortixWorld Lootlinks Bypass
// @namespace    afklolbypasser
// @version      0.6
// @description  Bypass lootllinks
// @author       afk.l0l
// @match        *://loot-link.com/s?*
// @match        *://loot-links.com/s?*
// @match        *://lootlink.org/s?*
// @match        *://lootlinks.co/s?*
// @match        *://lootdest.info/s?*
// @match        *://lootdest.org/s?*
// @match        *://lootdest.com/s?*
// @match        *://links-loot.com/s?*
// @match        *://linksloot.net/s?*
// @match        *://*/*
// @icon         https://i.ibb.co/cKy9ztXL/IMG-3412.png
// @grant        none
// @license      MIT
// @run-at       document-start
// ==/UserScript==

(function(){
    'use strict';
    const ALLOWED_HOSTS=['loot-link.com','loot-links.com','lootlink.org','lootlinks.co','lootdest.info','lootdest.org','lootdest.com','links-loot.com','linksloot.net'];
    const REDIRECT_STORE_KEY='vortix_redirects_v1';
    const NOTIF_SESSION_PREFIX='vortix_notif_shown_for_';
    const hostname=window.location.hostname||'';
    const isLootHost=ALLOWED_HOSTS.includes(hostname);
    const Logger={
        log:(m,d='')=>console.log('[VortixBypass] '+m,d||''),
        info:(m,d='')=>console.info('[VortixBypass] '+m,d||''),
        warn:(m,d='')=>console.warn('[VortixBypass] '+m,d||''),
        error:(m,d='')=>console.error('[VortixBypass] '+m,d||'')
    };
    function loadRedirectMap(){
        try{
            const raw=localStorage.getItem(REDIRECT_STORE_KEY);
            if(!raw) return {};
            return JSON.parse(raw);
        }catch(e){
            Logger.warn('Could not parse redirect map',e);
            return {};
        }
    }
    function saveRedirectMap(map){
        try{
            localStorage.setItem(REDIRECT_STORE_KEY,JSON.stringify(map));
            Logger.log('Redirect map saved.',map);
        }catch(e){
            Logger.error('Failed to save redirect map.',e);
        }
    }
    function saveRedirectMapping(lootUrl,destUrl){
        try{
            const map=loadRedirectMap();
            const key=encodeURIComponent(lootUrl);
            map[key]=destUrl;
            saveRedirectMap(map);
            Logger.info('Saved redirect mapping: '+lootUrl+' -> '+destUrl);
        }catch(e){
            Logger.error('Error saving mapping',e);
        }
    }
    function getRedirectFor(lootUrl){
        try{
            const map=loadRedirectMap();
            const key=encodeURIComponent(lootUrl);
            return map[key]||null;
        }catch(e){
            Logger.error('Error reading mapping',e);
            return null;
        }
    }
    const modernCSS=`
:root{--primary:#6366f1;--accent:#06b6d4;--darker:#020617;--light:#f8fafc;--gray:#94a3b8;--success:#10b981;--warning:#f59c00}
*{box-sizing:border-box}
#modern-bypass-overlay{position:fixed;inset:0;background:rgba(2,6,23,0.9);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;animation:fadeIn .35s ease-out;padding:env(safe-area-inset-top,10px) env(safe-area-inset-right,10px) env(safe-area-inset-bottom,10px) env(safe-area-inset-left,10px)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.bypass-container{background:linear-gradient(135deg,var(--darker) 0%,#1e293b 100%);border:1px solid rgba(99,102,241,0.14);border-radius:16px;padding:clamp(14px,4vw,28px);max-width:520px;width:min(94%,520px);box-shadow:0 18px 40px rgba(0,0,0,.5);text-align:center;position:relative;overflow:hidden}
.logo-section{z-index:1;margin-bottom:1rem;display:flex;flex-direction:column;align-items:center;gap:6px}
.logo-icon{width:clamp(48px,10vw,64px);height:clamp(48px,10vw,64px);display:flex;align-items:center;justify-content:center;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,var(--primary) 0%, #8b5cf6 100%);padding:6px;flex-shrink:0}
.logo-icon img{width:100%;height:100%;object-fit:contain;border-radius:8px}
.logo-text{font-size:clamp(16px,3vw,20px);font-weight:700;background:linear-gradient(135deg,var(--primary) 0%, var(--accent) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.5px}
.status-text{color:var(--gray);font-size:clamp(13px,2.2vw,15px);margin:8px 0;line-height:1.4}
.progress-ring{width:clamp(120px,36vw,180px);height:clamp(120px,36vw,180px);margin:10px auto;position:relative}
.progress-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.progress-ring-circle{fill:none;stroke:rgba(99,102,241,0.08);stroke-width:8}
.progress-ring-circle-progress{fill:none;stroke:url(#gradient);stroke-width:8;stroke-linecap:round;stroke-dasharray:565.48;stroke-dashoffset:565.48;transition:stroke-dashoffset .45s linear,stroke .3s linear}
.progress-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:clamp(20px,6vw,32px);font-weight:700;color:var(--light)}
.progress-label{position:absolute;top:68%;left:50%;transform:translateX(-50%);font-size:clamp(11px,2vw,14px);color:var(--gray)}
.task-type{background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.08);border-radius:12px;padding:10px;margin:10px 0;display:flex;align-items:center;gap:12px;justify-content:center}
.task-icon{width:40px;height:40px;background:linear-gradient(135deg,var(--primary) 0%, #8b5cf6 100%);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;flex-shrink:0}
.task-info h4{color:var(--light);font-size:14px;font-weight:600;margin-bottom:4px}
.task-info p{color:var(--gray);font-size:13px;margin:0}
.loading-dots{display:inline-flex;gap:.25rem;margin-left:.4rem}
.loading-dots span{width:8px;height:8px;background:var(--primary);border-radius:50%;animation:dotPulse 1.4s infinite}
.loading-dots span:nth-child(1){animation-delay:-.32s}.loading-dots span:nth-child(2){animation-delay:-.16s}
@keyframes dotPulse{0%,80%,100%{transform:scale(0);opacity:.5}40%{transform:scale(1);opacity:1}}
.footer-note{color:var(--gray);font-size:12px;margin-top:8px;opacity:.9}
.bypass-notification{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:12px;max-width:calc(100% - 28px);min-width:180px;z-index:2147483647;border-radius:12px;padding:12px 14px;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4);color:white;transform:translateX(300px);opacity:0;transition:transform .35s ease,opacity .35s ease}
@media (max-width:420px){.bypass-container{border-radius:12px;padding:14px}.logo-text{font-size:16px}.task-type{gap:8px;padding:8px}.task-info h4{font-size:14px}.progress-text{font-size:20px}}
`;
    (function insertStyle(){
        try{
            const s=document.createElement('style');
            s.id='vortix-modern-style';
            s.textContent=modernCSS;
            document.head&&document.head.appendChild(s);
        }catch(e){
            Logger.warn('Could not insert CSS',e);
        }
    })();
    const NotificationSystem={
        show:function(title,message,type='info',timeout=3500){
            try{
                const colors={info:{bg:'rgba(99,102,241,0.95)',border:'#6366f1'},success:{bg:'rgba(16,185,129,0.95)',border:'#10b981'},warning:{bg:'rgba(245,156,0,0.95)',border:'#f59c00'},error:{bg:'rgba(239,68,68,0.95)',border:'#ef4444'}};
                const c=colors[type]||colors.info;
                const id='bypass-notif-'+Date.now();
                const html=`<div id="${id}" class="bypass-notification" style="background:${c.bg}; border:1px solid ${c.border};"><div style="display:flex;gap:10px;align-items:center;"><div style="font-weight:700">${title}</div><div style="flex:1;color:rgba(255,255,255,0.95);font-weight:400;text-align:right">${message}</div></div></div>`;
                document.body.insertAdjacentHTML('beforeend',html);
                const el=document.getElementById(id);
                setTimeout(()=>{el.style.transform='translateX(0)';el.style.opacity='1'},50);
                setTimeout(()=>{el.style.transform='translateX(300px)';el.style.opacity='0';setTimeout(()=>el.remove(),350)},timeout);
                Logger.info('Notification shown: '+title+' — '+message);
            }catch(e){
                Logger.error('Notification failed',e);
            }
        }
    };
    function decodeURIxor(encodedString,prefixLength=5){
        let decodedString='';
        const base64Decoded=atob(encodedString);
        const prefix=base64Decoded.substring(0,prefixLength);
        const encodedPortion=base64Decoded.substring(prefixLength);
        for(let i=0;i<encodedPortion.length;i++){
            const encodedChar=encodedPortion.charCodeAt(i);
            const prefixChar=prefix.charCodeAt(i%prefix.length);
            const decodedChar=encodedChar^prefixChar;
            decodedString+=String.fromCharCode(decodedChar);
        }
        return decodedString;
    }
    if(!isLootHost){
        try{
            const ref=document.referrer||'';
            const cameFromLootHost=ALLOWED_HOSTS.some(h=>ref.includes(h));
            if(cameFromLootHost){
                Logger.info('Arrived at non-loot page from loot host',{referrer:ref,location:window.location.href});
                const sessKey=NOTIF_SESSION_PREFIX+encodeURIComponent(ref);
                if(!sessionStorage.getItem(sessKey)){
                    const mapping=getRedirectFor(ref);
                    const msg='Bypass Complete — '+window.location.hostname;
                    NotificationSystem.show('Bypass Complete',msg,'success',5000);
                    sessionStorage.setItem(sessKey,'1');
                    Logger.log('Displayed completion notification on destination page.',{referrer:ref,mapping:mapping});
                }else{
                    Logger.log('Completion notification already shown for this referrer in this session.',ref);
                }
            }else{
                Logger.log('Not arrived from loot hosts; nothing to do on this site.');
            }
        }catch(e){
            Logger.error('Error in destination notification logic',e);
        }
        return;
    }
    Logger.info('Script running on Loot host',window.location.href);
    try{
        const saved=getRedirectFor(window.location.href);
        if(saved){
            Logger.info('Found saved redirect for this loot URL — redirecting immediately.',{from:window.location.href,to:saved});
            setTimeout(()=>{try{NotificationSystem.show('Using Saved Redirect','Redirecting to '+new URL(saved).hostname,'info',2500)}catch(e){}},300);
            location.href=saved;
            return;
        }else{
            Logger.log('No saved redirect mapping for this loot URL',window.location.href);
        }
    }catch(e){
        Logger.error('Error checking saved mapping',e);
    }
    (function uiAndObserver(){
        try{
            Logger.log('Seeding localStorage as original script expects...');
            localStorage.clear();
            for(let i=0;i<100;i++){
                if(i!==54){
                    const key='t_'+i;
                    const value={value:1,expiry:new Date().getTime()+604800000};
                    localStorage.setItem(key,JSON.stringify(value));
                }
            }
            Logger.log('localStorage seeding complete.');
        }catch(e){
            Logger.warn('localStorage seeding failed',e);
        }
        const waitForElementAndModifyParent=()=>{
            const modifyParentElement=targetElement=>{
                const parentElement=targetElement.parentElement;
                if(!parentElement) return;
                Logger.log('Modifying parent element to show modern UI',targetElement);
                const images=document.querySelectorAll('img');
                let countdownSeconds=60;
                let taskName='Processing';
                let taskIcon='📦';
                for(let img of images){
                    const src=(img.src||'').toLowerCase();
                    if(src.includes('eye.png')){countdownSeconds=13;taskName='View Content';taskIcon='👁️';break}
                    else if(src.includes('bell.png')){countdownSeconds=30;taskName='Notification';taskIcon='🔔';break}
                    else if(src.includes('apps.png')||src.includes('fire.png')){countdownSeconds=60;taskName='App Install';taskIcon='⬇️';break}
                    else if(src.includes('gamers.png')){countdownSeconds=90;taskName='Gaming Offer';taskIcon='🎮';break}
                }
                let fallbackHref=null;
                try{
                    const anchor=parentElement.querySelector('a[href]');
                    if(anchor&&anchor.href) fallbackHref=anchor.href;
                }catch(e){}
                parentElement.innerHTML='';
                const popupHTML=`
<div id="modern-bypass-overlay">
  <div class="bypass-container" role="dialog" aria-modal="true">
    <div class="logo-section">
      <div class="logo-icon"><img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="logo"></div>
      <div class="logo-text">LootLabs Bypass</div>
    </div>
    <div class="status-text">Processing your request <span class="loading-dots"><span></span><span></span><span></span></span></div>
    <div class="task-type"><div class="task-icon">${taskIcon}</div><div class="task-info"><h4>${taskName}</h4><p>Estimated wait time: ${countdownSeconds} seconds</p></div></div>
    <div class="progress-ring" aria-hidden="true">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><circle class="progress-ring-circle" cx="100" cy="100" r="90"></circle><circle class="progress-ring-circle-progress" id="progress-circle" cx="100" cy="100" r="90"></circle></svg>
      <div class="progress-text" id="countdown-display">${countdownSeconds}</div>
      <div class="progress-label">seconds</div>
    </div>
    <div class="footer-note">Please wait while we process your request</div>
  </div>
</div>
`;
                parentElement.insertAdjacentHTML('afterbegin',popupHTML);
                try{
                    const progressCircle=document.getElementById('progress-circle');
                    const countdownDisplay=document.getElementById('countdown-display');
                    const radius=90;
                    const circumference=2*Math.PI*radius;
                    if(progressCircle) progressCircle.style.strokeDasharray=circumference.toString();
                    let remaining=countdownSeconds;
                    const updateInterval=1000;
                    if(countdownDisplay) countdownDisplay.textContent=remaining;
                    const timer=setInterval(()=>{
                        remaining--;
                        if(countdownDisplay) countdownDisplay.textContent=remaining>0?remaining:'0';
                        if(progressCircle){
                            const progress=Math.max(0,Math.min(1,(countdownSeconds-remaining)/countdownSeconds));
                            const offset=circumference-(progress*circumference);
                            progressCircle.style.strokeDashoffset=offset;
                        }
                        if(remaining===10) NotificationSystem.show('Almost Done','Just a few more seconds...','warning',2000);
                        if(remaining<=0){
                            clearInterval(timer);
                            if(countdownDisplay) countdownDisplay.textContent='✓';
                            if(progressCircle){progressCircle.style.stroke='#10b981';progressCircle.style.strokeDashoffset=0}
                            const status=parentElement.querySelector('.status-text');
                            if(status) status.innerHTML='Redirecting <span class="loading-dots"><span></span><span></span><span></span></span>';
                            NotificationSystem.show('Bypass Complete','Redirecting to destination...','success',3500);
                            if(fallbackHref){
                                try{saveRedirectMapping(window.location.href,fallbackHref)}catch(e){Logger.warn('Could not save mapping for fallbackHref',e)}
                                Logger.info('Fallback redirect (after UI) to saved href',fallbackHref);
                                setTimeout(()=>{window.location.href=fallbackHref},800);
                                return;
                            }
                            setTimeout(()=>{const ov=document.getElementById('modern-bypass-overlay');if(ov&&ov.parentElement)ov.parentElement.removeChild(ov)},900);
                        }
                    },updateInterval);
                }catch(e){
                    Logger.error('Countdown logic failed',e);
                    setTimeout(()=>{const ov=document.getElementById('modern-bypass-overlay');if(ov&&ov.parentElement)ov.parentElement.removeChild(ov)},(countdownSeconds+3)*1000);
                }
            };
            const observer=new MutationObserver((mutationsList,observerRef)=>{
                for(const mutation of mutationsList){
                    if(mutation.type==='childList'){
                        const foundElement=Array.from(document.querySelectorAll('body *')).find(element=>element.textContent&&(element.textContent.includes('UNLOCK CONTENT')||element.textContent.includes('Unlock Content')));
                        if(foundElement){
                            Logger.info('Unlock content element found - showing UI',foundElement);
                            modifyParentElement(foundElement);
                            observerRef.disconnect();
                            break;
                        }
                    }
                }
            });
            observer.observe(document.body,{childList:true,subtree:true});
            Logger.info('MutationObserver started, monitoring for unlock content...');
        };
        if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',waitForElementAndModifyParent); else waitForElementAndModifyParent();
    })();
    (function fetchOverride(){
        const originalFetch=window.fetch;
        window.fetch=function(url,config){
            try{
                const urlStr=(typeof url==='string')?url:(url&&url.url)?url.url:'';
                if(typeof INCENTIVE_SYNCER_DOMAIN!=='undefined'&&urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)){
                    Logger.log('Intercepted incentive syncer fetch',urlStr);
                    return originalFetch(url,config).then(response=>{
                        if(!response.ok) return response;
                        return response.clone().json().then(data=>{
                            let urid='';let task_id='';let action_pixel_url='';
                            try{data.forEach(item=>{urid=item.urid;task_id=54;action_pixel_url=item.action_pixel_url})}catch(e){Logger.warn('Incentive fetch JSON shape unexpected',e)}
                            try{
                                const wsUrl=`wss://${(urid.substr(-5)%3)}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`;
                                Logger.log('Opening WebSocket to',wsUrl);
                                const ws=new WebSocket(wsUrl);
                                ws.onopen=()=>setInterval(()=>ws.send('0'),1000);
                                ws.onmessage=event=>{if(event.data&&event.data.includes('r:')){PUBLISHER_LINK=event.data.replace('r:','');Logger.info('PUBLISHER_LINK received via WS',PUBLISHER_LINK)}};
                                try{navigator.sendBeacon(`https://${(urid.substr(-5)%3)}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`)}catch(e){}
                                if(action_pixel_url) fetch(action_pixel_url).catch(()=>{});
                                fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`).catch(()=>{});
                                ws.onclose=()=>{
                                    try{
                                        if(typeof PUBLISHER_LINK!=='undefined'&&PUBLISHER_LINK){
                                            const finalUrl=decodeURIComponent(decodeURIxor(PUBLISHER_LINK));
                                            try{saveRedirectMapping(window.location.href,finalUrl)}catch(e){Logger.warn('Failed to save mapping on ws.onclose',e)}
                                            Logger.info('Redirecting to publisher link',finalUrl);
                                            window.location.href=finalUrl;
                                        }else Logger.warn('WS closed but no PUBLISHER_LINK set');
                                    }catch(e){Logger.error('Error in ws.onclose redirect',e)}
                                };
                            }catch(e){Logger.error('WebSocket handling failed',e)}
                            return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers:response.headers});
                        }).catch(err=>{Logger.warn('Failed to parse incentive fetch response JSON',err);return response});
                    }).catch(err=>{Logger.warn('Original fetch for incentive endpoint failed',err);return originalFetch(url,config)});
                }
            }catch(e){Logger.error('Error in custom fetch override check',e)}
            return originalFetch(url,config);
        };
        Logger.log('Fetch overridden to intercept incentive endpoints.');
    })();
    (function tryToCatchOtherRedirects(){
        window.addEventListener('beforeunload',function(){
            try{Logger.log('beforeunload fired on loot host (possible redirect). Current URL: '+window.location.href)}catch(e){}
        });
    })();
    Logger.info('VortixWorld Bypass script initialized on loot host.');
})();
