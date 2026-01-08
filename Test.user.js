// ==UserScript==
// @name         New Userscript
// @namespace    https://staybrowser.com/
// @version      0.1
// @description  Template userscript created by Stay
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function () {
  "use strict";

  const win = window;
  const host = win.location.hostname;

  if (host.includes("ads.luarmor.net")) {
    handleLuarmor();
  }

  function handleLuarmor() {
    const originalElm = document.getElementById.bind(document);

    const buttonObserver = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;

          if (
            node.matches?.('.swal2-confirm, .swal2-styled') ||
            node.textContent?.includes('I accept')
          ) {
            node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }

          node.querySelectorAll?.(
            '.swal2-confirm, .swal2-styled, button[class*="confirm"]'
          ).forEach(btn =>
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true }))
          );
        }
      }
    });

    const start = () => {
      buttonObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    };

    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", start)
      : start();

    let hasClicked = false;

    const clickInterval = setInterval(() => {
      if (!win.location.href.includes("ads.luarmor.net")) return;

      if (hasClicked) return;

      const btn = originalElm("nextbtn");
      if (!btn || btn.disabled) return;

      const rect = btn.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const text = (btn.innerText || "").toLowerCase();
      if (!text.includes("start") && !text.includes("next")) return;

      hasClicked = true;
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      clearInterval(clickInterval);
    }, 100);
  }
})();
