/* Sends practice results to a Google Form (which feeds a Google Sheet).
   - Configured by the pre-filled link in js/config.js. If that's empty, nothing is sent.
   - Every send is a running total for the session, so the newest row for a
     session is always the full picture, and a closed tab loses at most one question.
   - Google Forms can't reply to other websites, so sends are "fire and forget".
     If the network is down, the latest snapshot is kept and sent next time. */
window.MP = window.MP || {};

(function (MP) {
  "use strict";
  var FIELDS = ["SESSION", "NAMES", "DATE", "UNIT", "LESSONS", "LEVELS", "ATTEMPTED", "CORRECT", "FIRSTTRY", "MINUTES", "MISSION"];
  var PENDING_KEY = "mp_track_pending";

  // Read the pre-filled link: entry.123=NAMES  →  { NAMES: "entry.123" }
  function parse(link) {
    if (!link) return null;
    try {
      var u = new URL(link);
      var m = u.pathname.match(/^(.*\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[^/]+)\//);
      if (!/docs\.google\.com$/.test(u.hostname) || !m) return null;
      var entries = {};
      u.searchParams.forEach(function (val, key) {
        if (!/^entry\.\d+$/.test(key)) return;
        var word = String(val).toUpperCase().replace(/[^A-Z]/g, "");
        if (FIELDS.indexOf(word) >= 0) entries[word] = key;
      });
      if (!Object.keys(entries).length) return null;
      return { action: u.origin + m[1] + "/formResponse", entries: entries };
    } catch (e) { return null; }
  }

  var cfg = parse(MP.TRACKING_PREFILL_LINK);

  function body(record) {
    var p = new URLSearchParams();
    Object.keys(cfg.entries).forEach(function (f) {
      if (record[f] !== undefined && record[f] !== null) p.append(cfg.entries[f], String(record[f]));
    });
    return p;
  }

  function remember(record) { try { localStorage.setItem(PENDING_KEY, JSON.stringify(record)); } catch (e) { /* ignore */ } }
  function forget() { try { localStorage.removeItem(PENDING_KEY); } catch (e) { /* ignore */ } }

  // useBeacon: for when the page is closing (fetch may be cancelled then)
  function send(record, useBeacon) {
    if (!cfg) return Promise.resolve(false);
    var b = body(record);
    if (useBeacon && navigator.sendBeacon) {
      try {
        var blob = new Blob([b.toString()], { type: "application/x-www-form-urlencoded" });
        if (navigator.sendBeacon(cfg.action, blob)) { forget(); return Promise.resolve(true); }
      } catch (e) { /* fall through to fetch */ }
    }
    remember(record);
    return fetch(cfg.action, { method: "POST", mode: "no-cors", body: b, keepalive: true })
      .then(function () { forget(); return true; })
      .catch(function () { return false; });   // stays pending; retried on the next send or page load
  }

  // retry anything left over from last time (e.g. Wi-Fi dropped)
  function retryPending() {
    if (!cfg) return;
    var rec = null;
    try { rec = JSON.parse(localStorage.getItem(PENDING_KEY) || "null"); } catch (e) { /* ignore */ }
    if (rec) send(rec);
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function newSessionId() {
    var s = "";
    for (var i = 0; i < 8; i++) s += "abcdefghjkmnpqrstuvwxyz23456789".charAt(Math.floor(Math.random() * 31));
    return s;
  }

  MP.tracker = {
    FIELDS: FIELDS,
    enabled: function () { return !!cfg; },
    missingFields: function () { return cfg ? FIELDS.filter(function (f) { return !cfg.entries[f]; }) : FIELDS.slice(); },
    parse: parse,
    send: send,
    retryPending: retryPending,
    today: today,
    newSessionId: newSessionId
  };
  retryPending();
})(window.MP);
