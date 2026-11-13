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
  var mission = MP.mission ? MP.mission.decode(params.get("m")) : null;
  var state = {
    mission: mission,
    levelCorrect: { mild: 0, medium: 0, spicy: 0 },
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
      saveMission();
    }
  }, 15000);

  // ---------- Setup ----------
  function init(units) {
    var uid = mission ? mission.u : params.get("u");
    state.unit = MP.units[uid] || (mission ? null : units[0]);
    if (!state.unit) { $("qtext").textContent = mission ? "This mission is for a unit that isn't on the site yet." : "No units are loaded."; return; }
    var l = mission ? (mission.l === "all" ? "all" : mission.l.join(",")) : (params.get("l") || "all");
    var avail = MP.availableLessons(state.unit).map(function (L) { return L.id; });
    state.lessonIds = l === "all" ? avail : l.split(",").filter(function (id) { return avail.indexOf(id) >= 0; });
    if (!state.lessonIds.length) state.lessonIds = avail;
    if (!MP.LEVELS.some(function (x) { return x.id === state.level; })) state.level = "mild";

    $("who").textContent = state.names.join(" & ");
    if (mission) startMission();
    renderLevelSwitch();
    newQuestion();
    if (mission && missionDone() >= MP.mission.total(mission) && state.completedShown) showEnd();
  }

  // ---------- Missions ----------
  function startMission() {
    var saved = MP.mission.loadProgress(mission, state.names);
    if (saved) {
      ["mild", "medium", "spicy"].forEach(function (k) { state.levelCorrect[k] = (saved.levelCorrect && saved.levelCorrect[k]) || 0; });
      if (saved.stats) Object.keys(state.stats).forEach(function (k) { state.stats[k] = saved.stats[k] || 0; });
      state.roleFlip = saved.roleFlip || 0;
      state.completedShown = !!saved.completedShown;
    }
    state.level = nextLevel() || MP.LEVELS.filter(function (lv) { return mission.t[lv.id] > 0; }).pop().id;
    $("missionBar").hidden = false;
    $("mbTitle").textContent = mission.title || ("Unit " + state.unit.number + " mission");
    renderMissionBar();
    renderStats();
  }

  function missionDone() {
    return MP.LEVELS.reduce(function (sum, lv) { return sum + Math.min(state.levelCorrect[lv.id], mission.t[lv.id]); }, 0);
  }

  // first level (mild → medium → spicy) that still needs correct answers
  function nextLevel() {
    var lv = MP.LEVELS.filter(function (x) { return mission.t[x.id] > 0 && state.levelCorrect[x.id] < mission.t[x.id]; })[0];
    return lv ? lv.id : null;
  }

  function renderMissionBar() {
    var done = missionDone(), total = MP.mission.total(mission);
    $("mbCount").textContent = done + " / " + total + " correct";
    $("mbFill").style.width = Math.round(done / total * 100) + "%";
    $("mbBar").setAttribute("aria-valuemax", total);
    $("mbBar").setAttribute("aria-valuenow", done);
    $("missionBar").classList.toggle("complete", done >= total);
  }

  function saveMission() {
    if (!mission) return;
    MP.mission.saveProgress(mission, state.names, {
      levelCorrect: state.levelCorrect, stats: state.stats, roleFlip: state.roleFlip, completedShown: !!state.completedShown
    });
  }

  function afterMissionResult(correct) {
    var fb = $("feedback"), lvId = state.q.level;
    if (correct) state.levelCorrect[lvId]++;
    saveMission();
    renderMissionBar();
    renderLevelSwitch();
    var total = MP.mission.total(mission);
    if (correct && missionDone() >= total && !state.completedShown) {
      state.showEndOnNext = true;
      $("nextBtn").textContent = "See your mission result 🎉";
      fb.insertAdjacentHTML("beforeend", "<div class='level-done'>🎉 That's the whole mission!</div>");
    } else if (correct && state.levelCorrect[lvId] === mission.t[lvId] && nextLevel()) {
      var nx = MP.LEVELS.filter(function (x) { return x.id === nextLevel(); })[0];
      state.switchOnNext = nx.id;
      fb.insertAdjacentHTML("beforeend", "<div class='level-done'>🎉 " + levelLabel(lvId) + " done! Next up: " + nx.icon + " " + nx.label + ".</div>");
    }
  }

  function levelLabel(id) { return MP.LEVELS.filter(function (x) { return x.id === id; })[0].label; }

  function showEnd() {
    var done = missionDone(), total = MP.mission.total(mission);
    var cls = done >= total ? "green" : done * 2 >= total ? "yellow" : "red";
    var end = $("endScreen");
    end.className = "end " + cls;
    $("endNames").textContent = state.names.join(" & ");
    $("endTitle").textContent = done >= total ? "Mission complete!" : (cls === "yellow" ? "Mission: halfway there" : "Mission: keep going");
    $("endScore").textContent = done + " / " + total;
    $("endLevels").innerHTML = MP.LEVELS.filter(function (lv) { return mission.t[lv.id] > 0; }).map(function (lv) {
      var got = Math.min(state.levelCorrect[lv.id], mission.t[lv.id]);
      return "<span>" + lv.icon + " " + lv.label + " " + got + "/" + mission.t[lv.id] + (got >= mission.t[lv.id] ? " ✓" : "") + "</span>";
    }).join("");
    var mins = Math.max(1, Math.round(state.stats.activeSeconds / 60));
    $("endMeta").textContent = new Date().toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" }) +
      (mission.title ? " · " + mission.title : "") +
      " · " + state.stats.attempted + " tried · " + state.stats.firstTry + " right on the first try · " + mins + " min";
    end.hidden = false;
    document.body.classList.add("end-open");
    if (done >= total) state.completedShown = true;
    saveMission();
    $("keepGoing").focus();
  }

  function hideEnd() {
    $("endScreen").hidden = true;
    document.body.classList.remove("end-open");
    var first = inputs()[0];
    if (first && !first.disabled) first.focus(); else $("nextBtn").focus();
  }

  function setLevel(id) {
    state.level = id;
    if (!mission) {
      params.set("lv", id);
      history.replaceState(null, "", "?" + params.toString());
    }
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
      if (mission) {
        var t = mission.t[lv.id], got = Math.min(state.levelCorrect[lv.id], t);
        if (!t) { b.disabled = true; b.title = "Not part of this mission"; }
        else b.innerHTML += " <small class='lvcount'>" + (got >= t ? "✓" : got + "/" + t) + "</small>";
      }
      b.onclick = function () {
        if (lv.id === state.level) return;
        setLevel(lv.id);
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
    $("nextBtn").textContent = "Next question →";
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
    if (mission) afterMissionResult(correct);
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
    var note = results.map(function (r) { return r.note; }).filter(Boolean)[0];
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
        (state.tries === 0 && !state.stepsSeen ? " — first try!" : "") +
        (note ? "<div class='note'>💡 " + note + "</div>" : "");
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
    fb.innerHTML = (res.message ? "❌ " + res.message + "<br>" : "❌ ") +
      "The answer is <b>" + MP.answerText(state.q) + "</b>. Read the steps below, then try a new one.";
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
  $("nextBtn").onclick = function () {
    state.roleFlip++;
    if (state.showEndOnNext) { state.showEndOnNext = false; newQuestion(); showEnd(); return; }
    if (state.switchOnNext) { var id = state.switchOnNext; state.switchOnNext = null; setLevel(id); }
    else newQuestion();
  };
  $("finishBtn").onclick = function () { if (mission) showEnd(); };
  $("keepGoing").onclick = hideEnd;
  $("skipBtn").onclick = function () {
    if (state.done) return;
    finish(false);
    state.roleFlip++;
    newQuestion();
  };

  // Built-in calculator (turn off with ?calc=0 in the link)
  if (params.get("calc") === "0" || (mission && !mission.calc)) {
    $("calcToggle").hidden = true;
  } else {
    MP.calc.mount({ host: $("layout"), toggle: $("calcToggle"), getAnswerBox: answerTarget, layout: $("layout") });
  }

  MP.state = state;
  MP.loadUnits().then(init);
})(window.MP);
