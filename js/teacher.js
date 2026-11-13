/* Teacher page: build a mission and produce a link + supply note. */
(function (MP) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var units = [], unit = null;
  var targets = { mild: 5, medium: 5, spicy: 2 };

  function renderUnits() {
    var box = $("unitList");
    box.innerHTML = "";
    units.forEach(function (u) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice" + (u === unit ? " selected" : "");
      b.innerHTML = "<b>Unit " + u.number + "</b><span>" + u.title + "</span>";
      b.onclick = function () { unit = u; renderUnits(); renderLessons(); update(); };
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
      lab.innerHTML = "<input type='checkbox' value='" + L.id + "'" + (ok ? "" : " disabled") + (ok && whole ? " checked" : "") +
        "> <b>L" + L.n + "</b> " + L.title + (ok ? "" : " <em>coming soon</em>");
      lab.querySelector("input").onchange = function () {
        var all = Array.prototype.every.call(document.querySelectorAll("#lessonList input:not([disabled])"), function (i) { return i.checked; });
        $("wholeUnit").checked = all;
        update();
      };
      box.appendChild(lab);
    });
  }

  function renderTargets() {
    var box = $("targets");
    box.innerHTML = "";
    MP.LEVELS.forEach(function (lv) {
      var row = document.createElement("div");
      row.className = "target level-" + lv.id;
      row.innerHTML = "<span class='tag level-" + lv.id + "'>" + lv.icon + " " + lv.label + "</span>" +
        "<button type='button' class='btn step' aria-label='Fewer " + lv.label + "'>−</button>" +
        "<input type='number' min='0' max='50' inputmode='numeric' aria-label='" + lv.label + " target' value='" + targets[lv.id] + "'>" +
        "<button type='button' class='btn step' aria-label='More " + lv.label + "'>+</button>";
      var inp = row.querySelector("input"), btns = row.querySelectorAll("button");
      function set(v) { v = Math.max(0, Math.min(50, parseInt(v, 10) || 0)); targets[lv.id] = v; inp.value = v; update(); }
      btns[0].onclick = function () { set(targets[lv.id] - 1); };
      btns[1].onclick = function () { set(targets[lv.id] + 1); };
      inp.oninput = function () { set(inp.value); };
      box.appendChild(row);
    });
  }

  function chosenLessons() {
    if ($("wholeUnit").checked) return "all";
    return Array.prototype.map.call(document.querySelectorAll("#lessonList input:checked"), function (i) { return i.value; });
  }

  function baseUrl() {
    return location.href.split(/[?#]/)[0].replace(/teacher\.html$/, "");
  }

  function update() {
    var err = $("linkError");
    err.textContent = "";
    var m = { u: unit.id, l: chosenLessons(), t: targets, calc: $("calcOn").checked, title: $("mTitle").value.trim() };
    var tot = MP.mission.total(m);
    $("targetTotal").textContent = tot ? "Total: " + tot + " correct answers." : "";
    if (m.l !== "all" && !m.l.length) { err.textContent = "Pick at least one lesson."; return blank(); }
    if (!tot) { err.textContent = "Set a target above 0 for at least one level."; return blank(); }

    var link = baseUrl() + "?m=" + MP.mission.encode(m);
    $("mLink").value = link;
    $("openLink").href = link;
    $("openLink").removeAttribute("aria-disabled");

    var lessonsTxt = MP.mission.lessonsText(m, unit);
    $("supplyNote").value = [
      "MATH" + (m.title ? " — " + m.title : "") + " (Zuri's Smoothie Truck practice mission)",
      "",
      "1. Students open this link on their Chromebooks: " + link,
      "2. They type their first names. Partners share one Chromebook and type both names. Partners swap Solver and Checker every question (the screen shows whose turn it is).",
      "3. Mission: get " + MP.mission.targetsText(m) + " questions CORRECT. Lessons: " + lessonsTxt + ".",
      "4. Calculator: " + (m.calc ? "allowed (built into the page)." : "NOT allowed for this mission (it's hidden)."),
      "5. Stuck? Press \"Show me the steps\" for a worked solution.",
      "6. Near the end of class, students press \"Finish\" and hold up their screen:",
      "   GREEN = mission complete   YELLOW = at least half done   RED = less than half",
      "   Please note anyone who is red or who didn't finish."
    ].join("\n");
  }

  function blank() {
    $("mLink").value = "";
    $("supplyNote").value = "";
    $("openLink").removeAttribute("href");
    $("openLink").setAttribute("aria-disabled", "true");
  }

  function copy(text) {
    if (!text) return;
    function done() { $("copied").textContent = "Copied ✓"; setTimeout(function () { $("copied").textContent = ""; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(t);
    }
  }

  $("copyLink").onclick = function () { copy($("mLink").value); };
  $("copyNote").onclick = function () { copy($("supplyNote").value); };
  $("mTitle").oninput = update;
  $("calcOn").onchange = update;
  $("wholeUnit").onchange = function () { renderLessons(); update(); };

  // ---------- Tracking status + test row ----------
  (function () {
    var st = $("trackStatus");
    if (!MP.tracker.enabled()) {
      st.innerHTML = "⚪ <b>Not connected yet.</b> The site works fully without it; results just aren't saved anywhere.";
      $("testRow").hidden = true;
      return;
    }
    var missing = MP.tracker.missingFields();
    st.innerHTML = "🟢 <b>Connected to your Google Form.</b>" +
      (missing.length ? " <span class='error'>These fields weren't found in the link: " + missing.join(", ") + "</span>" : "");
    $("testRow").onclick = function () {
      var id = "test-" + MP.tracker.newSessionId();
      MP.tracker.send({
        SESSION: id, NAMES: "TEST (teacher page)", DATE: MP.tracker.today(), UNIT: "Unit 3", LESSONS: "L6",
        LEVELS: "Mild 1/1", ATTEMPTED: 1, CORRECT: 1, FIRSTTRY: 1, MINUTES: 1, MISSION: "Test row"
      }).then(function (ok) {
        $("testResult").textContent = ok ? "Sent ✓ — look for session " + id + " in your Sheet (it can take a few seconds)."
          : "Couldn't reach Google. Check the internet connection and try again.";
      });
    };
  })();

  MP.loadUnits().then(function (list) {
    units = list;
    unit = units[0];
    renderUnits();
    renderLessons();
    renderTargets();
    update();
  });
})(window.MP);
