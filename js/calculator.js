/* Built-in calculator for the practice screen.
   - Safe expression evaluator (no eval): + − × ÷, brackets, decimals, Ans
   - Click keys or type; Enter = evaluate
   - Shows a short history so a partner can check the work
   - "Put in my answer" copies the result into the answer box
   No % key on purpose: students use × 0.13, × 0.75 etc. (the lesson key moves). */
window.MP = window.MP || {};

(function (MP) {
  "use strict";

  // ---------- Evaluator ----------
  function tokenize(src, ans) {
    var s = String(src)
      .replace(/[×xX*]/g, "*").replace(/[÷/]/g, "/").replace(/[−–—]/g, "-")
      .replace(/\s+/g, "").replace(/ans/gi, "A");
    var out = [], i = 0;
    while (i < s.length) {
      var c = s[i];
      if (/[0-9.]/.test(c)) {
        var m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
        if (!m) throw new Error("Check the decimal points");
        out.push({ t: "n", v: parseFloat(m[1]) }); i += m[1].length; continue;
      }
      if (c === "A") {
        if (ans === null || ans === undefined) throw new Error("No answer yet for Ans");
        out.push({ t: "n", v: ans }); i++; continue;
      }
      if ("+-*/()".indexOf(c) >= 0) { out.push({ t: c }); i++; continue; }
      if (c === ",") throw new Error("Leave out commas");
      throw new Error("I don't know the key “" + c + "”");
    }
    // implied multiplication: 2(3), (2)(3), 2Ans, )4
    var res = [];
    out.forEach(function (tk, k) {
      var prev = res[res.length - 1];
      if (prev && (prev.t === "n" || prev.t === ")") && (tk.t === "(" || (tk.t === "n" && prev.t === ")"))) res.push({ t: "*" });
      if (prev && prev.t === "n" && tk.t === "n" && k > 0) res.push({ t: "*" });
      res.push(tk);
    });
    return res;
  }

  function evaluate(src, ans) {
    var toks = tokenize(src, ans), pos = 0;
    if (!toks.length) throw new Error("Type a calculation");
    function peek() { return toks[pos] && toks[pos].t; }
    function expr() {
      var v = term();
      while (peek() === "+" || peek() === "-") { var op = toks[pos++].t, r = term(); v = op === "+" ? v + r : v - r; }
      return v;
    }
    function term() {
      var v = unary();
      while (peek() === "*" || peek() === "/") {
        var op = toks[pos++].t, r = unary();
        if (op === "/" && r === 0) throw new Error("You can't divide by 0");
        v = op === "*" ? v * r : v / r;
      }
      return v;
    }
    function unary() {
      if (peek() === "-") { pos++; return -unary(); }
      if (peek() === "+") { pos++; return unary(); }
      return atom();
    }
    function atom() {
      var tk = toks[pos];
      if (!tk) throw new Error("Something is missing at the end");
      if (tk.t === "n") { pos++; return tk.v; }
      if (tk.t === "(") {
        pos++; var v = expr();
        if (peek() !== ")") throw new Error("A bracket is missing");
        pos++; return v;
      }
      throw new Error("Two signs in a row?");
    }
    var v = expr();
    if (pos < toks.length) throw new Error(toks[pos].t === ")" ? "Too many closing brackets" : "Check your calculation");
    // clean float junk like 0.1 + 0.2 = 0.30000000000000004
    return Number(v.toPrecision(12));
  }

  function show(v) {
    if (Math.abs(v) >= 1e12) return v.toExponential(6);
    return MP.F ? MP.F.num(v, 10) : String(v);
  }

  // ---------- UI ----------
  var KEYS = [
    ["C", "clear", "fn"], ["(", "(", "op"], [")", ")", "op"], ["÷", "÷", "op"],
    ["7", "7"], ["8", "8"], ["9", "9"], ["×", "×", "op"],
    ["4", "4"], ["5", "5"], ["6", "6"], ["−", "−", "op"],
    ["1", "1"], ["2", "2"], ["3", "3"], ["+", "+", "op"],
    ["0", "0"], [".", "."], ["⌫", "back", "fn"], ["=", "eq", "eq"]
  ];

  function mount(opts) {
    var host = opts.host, toggle = opts.toggle, answerBox = opts.answerBox, layout = opts.layout;
    var lastAns = null, justEvaluated = false;
    var hist = [];

    var el = document.createElement("aside");
    el.className = "calc card";
    el.id = "calc";
    el.setAttribute("aria-label", "Calculator");
    el.hidden = true;
    el.innerHTML =
      "<div class='calc-head'><b>🧮 Calculator</b><button type='button' class='calc-x' aria-label='Close calculator'>✕</button></div>" +
      "<ol class='calc-hist' aria-label='Recent calculations'></ol>" +
      "<input class='calc-in' aria-label='Calculation' autocomplete='off' spellcheck='false' placeholder='e.g. 6.49 × 2 × 0.85'>" +
      "<div class='calc-out' aria-live='polite'></div>" +
      "<div class='calc-keys'></div>" +
      "<div class='calc-row'><button type='button' class='ck fn' data-k='ans' title='Use the last answer'>Ans</button>" +
      "<button type='button' class='btn primary calc-use'>Put in my answer ↵</button></div>";
    host.appendChild(el);

    var input = el.querySelector(".calc-in"), out = el.querySelector(".calc-out"), histBox = el.querySelector(".calc-hist");
    var keys = el.querySelector(".calc-keys");
    KEYS.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ck" + (k[2] ? " " + k[2] : "");
      b.textContent = k[0];
      b.dataset.k = k[1];
      if (k[1] === "back") b.setAttribute("aria-label", "Backspace");
      if (k[1] === "clear") b.setAttribute("aria-label", "Clear");
      keys.appendChild(b);
    });

    function preview() {
      var s = input.value.trim();
      out.className = "calc-out";
      if (!s) { out.textContent = ""; return; }
      try { out.textContent = "= " + show(evaluate(s, lastAns)); }
      catch (e) { out.textContent = ""; }
    }

    function insert(text) {
      var a = input.selectionStart, b = input.selectionEnd, v = input.value;
      if (document.activeElement !== input || a === null) { a = b = v.length; }
      input.value = v.slice(0, a) + text + v.slice(b);
      var p = a + text.length;
      try { input.setSelectionRange(p, p); } catch (e) { /* ignore */ }
    }

    function equals() {
      var s = input.value.trim();
      if (!s) return;
      try {
        var v = evaluate(s, lastAns);
        hist.push(s + " = " + show(v));
        if (hist.length > 4) hist.shift();
        histBox.innerHTML = "";
        hist.forEach(function (h) { var li = document.createElement("li"); li.textContent = h; histBox.appendChild(li); });
        lastAns = v;
        input.value = show(v);
        out.textContent = "";
        justEvaluated = true;
      } catch (e) {
        out.className = "calc-out err";
        out.textContent = e.message;
      }
    }

    function press(k) {
      if (k === "clear") { input.value = ""; out.textContent = ""; justEvaluated = false; return; }
      if (k === "back") {
        var a = input.selectionStart, b = input.selectionEnd, v = input.value;
        if (document.activeElement !== input || a === null) { a = b = v.length; }
        if (a === b && a > 0) a--;
        input.value = v.slice(0, a) + v.slice(b);
        try { input.setSelectionRange(a, a); } catch (e) { /* ignore */ }
        justEvaluated = false; preview(); return;
      }
      if (k === "eq") { equals(); return; }
      if (k === "ans") k = "Ans";
      // after "=", a number starts a new calculation; an operator carries on from the answer
      if (justEvaluated && /^[0-9.(A]/.test(k)) input.value = "";
      justEvaluated = false;
      insert(k);
      preview();
    }

    // keep focus where it was so touchscreens don't pop up the on-screen keyboard
    el.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".ck")) e.preventDefault();
    });
    el.addEventListener("click", function (e) {
      var b = e.target.closest(".ck");
      if (b) press(b.dataset.k);
    });
    input.addEventListener("input", function () { justEvaluated = false; preview(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); toggle.focus(); }
    });

    el.querySelector(".calc-use").onclick = function () {
      var s = input.value.trim(), v = null;
      try { v = evaluate(s, lastAns); } catch (e) { v = lastAns; }
      if (v === null || answerBox.disabled) return;
      answerBox.value = show(v);
      answerBox.focus();
    };

    function setOpen(open) {
      el.hidden = !open;
      toggle.setAttribute("aria-pressed", open ? "true" : "false");
      toggle.classList.toggle("on", open);
      if (layout) layout.classList.toggle("with-calc", open);
      try { sessionStorage.setItem("mp_calc_open", open ? "1" : "0"); } catch (e) { /* ignore */ }
      if (open && window.matchMedia("(min-width: 900px)").matches) input.focus();
    }
    toggle.onclick = function () { setOpen(el.hidden); };
    el.querySelector(".calc-x").onclick = function () { setOpen(false); toggle.focus(); };

    var remembered = "";
    try { remembered = sessionStorage.getItem("mp_calc_open"); } catch (e) { /* ignore */ }
    if (remembered === "1") setOpen(true);

    return { open: function () { setOpen(true); }, close: function () { setOpen(false); } };
  }

  MP.calc = { evaluate: evaluate, mount: mount };
})(window.MP);
