/* Print a set: a worksheet + answer key made from the same templates.
   Uses a mission link's lessons and targets: print.html?m=... */
(function (MP) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var mission = MP.mission.decode(new URLSearchParams(location.search).get("m"));
  var unit = null, questions = [];

  function lessonById(id) { return unit.lessons.filter(function (L) { return L.id === id; })[0]; }

  // Spread questions across the chosen lessons, avoiding repeated templates where possible
  function generate() {
    var lessonIds = mission.l === "all" ? MP.availableLessons(unit).map(function (L) { return L.id; }) : mission.l;
    questions = [];
    MP.LEVELS.forEach(function (lv) {
      var n = mission.t[lv.id];
      if (!n) return;
      var order = [];
      while (order.length < n) order = order.concat(MP.R.shuffle(lessonIds.filter(function (id) {
        return unit.templates.some(function (t) { return t.lesson === id && t.level === lv.id; });
      })));
      var used = {};
      order.slice(0, n).forEach(function (lid) {
        var pool = unit.templates.filter(function (t) { return t.lesson === lid && t.level === lv.id; });
        var fresh = pool.filter(function (t) { return !used[t.id]; });
        var t = MP.R.pick(fresh.length ? fresh : pool);
        used[t.id] = true;
        var q = t.generate();
        q.lesson = lid; q.level = lv.id;
        questions.push(q);
      });
    });
    render();
  }

  function levelInfo(id) { return MP.LEVELS.filter(function (x) { return x.id === id; })[0]; }

  function blanks(q) {
    if (q.parts) {
      return "<div class='p-answer'>" + q.parts.map(function (p) {
        return "<span>" + p.label + ": <span class='blank'></span>" + (p.unit && p.type === "number" ? " " + p.unit : "") + "</span>";
      }).join("") + "</div>";
    }
    return "<div class='p-answer'><span>Answer: <span class='blank'></span>" + (q.unit && q.type === "number" ? " " + q.unit : "") + "</span></div>";
  }

  function header(title, sub) {
    return "<header class='p-head'>" +
      "<div class='p-name'><span>Name: <span class='blank long'></span></span><span>Date: <span class='blank'></span></span></div>" +
      "<h1>" + title + "</h1><p class='p-sub'>" + sub + "</p></header>";
  }

  function render() {
    var title = mission.title || "Unit " + unit.number + " practice";
    var sub = "Zuri's Smoothie Truck · " + MP.mission.lessonsText(mission, unit) + (mission.calc ? "" : " · No calculator");
    var html = header(title, sub), keyHtml = "<header class='p-head'><h1>Answer key — " + title + "</h1><p class='p-sub'>" + sub + "</p></header>";
    var num = 0, lastLevel = null;
    var showSteps = $("showSteps").checked;

    questions.forEach(function (q) {
      num++;
      if (q.level !== lastLevel) {
        var lv = levelInfo(q.level);
        html += "<h2 class='p-level level-" + lv.id + "'>" + lv.icon + " " + lv.label + " <small>" + lv.blurb + "</small></h2>";
        keyHtml += "<h2 class='p-level level-" + lv.id + "'>" + lv.icon + " " + lv.label + "</h2>";
        lastLevel = q.level;
      }
      var L = lessonById(q.lesson);
      html += "<article class='p-q'><div class='p-num'>" + num + "</div><div class='p-body'>" +
        "<p class='p-tag'>L" + L.n + " " + L.title + "</p><p class='p-text'>" + q.text + "</p>" +
        "<div class='p-work'></div>" + blanks(q) + "</div></article>";
      keyHtml += "<article class='k-q'><div class='p-num'>" + num + "</div><div class='p-body'><p class='k-ans'>" + MP.answerText(q) + "</p>" +
        (showSteps ? "<ol class='k-steps'>" + q.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" : "") +
        "</div></article>";
    });

    $("sheet").innerHTML = html;
    $("key").innerHTML = keyHtml;
    $("key").hidden = !$("showKey").checked;
    $("printInfo").textContent = questions.length + " questions" + ($("showKey").checked ? " + answer key" : "");
  }

  $("printBtn").onclick = function () { window.print(); };
  $("newBtn").onclick = generate;
  $("showSteps").onchange = render;
  $("showKey").onchange = render;

  MP.loadUnits().then(function () {
    unit = mission && MP.units[mission.u];
    if (!unit) {
      $("sheet").innerHTML = "<p class='error'>Open this page from the Teacher page (Print a set), so it knows which lessons to use.</p>";
      return;
    }
    generate();
  });
})(window.MP);
