// Minimal, transparent web-analytics client.
// It records a small set of anonymous usage signals and POSTs them to the
// server, which appends them to data/events.jsonl. Nothing here identifies a
// person: IDs are random strings generated in the browser, not linked to any
// name, email, or account.
(function () {
  "use strict";

  // --- Stable-ish identifiers, generated locally -------------------------
  // visitorId persists across visits (localStorage) so we can tell a first
  // visit from a returning one. sessionId lasts for one browsing session.
  function id() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
    );
  }
  function getStored(key, store) {
    try {
      let v = store.getItem(key);
      if (!v) {
        v = id();
        store.setItem(key, v);
      }
      return v;
    } catch (e) {
      return "no-storage";
    }
  }

  const visitorId = getStored("aurora_visitor", localStorage);
  const sessionId = getStored("aurora_session", sessionStorage);
  const pageLoadTime = Date.now();

  // Context that is the same for every event in this pageview.
  const context = {
    visitorId: visitorId,
    sessionId: sessionId,
    path: location.pathname,
    referrer: document.referrer || "(direct)",
    language: navigator.language,
    userAgent: navigator.userAgent,
    screen: window.screen.width + "x" + window.screen.height,
    viewport: window.innerWidth + "x" + window.innerHeight,
  };

  // --- Sending -----------------------------------------------------------
  function send(type, extra) {
    const event = Object.assign(
      { type: type, timestamp: new Date().toISOString() },
      context,
      extra || {}
    );
    const body = JSON.stringify(event);
    // sendBeacon survives page unload; fetch is the normal path.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/track", body);
    } else {
      fetch("/track", { method: "POST", body: body, keepalive: true });
    }
  }

  // --- 1. Page view ------------------------------------------------------
  send("page_view");

  // --- 2. Button / link clicks ------------------------------------------
  // Any element with a data-track attribute reports which one was clicked.
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-track]");
    if (el) {
      send("click", { label: el.getAttribute("data-track"), text: el.textContent.trim().slice(0, 60) });
    }
  });

  // --- 3. Scroll depth ---------------------------------------------------
  // Fire once when the visitor first passes each depth milestone.
  const milestones = [25, 50, 75, 100];
  const reached = {};
  window.addEventListener(
    "scroll",
    function () {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? Math.round((doc.scrollTop / scrollable) * 100) : 100;
      milestones.forEach(function (m) {
        if (pct >= m && !reached[m]) {
          reached[m] = true;
          send("scroll_depth", { depth: m });
        }
      });
    },
    { passive: true }
  );

  // --- 4. Page exit / time on page --------------------------------------
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      send("page_exit", { timeOnPageMs: Date.now() - pageLoadTime });
    }
  });
})();
