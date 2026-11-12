/* Student start page: names -> unit -> lessons -> level -> practice.html */
(function (MP) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var units = [], unit = null;

  function cleanName(s) {
    return String(s || "").trim().split(/\s+/)[0].replace(/[^\p{L}\p{M}'\-]/gu, "").slice(0, 20);
  }

  function store(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function load(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }

  function renderUnits() {
    var box = $("unitList");
    box.innerHTML = "";
    units.forEach(function (u) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice" + (u === unit ? " selected" : "");
      b.setAttribute("aria-pressed", u === unit ? "true" : "false");
      b.innerHTML = "<b>Unit " + u.number + "</b><span>" + u.title + "</span>";
      b.onclick = function () { unit = u; renderUnits(); renderLessons(); };
      box.appendChild(b);
    });
  }

  function renderLessons() {
    var box = $("lessonList");
    box.innerHTML = "";
    var avail = MP.availableLessons(unit).map(function (L) { return L.id; });
    var whole = $("wholeUnit").checked;
    unit.lessons.forEach(function (L) {
      var ok = avail.indexOf(L.id) >= 0;
      var lab = document.createElement("label");
      lab.className = "lesson" + (ok ? "" : " soon");
      lab.innerHTML = "<input type='checkbox' value='" + L.id + "'" + (ok ? "" : " disabled") +
        (ok && whole ? " checked" : "") + "> <b>L" + L.n + "</b> " + L.title +
        (ok ? "" : " <em>coming soon</em>");
      lab.querySelector("input").onchange = function () {
        if (!this.checked) $("wholeUnit").checked = false;
      };
      box.appendChild(lab);
    });
  }

  function renderLevels() {
    var box = $("levelList");
    MP.LEVELS.forEach(function (lv) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "level-btn level-" + lv.id;
      b.innerHTML = "<span class='icon'>" + lv.icon + "</span><b>" + lv.label + "</b><span>" + lv.blurb + "</span>";
      b.onclick = function () { start(lv.id); };
      box.appendChild(b);
    });
  }

  function start(level) {
    var err = $("formError");
    err.textContent = "";
    var n1 = cleanName($("name1").value), n2 = cleanName($("name2").value);
    if (!n1) { err.textContent = "Type your first name in step 1."; $("name1").focus(); return; }
    var lessons = Array.prototype.slice.call(document.querySelectorAll("#lessonList input:checked"))
      .map(function (i) { return i.value; });
    if (!lessons.length) { err.textContent = "Pick at least one lesson in step 3."; return; }
    store("mp_n1", n1); store("mp_n2", n2);

    var p = new URLSearchParams();
    p.set("u", unit.id);
    p.set("l", $("wholeUnit").checked ? "all" : lessons.join(","));
    p.set("lv", level);
    p.set("n1", n1);
    if (n2) p.set("n2", n2);
    location.href = "practice.html?" + p.toString();
  }

  $("wholeUnit").onchange = renderLessons;
  $("name2").oninput = function () { $("pairHint").hidden = !this.value.trim(); };

  $("name1").value = load("mp_n1");
  $("name2").value = load("mp_n2");
  $("pairHint").hidden = !$("name2").value;

  MP.loadUnits().then(function (list) {
    units = list;
    unit = units[0];
    renderUnits();
    renderLessons();
    renderLevels();
  });
})(window.MP);
