/* UNIT 1 — Number Systems
   Story: Roz runs a base on the Moon (as in the class materials).
   Same template shape as units/unit3.js; see the comment at the top of that file.
   Extra answer types used here: "choice" (buttons), "order" (letters), "sci" ({a, e}). */
(function (MP) {
  "use strict";
  var R = MP.R, F = MP.F;

  // ---------- Story pieces ----------
  var CREW = ["Isaac", "Greta", "Pablo", "Wren", "Anwar", "Dev", "Tamsin", "Odalys", "Bram", "Zara",
    "Jordan", "Priya", "Nadia", "Leo", "Amara", "Kofi", "Orla", "Kaito", "Mina", "Theo"];
  var PLACES = ["garden bay", "solar field", "landing pad", "greenhouse floor", "storage room", "dome floor", "rover garage"];

  function c(x, dp) { return F.num(x, dp === undefined ? 4 : dp); }
  function sq(n) { return n * n; }
  function isSq(n) { var r = Math.round(Math.sqrt(n)); return r * r === n; }
  function until(make, ok) { for (var i = 0; i < 500; i++) { var v = make(); if (ok(v)) return v; } return make(); }
  function nonSquare(a, b) { return until(function () { return R.int(a, b); }, function (n) { return !isSq(n); }); }
  function sup(n) { return F.sup(n); }

  // Estimating √N the class way: boundaries, first guess, check by squaring
  function est(N) {
    var lo = Math.floor(Math.sqrt(N)), hi = lo + 1, d = N - lo * lo, gap = hi * hi - lo * lo;
    var guess = F.roundTo(lo + d / gap, 1);
    if (guess >= hi) guess = F.roundTo(hi - 0.1, 1);
    var t0 = Math.floor(Math.sqrt(N) * 10) / 10, t1 = F.roundTo(t0 + 0.1, 1);
    t0 = F.roundTo(t0, 1);
    var best = Math.abs(t0 * t0 - N) <= Math.abs(t1 * t1 - N) ? t0 : t1;
    return { lo: lo, hi: hi, d: d, gap: gap, guess: guess, t0: t0, t1: t1, best: best };
  }
  // "(63 × 63 = 3969, 64 × 64 = 4096)" hint for squaring tenths without a calculator
  function hint(e) {
    var a = Math.round(e.t0 * 10), b = Math.round(e.t1 * 10);
    return " <span class='note'>(" + a + " × " + a + " = " + a * a + ", " + b + " × " + b + " = " + b * b + ")</span>";
  }
  function estSteps(N, e) {
    return [
      "<b>Boundaries:</b> " + sq(e.lo) + " < " + N + " < " + sq(e.hi) + ", so √" + N + " is between " + e.lo + " and " + e.hi + ".",
      "<b>First guess:</b> " + N + " is " + e.d + " above " + sq(e.lo) + "; the gap is " + e.gap + ". " + e.d + " ÷ " + e.gap + " ≈ " +
        c(e.d / e.gap, 2) + ", so about " + c(e.guess, 1) + ".",
      "<b>Check:</b> " + c(e.t0, 1) + "² = " + c(e.t0 * e.t0, 2) + " and " + c(e.t1, 1) + "² = " + c(e.t1 * e.t1, 2) + ". " +
        N + " is closer to " + c(e.best * e.best, 2) + ", so √" + N + " ≈ <b>" + c(e.best, 1) + "</b>"
    ];
  }

  // Scientific notation helpers: value → { a, e } with 1 ≤ a < 10
  function toSci(v) {
    var e = Math.floor(Math.log10(Math.abs(v)) + 1e-12);
    var a = F.roundTo(v / Math.pow(10, e), 6);
    if (a >= 10) { a = F.roundTo(a / 10, 6); e++; }
    return { a: a, e: e };
  }
  function sciVal(s) { return s.a * Math.pow(10, s.e); }
  function sci(s) { return F.sci(s.a, s.e); }
  function std(v) { return F.num(v, 12); }   // plain number, no rounding

  function orderQ(items) {
    // items: [{ text, value }] → letters A, B, C… in the shown order; answer is the sorted letters
    var L = "ABCDE";
    items.forEach(function (it, i) { it.label = L[i]; });
    var sorted = items.slice().sort(function (a, b) { return a.value - b.value; });
    return {
      list: items.map(function (it) { return "<b>" + it.label + ":</b> " + it.text; }).join("&nbsp;&nbsp;&nbsp; "),
      answer: sorted.map(function (it) { return it.label; }),
      sorted: sorted
    };
  }

  // ---------- Lessons ----------
  var lessons = [
    { id: "L1", n: 1, title: "Square roots",
      keyMove: "Squaring undoes a square root: 8² = 64, so √64 = 8. Not a perfect square? Find the <b>perfect squares on each side</b>." },
    { id: "L2", n: 2, title: "Rational vs irrational",
      keyMove: "Rational = can be written as a fraction: decimals that <b>stop or repeat</b>. A perfect square under the root is rational; any other root (and π) is <b>irrational</b>." },
    { id: "L3", n: 3, title: "Estimating square roots",
      keyMove: "<b>Boundaries</b> (perfect squares on each side), <b>first guess</b> (distance ÷ gap), then <b>check by squaring</b>." },
    { id: "L4", n: 4, title: "Powers of ten",
      keyMove: "× 10, 100, 1000: digits move <b>left</b> 1, 2, 3 places. ÷ 10, 100, 1000 (or × 0.1, 0.01, 0.001): digits move <b>right</b>." },
    { id: "L5", n: 5, title: "Scientific notation: large numbers",
      keyMove: "a × 10ⁿ with <b>1 ≤ a < 10</b> (one non-zero digit before the decimal). Compare <b>exponents first</b>." },
    { id: "L6", n: 6, title: "Scientific notation: small numbers",
      keyMove: "A negative exponent means <b>small, not negative</b>. The more negative the exponent, the smaller the number." },
    { id: "L7", n: 7, title: "The real number line",
      keyMove: "Put every number in the <b>same form</b> (a decimal), then compare. To compare a root, <b>square both</b>." }
  ];

  var templates = [];
  function add(id, lesson, level, generate) {
    templates.push({ id: id, lesson: lesson, level: level, generate: function () { return MP.safeLT(generate()); } });
  }
  var LTGT = ["<", ">", "="];

  // =====================================================================
  // L1 — Square roots
  // =====================================================================
  add("U1L1-mild-square", "L1", "mild", function () {
    var n = R.int(2, 15);
    return {
      text: "Find <b>" + n + "²</b>.",
      answer: n * n, type: "number",
      steps: [n + "² means " + n + " × " + n + " (not " + n + " × 2).", n + " × " + n + " = <b>" + c(n * n) + "</b>"],
      mistakes: [{ answer: 2 * n, message: "Squaring is not doubling: " + n + "² = " + n + " × " + n + "." }]
    };
  });

  add("U1L1-mild-root", "L1", "mild", function () {
    var big = R.int(0, 2) === 0, n = big ? R.int(2, 9) * 10 : R.int(1, 15);
    return {
      text: "Find <b>√" + c(n * n) + "</b>.",
      answer: n, type: "number",
      steps: big ? [
        "Zeros pattern: " + n / 10 + " × " + n / 10 + " = " + sq(n / 10) + ", so " + n + " × " + n + " = " + c(n * n) + ".",
        "So √" + c(n * n) + " = <b>" + n + "</b>"
      ] : ["Which number times itself makes " + n * n + "?", n + " × " + n + " = " + n * n + ", so √" + n * n + " = <b>" + n + "</b>"],
      mistakes: n * n % 2 === 0 ? [{ answer: n * n / 2, message: "A square root is not half. Which number times itself makes " + c(n * n) + "?" }] : []
    };
  });

  add("U1L1-mild-between", "L1", "mild", function () {
    var N = nonSquare(5, 200), lo = Math.floor(Math.sqrt(N));
    return {
      text: "<b>√" + N + "</b> sits between which two whole numbers?",
      parts: [{ label: "Lower", answer: lo, type: "number" }, { label: "Upper", answer: lo + 1, type: "number" }],
      steps: [
        "Find the perfect squares just below and just above " + N + ": " + sq(lo) + " and " + sq(lo + 1) + ".",
        sq(lo) + " < " + N + " < " + sq(lo + 1) + ", so √" + N + " is between <b>" + lo + "</b> and <b>" + (lo + 1) + "</b>."
      ]
    };
  });

  add("U1L1-mild-side", "L1", "mild", function () {
    var s = R.int(4, 15), place = R.pick(PLACES);
    return {
      text: "Roz's square " + place + " has an area of <b>" + s * s + " m²</b>. What is its side length?",
      answer: s, type: "number", unit: "m",
      steps: ["Area of a square = side × side, so side = √area.", "√" + s * s + " = <b>" + s + "</b> m, because " + s + " × " + s + " = " + s * s + "."],
      mistakes: [{ answer: s * s / 4, message: "Dividing by 4 finds the side from the PERIMETER. From the area, take the square root." }]
    };
  });

  add("U1L1-med-perim-area", "L1", "medium", function () {
    var s = R.int(5, 15), place = R.pick(PLACES);
    return {
      text: "A square " + place + " on the Moon base has a perimeter of <b>" + 4 * s + " m</b>. What is its area?",
      answer: s * s, type: "number", unit: "m²",
      steps: ["Perimeter = 4 × side, so side = " + 4 * s + " ÷ 4 = " + s + " m.", "Area = side² = " + s + "² = <b>" + s * s + "</b> m²"],
      mistakes: [{ answer: 4 * s * 4 * s, message: "Find the side first (perimeter ÷ 4), then square it." }]
    };
  });

  add("U1L1-med-area-perim", "L1", "medium", function () {
    var s = R.int(6, 15), thing = R.pick(["tile", "window", "solar panel", "hatch"]);
    return {
      text: "A square " + thing + " has an area of <b>" + s * s + " cm²</b>. What is its perimeter?",
      answer: 4 * s, type: "number", unit: "cm",
      steps: ["Side = √" + s * s + " = " + s + " cm.", "Perimeter = 4 × " + s + " = <b>" + 4 * s + "</b> cm"],
      mistakes: [{ answer: s, message: "That's the side length. The perimeter goes all the way around: 4 sides." }]
    };
  });

  add("U1L1-med-closer", "L1", "medium", function () {
    var N = until(function () { return nonSquare(10, 200); }, function (n) {
      var lo = Math.floor(Math.sqrt(n)); return n - lo * lo !== (lo + 1) * (lo + 1) - n;
    });
    var lo = Math.floor(Math.sqrt(N)), hi = lo + 1, dl = N - lo * lo, dh = hi * hi - N, ans = dl < dh ? lo : hi;
    return {
      text: "Is <b>√" + N + "</b> closer to " + lo + " or to " + hi + "?",
      answer: String(ans), type: "choice", options: [String(lo), String(hi)], maxTries: 1,
      steps: [
        sq(lo) + " < " + N + " < " + sq(hi) + ".",
        N + " is " + dl + " from " + sq(lo) + " but " + dh + " from " + sq(hi) + ".",
        "So √" + N + " is closer to <b>" + ans + "</b>."
      ]
    };
  });

  add("U1L1-med-mistake", "L1", "medium", function () {
    var who = R.pick(CREW), s = R.int(5, 15);
    return {
      text: who + " says: “" + s + "² = " + 2 * s + ", so a square with a side of " + s + " m has an area of " + 2 * s + " m².” " +
        "<b>Find the mistake.</b> What is the correct area?",
      answer: s * s, type: "number", unit: "m²",
      steps: ["<b>The mistake:</b> " + who + " doubled " + s + ". Squaring is not doubling.", s + "² = " + s + " × " + s + " = <b>" + s * s + "</b> m²"],
      mistakes: [{ answer: 2 * s, message: "That's " + who + "'s answer. Squaring means times itself." }]
    };
  });

  add("U1L1-spicy-deck", "L1", "spicy", function () {
    var s = R.int(3, 15), P = 4 * s, big = 2 * s, tank = R.pick(["water tank", "oxygen tank", "seed vault", "battery bay"]);
    return {
      text: "Roz's square " + tank + " has a perimeter of <b>" + P + " m</b>. A square deck is built around it, so the " + tank + " and deck together form one " +
        "bigger square with <b>twice its side length</b>. What is the area of the deck alone?",
      answer: big * big - s * s, type: "number", unit: "m²",
      steps: [
        "Side = " + P + " ÷ 4 = " + s + " m, so the " + tank + "'s area = " + s + "² = " + s * s + " m².",
        "Big square side = 2 × " + s + " = " + big + " m, area = " + big + "² = " + big * big + " m².",
        "Deck = " + big * big + " − " + s * s + " = <b>" + (big * big - s * s) + "</b> m²"
      ],
      mistakes: [{ answer: s * s, message: "Doubling the side makes the area 4 times as big, not twice as big. Find the big square's area first." },
                 { answer: big * big, message: "That's the whole big square. Take away the " + tank + " to get the deck alone." }]
    };
  });

  add("U1L1-spicy-count", "L1", "spicy", function () {
    var a = R.int(5, 14);
    return {
      text: "A square has a whole-number area, and its side length is between <b>" + a + " m and " + (a + 1) + " m</b>. How many different areas are possible?",
      answer: 2 * a, type: "number", unit: "areas",
      steps: [
        a + "² = " + sq(a) + " and " + (a + 1) + "² = " + sq(a + 1) + ".",
        "The area must be more than " + sq(a) + " and less than " + sq(a + 1) + ": " + (sq(a) + 1) + " to " + (sq(a + 1) - 1) + ".",
        "Count them: " + (sq(a + 1) - 1) + " − " + (sq(a) + 1) + " + 1 = <b>" + 2 * a + "</b>"
      ],
      mistakes: [{ answer: 2 * a + 1, message: "Count only the areas strictly between the two perfect squares — " + sq(a) + " and " + sq(a + 1) + " give whole-number sides." }]
    };
  });

  add("U1L1-spicy-between-roots", "L1", "spicy", function () {
    var k = R.int(5, 13), A1 = R.int(sq(k - 1) + 1, sq(k) - 1), A2 = R.int(sq(k) + 1, sq(k + 1) - 1);
    return {
      text: "Roz has two square panels with areas of <b>" + A1 + " m²</b> and <b>" + A2 + " m²</b>. Which whole number of metres sits between their two side lengths?",
      answer: k, type: "number", unit: "m",
      steps: [
        "√" + A1 + ": " + sq(k - 1) + " < " + A1 + " < " + sq(k) + ", so it is between " + (k - 1) + " and " + k + ".",
        "√" + A2 + ": " + sq(k) + " < " + A2 + " < " + sq(k + 1) + ", so it is between " + k + " and " + (k + 1) + ".",
        k + "² = " + sq(k) + " and " + A1 + " < " + sq(k) + " < " + A2 + ", so <b>" + k + "</b> m sits between them."
      ]
    };
  });

  add("U1L1-spicy-add-first", "L1", "spicy", function () {
    var t = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 6, 10], [12, 5, 13]]), who = R.pick(CREW);
    var A = sq(t[0]), B = sq(t[1]);
    return {
      text: who + " says: “√(" + A + " + " + B + ") = √" + A + " + √" + B + " = " + t[0] + " + " + t[1] + " = " + (t[0] + t[1]) + ".” " +
        "Find <b>√(" + A + " + " + B + ")</b> correctly.",
      answer: t[2], type: "number",
      steps: [
        "Do the inside of the root first: " + A + " + " + B + " = " + (A + B) + ".",
        "√" + (A + B) + " = <b>" + t[2] + "</b>, because " + t[2] + " × " + t[2] + " = " + (A + B) + ".",
        "<b>The mistake:</b> you can't split a root over +. √" + A + " + √" + B + " is a different number."
      ],
      mistakes: [{ answer: t[0] + t[1], message: "That's " + who + "'s answer. Add inside the root first, then take the root." }]
    };
  });

  // =====================================================================
  // L2 — Rational vs irrational
  // =====================================================================
  function rationalPool() {
    var p = R.int(2, 14), n = nonSquare(2, 99), d = R.pick([4, 5, 8, 10]), rep = R.pick(["0.333…", "0.2727…", "0.1515…", "0.8181…", "0.454545…"]);
    return [
      { t: "√" + p * p, r: true, why: "√" + p * p + " = " + p + ", and " + p + " = " + p + "/1." },
      { t: "√" + n, r: false, why: n + " is not a perfect square, so √" + n + " never ends and never repeats." },
      { t: R.int(1, d - 1) + "/" + d, r: true, why: "it is already a fraction." },
      { t: rep, r: true, why: "the decimal repeats in a pattern, so it can be written as a fraction." },
      { t: "π", r: false, why: "π = 3.14159… never ends and never repeats." },
      { t: c(R.int(1, 99) / 100, 2), r: true, why: "the decimal stops, so it can be written as a fraction out of 100." }
    ];
  }

  add("U1L2-mild-classify", "L2", "mild", function () {
    var x = R.pick(rationalPool());
    return {
      text: "Is <b>" + x.t + "</b> rational or irrational?",
      answer: x.r ? "Rational" : "Irrational", type: "choice", options: ["Rational", "Irrational"], maxTries: 1,
      steps: ["Rational means it can be written as a fraction (its decimal stops or repeats).", "<b>" + (x.r ? "Rational" : "Irrational") + "</b>: " + x.why]
    };
  });

  add("U1L2-mild-root", "L2", "mild", function () {
    var perfect = R.int(0, 1) === 0, n = perfect ? sq(R.int(2, 15)) : nonSquare(2, 200), lo = Math.floor(Math.sqrt(n));
    return {
      text: "Roz's decoder reads <b>√" + n + "</b>. Should it stamp it rational or irrational?",
      answer: perfect ? "Rational" : "Irrational", type: "choice", options: ["Rational", "Irrational"], maxTries: 1,
      steps: perfect ? ["Is " + n + " a perfect square? Yes: " + lo + " × " + lo + " = " + n + ".", "√" + n + " = " + lo + " = " + lo + "/1, so it is <b>Rational</b>."] :
        ["Is " + n + " a perfect square? " + sq(lo) + " < " + n + " < " + sq(lo + 1) + ", so no.", "A root of a non-perfect square never ends or repeats: <b>Irrational</b>."]
    };
  });

  add("U1L2-mild-fraction", "L2", "mild", function () {
    var d = R.pick([[0.5, 1, 2], [0.25, 1, 4], [0.75, 3, 4], [0.2, 1, 5], [0.4, 2, 5], [0.6, 3, 5], [0.8, 4, 5], [0.125, 1, 8], [0.375, 3, 8], [1.5, 3, 2], [2.5, 5, 2], [0.3, 3, 10], [0.7, 7, 10], [1.25, 5, 4]]);
    var places = String(d[0]).split(".")[1].length, den = Math.pow(10, places), num = Math.round(d[0] * den);
    return {
      text: "Prove <b>" + c(d[0]) + "</b> is rational: write it as a fraction in lowest terms.",
      answer: MP.Fr.make(d[1], d[2]), type: "fraction", noDecimal: true,
      steps: [
        c(d[0]) + " has " + places + " decimal place" + (places > 1 ? "s" : "") + ", so write it over " + den + ": " + num + "/" + den + ".",
        "Simplify: " + num + "/" + den + " = <b>" + MP.Fr.both(MP.Fr.make(d[1], d[2])) + "</b>"
      ]
    };
  });

  add("U1L2-mild-odd-one", "L2", "mild", function () {
    var roots = R.shuffle([4, 9, 16, 25, 36, 49, 64, 81, 100]).slice(0, 3), odd = nonSquare(10, 99);
    var opts = R.shuffle(roots.map(function (r) { return "√" + r; }).concat(["√" + odd]));
    return {
      text: "Which number does <b>not</b> belong (it's the only irrational one)?",
      answer: "√" + odd, type: "choice", options: opts, maxTries: 2,
      steps: [roots.map(function (r) { return "√" + r + " = " + Math.sqrt(r); }).join(", ") + ": all rational.",
        odd + " is not a perfect square, so <b>√" + odd + "</b> is irrational."]
    };
  });

  add("U1L2-med-count", "L2", "medium", function () {
    var pool = R.shuffle(rationalPool()).slice(0, 5), k = pool.filter(function (x) { return !x.r; }).length;
    return {
      text: "How many of these are <b>irrational</b>?&nbsp;&nbsp; " + pool.map(function (x) { return x.t; }).join("&nbsp;&nbsp;&nbsp; "),
      answer: k, type: "number",
      steps: pool.map(function (x) { return x.t + ": " + (x.r ? "rational" : "<b>irrational</b>") + " — " + x.why; }).concat(["So <b>" + k + "</b> are irrational."])
    };
  });

  add("U1L2-med-between", "L2", "medium", function () {
    var a = R.int(3, 13), inside = R.int(sq(a) + 1, sq(a + 1) - 1);
    var opts = R.shuffle(["√" + inside, "√" + (sq(a) - R.int(1, 3)), "√" + (sq(a + 1) + R.int(1, 4)), "√" + sq(a)]);
    return {
      text: "Which number sits <b>between " + a + " and " + (a + 1) + "</b>?",
      answer: "√" + inside, type: "choice", options: opts, maxTries: 2,
      steps: [a + "² = " + sq(a) + " and " + (a + 1) + "² = " + sq(a + 1) + ". The number under the root must be between " + sq(a) + " and " + sq(a + 1) + ".",
        "√" + sq(a) + " = " + a + " exactly, so it is not between. Only <b>√" + inside + "</b> works."]
    };
  });

  add("U1L2-med-mistake", "L2", "medium", function () {
    var who = R.pick(CREW), n = nonSquare(11, 99), lo = Math.floor(Math.sqrt(n));
    return {
      text: who + " says: “√" + n + " is rational, because " + n + " is a whole number and whole numbers are rational.” " +
        "<b>Find the mistake.</b> Is √" + n + " rational or irrational?",
      answer: "Irrational", type: "choice", options: ["Rational", "Irrational"], maxTries: 1,
      steps: ["<b>The mistake:</b> " + n + " is rational, but √" + n + " is a different number.",
        sq(lo) + " < " + n + " < " + sq(lo + 1) + ", so " + n + " is not a perfect square and √" + n + " is <b>Irrational</b>."]
    };
  });

  add("U1L2-med-range", "L2", "medium", function () {
    var a = R.int(1, 40), b = a + R.int(20, 80);
    var list = [];
    for (var k = 1; k * k <= b; k++) if (k * k >= a) list.push(k * k);
    return {
      text: "Roz takes the square root of every whole number from <b>" + a + " to " + b + "</b>. How many of the roots are rational?",
      answer: list.length, type: "number",
      steps: ["A root is rational only when the number is a perfect square.",
        "Perfect squares from " + a + " to " + b + ": " + (list.join(", ") || "none") + ".", "So <b>" + list.length + "</b> roots are rational."]
    };
  });

  add("U1L2-spicy-compare", "L2", "spicy", function () {
    var v = until(function () {
      var a = R.int(1, 6), b = R.int(1, 6), x = nonSquare(3, 80), y = nonSquare(3, 80);
      var lx = a + Math.floor(Math.sqrt(x)), ly = b + Math.floor(Math.sqrt(y));
      return { a: a, b: b, x: x, y: y, lx: lx, ly: ly };
    }, function (v) { return v.lx !== v.ly; });
    var ans = v.lx > v.ly ? ">" : "<", fx = Math.floor(Math.sqrt(v.x)), fy = Math.floor(Math.sqrt(v.y));
    return {
      text: "Without a calculator, choose &lt; or &gt;:&nbsp;&nbsp; <b>" + v.a + " + √" + v.x + "</b> ___ <b>" + v.b + " + √" + v.y + "</b>",
      answer: ans, type: "choice", options: LTGT, maxTries: 1,
      steps: [
        "√" + v.x + " is between " + fx + " and " + (fx + 1) + ", so " + v.a + " + √" + v.x + " is between " + v.lx + " and " + (v.lx + 1) + ".",
        "√" + v.y + " is between " + fy + " and " + (fy + 1) + ", so " + v.b + " + √" + v.y + " is between " + v.ly + " and " + (v.ly + 1) + ".",
        "So the answer is <b>" + ans + "</b>"
      ]
    };
  });

  add("U1L2-spicy-nested", "L2", "spicy", function () {
    var v = until(function () { var m = R.int(2, 9), t = R.int(m + 1, 12); return { m: m, t: t, N: t * t - m }; }, function (v) { return v.N > 0; });
    return {
      text: "Find the value of <b>√(" + v.N + " + √" + v.m * v.m + ")</b>. (Is it rational?)",
      answer: v.t, type: "number",
      steps: ["Inside first: √" + v.m * v.m + " = " + v.m + ".", v.N + " + " + v.m + " = " + v.t * v.t + ".",
        "√" + v.t * v.t + " = <b>" + v.t + "</b> — a whole number, so it's rational."]
    };
  });

  add("U1L2-spicy-count", "L2", "spicy", function () {
    var n = R.int(20, 150), k = Math.floor(Math.sqrt(n));
    return {
      text: "Roz lists the whole numbers from <b>1 to " + n + "</b> and takes the square root of each. How many of the roots are <b>irrational</b>?",
      answer: n - k, type: "number",
      steps: ["Rational roots come from perfect squares: 1, 4, 9, …, " + k * k + " (" + k + " of them, since " + k + "² = " + k * k + " ≤ " + n + " < " + sq(k + 1) + ").",
        "Irrational: " + n + " − " + k + " = <b>" + (n - k) + "</b>"],
      mistakes: [{ answer: k, message: "That's how many are RATIONAL (the perfect squares). The question asks for irrational." }]
    };
  });

  add("U1L2-spicy-find-x", "L2", "spicy", function () {
    var v = until(function () {
      var k = R.pick([3, 5, 6, 7, 8, 11]), t = R.int(4, 10), good = t * t - k;
      var bads = [(t - 1) * (t - 1), good + 1, good + 2, good - 1, (t - 2) * (t - 2)].filter(function (x) {
        return x > 0 && x !== good && (isSq(x) || !isSq(x + k));
      });
      return { k: k, t: t, good: good, bads: R.shuffle(bads).slice(0, 3) };
    }, function (v) { return !isSq(v.good) && v.bads.length === 3 && new Set(v.bads).size === 3; });
    var k = v.k, t = v.t, good = v.good;
    var opts = R.shuffle([good].concat(v.bads).map(String));
    return {
      text: "Which value of x makes <b>√x irrational</b> but <b>√(x + " + k + ") rational</b>?",
      answer: String(good), type: "choice", options: opts, maxTries: 2,
      steps: ["x + " + k + " must be a perfect square, and x must not be.",
        "Try " + good + ": " + good + " + " + k + " = " + t * t + " = " + t + "², and " + good + " is not a perfect square. So <b>" + good + "</b>."]
    };
  });

  // =====================================================================
  // L3 — Estimating square roots
  // =====================================================================
  add("U1L3-mild-between", "L3", "mild", function () {
    var N = nonSquare(3, 150), lo = Math.floor(Math.sqrt(N));
    return {
      text: "<b>√" + N + "</b> sits between which two whole numbers?",
      parts: [{ label: "Lower", answer: lo, type: "number" }, { label: "Upper", answer: lo + 1, type: "number" }],
      steps: ["Boundaries: " + sq(lo) + " < " + N + " < " + sq(lo + 1) + ".", "So √" + N + " is between <b>" + lo + "</b> and <b>" + (lo + 1) + "</b>."]
    };
  });

  add("U1L3-mild-estimate", "L3", "mild", function () {
    var N = nonSquare(5, 99), e = est(N);
    return {
      text: "Estimate <b>√" + N + "</b> to one decimal place." + hint(e),
      answer: e.best, type: "number", dp: 1, tol: 0.1,
      steps: estSteps(N, e),
      mistakes: [{ answer: F.roundTo(e.lo + 0.5, 1), message: "It isn't always halfway. Use distance ÷ gap, then check by squaring." }]
    };
  });

  add("U1L3-mild-closer", "L3", "mild", function () {
    var N = nonSquare(5, 99), e = est(N);
    return {
      text: "Is <b>√" + N + "</b> closer to " + c(e.t0, 1) + " or to " + c(e.t1, 1) + "? Square both to find out." + hint(e),
      answer: c(e.best, 1), type: "choice", options: [c(e.t0, 1), c(e.t1, 1)], maxTries: 1,
      steps: [c(e.t0, 1) + "² = " + c(e.t0 * e.t0, 2) + " and " + c(e.t1, 1) + "² = " + c(e.t1 * e.t1, 2) + ".",
        N + " is " + c(Math.abs(N - e.t0 * e.t0), 2) + " from " + c(e.t0 * e.t0, 2) + " and " + c(Math.abs(e.t1 * e.t1 - N), 2) + " from " + c(e.t1 * e.t1, 2) + ".",
        "So √" + N + " is closer to <b>" + c(e.best, 1) + "</b>."]
    };
  });

  add("U1L3-mild-compare", "L3", "mild", function () {
    var N = nonSquare(5, 99), e = est(N), t = R.pick([e.t0, e.t1]), ans = t * t < N ? ">" : "<", a = Math.round(t * 10);
    return {
      text: "Choose &lt; or &gt;:&nbsp;&nbsp; <b>√" + N + "</b> ___ <b>" + c(t, 1) + "</b> <span class='note'>(" + a + " × " + a + " = " + a * a + ")</span>",
      answer: ans, type: "choice", options: ["<", ">"], maxTries: 1,
      steps: ["Square both: (√" + N + ")² = " + N + " and " + c(t, 1) + "² = " + c(t * t, 2) + ".",
        "The bigger square is the bigger number, so √" + N + " <b>" + ans + "</b> " + c(t, 1) + "."]
    };
  });

  add("U1L3-med-mistake", "L3", "medium", function () {
    var who = R.pick(CREW), lo = R.int(4, 9), d = R.int(1, 3), N = lo * lo + d, e = est(N), wrong = F.roundTo(lo + d / 10, 1);
    var tooBig = lo + "." + d + "² = " + c(wrong * wrong, 2);
    return {
      text: who + " says: “√" + N + " ≈ " + c(wrong, 1) + ", because " + N + " is " + d + " above " + lo * lo + ".” <b>Find the mistake</b> and give a better estimate to one decimal place." + hint(e),
      answer: e.best, type: "number", dp: 1, tol: 0.1,
      steps: ["<b>The mistake:</b> " + who + " used the distance (" + d + ") as the decimal. Divide by the gap instead. (Check: " + tooBig + ", which is more than " + N + ".)"].concat(estSteps(N, e)),
      mistakes: wrong !== e.best ? [{ answer: wrong, message: "That's " + who + "'s estimate. Use distance ÷ gap, not the distance itself." }] : []
    };
  });

  add("U1L3-med-perimeter", "L3", "medium", function () {
    var N = nonSquare(20, 99), e = est(N), thing = R.pick(["dance floor", "garden bed", "landing pad", "greenhouse floor"]);
    return {
      text: "A square " + thing + " has an area of <b>" + N + " m²</b>. Estimate its side to one decimal place, then find the distance all the way around it." + hint(e),
      answer: F.roundTo(4 * e.best, 1), type: "number", dp: 1, tol: 0.4, unit: "m",
      steps: estSteps(N, e).concat(["Perimeter = 4 × " + c(e.best, 1) + " = <b>" + c(4 * e.best, 1) + "</b> m"]),
      mistakes: [{ answer: e.best, message: "That's the side length. Now go all the way around: 4 sides." }]
    };
  });

  add("U1L3-med-count", "L3", "medium", function () {
    var a = R.int(3, 14), h = a + 0.5, top = h * h, list = [];
    for (var n = a * a + 1; n < top; n++) list.push(n);
    var b = a * 10 + 5;
    return {
      text: "How many whole numbers n make <b>√n</b> between " + a + " and " + c(h, 1) + "? <span class='note'>(" + b + " × " + b + " = " + b * b + ")</span>",
      answer: list.length, type: "number",
      steps: ["Square the boundaries: " + a + "² = " + a * a + " and " + c(h, 1) + "² = " + c(top, 2) + ".", "n must be more than " + a * a + " and less than " + c(top, 2) + ": " + list.join(", ") + ".",
        "That's <b>" + list.length + "</b> numbers."]
    };
  });

  add("U1L3-med-greater", "L3", "medium", function () {
    var N = nonSquare(20, 99), e = est(N), t = R.pick([e.t0, e.t1]), bigger = t * t > N ? c(t, 1) : "√" + N, a = Math.round(t * 10);
    return {
      text: "Which is greater: <b>√" + N + "</b> or <b>" + c(t, 1) + "</b>? <span class='note'>(" + a + " × " + a + " = " + a * a + ")</span>",
      answer: bigger, type: "choice", options: ["√" + N, c(t, 1)], maxTries: 1,
      steps: [c(t, 1) + "² = " + c(t * t, 2) + ", compared with " + N + ".", "The bigger square is the bigger number: <b>" + bigger + "</b>."]
    };
  });

  add("U1L3-spicy-sum", "L3", "spicy", function () {
    var v = until(function () { var x = nonSquare(10, 90), y = nonSquare(10, 90); return { x: x, y: y, ex: est(x), ey: est(y) }; },
      function (v) { var s = v.ex.best + v.ey.best; return Math.abs(s - Math.round(s)) < 0.4 && Math.round(Math.sqrt(v.x) + Math.sqrt(v.y)) === Math.round(s); });
    var s = v.ex.best + v.ey.best;
    return {
      text: "Estimate <b>√" + v.x + " + √" + v.y + "</b> to the nearest whole number. Estimate each root first." + hint(v.ex) + hint(v.ey),
      answer: Math.round(s), type: "number",
      steps: ["√" + v.x + " ≈ " + c(v.ex.best, 1) + " (" + sq(v.ex.lo) + " < " + v.x + " < " + sq(v.ex.hi) + ")",
        "√" + v.y + " ≈ " + c(v.ey.best, 1) + " (" + sq(v.ey.lo) + " < " + v.y + " < " + sq(v.ey.hi) + ")",
        c(v.ex.best, 1) + " + " + c(v.ey.best, 1) + " = " + c(s, 1) + ", so about <b>" + Math.round(s) + "</b>"],
      mistakes: isSq(v.x + v.y) ? [] : [{ answer: Math.round(Math.sqrt(v.x + v.y)), message: "You can't add under one root: √" + v.x + " + √" + v.y + " is not √" + (v.x + v.y) + ". Estimate each root, then add." }]
    };
  });

  add("U1L3-spicy-panels", "L3", "spicy", function () {
    var w = R.pick([5.5, 6.5, 7.5, 8.5]), need = w * w, base = Math.floor(need);
    var areas = R.shuffle([base - 2, base - 1, base + 1, base + 2, base + 3]).slice(0, 4).sort(function (a, b) { return a - b; });
    var ok = areas.filter(function (a) { return a >= need; }), b10 = Math.round(w * 10);
    return {
      text: "A sensor needs a square panel at least <b>" + c(w, 1) + " m</b> wide. Roz has panels with areas of " + areas.join(", ") + " m². How many of them are big enough? <span class='note'>(" + b10 + " × " + b10 + " = " + b10 * b10 + ")</span>",
      answer: ok.length, type: "number",
      steps: ["A side of " + c(w, 1) + " m needs an area of at least " + c(w, 1) + "² = " + c(need, 2) + " m².",
        "Areas of at least " + c(need, 2) + ": " + (ok.join(", ") || "none") + ". That's <b>" + ok.length + "</b>."]
    };
  });

  add("U1L3-spicy-rail", "L3", "spicy", function () {
    var v = until(function () { var x = nonSquare(30, 99), y = nonSquare(10, 50); return { x: x, y: y, ex: est(x), ey: est(y) }; }, function () { return true; });
    var tot = F.roundTo(v.ex.best + v.ey.best, 1);
    return {
      text: "Roz has a square greenhouse floor with an area of <b>" + v.x + " m²</b> and a square solar field with an area of <b>" + v.y + " m²</b>. " +
        "She lays one side of each end to end along a rail. Estimate the total length to one decimal place." + hint(v.ex) + hint(v.ey),
      answer: tot, type: "number", dp: 1, tol: 0.2, unit: "m",
      steps: estSteps(v.x, v.ex).concat(estSteps(v.y, v.ey)).concat([c(v.ex.best, 1) + " + " + c(v.ey.best, 1) + " = <b>" + c(tot, 1) + "</b> m"])
    };
  });

  // =====================================================================
  // L4 — Powers of ten
  // =====================================================================
  function decimalNum() { return R.pick([R.step(0.01, 0.99, 0.01), R.step(1.1, 9.9, 0.1), R.step(0.001, 0.099, 0.001), R.step(10, 99, 1), R.step(1.05, 9.95, 0.05)]); }
  function moveSteps(x, op, p, result) {
    var places = String(p).replace(/^0\./, "").length, dir;
    if (op === "×" && p >= 10) { dir = "left"; places = String(p).length - 1; }
    else if (op === "÷") { dir = "right"; places = String(p).length - 1; }
    else { dir = "right"; places = String(p).split(".")[1].length; }
    return [
      op + " " + c(p) + (op === "×" && p < 1 ? " does the same job as ÷ " + c(Math.round(1 / p)) : "") + ": every digit moves " + places + " place" + (places > 1 ? "s" : "") + " " + dir + ".",
      c(x) + " " + op + " " + c(p) + " = <b>" + c(result, 8) + "</b>",
      "Check the size: " + (dir === "left" ? "multiplying by 10, 100 or 1000 makes it bigger." : "it should get smaller.")
    ];
  }

  add("U1L4-mild-times", "L4", "mild", function () {
    var x = decimalNum(), p = R.pick([10, 100, 1000]), r = F.roundTo(x * p, 8);
    return { text: "Calculate <b>" + c(x) + " × " + c(p) + "</b>.", answer: r, type: "number", dp: 6,
      steps: moveSteps(x, "×", p, r), mistakes: [{ answer: F.roundTo(x / p, 8), message: "Multiplying by " + p + " makes it bigger: the digits move LEFT." }] };
  });

  add("U1L4-mild-divide", "L4", "mild", function () {
    var x = R.pick([R.step(1, 99, 1), R.step(1.1, 9.9, 0.1), R.step(10.5, 99.5, 0.5)]), p = R.pick([10, 100, 1000]), r = F.roundTo(x / p, 8);
    return { text: "Calculate <b>" + c(x) + " ÷ " + c(p) + "</b>.", answer: r, type: "number", dp: 6,
      steps: moveSteps(x, "÷", p, r), mistakes: [{ answer: F.roundTo(x * p, 8), message: "Dividing makes it smaller: the digits move RIGHT." }] };
  });

  add("U1L4-mild-times-small", "L4", "mild", function () {
    var x = R.pick([R.step(1, 99, 1), R.step(1.1, 9.9, 0.1)]), p = R.pick([0.1, 0.01, 0.001]), r = F.roundTo(x * p, 8);
    return { text: "Calculate <b>" + c(x) + " × " + c(p) + "</b>.", answer: r, type: "number", dp: 6,
      steps: moveSteps(x, "×", p, r), mistakes: [{ answer: F.roundTo(x / p, 8), message: "× " + c(p) + " makes it smaller (it's the same as ÷ " + c(Math.round(1 / p)) + ")." }] };
  });

  add("U1L4-mild-missing", "L4", "mild", function () {
    var x = R.step(1.1, 9.9, 0.1), p = R.pick([10, 100, 1000]);
    return { text: "Fill in the missing power of ten:&nbsp;&nbsp; <b>" + c(x) + " × ___ = " + c(x * p) + "</b>", answer: p, type: "number",
      steps: ["From " + c(x) + " to " + c(x * p) + ", the digits moved " + (String(p).length - 1) + " places left.", "That's × <b>" + c(p) + "</b>"] };
  });

  add("U1L4-med-mixed", "L4", "medium", function () {
    var x = R.pick([R.step(0.0011, 0.0099, 0.0001), R.step(11, 99, 1), R.step(110, 990, 10)]), op = R.pick(["×", "÷"]);
    var p = op === "×" ? R.pick([10000, 0.1, 0.01]) : R.pick([1000, 10000]), r = F.roundTo(op === "×" ? x * p : x / p, 10);
    return { text: "Calculate <b>" + c(x, 6) + " " + op + " " + c(p) + "</b>.", answer: r, type: "number", dp: 8,
      steps: moveSteps(x, op, p, r) };
  });

  add("U1L4-med-mistake", "L4", "medium", function () {
    var who = R.pick(CREW), x = R.step(1.1, 9.9, 0.1), p = R.pick([100, 1000]), zeros = String(p).length - 1;
    var wrong = c(x) + "0".repeat(zeros);
    return {
      text: who + " says: “" + c(x) + " × " + c(p) + " = " + wrong + ", because multiplying by " + c(p) + " adds " + zeros + " zeros.” <b>Find the mistake.</b> What is the correct answer?",
      answer: F.roundTo(x * p, 6), type: "number",
      steps: ["<b>The mistake:</b> " + wrong + " is the same number as " + c(x) + " — adding zeros after a decimal changes nothing.",
        "The digits move " + zeros + " places left: " + c(x) + " × " + c(p) + " = <b>" + c(x * p) + "</b>"],
      mistakes: [{ answer: x, message: "That's " + who + "'s answer — it's still " + c(x) + ". The digits must move." }]
    };
  });

  add("U1L4-med-mass", "L4", "medium", function () {
    var m = R.pick([0.35, 0.25, 0.04, 0.125, 0.6, 0.075]), n = R.pick([100, 1000, 10000]), thing = R.pick(["seed packet", "sample bag", "bolt", "filter"]);
    return { text: "A " + thing + " on the Moon base has a mass of <b>" + c(m) + " g</b>. What is the mass of <b>" + c(n) + "</b> of them?",
      answer: F.roundTo(m * n, 6), type: "number", unit: "g",
      steps: [c(m) + " × " + c(n) + ": the digits move " + (String(n).length - 1) + " places left.", "= <b>" + c(m * n) + "</b> g"] };
  });

  add("U1L4-med-compare", "L4", "medium", function () {
    var x = R.step(1.1, 9.9, 0.1), pair = R.pick([[["÷", 10], ["×", 0.1]], [["÷", 100], ["×", 0.1]], [["×", 0.01], ["÷", 10]], [["÷", 1000], ["×", 0.01]], [["×", 100], ["÷", 0.1]]]);
    function val(o) { return o[0] === "×" ? x * o[1] : x / o[1]; }
    var a = val(pair[0]), b = val(pair[1]), ans = Math.abs(a - b) < 1e-12 ? "=" : a < b ? "<" : ">";
    return {
      text: "Choose &lt;, &gt; or = without calculating:&nbsp;&nbsp; <b>" + c(x) + " " + pair[0][0] + " " + c(pair[0][1]) + "</b> ___ <b>" + c(x) + " " + pair[1][0] + " " + c(pair[1][1]) + "</b>",
      answer: ans, type: "choice", options: LTGT, maxTries: 1,
      steps: ["Left: " + c(x) + " " + pair[0][0] + " " + c(pair[0][1]) + " = " + c(a, 8) + ". Right: " + c(x) + " " + pair[1][0] + " " + c(pair[1][1]) + " = " + c(b, 8) + ".", "So <b>" + ans + "</b>"]
    };
  });

  add("U1L4-spicy-big-times", "L4", "spicy", function () {
    var a = R.int(2, 9), b = R.int(2, 9), za = R.int(2, 4), zb = R.int(1, 3), A = a * Math.pow(10, za), B = b * Math.pow(10, zb);
    return {
      text: "A lab counts <b>" + c(A) + "</b> dust specks in each sample. How many specks are in <b>" + c(B) + "</b> samples?",
      answer: A * B, type: "number",
      steps: ["Multiply the non-zero digits: " + a + " × " + b + " = " + a * b + ".", "Count the zeros: " + za + " + " + zb + " = " + (za + zb) + ".",
        a * b + " with " + (za + zb) + " more zeros = <b>" + c(A * B) + "</b>"]
    };
  });

  add("U1L4-spicy-big-divide", "L4", "spicy", function () {
    var v = until(function () { var q = R.int(2, 9), b = R.int(2, 9), zb = R.int(2, 4), zq = R.int(1, 3); return { q: q, b: b, zb: zb, zq: zq }; }, function () { return true; });
    var B = v.b * Math.pow(10, v.zb), Q = v.q * Math.pow(10, v.zq), A = B * Q;
    return {
      text: "<b>" + c(A) + "</b> specks are shared equally into <b>" + c(B) + "</b> jars. How many specks go in each jar?",
      answer: Q, type: "number",
      steps: ["Divide the non-zero parts: " + c(A / Math.pow(10, v.zb + v.zq)) + " ÷ " + v.b + " = " + v.q + ".",
        "Zeros: " + (String(A).length - String(A).replace(/0+$/, "").length) + " − " + v.zb + " = " + v.zq + ".", "So <b>" + c(Q) + "</b> specks per jar"],
      mistakes: [{ answer: A * B, message: "Sharing into jars means DIVIDE." }]
    };
  });

  add("U1L4-spicy-units", "L4", "spicy", function () {
    var kg = F.roundTo(R.pick([R.step(0.0011, 0.0099, 0.0001), R.step(0.011, 0.099, 0.001), R.step(0.11, 0.99, 0.01)]), 6);
    return {
      text: "A scale on the Moon base shows <b>" + c(kg, 6) + " kg</b>. Write the mass in <b>milligrams</b>. (1 kg = 1000 g and 1 g = 1000 mg)",
      answer: F.roundTo(kg * 1e6, 6), type: "number", unit: "mg",
      steps: ["kg → g: × 1000: " + c(kg, 6) + " × 1000 = " + c(kg * 1000, 6) + " g", "g → mg: × 1000: " + c(kg * 1000, 6) + " × 1000 = <b>" + c(kg * 1e6, 6) + "</b> mg"],
      mistakes: [{ answer: F.roundTo(kg * 1000, 6), message: "That's grams. Multiply by 1000 again for milligrams." }]
    };
  });

  add("U1L4-spicy-rocket", "L4", "spicy", function () {
    var m = R.pick([0.25, 0.2, 0.4, 0.5, 0.15]), n1 = R.pick([1000, 2000, 3000]), n2 = R.pick([100, 200, 500]), cap = R.int(4, 20) * 100;
    var tot = m * n1 + m * n2;
    return {
      text: "Each bag of Moon soil has a mass of <b>" + c(m) + " kg</b>. Roz loads <b>" + c(n1) + "</b> bags and then <b>" + c(n2) + "</b> more. What is the total mass?",
      answer: F.roundTo(tot, 6), type: "number", unit: "kg",
      steps: [c(n1) + " bags: " + c(m) + " × " + c(n1) + " = " + c(m * n1) + " kg", c(n2) + " bags: " + c(m) + " × " + c(n2) + " = " + c(m * n2) + " kg",
        "Total: " + c(m * n1) + " + " + c(m * n2) + " = <b>" + c(tot) + "</b> kg"]
    };
  });

  // =====================================================================
  // L5 — Scientific notation: large numbers
  // =====================================================================
  function bigSci() { return { a: R.pick([R.step(1.1, 9.9, 0.1), R.int(2, 9), R.step(1.01, 9.99, 0.01)]), e: R.int(3, 9) }; }

  add("U1L5-mild-to-sci", "L5", "mild", function () {
    var s = bigSci(), v = sciVal(s);
    return {
      text: "Write <b>" + c(v, 0) + "</b> in scientific notation.",
      answer: s, type: "sci",
      steps: ["Put the decimal after the first non-zero digit: " + c(s.a) + ".", "Count how many places it slid: " + c(s.e) + ".", "<b>" + sci(s) + "</b>"],
      mistakes: [{ answer: { a: s.a * 10, e: s.e - 1 }, message: "Not proper form: the front number must be at least 1 and less than 10." }]
    };
  });

  add("U1L5-mild-to-std", "L5", "mild", function () {
    var s = bigSci(), v = Math.round(sciVal(s));
    return {
      text: "Write <b>" + sci(s) + "</b> as a regular number.",
      answer: v, type: "number", dp: 0,
      steps: ["10" + sup(s.e) + " means the decimal slides " + c(s.e) + " places right.", c(s.a) + " → <b>" + c(v, 0) + "</b>"]
    };
  });

  add("U1L5-mild-proper", "L5", "mild", function () {
    var a = R.step(1.1, 9.9, 0.1), e = R.int(3, 8);
    var opts = R.shuffle([c(a * 10) + " × 10" + sup(e - 1), c(a) + " × 10" + sup(e), c(a / 10, 3) + " × 10" + sup(e + 1)]);
    return {
      text: "Which number is in <b>proper</b> scientific notation?",
      answer: c(a) + " × 10" + sup(e), type: "choice", options: opts, maxTries: 1,
      steps: ["Proper form has exactly one non-zero digit before the decimal (1 ≤ front number < 10).", c(a * 10) + " is too big and " + c(a / 10, 3) + " is too small, so <b>" + c(a) + " × 10" + sup(e) + "</b>."]
    };
  });

  add("U1L5-med-fix", "L5", "medium", function () {
    var a = R.step(1.1, 9.9, 0.1), e = R.int(4, 9), shift = R.pick([1, 2, -1]);
    var shownA = F.roundTo(a * Math.pow(10, shift), 6), shownE = e - shift;
    return {
      text: "Rewrite in proper scientific notation:&nbsp;&nbsp; <b>" + c(shownA, 6) + " × 10" + sup(shownE) + "</b>",
      answer: { a: a, e: e }, type: "sci",
      steps: [shift > 0 ? "The front number is too big: divide it by " + c(Math.pow(10, shift)) + " and raise the exponent by " + shift + "." :
        "The front number is less than 1: multiply it by 10 and lower the exponent by 1.",
        "<b>" + F.sci(a, e) + "</b>"],
      mistakes: [{ answer: { a: a, e: shownE - shift }, message: "Right front number, but the exponent went the wrong way. Front smaller → exponent up." }]
    };
  });

  add("U1L5-med-compare", "L5", "medium", function () {
    var v = until(function () { return [bigSci(), bigSci()]; }, function (p) { return Math.abs(p[0].e - p[1].e) <= 1 && sciVal(p[0]) !== sciVal(p[1]); });
    var ans = sciVal(v[0]) < sciVal(v[1]) ? "<" : ">";
    return {
      text: "Choose &lt; or &gt; without expanding:&nbsp;&nbsp; <b>" + sci(v[0]) + "</b> ___ <b>" + sci(v[1]) + "</b>",
      answer: ans, type: "choice", options: ["<", ">"], maxTries: 1,
      steps: [v[0].e !== v[1].e ? "Compare the exponents first: " + c(v[0].e) + " vs " + c(v[1].e) + ". The bigger exponent wins." : "The exponents match, so compare the front numbers: " + c(v[0].a) + " vs " + c(v[1].a) + ".",
        "So <b>" + ans + "</b>"]
    };
  });

  add("U1L5-med-order", "L5", "medium", function () {
    var nums = until(function () { var b = R.int(5, 7); return [0, 1, 2, 3].map(function () { return { a: R.step(1.1, 9.9, 0.1), e: b + R.int(0, 2) }; }); },
      function (ns) { var vals = ns.map(sciVal); return new Set(vals).size === 4; });
    var o = orderQ(nums.map(function (s) { return { text: sci(s), value: sciVal(s) }; }));
    return {
      text: "Order from <b>least to greatest</b> (type the letters):<br>" + o.list,
      answer: o.answer, type: "order",
      steps: ["Sort by exponent first, then by the front number when exponents match.", o.sorted.map(function (it) { return it.text; }).join(" < "), "<b>" + o.answer.join(", ") + "</b>"]
    };
  });

  add("U1L5-med-mistake", "L5", "medium", function () {
    var who = R.pick(CREW), big = { a: R.step(1.1, 4.9, 0.1), e: R.int(5, 8) }, small = { a: R.step(5.1, 9.9, 0.1), e: big.e - 1 };
    return {
      text: who + " says " + sci(small) + " is bigger than " + sci(big) + " “because " + c(small.a) + " is bigger than " + c(big.a) + ".” <b>Find the mistake.</b> Which number is bigger?",
      answer: sci(big), type: "choice", options: [sci(small), sci(big)], maxTries: 1,
      steps: ["<b>The mistake:</b> " + who + " compared the front numbers first. Compare exponents first.",
        big.e + " > " + small.e + ", so <b>" + sci(big) + "</b> (" + c(sciVal(big), 0) + ") is bigger than " + c(sciVal(small), 0) + "."]
    };
  });

  add("U1L5-spicy-times", "L5", "spicy", function () {
    var a = R.int(2, 9), e = R.int(4, 9), k = R.pick([20, 30, 40, 50, 60, 300, 500]), prod = a * k, s = toSci(prod * Math.pow(10, e));
    return {
      text: "A computer does <b>" + F.sci(a, e) + "</b> calculations every second. How many does it do in <b>" + k + "</b> seconds? Answer in proper scientific notation.",
      answer: s, type: "sci",
      steps: [k + " × " + a + " = " + prod + ", so " + prod + " × 10" + sup(e) + ".", "Fix the form: " + prod + " = " + c(toSci(prod).a) + " × 10" + sup(toSci(prod).e) + ", so <b>" + sci(s) + "</b>"],
      mistakes: [{ answer: { a: prod / Math.pow(10, toSci(prod).e), e: e }, message: "Right front number, but fixing the form moves the exponent up too." }]
    };
  });

  add("U1L5-spicy-divide", "L5", "spicy", function () {
    var v = until(function () { var q = R.int(2, 9), b = R.int(2, 4), eb = R.int(2, 5), eq = R.int(2, 6); return { q: q, b: b, eb: eb, eq: eq, a: q * b }; }, function (v) { return v.a < 10; });
    var ea = v.eb + v.eq;
    return {
      text: "A probe must travel <b>" + F.sci(v.a, ea) + " km</b> at <b>" + F.sci(v.b, v.eb) + " km per hour</b>. How many hours will the trip take? Proper form.",
      answer: { a: v.q, e: v.eq }, type: "sci",
      steps: ["Time = distance ÷ speed.", "Front numbers: " + v.a + " ÷ " + v.b + " = " + v.q + ".", "Powers: 10" + sup(ea) + " ÷ 10" + sup(v.eb) + " = 10" + sup(v.eq) + " (subtract exponents).", "<b>" + F.sci(v.q, v.eq) + "</b> hours"]
    };
  });

  add("U1L5-spicy-mistake", "L5", "spicy", function () {
    var who = R.pick(CREW), a = R.int(2, 9), b = R.int(2, 9), ea = R.int(3, 7), eb = R.int(3, 7), p = a * b, s = toSci(p * Math.pow(10, ea + eb));
    return {
      text: who + " calculated: (" + F.sci(a, ea) + ") × (" + F.sci(b, eb) + ") = " + p + " × 10" + sup(ea * eb) + ". <b>Find the mistakes</b> and write the correct answer in proper form.",
      answer: s, type: "sci",
      steps: ["<b>Mistake 1:</b> " + who + " multiplied the exponents. Add them: " + c(ea) + " + " + c(eb) + " = " + (ea + eb) + ".",
        p >= 10 ? "<b>Mistake 2:</b> " + p + " is not between 1 and 10. Fix it: " + p + " × 10" + sup(ea + eb) + " = " + sci(s) + "." : "Front numbers: " + a + " × " + b + " = " + p + ".",
        "Answer: <b>" + sci(s) + "</b>"],
      mistakes: [{ answer: { a: p >= 10 ? p / 10 : p, e: ea * eb + (p >= 10 ? 1 : 0) }, message: "Multiplying powers of ten: ADD the exponents." }]
    };
  });

  // =====================================================================
  // L6 — Scientific notation: small numbers
  // =====================================================================
  function smallSci() { return { a: R.pick([R.step(1.1, 9.9, 0.1), R.int(2, 9), R.step(1.01, 9.99, 0.01)]), e: -R.int(2, 8) }; }
  function dec(v) { return F.num(v, 14); }

  add("U1L6-mild-to-sci", "L6", "mild", function () {
    var s = smallSci(), v = sciVal(s);
    return {
      text: "Write <b>" + dec(v) + "</b> in scientific notation.",
      answer: s, type: "sci",
      steps: ["Slide the decimal right until it's after the first non-zero digit: " + c(s.a) + ".", "It slid " + (-s.e) + " places right, so the exponent is " + c(s.e) + " (negative, because the number is small).", "<b>" + sci(s) + "</b>"],
      mistakes: [{ answer: { a: s.a, e: -s.e }, message: "A small decimal needs a NEGATIVE exponent." }]
    };
  });

  add("U1L6-mild-to-dec", "L6", "mild", function () {
    var s = smallSci(), v = sciVal(s);
    return {
      text: "Write <b>" + sci(s) + "</b> as a regular decimal.",
      answer: F.roundTo(v, 12), type: "number", dp: 12,
      steps: ["10" + sup(s.e) + " means the decimal slides " + (-s.e) + " places LEFT (the number is small, not negative).", c(s.a) + " → <b>" + dec(v) + "</b>"]
    };
  });

  add("U1L6-mild-negative", "L6", "mild", function () {
    var s = smallSci(), who = R.pick(CREW);
    return {
      text: who + " says <b>" + sci(s) + "</b> is a negative number “because the exponent is negative.” Is " + sci(s) + " positive or negative?",
      answer: "Positive", type: "choice", options: ["Positive", "Negative"], maxTries: 1,
      steps: [sci(s) + " = " + dec(sciVal(s)) + ".", "A negative exponent means a small number between 0 and 1, so it is <b>Positive</b>."]
    };
  });

  add("U1L6-med-fix", "L6", "medium", function () {
    var a = R.step(1.1, 9.9, 0.1), e = -R.int(3, 8), shift = R.pick([1, 2, -1]);
    var shownA = F.roundTo(a * Math.pow(10, shift), 6), shownE = e - shift;
    return {
      text: "Rewrite in proper scientific notation:&nbsp;&nbsp; <b>" + c(shownA, 6) + " × 10" + sup(shownE) + "</b>",
      answer: { a: a, e: e }, type: "sci",
      steps: [shift > 0 ? "The front number is too big: divide it by " + c(Math.pow(10, shift)) + " and raise the exponent by " + shift + " (" + c(shownE) + " + " + shift + " = " + e + ")." :
        "The front number is less than 1: multiply it by 10 and lower the exponent by 1 (" + c(shownE) + " − 1 = " + e + ").", "<b>" + F.sci(a, e) + "</b>"],
      mistakes: [{ answer: { a: a, e: shownE - shift }, message: "Right front number, but the exponent went the wrong way. Front smaller → exponent up (closer to zero)." }]
    };
  });

  add("U1L6-med-compare", "L6", "medium", function () {
    var v = until(function () { return [smallSci(), smallSci()]; }, function (p) { return Math.abs(p[0].e - p[1].e) <= 1 && sciVal(p[0]) !== sciVal(p[1]) && (p[0].a > p[1].a) === (p[0].e < p[1].e); });
    var ans = sciVal(v[0]) < sciVal(v[1]) ? "<" : ">";
    return {
      text: "Choose &lt; or &gt; without converting to decimals:&nbsp;&nbsp; <b>" + sci(v[0]) + "</b> ___ <b>" + sci(v[1]) + "</b>",
      answer: ans, type: "choice", options: ["<", ">"], maxTries: 1,
      steps: [v[0].e !== v[1].e ? "Compare exponents first: " + c(v[0].e) + " vs " + c(v[1].e) + ". The more negative exponent is the smaller number." : "Exponents match, so compare front numbers.", "So <b>" + ans + "</b>"]
    };
  });

  add("U1L6-med-order", "L6", "medium", function () {
    var nums = until(function () { var b = -R.int(3, 6); return [0, 1, 2, 3].map(function () { return { a: R.step(1.1, 9.9, 0.1), e: b - R.int(0, 2) }; }); },
      function (ns) { return new Set(ns.map(sciVal)).size === 4; });
    var o = orderQ(nums.map(function (s) { return { text: sci(s), value: sciVal(s) }; }));
    return {
      text: "Order from <b>least to greatest</b> (type the letters):<br>" + o.list,
      answer: o.answer, type: "order",
      steps: ["Most negative exponent = smallest. Same exponent: compare front numbers.", o.sorted.map(function (it) { return it.text; }).join(" < "), "<b>" + o.answer.join(", ") + "</b>"]
    };
  });

  add("U1L6-med-filter", "L6", "medium", function () {
    var lim = { a: R.int(2, 8), e: -R.int(4, 6) }, grain = R.int(11, 99), ge = lim.e - 1, gv = grain * Math.pow(10, ge), g = toSci(gv), through = gv < sciVal(lim);
    return {
      text: "Roz's dust filter lets through grains narrower than <b>" + sci(lim) + " m</b>. A grain measures <b>" + grain + " × 10" + sup(ge) + " m</b>. Does it get through?",
      answer: through ? "Yes" : "No", type: "choice", options: ["Yes", "No"], maxTries: 1,
      steps: ["Proper form first: " + grain + " × 10" + sup(ge) + " = " + sci(g) + ".", (g.e === lim.e ? "Exponents match; compare " + c(g.a) + " and " + lim.a + "." : "Compare exponents: " + c(g.e) + " vs " + c(lim.e) + "."),
        "The grain is " + (through ? "narrower" : "wider") + ", so <b>" + (through ? "Yes" : "No") + "</b>."]
    };
  });

  add("U1L6-spicy-times", "L6", "spicy", function () {
    var a = R.int(2, 9), e = -R.int(4, 8), k = R.pick([40, 50, 500, 200, 20]), prod = a * k, s = toSci(prod * Math.pow(10, e)), thing = R.pick(["bacterium", "dust grain", "crystal"]);
    return {
      text: "A " + thing + " is <b>" + F.sci(a, e) + " m</b> long. How long would <b>" + k + "</b> of them be, lined up end to end? Proper form.",
      answer: s, type: "sci",
      steps: [k + " × " + a + " = " + prod + ", so " + prod + " × 10" + sup(e) + ".", "Fix the form: " + prod + " = " + sci(toSci(prod)) + ", so <b>" + sci(s) + "</b> m"]
    };
  });

  add("U1L6-spicy-howmany", "L6", "spicy", function () {
    var v = until(function () { var q = R.int(2, 4), b = R.int(2, 3), eb = -R.int(6, 9), ea = -R.int(2, 5); return { q: q, b: b, a: q * b, ea: ea, eb: eb }; }, function (v) { return v.a < 10; });
    var eq = v.ea - v.eb;
    return {
      text: "A strip on the Moon base is <b>" + F.sci(v.a, v.ea) + " m</b> long. A virus is <b>" + F.sci(v.b, v.eb) + " m</b> wide. How many viruses fit side by side along the strip? Proper form.",
      answer: { a: v.q, e: eq }, type: "sci",
      steps: ["Divide: front numbers " + v.a + " ÷ " + v.b + " = " + v.q + ".", "10" + sup(v.eb) + " up to 10" + sup(v.ea) + " is " + c(eq) + " places, so × 10" + sup(eq) + ".", "<b>" + F.sci(v.q, eq) + "</b>"],
      mistakes: [{ answer: { a: v.q, e: v.ea + v.eb }, message: "Dividing powers of ten: SUBTRACT the exponents (" + c(v.ea) + " − (" + c(v.eb) + "))." }]
    };
  });

  add("U1L6-spicy-mistake", "L6", "spicy", function () {
    var who = R.pick(CREW), q = R.int(2, 3), b = R.int(2, 3), a = q * b, ea = -R.int(3, 5), eb = ea - R.int(2, 4), eq = ea - eb;
    return {
      text: who + " calculated: (" + F.sci(a, ea) + ") ÷ (" + F.sci(b, eb) + ") = " + F.sci(q, ea + eb) + ". <b>Find the mistake</b> and write the correct answer.",
      answer: { a: q, e: eq }, type: "sci",
      steps: ["<b>The mistake:</b> " + who + "'s answer is tiny, but " + F.sci(a, ea) + " is much BIGGER than " + F.sci(b, eb) + ", so the answer must be big.",
        a + " ÷ " + b + " = " + q + "; subtract exponents: " + c(ea) + " − (" + c(eb) + ") = " + c(eq) + ".", "<b>" + F.sci(q, eq) + "</b>"],
      mistakes: [{ answer: { a: q, e: ea + eb }, message: "That's " + who + "'s answer. Dividing: subtract the exponents." }]
    };
  });

  // =====================================================================
  // L7 — The real number line
  // =====================================================================
  add("U1L7-mild-decimal", "L7", "mild", function () {
    var k = R.int(0, 2), q;
    if (k === 0) { var f = R.pick([[3, 8], [5, 8], [1, 4], [3, 4], [2, 5], [7, 20], [9, 4], [15, 2], [1, 8]]); q = { t: f[0] + "/" + f[1], v: f[0] / f[1], s: f[0] + " ÷ " + f[1] }; }
    else if (k === 1) { var a = R.step(1.1, 9.9, 0.1), e = -R.int(1, 3); q = { t: F.sci(a, e), v: a * Math.pow(10, e), s: "slide the decimal " + (-e) + " place" + (e < -1 ? "s" : "") + " left" }; }
    else { var r = R.int(2, 12); q = { t: "√" + r * r, v: r, s: r + " × " + r + " = " + r * r }; }
    return {
      text: "Write <b>" + q.t + "</b> as a decimal.",
      answer: F.roundTo(q.v, 8), type: "number", dp: 6,
      steps: [q.t + ": " + q.s + ".", "= <b>" + c(q.v, 8) + "</b>"]
    };
  });

  add("U1L7-mild-root-vs-whole", "L7", "mild", function () {
    var n = R.int(3, 12), N = n * n + R.pick([-2, -1, 1, 2, 3]), ans = N < n * n ? "<" : ">";
    return {
      text: "Choose &lt; or &gt; without a calculator:&nbsp;&nbsp; <b>√" + N + "</b> ___ <b>" + n + "</b>",
      answer: ans, type: "choice", options: ["<", ">"], maxTries: 1,
      steps: ["Square both: " + N + " and " + n + "² = " + n * n + ".", N + (ans === "<" ? " < " : " > ") + n * n + ", so √" + N + " <b>" + ans + "</b> " + n + "."]
    };
  });

  add("U1L7-mild-sci-zero", "L7", "mild", function () {
    var a = R.step(1.1, 9.9, 0.1), e1 = R.int(-2, 0), e2 = e1 + R.pick([-1, 1]), A = a * Math.pow(10, e1), B = a * Math.pow(10, e2), ans = A < B ? "<" : ">";
    return {
      text: "Choose &lt; or &gt;:&nbsp;&nbsp; <b>" + F.sci(a, e1) + "</b> ___ <b>" + F.sci(a, e2) + "</b>",
      answer: ans, type: "choice", options: ["<", ">"], maxTries: 1,
      steps: [F.sci(a, e1) + " = " + c(A, 6) + " and " + F.sci(a, e2) + " = " + c(B, 6) + ".", "So <b>" + ans + "</b> (bigger exponent, bigger number)."]
    };
  });

  add("U1L7-mild-order", "L7", "mild", function () {
    var v = until(function () {
      var n = R.int(3, 8), N = n * n + R.int(1, 2 * n), half = R.pick([1, 3]) ;
      var fr = (2 * n + half) + "/2", frV = n + half / 2, s = F.roundTo(n + R.int(1, 9) / 10, 1);
      return { items: [{ text: "√" + N, value: Math.sqrt(N) }, { text: fr, value: frV }, { text: F.sci(s, 0), value: s }] };
    }, function (v) { var vals = v.items.map(function (i) { return i.value; }).sort(); return vals[1] - vals[0] > 0.05 && vals[2] - vals[1] > 0.05; });
    var o = orderQ(R.shuffle(v.items));
    return {
      text: "Order from <b>least to greatest</b> (type the letters):<br>" + o.list,
      answer: o.answer, type: "order",
      steps: ["Write each as a decimal: " + o.sorted.map(function (it) { return it.text + " ≈ " + c(it.value, 2); }).join(", ") + ".", "<b>" + o.answer.join(", ") + "</b>"]
    };
  });

  add("U1L7-med-compare", "L7", "medium", function () {
    var w = R.int(3, 9), m = R.pick([[0.001, 1000], [0.0001, 10000], [0.01, 100]]), N = w * w + R.pick([-3, -2, -1, 1, 2, 3]);
    var left = w, ans = left * left < N ? "<" : ">";
    return {
      text: "Choose &lt; or &gt; without a calculator:&nbsp;&nbsp; <b>" + c(w * m[0], 6) + " × " + c(m[1]) + "</b> ___ <b>√" + N + "</b>",
      answer: ans, type: "choice", options: ["<", ">"], maxTries: 1,
      steps: [c(w * m[0], 6) + " × " + c(m[1]) + " = " + w + ".", w + "² = " + w * w + " and " + N + (ans === "<" ? " > " : " < ") + w * w + ", so <b>" + ans + "</b>"]
    };
  });

  add("U1L7-med-order", "L7", "medium", function () {
    var v = until(function () {
      var n = R.int(4, 8), N = n * n + R.int(2, 2 * n - 1), q = R.pick([1, 3]), mixedQ = R.pick([1, 3]);
      var items = [
        { text: "√" + N, value: Math.sqrt(N) },
        { text: (4 * n + 2) / 2 === 2 * n + 1 ? (2 * n + 1) + "/2" : (2 * n + 1) + "/2", value: (2 * n + 1) / 2 },
        { text: F.sci(F.roundTo(n + R.int(1, 4) / 10, 1), 0), value: 0 },
        { text: n + " " + mixedQ + "/4", value: n + mixedQ / 4 }
      ];
      items[2].value = parseFloat(items[2].text);
      return { items: items };
    }, function (v) { var vals = v.items.map(function (i) { return i.value; }).sort(function (a, b) { return a - b; }); return vals.every(function (x, i) { return i === 0 || x - vals[i - 1] > 0.04; }); });
    var o = orderQ(R.shuffle(v.items));
    return {
      text: "Order from <b>least to greatest</b> (type the letters):<br>" + o.list,
      answer: o.answer, type: "order",
      steps: ["Same form first (decimals): " + o.sorted.map(function (it) { return it.text + " = " + c(it.value, 2); }).join(", ") + " (for the root, square tenths to check).", "<b>" + o.answer.join(", ") + "</b>"]
    };
  });

  add("U1L7-med-estimate", "L7", "medium", function () {
    var N = nonSquare(40, 99), e = est(N), thing = R.pick(["tile", "solar panel", "hatch cover"]);
    return {
      text: "A square " + thing + " has an area of <b>" + N + " cm²</b>. Estimate its side length to one decimal place." + hint(e),
      answer: e.best, type: "number", dp: 1, tol: 0.1, unit: "cm",
      steps: estSteps(N, e)
    };
  });

  add("U1L7-med-mistake", "L7", "medium", function () {
    var who = R.pick(CREW), N = nonSquare(30, 99), e = est(N), wrong = F.roundTo(e.best + R.pick([0.2, 0.3]), 1), w10 = Math.round(wrong * 10);
    return {
      text: who + " says √" + N + " ≈ " + c(wrong, 1) + ". Square " + c(wrong, 1) + " to test it <span class='note'>(" + w10 + " × " + w10 + " = " + w10 * w10 + ")</span>, then give a better estimate to one decimal place." + hint(e),
      answer: e.best, type: "number", dp: 1, tol: 0.1,
      steps: [c(wrong, 1) + "² = " + c(wrong * wrong, 2) + ", which is more than " + N + ", so " + c(wrong, 1) + " is too high."].concat(estSteps(N, e)),
      mistakes: [{ answer: wrong, message: "That's " + who + "'s estimate — square it: it's too big." }]
    };
  });

  add("U1L7-spicy-find-n", "L7", "spicy", function () {
    var v = until(function () { var t = R.step(4.1, 9.8, 0.1), lo = t * t, hi = (t + 0.1) * (t + 0.1), ns = []; for (var n = Math.ceil(lo + 1e-9); n < hi; n++) ns.push(n); return { t: t, lo: lo, hi: hi, ns: ns }; },
      function (v) { return v.ns.length === 1; });
    var a = Math.round(v.t * 10), b = a + 1;
    return {
      text: "Find the whole number n so that <b>" + c(v.t, 1) + " &lt; √n &lt; " + c(v.t + 0.1, 1) + "</b>. <span class='note'>(" + a + " × " + a + " = " + a * a + ", " + b + " × " + b + " = " + b * b + ")</span>",
      answer: v.ns[0], type: "number",
      steps: ["Square the boundaries: " + c(v.t, 1) + "² = " + c(v.lo, 2) + " and " + c(v.t + 0.1, 1) + "² = " + c(v.hi, 2) + ".", "n is between " + c(v.lo, 2) + " and " + c(v.hi, 2) + ", so n = <b>" + v.ns[0] + "</b>"]
    };
  });

  add("U1L7-spicy-park", "L7", "spicy", function () {
    var side = R.pick([300, 400, 500, 600, 700, 800, 900]), A = toSci(side * side), speed = R.pick([50, 80, 100, 120, 160, 200]);
    var per = 4 * side, t = per / speed;
    if (!exact(t)) { speed = 100; t = per / speed; }
    return {
      text: "A square park has an area of <b>" + sci(A) + " m²</b>. A jogger runs once around the edge at <b>" + speed + " m per minute</b>. How many minutes does one lap take?",
      answer: t, type: "number", unit: "minutes",
      steps: [sci(A) + " = " + c(side * side) + " m².", "Side = √" + c(side * side) + " = " + side + " m (" + side + " × " + side + " = " + c(side * side) + ").",
        "Perimeter = 4 × " + side + " = " + c(per) + " m.", "Time = " + c(per) + " ÷ " + speed + " = <b>" + c(t) + "</b> minutes"]
    };
  });
  function exact(x) { return Math.abs(Math.round(x * 100) - x * 100) < 1e-9; }

  add("U1L7-spicy-mistake", "L7", "spicy", function () {
    var who = R.pick(CREW), N = until(function () { return nonSquare(10, 99); }, function (n) { return n % 2 === 0; }), e = est(N);
    return {
      text: who + " says: “√" + N + " = " + N / 2 + ", because " + N + " ÷ 2 = " + N / 2 + ".” <b>Find the mistake</b>, then estimate √" + N + " to one decimal place." + hint(e),
      answer: e.best, type: "number", dp: 1, tol: 0.1,
      steps: ["<b>The mistake:</b> " + who + " halved " + N + ". A square root times itself makes " + N + ", and " + N / 2 + " × " + N / 2 + " = " + sq(N / 2) + "."].concat(estSteps(N, e)),
      mistakes: [{ answer: N / 2, message: "That's " + who + "'s answer. A square root is not half." }]
    };
  });

  add("U1L7-spicy-divide-ten", "L7", "spicy", function () {
    var N = nonSquare(2, 380), r = Math.sqrt(N), ans = r / 10 < 1 ? "Less than 1" : "Greater than 1", lo = Math.floor(r);
    return {
      text: "Without calculating: is <b>√" + N + " ÷ 10</b> greater than or less than 1?",
      answer: ans, type: "choice", options: ["Greater than 1", "Less than 1"], maxTries: 1,
      steps: [sq(lo) + " < " + N + " < " + sq(lo + 1) + ", so √" + N + " is between " + lo + " and " + (lo + 1) + ".",
        "Dividing by 10 slides the digits right: between " + c(lo / 10) + " and " + c((lo + 1) / 10) + ". <b>" + ans + "</b>."]
    };
  });

  MP.registerUnit({
    id: "u1",
    number: 1,
    title: "Number Systems",
    story: "Roz's Moon Base",
    lessons: lessons,
    templates: templates
  });
})(window.MP);
