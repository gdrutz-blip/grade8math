/* Practice screen: generates questions, checks answers, shows steps,
   handles level switching, partner roles and running totals. */
(function (MP) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var MAX_TRIES = 2;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var params = new URLSearchParams(location.search);
  var state = {
    unit: null,
    lessonIds: [],
    level: params.get("lv") || "mild",
    names: [params.get("n1") || "", params.get("n2") || ""].filter(Boolean),
    q: null,
    tries: 0,
    stepsSeen: false,
    done: false,
    lastTemplate: null,
    roleFlip: 0,
    stats: { attempted: 0, correct: 0, firstTry: 0, activeSeconds: 0 }
  };

  // ---------- Active time (counts only while the tab is visible and in use) ----------
  var lastActivity = Date.now();
  ["keydown", "pointerdown", "input"].forEach(function (ev) {
    document.addEventListener(ev, function () { lastActivity = Date.now(); }, true);
  });
  setInterval(function () {
    if (document.visibilityState === "visible" && Date.now() - lastActivity < 120000) {
      state.stats.activeSeconds += 15;
    }
  }, 15000);

  // ---------- Setup ----------
  function init(units) {
    var uid = params.get("u");
    state.unit = MP.units[uid] || units[0];
    if (!state.unit) { $("qtext").textContent = "No units are loaded."; return; }
    var l = params.get("l") || "all";
    var avail = MP.availableLessons(state.unit).map(function (L) { return L.id; });
    state.lessonIds = l === "all" ? avail : l.split(",").filter(function (id) { return avail.indexOf(id) >= 0; });
    if (!state.lessonIds.length) state.lessonIds = avail;
    if (!MP.LEVELS.some(function (x) { return x.id === state.level; })) state.level = "mild";

    $("who").textContent = state.names.join(" & ");
    renderLevelSwitch();
    newQuestion();
  }

  function renderLevelSwitch() {
    var box = $("levelSwitch");
    box.innerHTML = "";
    MP.LEVELS.forEach(function (lv) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "seg-btn level-" + lv.id + (lv.id === state.level ? " on" : "");
      b.setAttribute("aria-pressed", lv.id === state.level ? "true" : "false");
      b.innerHTML = lv.icon + " " + lv.label;
      b.onclick = function () {
        if (lv.id === state.level) return;
        state.level = lv.id;
        params.set("lv", lv.id);
        history.replaceState(null, "", "?" + params.toString());
        renderLevelSwitch();
        newQuestion();
      };
      box.appendChild(b);
    });
  }

  function lessonById(id) {
    return state.unit.lessons.filter(function (L) { return L.id === id; })[0];
  }

  function pickTemplate() {
    var pool = state.unit.templates.filter(function (t) {
      return t.level === state.level && state.lessonIds.indexOf(t.lesson) >= 0;
    });
    if (!pool.length) return null;
    // pick a lesson first so every chosen lesson shows up equally often
    var lessons = pool.map(function (t) { return t.lesson; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    var lesson = MP.R.pick(lessons);
    var choices = pool.filter(function (t) { return t.lesson === lesson; });
    if (choices.length > 1) choices = choices.filter(function (t) { return t.id !== state.lastTemplate; });
    return MP.R.pick(choices);
  }

  // ---------- Question lifecycle ----------
  function newQuestion() {
    var t = pickTemplate();
    if (!t) { $("qtext").textContent = "No questions yet for this level."; return; }
    var q = t.generate();
    q.templateId = t.id; q.lesson = t.lesson; q.level = t.level;
    state.q = q; state.lastTemplate = t.id;
    state.tries = 0; state.stepsSeen = false; state.done = false;

    var L = lessonById(t.lesson);
    $("lessonLabel").innerHTML = "Unit " + state.unit.number + " · <b>L" + L.n + "</b> " + L.title;
    var lv = MP.LEVELS.filter(function (x) { return x.id === q.level; })[0];
    $("qmeta").innerHTML = "<span class='tag level-" + lv.id + "'>" + lv.icon + " " + lv.label + "</span>";
    $("qtext").innerHTML = q.text;
    $("qcard").className = "card qcard";
    $("feedback").innerHTML = "";
    $("feedback").className = "feedback";
    $("steps").hidden = true;
    $("steps").innerHTML = "";
    $("stepsBtn").textContent = "Show me the steps";
    renderInputs(q);
    $("checkBtn").disabled = false;
    $("skipBtn").hidden = false;
    $("nextBtn").hidden = true;
    renderRoles();
    inputs()[0].focus();
  }

  // ---------- Answer boxes: one, or one per part (e.g. "Mango" and "Berry") ----------
  var lastFocused = null;
  function inputs() { return Array.prototype.slice.call(document.querySelectorAll("#inputs input")); }

  function renderInputs(q) {
    var box = $("inputs");
    box.innerHTML = "";
    var parts = q.parts || [q];
    box.className = "inputs" + (q.parts ? " multi" : "");
    parts.forEach(function (p, i) {
      var wrap = document.createElement("label");
      wrap.className = "ans-wrap";
      if (q.parts) {
        var cap = document.createElement("span");
        cap.className = "ans-label";
        cap.textContent = p.label;
        wrap.appendChild(cap);
      }
      var inp = document.createElement("input");
      inp.className = "ans-input";
      inp.autocomplete = "off";
      inp.spellcheck = false;
      inp.placeholder = p.type === "ratio" ? "e.g. 2:3" : (q.parts ? "Answer" : "Your answer");
      inp.setAttribute("aria-label", q.parts ? p.label : "Your answer");
      inp.addEventListener("focus", function () { lastFocused = inp; });
      if (i === 0) inp.id = "answer";
      wrap.appendChild(inp);
      if (p.unit && p.type === "number") {
        var u = document.createElement("span");
        u.className = "ans-unit";
        u.textContent = p.unit;
        wrap.appendChild(u);
      }
      box.appendChild(wrap);
    });
    lastFocused = null;
  }

  // the box the calculator's "Put in my answer" fills
  function answerTarget() {
    var list = inputs();
    if (lastFocused && list.indexOf(lastFocused) >= 0) return lastFocused;
    return list.filter(function (i) { return !i.value; })[0] || list[0];
  }

  function renderRoles() {
    var box = $("roles");
    if (state.names.length < 2) { box.hidden = true; return; }
    var solver = state.names[state.roleFlip % 2], checker = state.names[(state.roleFlip + 1) % 2];
    box.hidden = false;
    box.innerHTML = "<span>✏️ Solver: <b>" + esc(solver) + "</b></span><span>🔍 Checker: <b>" + esc(checker) + "</b></span>";
  }

  function finish(correct) {
    state.done = true;
    state.stats.attempted++;
    if (correct) {
      state.stats.correct++;
      if (state.tries === 0 && !state.stepsSeen) state.stats.firstTry++;
    }
    inputs().forEach(function (i) { i.disabled = true; });
    $("checkBtn").disabled = true;
    $("skipBtn").hidden = true;
    $("nextBtn").hidden = false;
    $("nextBtn").focus();
    renderStats();
    if (typeof MP.onResult === "function") {
      MP.onResult({ correct: correct, firstTry: correct && state.tries === 0 && !state.stepsSeen, q: state.q, state: state });
    }
  }

  function onCheck(e) {
    e.preventDefault();
    if (state.done || !state.q) return;
    var fb = $("feedback");
    var parts = state.q.parts || [state.q];
    var boxes = inputs();
    var results = parts.map(function (p, i) {
      if (!boxes[i].value.trim()) return { status: "unreadable", message: parts.length > 1 ? "Fill in every box." : "Type your answer first." };
      return MP.check(boxes[i].value, p);
    });
    var unreadable = results.filter(function (r) { return r.status === "unreadable"; })[0];
    var res = unreadable || (results.every(function (r) { return r.status === "correct"; }) ? { status: "correct" } :
      { status: "wrong", message: results.map(function (r) { return r.message; }).filter(Boolean)[0] });
    boxes.forEach(function (b, i) {
      b.classList.remove("ok", "no");
      if (parts.length > 1 && results[i].status !== "unreadable") b.classList.add(results[i].status === "correct" ? "ok" : "no");
    });

    if (res.status === "unreadable") {
      fb.className = "feedback info";
      fb.textContent = res.message;
      return;
    }
    if (res.status === "correct") {
      fb.className = "feedback good";
      fb.innerHTML = "✅ <b>Correct!</b> " + MP.answerText(state.q) +
        (state.tries === 0 && !state.stepsSeen ? " — first try!" : "");
      $("qcard").className = "card qcard good";
      finish(true);
      return;
    }
    state.tries++;
    if (state.tries < MAX_TRIES) {
      fb.className = "feedback warn";
      fb.innerHTML = "❌ <b>Not quite.</b> " + (res.message || (parts.length > 1 ? "Fix the box marked in red." : "Check your work and try once more.")) +
        " <span class='note'>(1 try left)</span>";
      var firstWrong = boxes.filter(function (b, i) { return results[i].status !== "correct"; })[0] || boxes[0];
      firstWrong.select();
      return;
    }
    fb.className = "feedback bad";
    fb.innerHTML = "❌ The answer is <b>" + MP.answerText(state.q) + "</b>. Read the steps below, then try a new one.";
    $("qcard").className = "card qcard bad";
    showSteps(true);
    finish(false);
  }

  function showSteps(forceOpen) {
    var box = $("steps");
    if (!box.innerHTML) {
      var L = lessonById(state.q.lesson);
      box.innerHTML = "<div class='keymove'><span>🔑 Key move</span>" + L.keyMove + "</div><ol>" +
        state.q.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>";
    }
    var open = forceOpen ? true : box.hidden;
    box.hidden = !open;
    $("stepsBtn").textContent = open ? "Hide the steps" : "Show me the steps";
    if (open && !state.done) state.stepsSeen = true;
  }

  function renderStats() {
    $("sAtt").textContent = state.stats.attempted;
    $("sCor").textContent = state.stats.correct;
    $("sFirst").textContent = state.stats.firstTry;
  }

  $("answerForm").addEventListener("submit", onCheck);
  $("stepsBtn").onclick = function () { showSteps(false); };
  $("nextBtn").onclick = function () { state.roleFlip++; newQuestion(); };
  $("skipBtn").onclick = function () {
    if (state.done) return;
    finish(false);
    state.roleFlip++;
    newQuestion();
  };

  // Built-in calculator (turn off with ?calc=0 in the link)
  if (params.get("calc") === "0") {
    $("calcToggle").hidden = true;
  } else {
    MP.calc.mount({ host: $("layout"), toggle: $("calcToggle"), getAnswerBox: answerTarget, layout: $("layout") });
  }

  MP.state = state;
  MP.loadUnits().then(init);
})(window.MP);
