(function() {
    'use strict';
    const EAS_API_KEY = ".john2032-3253f-3262k-3631f-2626j-9078k";
    const EAS_SUPPORTED = ["bit.ly","t.ly","jpeg.ly","tiny.cc","tinyurl.com","tinylink.onl","shorter.me","is.gd","v.gd","rebrand.ly","bst.gg","bst.wtf","boost.ink","sub2get.com","sub4unlock.io","sub4unlock.com","sub4unlock.net","subfinal.com","unlocknow.net","ytsubme.com","cuty.io","cuty.me","adfoc.us","justpaste.it","paste-drop.com","pastebin.com","pastecanyon.com","pastehill.com","pastemode.com","rentry.org","paster.so"];
    const ABYSM_SUPPORTED = ['socialwolvez.com','scwz.me','adfoc.us','unlocknow.net','sub2get.com','sub4unlock.com','sub2unlock.net','sub2unlock.com','paste-drop.com','pastebin.com','rb.gy','is.gd','rebrand.ly','6x.work','boost.ink','booo.st','bst.gg','bst.wtf','linkunlocker.com','unlk.link','cuty.io','cutynow.com','cuttty.com','cuttlinks.com','shrinkme.click','direct-link.net','link-hub.net','up-to-down.net'];
    const LINKVERTISE_NETWORKS = ["linkvertise.com","link-target.net","link-center.net","link-to.net"];
    function isHostMatch(hostname, short) {
        if (!hostname || !short) return false;
        if (hostname === short) return true;
        return hostname.endsWith('.' + short);
    }
    function getHostFromUrl(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return null;
        }
    }
    async function tryAbysmApi(url) {
        const ABYSM_API_BASE = 'https://api.abysm.lat/v2/free/bypass?url=';
        const apiUrl = ABYSM_API_BASE + encodeURIComponent(url);
        try {
            const response = await fetch(apiUrl, { method: 'GET' });
            if (!response.ok) throw new Error('Abysm API error');
            const json = await response.json();
            const s = json.status || json.success;
            if (s === 'fail' || s === 'error' || s === false) {
                throw new Error('Abysm bypass failed');
            }
            let resultVal = null;
            if (json.data && typeof json.data.result !== 'undefined') {
                resultVal = json.data.result;
            } else if (json.result) {
                resultVal = json.result;
            } else if (json.url) {
                resultVal = json.url;
            } else {
                const findFirstUrlInObj = (obj) => {
                    if (typeof obj === 'string') {
                        const m = obj.match(/https?:\/\/[^\s"'<>]+/);
                        return m ? m[0] : null;
                    }
                    if (typeof obj === 'object') {
                        for (const k in obj) {
                            const res = findFirstUrlInObj(obj[k]);
                            if (res) return res;
                        }
                    }
                    return null;
                };
                resultVal = findFirstUrlInObj(json) || JSON.stringify(json);
            }
            return { success: true, result: resultVal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    async function tryEasApi(url) {
        try {
            const response = await fetch('https://api.eas-x.com/v3/bypass', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'eas-api-key': EAS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });
            if (!response.ok) throw new Error('EAS API error');
            const json = await response.json();
            if (json.status === 'error') {
                throw new Error(json.message || 'EAS bypass failed');
            }
            return { success: true, result: json.result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    async function bypassUrl(url) {
        const host = getHostFromUrl(url);
        if (!host) return { success: false, error: 'Invalid URL' };
        const isLinkvertise = LINKVERTISE_NETWORKS.some(pattern => isHostMatch(host, pattern));
        const isAbysmSupported = ABYSM_SUPPORTED.some(pattern => isHostMatch(host, pattern));
        const isEasSupported = EAS_SUPPORTED.some(pattern => isHostMatch(host, pattern));
        let result = null;
        if (isAbysmSupported && isEasSupported && !isLinkvertise) {
            result = await tryAbysmApi(url);
            if (result.success) {
                return result;
            }
            result = await tryEasApi(url);
            return result;
        }
        else if (isEasSupported) {
            result = await tryEasApi(url);
            return result;
        }
        else if (isAbysmSupported) {
            result = await tryAbysmApi(url);
            return result;
        }
        else if (isLinkvertise && isEasSupported) {
            result = await tryEasApi(url);
            return result;
        }
        return { success: false, error: 'No supported API for this host' };
    }
    window.VortixWorldBypass = {
        bypassUrl: bypassUrl,
        isHostMatch: isHostMatch
    };
})();
