/* Missions: a teacher-made set of targets stored entirely in the link (no login, no server).
   A mission looks like:
     { u: "u3", l: ["L6","L7"] or "all", t: { mild: 5, medium: 5, spicy: 2 }, calc: true, title: "Thursday supply" }
   It is packed into ?m=... as base64url JSON. */
window.MP = window.MP || {};

(function (MP) {
  "use strict";

  function b64urlEncode(str) {
    var b = btoa(unescape(encodeURIComponent(str)));
    return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlDecode(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return decodeURIComponent(escape(atob(s)));
  }

  function encode(m) {
    var packed = {
      v: 1,
      u: m.u,
      l: m.l === "all" ? "all" : m.l.join("."),
      t: [m.t.mild || 0, m.t.medium || 0, m.t.spicy || 0],
      c: m.calc ? 1 : 0
    };
    if (m.title) packed.n = m.title;
    return b64urlEncode(JSON.stringify(packed));
  }

  function clampInt(x) { x = parseInt(x, 10); return isNaN(x) ? 0 : Math.max(0, Math.min(50, x)); }

  function decode(code) {
    if (!code) return null;
    try {
      var p = JSON.parse(b64urlDecode(code));
      if (!p || p.v !== 1 || typeof p.u !== "string" || !Array.isArray(p.t)) return null;
      var m = {
        u: p.u,
        l: p.l === "all" ? "all" : String(p.l || "").split(".").filter(Boolean),
        t: { mild: clampInt(p.t[0]), medium: clampInt(p.t[1]), spicy: clampInt(p.t[2]) },
        calc: p.c !== 0,
        title: typeof p.n === "string" ? p.n.slice(0, 60) : ""
      };
      if (total(m) === 0) return null;
      if (m.l !== "all" && !m.l.length) return null;
      m.code = code;
      return m;
    } catch (e) {
      return null;
    }
  }

  function total(m) { return m.t.mild + m.t.medium + m.t.spicy; }

  // "5 Mild · 5 Medium · 2 Spicy"
  function targetsText(m) {
    return MP.LEVELS.filter(function (lv) { return m.t[lv.id] > 0; })
      .map(function (lv) { return m.t[lv.id] + " " + lv.label; }).join(" · ");
  }

  // "L6 Discount, tax, tip, L7 Simple interest" or "Whole unit"
  function lessonsText(m, unit) {
    if (m.l === "all") return "Unit " + unit.number + " (all lessons)";
    return unit.lessons.filter(function (L) { return m.l.indexOf(L.id) >= 0; })
      .map(function (L) { return "L" + L.n + " " + L.title; }).join(", ");
  }

  // Progress is kept on the device so a closed tab doesn't lose it.
  function progressKey(m, names) { return "mp_mission_" + m.code + "_" + names.join("&").toLowerCase(); }
  function loadProgress(m, names) {
    try { var s = localStorage.getItem(progressKey(m, names)); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function saveProgress(m, names, data) {
    try { localStorage.setItem(progressKey(m, names), JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  MP.mission = {
    encode: encode, decode: decode, total: total,
    targetsText: targetsText, lessonsText: lessonsText,
    loadProgress: loadProgress, saveProgress: saveProgress
  };
})(window.MP);
