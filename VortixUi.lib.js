window.VortixUi = (function() {
    const config = { time: 10 }
    const SITE_HOST = 'vortix-world-bypass.vercel.app'
    const TARGET = 'https://' + SITE_HOST + '/userscript.html'
    const LOGO_SRC = 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png';
  
    const LOCAL_SUPPORTED_HOSTS = [
        'lootlink.org', 'lootlinks.co', 'lootdest.info', 'lootdest.org', 'lootdest.com',
        'links-loot.com', 'loot-links.com', 'best-links.org', 'lootlinks.com', 
        'loot-labs.com', 'lootlabs.com', 'loot-link.com', 'linksloot.net'
    ];

    function isLocalSupported(host) {
        const h = host.toLowerCase().replace(/^www\./, '')
        return LOCAL_SUPPORTED_HOSTS.some(domain => h.includes(domain));
    }

    function injectRedirectUI(status, subStatus, showBtn = false, btnLink = '#') {
        const html = `
          <html>
            <head>
              <title>VortixWorld BYPASSER</title>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <style>
                html, body { height: 100%; margin: 0; padding: 0; background: linear-gradient(135deg, #020617, #000000); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow: hidden; color: #fff; }
                .bh-root { min-height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
                .bh-header-bar { position: fixed; top: 0; left: 0; width: 100%; height: 80px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; background: rgba(2, 6, 23, 0.95); border-bottom: 1px solid #1e293b; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.5); backdrop-filter: blur(10px); box-sizing: border-box; }
                .bh-title { font-weight: 800; font-size: 24px; color: #38bdf8; display: flex; align-items: center; gap: 15px; text-shadow: 0 0 15px rgba(56, 189, 248, 0.4); }
                .bh-header-icon { height: 35px; width: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #38bdf8; }
                .bh-main-content { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 600px; padding: 20px; animation: bh-fade-in 0.6s ease-out; position: relative; z-index: 10; margin-top: 60px; }
                .bh-icon-img { width: 80px; height: 80px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 0 25px rgba(56, 189, 248, 0.25); object-fit: cover; }
                .bh-status { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
                .bh-substatus { font-size: 15px; color: #94a3b8; text-align: center; margin-bottom: 15px; }
                .bh-spinner-container { position: relative; width: 60px; height: 60px; margin-bottom: 30px; }
                .bh-spinner-outer { position: absolute; width: 100%; height: 100%; border: 4px solid transparent; border-top: 4px solid #38bdf8; border-right: 4px solid #38bdf8; border-radius: 50%; animation: bh-spin 1s linear infinite; }
                .bh-spinner-inner { position: absolute; top: 8px; left: 8px; width: 44px; height: 44px; border: 4px solid transparent; border-bottom: 4px solid #7dd3fc; border-left: 4px solid #7dd3fc; border-radius: 50%; animation: bh-spin-reverse 0.8s linear infinite; }
                .bh-spinner-dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: #38bdf8; border-radius: 50%; animation: bh-pulse 1s ease-in-out infinite; }
                .bh-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; border: none; padding: 16px 20px; border-radius: 8px; font-weight: 800; cursor: pointer; text-decoration: none; display: inline-block; text-transform: uppercase; transition: all 0.2s; font-size: 15px; letter-spacing: 1px; box-shadow: 0 5px 20px rgba(14, 165, 233, 0.3); margin-top: 15px; }
                .bh-btn:hover { background: linear-gradient(135deg, #38bdf8, #0ea5e9); transform: translateY(-2px); }
                @keyframes bh-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes bh-spin-reverse { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
                @keyframes bh-pulse { 0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); } }
                @keyframes bh-fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
              </style>
            </head>
            <body>
              <div class="bh-root">
                <div class="bh-header-bar">
                  <div class="bh-title">
                    <img src="${LOGO_SRC}" class="bh-header-icon" alt="Icon" />
                    VortixWorld
                  </div>
                </div>
                <div class="bh-main-content">
                  <img src="${LOGO_SRC}" class="bh-icon-img" alt="VortixWorld" />
                  <div class="bh-spinner-container">
                    <div class="bh-spinner-outer"></div>
                    <div class="bh-spinner-inner"></div>
                    <div class="bh-spinner-dot"></div>
                  </div>
                  <div class="bh-status">${status}</div>
                  <div class="bh-substatus">${subStatus}</div>
                  ${showBtn ? `<a href="${btnLink}" class="bh-btn">Click here to continue</a>` : ''}
                </div>
              </div>
            </body>
          </html>
        `;
        document.documentElement.innerHTML = html;
    }

    return {
        check: function() {
            const params = new URLSearchParams(location.search);
            const redirectParam = params.get('redirect');

            if (redirectParam) {
                if (redirectParam.includes('https://flux.li/android/external/main.php')) {
                    injectRedirectUI("Manual Redirect", "Security check required.", true, redirectParam);
                } else {
                    try { location.href = redirectParam } catch (e) { window.open(redirectParam, '_blank', 'noopener,noreferrer') }
                }
                return true;
            }

            if (location.hostname.includes('ads.luarmor.net')) {
                let lastClickTime = 0;
                const CLICK_DELAY = 20000;
                function clickElement(el) {
                    if (!el) return false;
                    const now = Date.now();
                    if (now - lastClickTime < CLICK_DELAY) return false;
                    const rect = el.getBoundingClientRect();
                    if (el.disabled || rect.width === 0 || rect.height === 0) return false;
                    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                    lastClickTime = now;
                    return true;
                }
                const buttonObserver = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType !== Node.ELEMENT_NODE) return;
                            const nodeText = (node.textContent || '').toLowerCase();
                            if (node.matches?.('.swal2-confirm, .swal2-styled, [class*="confirm"]') || nodeText.includes('accept') || nodeText.includes('continue') || nodeText.includes('next')) clickElement(node);
                            node.querySelectorAll?.('.swal2-confirm, .swal2-styled, button, [role="button"], [class*="confirm"], [class*="btn"]').forEach(el => {
                                const elText = (el.textContent || el.value || '').toLowerCase();
                                if (elText.includes('accept') || elText.includes('continue') || elText.includes('next') || elText.includes('verify')) clickElement(el);
                            });
                        });
                    });
                });
                buttonObserver.observe(document.documentElement, { childList: true, subtree: true });
                return true;
            }
            return false;
        },

        redirect: function() {
            injectRedirectUI("Redirecting...", "Bypassing via VortixWorld API");
            setTimeout(() => {
                location.href = TARGET + '?url=' + encodeURIComponent(location.href) + '&time=' + encodeURIComponent(config.time)
            }, 850);
        },

        isLocalSupported: isLocalSupported
    };
})();