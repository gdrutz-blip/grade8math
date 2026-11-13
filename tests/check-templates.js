/* Stress test for question templates. Run:  node tests/check-templates.js
   Generates many questions from every template and checks that:
   - the answer is a finite, positive number with no float junk
   - money answers are sensible to the cent
   - the formatted answer, typed back in, is marked correct
   - common typed formats are accepted
   - steps exist and the final answer appears in the steps */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");

var root = path.join(__dirname, "..");
var ctx = { window: {}, console: console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
function load(f) { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); }
load("js/engine.js");
load("js/calculator.js");
var unitFiles = fs.readdirSync(path.join(root, "units")).filter(function (f) { return /^unit\d+\.js$/.test(f); });
unitFiles.forEach(function (f) { load("units/" + f); });

var MP = ctx.window.MP, F = MP.F;
var N = Number(process.argv[2]) || 3000;
var failures = 0, total = 0;

function checkOne(t, q, p, stepsText) {
  var types = ["money", "percent", "number", "ratio"];
  if (types.indexOf(p.type) < 0) { fail(t, q, "bad type " + p.type); return; }
  if (p.type === "ratio") {
    if (!Array.isArray(p.answer) || p.answer.some(function (x) { return !Number.isInteger(x) || x <= 0; })) fail(t, q, "bad ratio " + p.answer);
    var g = p.answer.reduce(function (a, b) { return MP.gcd(a, b); });
    if (g !== 1) fail(t, q, "ratio answer not simplest: " + p.answer);
    ["", " to ", " : "].forEach(function (sep, i) {
      var s = p.answer.join(i === 0 ? ":" : sep);
      if (MP.check(s, p).status !== "correct") fail(t, q, "ratio '" + s + "' not accepted");
    });
    if (MP.check(p.answer.map(function (x) { return x * 2; }).join(":"), p).status !== "unreadable") fail(t, q, "unsimplified ratio not flagged");
    if (stepsText.indexOf(p.answer.join(":")) < 0) fail(t, q, "ratio answer not in steps");
    return;
  }
  if (typeof p.answer !== "number" || !isFinite(p.answer)) { fail(t, q, "answer not finite: " + p.answer); return; }
  if (p.answer <= 0) fail(t, q, "answer not positive: " + p.answer);
  var shown = MP.answerText(p);
  if (MP.check(shown, p).status !== "correct") fail(t, q, "formatted answer '" + shown + "' not accepted");
  if (p.type === "money") {
    var plain = F.roundTo(p.answer, 2).toFixed(2);
    ["$" + plain, plain, plain + " dollars"].forEach(function (s) {
      if (MP.check(s, p).status !== "correct") fail(t, q, "money format '" + s + "' not accepted");
    });
    if (MP.check((F.roundTo(p.answer, 2) + 0.05).toFixed(2), p).status === "correct") fail(t, q, "wrong answer accepted");
    if (stepsText.indexOf(shown) < 0) fail(t, q, "answer " + shown + " not shown in steps");
  } else {
    var dp = p.dp === undefined ? (p.type === "percent" ? 1 : 2) : p.dp;
    var v = F.num(p.answer, dp);
    var forms = p.type === "percent" ? [v, v + "%"] : [v];
    forms.forEach(function (s) { if (MP.check(s, p).status !== "correct") fail(t, q, "format '" + s + "' not accepted"); });
    if (MP.check(String(p.answer + 1), p).status === "correct") fail(t, q, "wrong answer accepted");
    // answers should be tidy: at most 2 decimals unless dp says otherwise
    if (Math.abs(F.roundTo(p.answer, Math.max(dp, 2)) - p.answer) > 1e-9) fail(t, q, "answer has extra decimals: " + p.answer);
    if (stepsText.indexOf(F.num(p.answer, dp)) < 0) fail(t, q, "answer " + F.num(p.answer, dp) + " not shown in steps");
  }
}

function fail(t, q, msg) {
  failures++;
  if (failures <= 30) console.log("FAIL " + t.id + ": " + msg + "\n   " + String(q && q.text).replace(/<[^>]+>/g, "").slice(0, 200));
}

Object.keys(MP.units).forEach(function (uid) {
  var unit = MP.units[uid];
  var counts = {};
  unit.templates.forEach(function (t) {
    var key = t.lesson + " " + t.level;
    counts[key] = (counts[key] || 0) + 1;
    var seen = {};
    for (var i = 0; i < N; i++) {
      total++;
      var q;
      try { q = t.generate(); } catch (e) { fail(t, null, "threw " + e.message); continue; }
      seen[q.text] = 1;
      if (/NaN|undefined|Infinity/.test(q.text + (q.steps || []).join(""))) fail(t, q, "NaN/undefined in text or steps");
      if (!q.steps || q.steps.length < 2) { fail(t, q, "too few steps"); continue; }
      var stepsText = q.steps.join(" ");
      (q.parts || [q]).forEach(function (p) { checkOne(t, q, p, stepsText); });
    }
    var variety = Object.keys(seen).length;
    if (variety < 10) fail(t, null, "only " + variety + " different questions");
  });
  console.log("Unit " + unit.number + " templates per lesson/level:");
  Object.keys(counts).sort().forEach(function (k) { console.log("  " + k + ": " + counts[k]); });
});

// Parser spot checks
var spot = [
  ["$1,250.50", { type: "money", answer: 1250.5 }, "correct"],
  ["12,50", { type: "money", answer: 12.5 }, "correct"],
  ["12.499", { type: "money", answer: 12.5 }, "correct"],
  ["12.51", { type: "money", answer: 12.5 }, "wrong"],
  ["0.28", { type: "percent", answer: 28 }, "correct"],
  ["28%", { type: "percent", answer: 28 }, "correct"],
  ["0.28%", { type: "percent", answer: 28 }, "wrong"],
  ["abc", { type: "money", answer: 1 }, "unreadable"],
  ["20 scoops", { type: "number", answer: 20 }, "correct"],
  ["x = 15", { type: "number", answer: 15 }, "correct"],
  ["2.5 hours", { type: "number", answer: 2.5 }, "correct"],
  ["18.5km", { type: "number", answer: 18.5 }, "correct"],
  ["2 to 3", { type: "ratio", answer: [2, 3] }, "correct"],
  ["4:6", { type: "ratio", answer: [2, 3] }, "unreadable"],
  ["3:2", { type: "ratio", answer: [2, 3] }, "wrong"],
  ["", { type: "money", answer: 1 }, "unreadable"]
];
spot.forEach(function (s) {
  total++;
  var r = MP.check(s[0], s[1]).status;
  if (r !== s[2]) { failures++; console.log("FAIL parser: '" + s[0] + "' gave " + r + ", expected " + s[2]); }
});

// Calculator evaluator checks
[
  ["6.49 × 2 × 0.85", 11.033], ["12 ÷ 4 + 3", 6], ["2(3+4)", 14], ["-5 + 2", -3], ["0.1+0.2", 0.3],
  ["45.20 × 1.13", 51.076], ["(8 − 2) × 1.13", 6.78], ["Ans × 2", 20, 10], ["3 x 4", 12], ["10/4", 2.5]
].forEach(function (c) {
  total++;
  var v = ctx.window.MP.calc.evaluate(c[0], c[2] === undefined ? null : c[2]);
  if (Math.abs(v - c[1]) > 1e-9) { failures++; console.log("FAIL calc: " + c[0] + " gave " + v); }
});
["5 ÷ 0", "2 +", "(3", "3)", "5 % 2", "", "Ans + 1"].forEach(function (bad) {
  total++;
  try { ctx.window.MP.calc.evaluate(bad, null); failures++; console.log("FAIL calc: '" + bad + "' should be an error"); }
  catch (e) { /* expected */ }
});

console.log((failures ? "❌ " + failures + " failures" : "✅ all passed") + " (" + total + " checks)");
process.exit(failures ? 1 : 0);
