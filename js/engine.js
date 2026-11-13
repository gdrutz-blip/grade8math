/* Core helpers shared by every unit: random numbers, formatting, answer checking.
   Plain script (no modules) so it works on GitHub Pages and from a local file. */
window.MP = window.MP || {};

(function (MP) {
  "use strict";

  // ---------- Rounding ----------
  // toFixed(6) first removes floating-point fuzz (e.g. 1.005*100 = 100.49999...).
  function roundTo(x, dp) {
    var f = Math.pow(10, dp);
    return Math.round(Number((x * f).toFixed(6))) / f;
  }

  // ---------- Random helpers ----------
  var R = {
    int: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    // a random value from a to b in steps of s, e.g. step(4, 9, 0.25)
    step: function (a, b, s) {
      var n = Math.round((b - a) / s);
      return roundTo(a + s * R.int(0, n), 6);
    },
    // two different picks
    pickTwo: function (arr) {
      var a = R.pick(arr), b;
      do { b = R.pick(arr); } while (b === a && arr.length > 1);
      return [a, b];
    },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  };

  // ---------- Formatting ----------
  function commas(intStr) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  var F = {
    roundTo: roundTo,
    // $12.50
    money: function (x) {
      var neg = x < 0;
      var parts = Math.abs(roundTo(x, 2)).toFixed(2).split(".");
      return (neg ? "−" : "") + "$" + commas(parts[0]) + "." + parts[1];
    },
    // For worked steps: exact cents if it is exact, otherwise up to 4 decimals
    // so students see that we keep the extra digits and round at the end.
    moneyRaw: function (x) {
      if (Math.abs(roundTo(x, 2) - roundTo(x, 6)) < 1e-9) return F.money(x);
      return "$" + F.num(x, 4);
    },
    // 12.5, 3, 0.125 — trims trailing zeros
    num: function (x, dp) {
      if (dp === undefined) dp = 4;
      var s = roundTo(x, dp).toFixed(dp);
      if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
      var p = s.split(".");
      p[0] = p[0].replace(/^(-?)(\d+)$/, function (m, sign, d) { return sign + commas(d); });
      return p.join(".");
    },
    pct: function (x) { return F.num(x, 2) + "%"; },
    // 0.85 from 15 (% off) etc.
    dec: function (pct) { return F.num(pct / 100, 4); }
  };

  // ---------- Answer parsing ----------
  // Accepts: "12.50", "$12.50", "12.5 dollars", "1,250", "45%", " = 36 "
  function parseNumber(raw) {
    if (raw === null || raw === undefined) return null;
    var s = String(raw).trim().toLowerCase();
    if (!s) return null;
    var hadPercent = /%|percent/.test(s);
    var hadDollar = /\$|dollar/.test(s);
    // drop "x =" in front and unit words after (20 scoops, 2.5 hours, 18.5 km)
    s = s.replace(/^[a-z]{0,3}\s*=\s*/, "").replace(/\s*(?:[a-z]+\.?\s*)+$/, function (m) { return /dollar|percent|cent/.test(m) ? m : ""; });
    s = s.replace(/^=/, "")
      .replace(/dollars?|percent|per\s*cent|\$|%|\s/g, "")
      .replace(/−/g, "-");
    // commas as thousands separators only (1,250.50)
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
    // a lone comma used as a decimal point (12,50)
    else if (/^-?\d+,\d{1,2}$/.test(s)) s = s.replace(",", ".");
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    return { value: parseFloat(s), hadPercent: hadPercent, hadDollar: hadDollar };
  }

  // "2:3", "2 : 3", "2 to 3", "2/3", "2:3:5" -> [2, 3] / [2, 3, 5]
  function parseRatio(raw) {
    var s = String(raw || "").trim().toLowerCase();
    if (!s) return null;
    var bits = s.split(/\s*(?::|\bto\b|\/)\s*/);
    if (bits.length < 2) return null;
    var nums = bits.map(function (b) { var p = parseNumber(b); return p ? p.value : NaN; });
    return nums.some(isNaN) ? null : nums;
  }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }

  // Returns { status: "correct" | "wrong" | "unreadable", message }
  // q.type: "money" | "percent" | "number" | "ratio"
  // "unreadable" never uses up a try.
  // q.mistakes: [{ answer, message }] — common wrong answers (from the marking guide)
  // get a message that names the mistake instead of a plain "not quite".
  function check(raw, q) {
    var res = baseCheck(raw, q);
    if (res.status === "wrong" && q.mistakes) {
      for (var i = 0; i < q.mistakes.length; i++) {
        var m = q.mistakes[i];
        if (baseCheck(raw, { type: q.type, answer: m.answer, dp: q.dp }).status === "correct") {
          res.message = m.message;
          res.mistake = true;
          break;
        }
      }
    }
    return res;
  }

  function baseCheck(raw, q) {
    if (q.type === "ratio") {
      var got = parseRatio(raw), want = q.answer;
      if (!got || got.length !== want.length) {
        return { status: "unreadable", message: "Write the ratio with a colon, like " + want.map(function (_, i) { return i + 2; }).join(":") + "." };
      }
      var same = got.every(function (g, i) { return Math.abs(g - want[i]) < 1e-9; });
      if (same) return { status: "correct" };
      var equiv = got.every(function (g, i) { return Math.abs(g * want[0] - want[i] * got[0]) < 1e-9; }) && got[0] !== 0;
      if (equiv) return { status: "unreadable", message: "That ratio is equivalent, but not in simplest form. Divide every part by the same number." };
      return { status: "wrong" };
    }
    var p = parseNumber(raw);
    if (!p) {
      return { status: "unreadable", message: "I couldn't read that as a number. Try something like " + example(q) + "." };
    }
    var v = p.value, ans = q.answer;

    if (q.type === "money") {
      if (Math.abs(roundTo(v, 2) - roundTo(ans, 2)) < 1e-9) {
        // the test wants money to the cent: $50.80, not $50.8
        if (/\.\d(?!\d)/.test(String(raw))) {
          return { status: "correct", note: "On a test, write money to the cent: " + F.money(ans) + ", not " + String(raw).trim() + "." };
        }
        return { status: "correct" };
      }
      if (Math.abs(v - ans) <= 0.021) {
        return { status: "wrong", message: "So close! Check your rounding — keep all the digits and round to the nearest cent at the very end." };
      }
      return { status: "wrong" };
    }

    if (q.type === "percent") {
      var dp = q.dp === undefined ? 1 : q.dp;
      if (Math.abs(roundTo(v, dp) - roundTo(ans, dp)) < 1e-9) return { status: "correct" };
      // decimal form, e.g. 0.28 for 28%
      if (!p.hadPercent && Math.abs(v) < 1 && Math.abs(roundTo(v * 100, dp) - roundTo(ans, dp)) < 1e-9) return { status: "correct" };
      return { status: "wrong" };
    }

    // plain number
    var ndp = q.dp === undefined ? 2 : q.dp;
    if (Math.abs(roundTo(v, ndp) - roundTo(ans, ndp)) < 1e-9) return { status: "correct" };
    return { status: "wrong" };
  }

  function example(q) {
    if (q.type === "money") return "12.50 or $12.50";
    if (q.type === "ratio") return "2:3";
    if (q.type === "percent") return "28 or 28%";
    return "36";
  }

  // Text shown for the correct answer
  function answerText(q) {
    if (q.answerText) return q.answerText;
    if (q.parts) return q.parts.map(function (p) { return p.label + ": " + answerText(p); }).join(", ");
    if (q.type === "ratio") return q.answer.join(":");
    if (q.type === "money") return F.money(q.answer);
    if (q.type === "percent") return F.pct(q.answer);
    return F.num(q.answer, q.dp === undefined ? 2 : q.dp) + (q.unit ? " " + q.unit : "");
  }

  // ---------- Unit registry ----------
  MP.units = MP.units || {};
  MP.registerUnit = function (unit) { MP.units[unit.id] = unit; };

  // Lessons in a unit that have at least one template (optionally at a level)
  MP.availableLessons = function (unit, level) {
    return unit.lessons.filter(function (L) {
      return unit.templates.some(function (t) { return t.lesson === L.id && (!level || t.level === level); });
    });
  };

  MP.LEVELS = [
    { id: "mild", label: "Mild", icon: "🌶️", blurb: "Friendly numbers, one step" },
    { id: "medium", label: "Medium", icon: "🌶️🌶️", blurb: "Awkward numbers or two steps" },
    { id: "spicy", label: "Spicy", icon: "🌶️🌶️🌶️", blurb: "Work backwards or multi-step" }
  ];

  MP.R = R;
  MP.F = F;
  MP.parseNumber = parseNumber;
  MP.check = check;
  MP.parseRatio = parseRatio;
  MP.gcd = gcd;
  MP.answerText = answerText;
})(window.MP);
