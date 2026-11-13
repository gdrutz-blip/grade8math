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
      var out = p.join(".");
      return out === "-0" ? "0" : out.replace(/^-/, "−");
    },
    pct: function (x) { return F.num(x, 2) + "%"; },
    // integer in brackets when negative, for expressions: (−5)
    br: function (x) { return x < 0 ? "(" + F.num(x) + ")" : F.num(x); },
    // superscript digits for exponents: 10⁻⁴
    sup: function (n) {
      return String(n).replace(/-|−/g, "⁻").replace(/\d/g, function (d) { return "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]; });
    },
    // scientific notation: 5.4 × 10⁶
    sci: function (a, e) { return F.num(a, 6) + " × 10" + F.sup(e); },
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
    s = s.replace(/^[a-z]{0,3}\s*=\s*/, "").replace(/\s*(?:[a-z°µ²³]+\.?\s*)+$/, function (m) { return /dollar|percent|cent/.test(m) ? m : ""; });
    s = s.replace(/^=/, "")
      .replace(/dollars?|percent|per\s*cent|\$|%|\s/g, "")
      .replace(/[−–]/g, "-")
      .replace(/^\((.*)\)$/, "$1");
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

  // ---------- Fractions ----------
  // A fraction is { n, d } with d > 0, always stored in lowest terms.
  function fr(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }
  function plain(n) { return (n < 0 ? "−" : "") + Math.abs(n); }   // no thousands commas inside fractions
  var Fr = {
    make: fr,
    mixed: function (w, n, d) { return fr(w * d + (w < 0 ? -n : n), d); },     // 2 1/3 → 7/3
    add: function (a, b) { return fr(a.n * b.d + b.n * a.d, a.d * b.d); },
    sub: function (a, b) { return fr(a.n * b.d - b.n * a.d, a.d * b.d); },
    mul: function (a, b) { return fr(a.n * b.n, a.d * b.d); },
    div: function (a, b) { return fr(a.n * b.d, a.d * b.n); },
    val: function (a) { return a.n / a.d; },
    eq: function (a, b) { return a.n * b.d === b.n * a.d; },
    // "7/4" (improper form; "3" for whole numbers)
    imp: function (a) { return a.d === 1 ? F.num(a.n) : plain(a.n) + "/" + a.d; },
    // "1 3/4" (mixed form when bigger than 1)
    text: function (a) {
      if (a.d === 1) return F.num(a.n);
      var neg = a.n < 0, n = Math.abs(a.n), w = Math.floor(n / a.d), r = n % a.d;
      return (neg ? "−" : "") + (w ? w + " " : "") + r + "/" + a.d;
    },
    // both forms when they differ: "7/4 = 1 3/4"
    both: function (a) { return Math.abs(a.n) > a.d && a.d !== 1 ? Fr.imp(a) + " = " + Fr.text(a) : Fr.text(a); }
  };

  // "3/4", "-3/4", "2 1/3", "−2 1/3", "5", "0.75" → { n, d, raw: {n, d} as typed, decimal }
  function parseFraction(raw) {
    var s = String(raw || "").trim().replace(/[−–]/g, "-").replace(/^\((.*)\)$/, "$1").replace(/\s+/g, " ").replace(/(\d),(\d{3})/g, "$1$2");
    s = s.replace(/^[a-z]{0,3}\s*=\s*/i, "").replace(/\s*[a-z][a-z\s.²]*$/i, "");
    var m;
    if ((m = s.match(/^(-?)(\d+) (\d+)\s*\/\s*(\d+)$/))) {          // mixed number
      var w = +m[2], n = +m[3], d = +m[4];
      if (!d) return null;
      var sign = m[1] ? -1 : 1;
      return { n: sign * (w * d + n), d: d, typedN: n, typedD: d, mixed: true };
    }
    if ((m = s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/))) {                // a/b
      if (!+m[2]) return null;
      var nn = +m[1], dd = +m[2];
      if (dd < 0) { nn = -nn; dd = -dd; }
      return { n: nn, d: dd, typedN: Math.abs(nn), typedD: dd };
    }
    var p = parseNumber(s);
    if (p) {
      var str = String(p.value), dec = (str.split(".")[1] || "").length;
      var den = Math.pow(10, dec);
      return { n: Math.round(p.value * den), d: den, decimal: dec > 0, typedN: Math.round(Math.abs(p.value) * den), typedD: dec ? den : 1 };
    }
    return null;
  }

  // "5.4 x 10^6", "5.4×10⁶", "5.4*10^-3", "5.4e6", "5.4 x 10 6" → { a, e }
  function parseSci(raw) {
    var s = String(raw || "").trim().toLowerCase()
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, function (c) { return c === "⁻" ? "^-" : "^" + "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c); })
      .replace(/\^-?\^/g, function (m) { return m.indexOf("-") >= 0 ? "^-" : "^"; })
      .replace(/[−–]/g, "-").replace(/\s+/g, " ");
    s = s.replace(/\^(-?)\^?/g, "^$1").replace(/(\^-?\d)\^(\d)/g, "$1$2").replace(/(\^-?\d+)\^(\d)/g, "$1$2");
    var m = s.match(/^(-?\d*\.?\d+)\s*(?:x|×|\*|·)\s*10\s*(?:\^|\*\*)?\s*\(?\s*(-?\d+)\s*\)?$/) ||
            s.match(/^(-?\d*\.?\d+)\s*e\s*(-?\d+)$/);
    if (m) return { a: parseFloat(m[1]), e: parseInt(m[2], 10), sci: true };
    var p = parseNumber(s);
    return p ? { value: p.value, sci: false } : null;
  }

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
        if (baseCheck(raw, { type: q.type, answer: m.answer, dp: q.dp, tol: q.tol, options: q.options }).status === "correct") {
          res.message = m.message;
          res.mistake = true;
          break;
        }
      }
    }
    return res;
  }

  function norm(s) { return String(s).toLowerCase().replace(/[−–]/g, "-").replace(/\s+/g, " ").trim(); }

  function baseCheck(raw, q) {
    if (q.type === "fraction") {
      var f = parseFraction(raw), want = q.answer;
      if (!f) return { status: "unreadable", message: "Write a fraction like 3/4, a mixed number like 1 3/4, or a whole number." };
      var got = fr(f.n, f.d);
      if (!Fr.eq(got, want)) return { status: "wrong" };
      if (f.decimal) return { status: "correct", note: "On a test, write it as a fraction: " + Fr.both(want) + "." };
      // lowest terms: the fraction part as typed must not simplify
      if (gcd(f.mixed ? f.typedN : f.typedN, f.typedD) > 1 && f.typedD > 1) {
        return { status: "unreadable", message: "That's the right amount, but not in lowest terms. Divide the top and bottom by the same number." };
      }
      if (f.mixed && f.typedN >= f.typedD) {
        return { status: "unreadable", message: "Right amount! In a mixed number the fraction part should be less than 1 — take out another whole." };
      }
      return { status: "correct" };
    }

    if (q.type === "sci") {
      var sc = parseSci(raw), a = q.answer.a, e = q.answer.e, wantV = a * Math.pow(10, e);
      if (!sc) return { status: "unreadable", message: "Write it like 3.2 x 10^5 (use ^ for the exponent, and a minus sign for small numbers: 3.2 x 10^-5)." };
      var gotV = sc.sci ? sc.a * Math.pow(10, sc.e) : sc.value;
      var same = Math.abs(gotV - wantV) <= Math.abs(wantV) * 1e-9;
      if (!same) {
        if (sc.sci && Math.abs(sc.a - a) < 1e-9 && sc.e === -e && e !== 0) {
          return { status: "wrong", message: "Check the sign of the exponent: big numbers have a positive exponent, small decimals a negative one." };
        }
        return { status: "wrong" };
      }
      if (!sc.sci) return { status: "unreadable", message: "That's the right value. Now write it in scientific notation, like 3.2 x 10^5." };
      if (Math.abs(sc.a) < 1 || Math.abs(sc.a) >= 10) {
        return { status: "unreadable", message: "Right value, but not proper form: the front number must be at least 1 and less than 10." };
      }
      return { status: "correct" };
    }

    if (q.type === "choice") {
      var t = norm(raw);
      var hit = q.options.filter(function (o) { return norm(o) === t; })[0];
      if (!hit) return { status: "unreadable", message: "Pick one: " + q.options.join(", ") + "." };
      return { status: norm(hit) === norm(q.answer) ? "correct" : "wrong" };
    }

    if (q.type === "order") {
      var letters = String(raw || "").toUpperCase().replace(/[^A-Z]/g, "").split("");
      var want2 = q.answer;
      var okLetters = letters.length === want2.length && want2.every(function (L) { return letters.indexOf(L) >= 0; });
      if (!okLetters) return { status: "unreadable", message: "Type the letters in order, like " + want2.slice().sort().join(", ") + " (use each letter once)." };
      if (letters.join("") === want2.join("")) return { status: "correct" };
      if (letters.join("") === want2.slice().reverse().join("")) return { status: "wrong", message: "That's greatest to least. The question asks for least to greatest." };
      return { status: "wrong" };
    }

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
    // estimates: the marking guide accepts within q.tol (e.g. 0.1) of the best answer
    if (q.tol && Math.abs(v - ans) <= q.tol + 1e-9) {
      return { status: "correct", note: "Close enough for an estimate. The closest tenth is " + F.num(ans, ndp) + " — square both to check." };
    }
    return { status: "wrong" };
  }

  function example(q) {
    if (q.type === "money") return "12.50 or $12.50";
    if (q.type === "ratio") return "2:3";
    if (q.type === "fraction") return "3/4 or 1 1/2";
    if (q.type === "sci") return "3.2 x 10^5";
    if (q.type === "percent") return "28 or 28%";
    return "36";
  }

  // Text shown for the correct answer
  function answerText(q) {
    if (q.answerText) return q.answerText;
    if (q.parts) return q.parts.map(function (p) { return p.label + ": " + answerText(p); }).join(", ");
    if (q.type === "ratio") return q.answer.join(":");
    if (q.type === "fraction") return Fr.both(q.answer) + (q.unit ? " " + q.unit : "");
    if (q.type === "sci") return F.sci(q.answer.a, q.answer.e) + (q.unit ? " " + q.unit : "");
    if (q.type === "choice") return q.answer;
    if (q.type === "order") return q.answer.join(", ");
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
  // Write a bare "<" (as in "36 < 40") as &lt; in a question's text and steps, leaving HTML tags alone.
  MP.safeLT = function (q) {
    function fix(t) { return typeof t === "string" ? t.replace(/<(?=[\s\d=√−\-<(])/g, "&lt;") : t; }
    q.text = fix(q.text);
    if (q.steps) q.steps = q.steps.map(fix);
    return q;
  };
  MP.check = check;
  MP.Fr = Fr;
  MP.parseFraction = parseFraction;
  MP.parseSci = parseSci;
  MP.parseRatio = parseRatio;
  MP.gcd = gcd;
  MP.answerText = answerText;
})(window.MP);
