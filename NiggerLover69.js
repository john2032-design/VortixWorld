(function(){
'use strict';
var cfg={
  "ABYSM_API_BASE":"https://api.abysm.lat/v2/free/bypass?url=",
  "EAS_API_BASE":"https://api.eas-x.com/v3/bypass",
  "EAS_API_KEY":".john2032-3253f-3262k-3631f-2626j-9078k",
  "API_HOSTS":[
    "socialwolvez.com","scwz.me","adfoc.us","unlocknow.net","sub2get.com","sub4unlock.com",
    "sub2unlock.net","sub2unlock.com","paste-drop.com","pastebin.com","rb.gy",
    "is.gd","rebrand.ly","6x.work","boost.ink","booo.st","bst.gg","bst.wtf","linkunlocker.com",
    "unlk.link","cuty.io","cutynow.com","cuttty.com","cuttlinks.com","shrinkme.click",
    "direct-link.net","link-hub.net","up-to-down.net"
  ],
  "EAS_HOSTS":[
    "linkvertise.com","link-target.net","link-center.net","link-to.net","bit.ly","t.ly","jpeg.ly",
    "tiny.cc","tinyurl.com","tinylink.onl","shorter.me","is.gd","v.gd","rebrand.ly","bst.gg","bst.wtf",
    "boost.ink","sub2get.com","sub4unlock.io","sub4unlock.com","sub4unlock.net","subfinal.com","unlocknow.net",
    "ytsubme.com","cuty.io","cuty.me","adfoc.us","justpaste.it","paste-drop.com","pastebin.com",
    "pastecanyon.com","pastehill.com","pastemode.com","rentry.org","paster.so"
  ]
};
function isHostMatch(hostname,short){
  if(!hostname||!short) return false;
  if(hostname===short) return true;
  return hostname.endsWith('.'+short);
}
function isEasAllowedForHost(hostname){
  return cfg.EAS_HOSTS.some(function(h){return isHostMatch(hostname,h);});
}
function isAbysmAllowedForHost(hostname){
  return cfg.API_HOSTS.some(function(h){return isHostMatch(hostname,h);});
}
function findFirstUrlInObj(obj){
  if(!obj) return null;
  if(typeof obj==='string'){
    var m=obj.match(/https?:\/\/[^\s"'<>]+/);
    return m?m[0]:null;
  }
  if(typeof obj==='object'){
    try{
      for(var k in obj){
        if(!Object.prototype.hasOwnProperty.call(obj,k)) continue;
        var v=obj[k];
        var res=findFirstUrlInObj(v);
        if(res) return res;
      }
    }catch(e){}
  }
  return null;
}
function parseApiJson(json){
  var s=(json&&(json.status||json.success));
  if(s==='fail'||s==='error'||s===false) return {ok:false,json:json};
  var resultVal=null;
  if(json&&typeof json==='object'){
    if(json.data&&typeof json.data==='object'&&(typeof json.data.result!=='undefined')) resultVal=json.data.result;
    else if(json.result) resultVal=json.result;
    else if(json.url) resultVal=json.url;
    else resultVal=findFirstUrlInObj(json)||JSON.stringify(json);
  }else if(typeof json==='string'){
    resultVal=json;
  }
  if(resultVal===null||(typeof resultVal==='string'&&resultVal.trim().length===0)) return {ok:false,json:json};
  return {ok:true,result:resultVal,json:json};
}
function fetchAbysmForUrl(url){
  var apiUrl=cfg.ABYSM_API_BASE+encodeURIComponent(url);
  return fetch(apiUrl,{method:'GET'}).then(function(r){return r.json().catch(function(){return {status:'error',message:'invalid json'});}).then(function(json){
    var parsed=parseApiJson(json);
    if(parsed.ok) return {ok:true,result:parsed.result,json:parsed.json,source:'abysm'};
    return {ok:false,json:parsed.json,source:'abysm'};
  }).catch(function(err){return {ok:false,err:String(err),source:'abysm'}});});
}
function fetchEasForUrl(url){
  var apiUrl=cfg.EAS_API_BASE+'?url='+encodeURIComponent(url);
  return fetch(apiUrl,{
    method:'GET',
    headers:{
      'accept':'application/json',
      'eas-api-key':cfg.EAS_API_KEY,
      'Content-Type':'application/json'
    }
  }).then(function(r){return r.json().catch(function(){return {status:'error',message:'invalid json'});}).then(function(json){
    var parsed=parseApiJson(json);
    if(parsed.ok) return {ok:true,result:parsed.result,json:parsed.json,source:'eas'};
    return {ok:false,json:parsed.json,source:'eas'};
  }).catch(function(err){return {ok:false,err:String(err),source:'eas'}});});
}
function tryAbysmThenEasForUrl(fullUrl,hostname){
  try{
    if(isAbysmAllowedForHost(hostname)){
      return fetchAbysmForUrl(fullUrl).then(function(res){
        if(res&&res.ok) return res;
        if(isEasAllowedForHost(hostname)) return fetchEasForUrl(fullUrl).then(function(r2){return r2;});
        return res;
      });
    }
    if(isEasAllowedForHost(hostname)) return fetchEasForUrl(fullUrl).then(function(res){return res;});
    return Promise.resolve({ok:false,err:'no_api_configured_for_host'});
  }catch(e){
    return Promise.resolve({ok:false,err:String(e)});
  }
}
window.VortixAPIs=window.VortixAPIs||{};
window.VortixAPIs.tryAbysmThenEasForUrl=tryAbysmThenEasForUrl;
window.VortixAPIs.config=cfg;
})();
