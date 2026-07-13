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
  // Any element with a data-track attribute that is NOT a form control
  // reports which one was clicked. (Inputs/selects are handled by "change"
  // below so we record the chosen value, not every click.)
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-track]");
    if (!el) return;
    const tag = el.tagName.toLowerCase();
    if (tag === "select" || tag === "input") return; // handled by change
    send("click", { label: el.getAttribute("data-track"), text: el.textContent.trim().slice(0, 60) });
  });

  // --- 3. Form controls: menus, radios, sliders -------------------------
  // One "change" listener covers all three. The event sub-type is derived
  // from the control so the dashboard can group them.
  document.addEventListener("change", function (e) {
    const el = e.target;
    const label = el.getAttribute && el.getAttribute("data-track");
    if (!label) return;

    if (el.tagName.toLowerCase() === "select") {
      send("select_change", { label: label, name: el.name, value: el.value });
    } else if (el.type === "radio") {
      send("radio_change", { label: label, name: el.name, value: el.value });
    } else if (el.type === "range") {
      // "change" fires on release, so we log the value the user settled on.
      send("slider_change", { label: label, name: el.name, value: Number(el.value) });
    }
  });

  // Live-update the <output> next to each slider (display only, not tracking).
  document.addEventListener("input", function (e) {
    const el = e.target;
    if (el.type === "range" && el.getAttribute("output")) {
      const out = document.getElementById(el.getAttribute("output"));
      if (out) out.textContent = el.value;
    }
  });

  // --- 4. Carousel slide changes ----------------------------------------
  // carousel.js calls this on every slide change.
  window.onCarouselChange = function (detail) {
    send("carousel_change", detail);
  };

  // --- 5. Scroll depth ---------------------------------------------------
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

  // --- 6. Page exit / time on page --------------------------------------
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      send("page_exit", { timeOnPageMs: Date.now() - pageLoadTime });
    }
  });
})();
