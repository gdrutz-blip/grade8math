/* UNIT 2 — Operations with Rational Numbers
   Stories (as in the class materials): Sana's crew plans a movie night (snack table, movie fund,
   popcorn sale, banner), the brownie pan, ribbon cutting, Weather Watch and Mira's mountain climb.
   Fractions use the { n, d } answer type ("fraction"); see js/engine.js. */
(function (MP) {
  "use strict";
  var R = MP.R, F = MP.F, Fr = MP.Fr;

  var CREW = ["Chloe", "Marco", "Saoirse", "Linnea", "Joaquin", "Marit", "Hugo", "Tess", "Zara", "Noah", "Lucas", "Simone",
    "Wren", "Felix", "Bianca", "Jasper", "Dashiell", "Anouk", "Hollis", "Wei"];

  function c(x, dp) { return F.num(x, dp === undefined ? 4 : dp); }
  function b(x) { return F.br(x); }                                   // (−5) for negatives
  function f(x) { return "<span class='fr'>" + Fr.text(x) + "</span>"; }   // 2 1/3
  function fi(x) { return "<span class='fr'>" + Fr.imp(x) + "</span>"; }  // 7/3
  function fb(x) { return "<span class='fr'>" + Fr.both(x) + "</span>"; } // 7/3 = 2 1/3
  function fm(n, d) { return Fr.make(n, d); }
  function until(make, ok) { for (var i = 0; i < 500; i++) { var v = make(); if (ok(v)) return v; } return make(); }
  function gcd(a, bb) { return MP.gcd(a, bb); }
  function lcm(a, bb) { return a / gcd(a, bb) * bb; }
  function sup(n) { return F.sup(n); }
  // a proper fraction with one of these denominators, already in lowest terms
  function properFr(dens) {
    return until(function () { var d = R.pick(dens); return fm(R.int(1, d - 1), d); }, function (x) { return x.d > 1; });
  }
  function mixedFr(wMin, wMax, dens) { var p = properFr(dens); return Fr.add(fm(R.int(wMin, wMax), 1), p); }
  // "2/3 = 8/12" style rewrite to a common denominator
  function toDen(x, D) { return x.n * (D / x.d) + "/" + D; }
  function sameDen(x, y) { return { D: lcm(x.d, y.d) }; }

  var lessons = [
    { id: "L1", n: 1, title: "Adding & subtracting fractions",
      keyMove: "Same-size pieces first: rewrite with a <b>common denominator</b>, then add or subtract the <b>numerators only</b>. Mixed numbers: estimate, convert, calculate, convert back, check." },
    { id: "L2", n: 2, title: "Multiplying fractions",
      keyMove: "<b>Top × top, bottom × bottom</b>, then simplify (or simplify first). Convert mixed numbers to improper fractions before multiplying." },
    { id: "L3", n: 3, title: "Dividing fractions",
      keyMove: "<b>Keep, change, flip</b>: keep the first fraction, change ÷ to ×, flip the second one only. Convert mixed numbers first." },
    { id: "L4", n: 4, title: "Adding integers",
      keyMove: "Same signs: <b>add and keep the sign</b>. Different signs: <b>find the difference</b> and take the sign of the number farther from zero." },
    { id: "L5", n: 5, title: "Subtracting integers",
      keyMove: "Subtracting is <b>adding the opposite</b>: 5 − (−3) = 5 + 3. A change is <b>final − start</b>." },
    { id: "L6", n: 6, title: "Multiplying & dividing integers",
      keyMove: "Work out the size, then the sign: <b>same signs → positive, different signs → negative</b>. Count the negatives: even → positive, odd → negative." },
    { id: "L7", n: 7, title: "Multiplying & dividing decimals",
      keyMove: "Multiply as whole numbers, then <b>count decimal places</b>. To divide by a decimal, <b>multiply both numbers by the same power of ten</b>. Estimate to check." },
    { id: "L8", n: 8, title: "Order of operations",
      keyMove: "<b>Brackets, exponents</b>, then × and ÷ left to right, then + and − left to right. (−3)² = 9 but −3² = −9." }
  ];

  var templates = [];
  function add(id, lesson, level, generate) {
    templates.push({ id: id, lesson: lesson, level: level, generate: function () { return MP.safeLT(generate()); } });
  }

  // ---------- fraction steps ----------
  function addSteps(x, y, op) {
    var D = lcm(x.d, y.d), r = op === "+" ? Fr.add(x, y) : Fr.sub(x, y);
    var s = [];
    if (x.d !== y.d) s.push("Common denominator " + D + ": " + fi(x) + " = " + toDen(x, D) + " and " + fi(y) + " = " + toDen(y, D) + ".");
    s.push((op === "+" ? "Add" : "Subtract") + " the numerators: " + toDen(x, D) + " " + op + " " + toDen(y, D) + " = " +
      (op === "+" ? x.n * (D / x.d) + y.n * (D / y.d) : x.n * (D / x.d) - y.n * (D / y.d)) + "/" + D + ".");
    var raw = (op === "+" ? x.n * (D / x.d) + y.n * (D / y.d) : x.n * (D / x.d) - y.n * (D / y.d));
    s.push("Simplify: " + (raw + "/" + D === Fr.imp(r) ? "" : raw + "/" + D + " = ") + "<b>" + fb(r) + "</b>");
    return s;
  }
  function mulSteps(x, y, show) {
    var raw = { n: x.n * y.n, d: x.d * y.d }, r = Fr.mul(x, y);
    return [(show || "") + "Top × top and bottom × bottom: " + fi(x) + " × " + fi(y) + " = " + raw.n + "/" + raw.d + ".",
      "Simplify: " + (raw.n + "/" + raw.d === Fr.imp(r) ? "" : raw.n + "/" + raw.d + " = ") + "<b>" + fb(r) + "</b>"];
  }
  function divSteps(x, y) {
    var flip = fm(y.d, y.n);
    return ["<b>Keep, change, flip:</b> " + fi(x) + " ÷ " + fi(y) + " = " + fi(x) + " × " + fi(flip) + "."].concat(mulSteps(x, flip));
  }
  function convertNote(xs) {
    var m = xs.filter(function (x) { return Math.abs(x.n) > x.d && x.d > 1; });
    return m.length ? "Convert to improper fractions: " + m.map(function (x) { return f(x) + " = " + fi(x); }).join(", ") + ". " : "";
  }

  // =====================================================================
  // L1 — Adding & subtracting fractions (Sana's snack table)
  // =====================================================================
  add("U2L1-mild-same", "L1", "mild", function () {
    var d = R.pick([5, 7, 8, 9, 10, 12]), a = R.int(2, d - 1), bb = R.int(1, d - 1), op = R.pick(["+", "−"]);
    if (op === "−" && a <= bb) { var t = a; a = bb; bb = t; }
    if (a === bb) bb = a - 1;
    var x = fm(a, d), y = fm(bb, d), r = op === "+" ? Fr.add(x, y) : Fr.sub(x, y), raw = op === "+" ? a + bb : a - bb;
    return {
      text: "Calculate <b>" + a + "/" + d + " " + op + " " + bb + "/" + d + "</b>. Simplify your answer.",
      answer: r, type: "fraction",
      steps: ["The pieces are already the same size (" + d + "ths), so " + (op === "+" ? "add" : "subtract") + " the numerators only: " + a + " " + op + " " + bb + " = " + raw + ".",
        raw + "/" + d + (raw + "/" + d === Fr.imp(r) ? " is already in lowest terms: <b>" + fb(r) + "</b>" : " simplifies to <b>" + fb(r) + "</b>")],
      mistakes: op === "+" ? [{ answer: fm(a + bb, 2 * d), message: "Never add the denominators — the pieces stay " + d + "ths." }] : []
    };
  });

  add("U2L1-mild-related", "L1", "mild", function () {
    var v = until(function () {
      var d1 = R.pick([2, 3, 4, 5]), k = R.pick([2, 3, 4]), d2 = d1 * k, x = fm(R.int(1, d1 - 1), d1), y = fm(R.int(1, d2 - 1), d2), op = R.pick(["+", "−"]);
      return { x: x, y: y, op: op };
    }, function (v) { return v.x.d !== v.y.d && (v.op === "+" || Fr.val(v.x) > Fr.val(v.y)) && (v.op === "−" || Fr.val(v.x) + Fr.val(v.y) < 2); });
    var r = v.op === "+" ? Fr.add(v.x, v.y) : Fr.sub(v.x, v.y);
    return {
      text: "Calculate <b>" + fi(v.x) + " " + v.op + " " + fi(v.y) + "</b>. Simplify your answer.",
      answer: r, type: "fraction",
      steps: addSteps(v.x, v.y, v.op === "+" ? "+" : "−"),
      mistakes: [{ answer: fm(v.op === "+" ? v.x.n + v.y.n : Math.abs(v.x.n - v.y.n) || 1, v.op === "+" ? v.x.d + v.y.d : Math.abs(v.x.d - v.y.d) || 1), message: "You can't " + (v.op === "+" ? "add" : "subtract") + " tops and bottoms. Make the pieces the same size first." }]
    };
  });

  add("U2L1-mild-unrelated", "L1", "mild", function () {
    var v = until(function () { return { x: properFr([2, 3, 4, 5, 6]), y: properFr([2, 3, 4, 5, 6]) }; },
      function (v) { return lcm(v.x.d, v.y.d) === v.x.d * v.y.d && v.x.d !== v.y.d; });
    var r = Fr.add(v.x, v.y), who = R.pick(CREW);
    return {
      text: "At Sana's snack table, " + who + " fills " + fi(v.x) + " of a bowl with popcorn and " + fi(v.y) + " of a bowl with pretzels. How many bowls is that altogether?",
      answer: r, type: "fraction", unit: "bowls",
      steps: addSteps(v.x, v.y, "+"),
      mistakes: [{ answer: fm(v.x.n + v.y.n, v.x.d + v.y.d), message: "Never add the denominators: " + fi(fm(v.x.n + v.y.n, v.x.d + v.y.d)) + " is even less than " + fi(Fr.val(v.x) > Fr.val(v.y) ? v.x : v.y) + "!" }]
    };
  });

  add("U2L1-mild-whole-minus", "L1", "mild", function () {
    var w = R.int(2, 5), x = properFr([2, 3, 4, 5, 6, 8]), r = Fr.sub(fm(w, 1), x);
    return {
      text: "Sana has <b>" + w + " L</b> of juice and pours out <b>" + fi(x) + " L</b>. How much is left?",
      answer: r, type: "fraction", unit: "L",
      steps: ["Write " + w + " with the same denominator: " + w + " = " + w * x.d + "/" + x.d + ".", w * x.d + "/" + x.d + " − " + fi(x) + " = <b>" + fb(r) + "</b>"],
    };
  });

  add("U2L1-med-mixed-sub", "L1", "medium", function () {
    var v = until(function () { return { x: mixedFr(3, 6, [2, 3, 4, 6, 8]), y: mixedFr(1, 2, [2, 3, 4, 6, 8]) }; },
      function (v) { var fx = Fr.val(v.x) % 1, fy = Fr.val(v.y) % 1; return fx < fy && v.x.d !== v.y.d; });
    var r = Fr.sub(v.x, v.y);
    return {
      text: "Calculate <b>" + f(v.x) + " − " + f(v.y) + "</b>. Estimate first.",
      answer: r, type: "fraction",
      steps: ["Estimate: about " + Math.round(Fr.val(v.x)) + " − " + Math.round(Fr.val(v.y)) + " = " + (Math.round(Fr.val(v.x)) - Math.round(Fr.val(v.y))) + ".",
        convertNote([v.x, v.y])].concat(addSteps(v.x, v.y, "−")).concat(["Check: close to the estimate ✓"])
    };
  });

  add("U2L1-med-mistake", "L1", "medium", function () {
    var who = R.pick(CREW), v = until(function () { return { x: mixedFr(3, 5, [4, 8, 6]), y: mixedFr(1, 2, [2, 3, 4]) }; },
      function (v) { return Fr.val(v.x) % 1 < Fr.val(v.y) % 1; });
    var wx = Math.floor(Fr.val(v.x)), wy = Math.floor(Fr.val(v.y)), px = Fr.sub(v.x, fm(wx, 1)), py = Fr.sub(v.y, fm(wy, 1));
    var wrongFrac = Fr.sub(py, px), wrong = Fr.add(fm(wx - wy, 1), wrongFrac), r = Fr.sub(v.x, v.y);
    return {
      text: who + " says: “" + f(v.x) + " − " + f(v.y) + " = " + f(wrong) + ", because " + wx + " − " + wy + " = " + (wx - wy) + " and the fractions give " + fi(wrongFrac) + ".” <b>Find the mistake.</b> What is the correct answer?",
      answer: r, type: "fraction",
      steps: ["<b>The mistake:</b> " + who + " flipped the fractions (" + fi(py) + " − " + fi(px) + " instead of " + fi(px) + " − " + fi(py) + "). Convert to improper fractions instead.",
        convertNote([v.x, v.y])].concat(addSteps(v.x, v.y, "−")),
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Convert to improper fractions, then subtract." }]
    };
  });

  add("U2L1-med-roll", "L1", "medium", function () {
    var v = until(function () { return { T: mixedFr(4, 7, [2, 4]), a: mixedFr(1, 2, [2, 4, 3]), bb: mixedFr(1, 1, [3, 4, 6, 2]) }; },
      function (v) { return Fr.val(Fr.sub(Fr.sub(v.T, v.a), v.bb)) > 0.2; });
    var r = Fr.sub(Fr.sub(v.T, v.a), v.bb), D = lcm(lcm(v.T.d, v.a.d), v.bb.d);
    return {
      text: "Sana has a <b>" + f(v.T) + " m</b> roll of paper. She uses <b>" + f(v.a) + " m</b> for a poster and <b>" + f(v.bb) + " m</b> for tickets. How much paper is left?",
      answer: r, type: "fraction", unit: "m",
      steps: [convertNote([v.T, v.a, v.bb]) + "Common denominator " + D + ".",
        toDen(v.T, D) + " − " + toDen(v.a, D) + " − " + toDen(v.bb, D) + " = " + ((v.T.n * D / v.T.d - v.a.n * D / v.a.d - v.bb.n * D / v.bb.d) + "/" + D === Fr.imp(r) ? "" : (v.T.n * D / v.T.d - v.a.n * D / v.a.d - v.bb.n * D / v.bb.d) + "/" + D + " = ") + "<b>" + fb(r) + "</b> m"]
    };
  });

  add("U2L1-med-fix", "L1", "medium", function () {
    var v = until(function () { return { x: properFr([5, 7, 8, 9]), y: properFr([3, 4, 6]) }; },
      function (v) { return Fr.val(v.x) > Fr.val(v.y) && v.x.n > v.y.n && v.x.d > v.y.d; });
    var r = Fr.sub(v.x, v.y), wrong = fm(v.x.n - v.y.n, v.x.d - v.y.d);
    return {
      text: "Fix this work:&nbsp;&nbsp; " + fi(v.x) + " − " + fi(v.y) + " = " + (v.x.n - v.y.n) + "/" + (v.x.d - v.y.d) + ". What is the correct answer?",
      answer: r, type: "fraction",
      steps: ["<b>The mistake:</b> you can't subtract tops and bottoms. Make the pieces the same size first."].concat(addSteps(v.x, v.y, "−")),
      mistakes: [{ answer: wrong, message: "That's the broken work. Use a common denominator." }]
    };
  });

  add("U2L1-spicy-table", "L1", "spicy", function () {
    var v = until(function () {
      var parts = R.shuffle([fm(1, 3), fm(1, 4), fm(1, 6), fm(1, 2), fm(1, 5), fm(1, 10), fm(1, 12), fm(1, 8)]).slice(0, 3);
      var used = parts.reduce(function (a, x) { return Fr.add(a, x); }, fm(0, 1)), rest = Fr.sub(fm(1, 1), used);
      var N = R.int(2, 6) * lcm(lcm(parts[0].d, parts[1].d), parts[2].d);
      return { parts: parts, rest: rest, N: N };
    }, function (v) { return Fr.val(v.rest) > 0 && Number.isInteger(v.N * Fr.val(v.rest)) && v.N <= 120; });
    var names = ["popcorn", "pretzels", "fruit"], items = v.N * v.rest.n / v.rest.d;
    var D = lcm(lcm(v.parts[0].d, v.parts[1].d), v.parts[2].d);
    return {
      text: "Sana plans the snack table: " + v.parts.map(function (x, i) { return fi(x) + " is " + names[i]; }).join(", ") + ". The rest is drinks. " +
        "The table holds <b>" + v.N + " items</b>. What fraction is drinks, and how many items is that?",
      parts: [{ label: "Fraction that is drinks", answer: v.rest, type: "fraction" }, { label: "Drink items", answer: items, type: "number" }],
      steps: ["Add the parts: " + v.parts.map(function (x) { return toDen(x, D); }).join(" + ") + " = " + (D - v.rest.n * D / v.rest.d) + "/" + D + ".",
        "Drinks: " + D + "/" + D + " − " + (D - v.rest.n * D / v.rest.d) + "/" + D + " = <b>" + fb(v.rest) + "</b>.",
        fi(v.rest) + " of " + v.N + " = " + v.N + " ÷ " + v.rest.d + " × " + v.rest.n + " = <b>" + c(items) + "</b> items"]
    };
  });

  add("U2L1-spicy-missing", "L1", "spicy", function () {
    var v = until(function () { return { x: mixedFr(1, 3, [2, 3, 4, 5]), y: mixedFr(3, 5, [3, 4, 5, 6]) }; },
      function (v) { return Fr.val(v.y) - Fr.val(v.x) > 0.5 && v.x.d !== v.y.d; });
    var r = Fr.sub(v.y, v.x);
    return {
      text: "Find the missing number:&nbsp;&nbsp; <b>" + f(v.x) + " + ___ = " + f(v.y) + "</b>",
      answer: r, type: "fraction",
      steps: ["Work backwards: missing = " + f(v.y) + " − " + f(v.x) + ".", convertNote([v.x, v.y])].concat(addSteps(v.y, v.x, "−")).concat(["Check: " + f(v.x) + " + " + f(r) + " = " + f(v.y) + " ✓"])
    };
  });

  add("U2L1-spicy-mistake", "L1", "spicy", function () {
    var who = R.pick(CREW), set = R.pick([[fm(1, 2), fm(1, 3), fm(1, 6)], [fm(1, 4), fm(1, 2), fm(1, 8)], [fm(2, 3), fm(1, 6), fm(1, 2)], [fm(1, 3), fm(1, 4), fm(1, 12)], [fm(3, 5), fm(1, 2), fm(1, 10)]]);
    var r = set.reduce(function (a, x) { return Fr.add(a, x); }, fm(0, 1)), D = lcm(lcm(set[0].d, set[1].d), set[2].d);
    var wrong = fm(set[0].n + set[1].n + set[2].n, set[0].d + set[1].d + set[2].d);
    return {
      text: who + " says: “" + set.map(fi).join(" + ") + " = " + (set[0].n + set[1].n + set[2].n) + "/" + (set[0].d + set[1].d + set[2].d) + ".” <b>Find the mistake.</b> What is the correct sum?",
      answer: r, type: "fraction",
      steps: ["<b>The mistake:</b> " + who + " added the tops and the bottoms. (The answer is less than " + fi(set[0]) + " — that can't be right.)",
        "Common denominator " + D + ": " + set.map(function (x) { return toDen(x, D); }).join(" + ") + " = " + set.reduce(function (a, x) { return a + x.n * D / x.d; }, 0) + "/" + D + " = <b>" + fb(r) + "</b>"],
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer — never add the denominators." }]
    };
  });

  add("U2L1-spicy-pizza", "L1", "spicy", function () {
    var v = until(function () { return { T: R.int(5, 8), a: mixedFr(1, 2, [8, 4]), bb: mixedFr(1, 2, [4, 2]), cc: mixedFr(1, 1, [2, 8]) }; },
      function (v) { var left = v.T - Fr.val(v.a) - Fr.val(v.bb) - Fr.val(v.cc); return left > 0.1 && left < 2; });
    var eaten = Fr.add(Fr.add(v.a, v.bb), v.cc), left = Fr.sub(fm(v.T, 1), eaten);
    return {
      text: "Sana's crew orders <b>" + v.T + " pizzas</b>. Group A eats <b>" + f(v.a) + "</b>, Group B eats <b>" + f(v.bb) + "</b> and Group C eats <b>" + f(v.cc) + "</b>. How much pizza is left over?",
      answer: left, type: "fraction", unit: "pizzas",
      steps: ["Eaten: " + fi(v.a) + " + " + fi(v.bb) + " + " + fi(v.cc) + " = " + fb(eaten) + ".", "Left: " + v.T + " − " + f(eaten) + " = <b>" + fb(left) + "</b>"],
      mistakes: [{ answer: eaten, message: "That's how much was EATEN. Subtract it from " + v.T + "." }]
    };
  });

  // =====================================================================
  // L2 — Multiplying fractions (the brownie pan)
  // =====================================================================
  add("U2L2-mild-basic", "L2", "mild", function () {
    var x = properFr([2, 3, 4, 5, 7, 8]), y = properFr([3, 4, 5, 6, 9, 10]), r = Fr.mul(x, y);
    return {
      text: "Multiply in lowest terms:&nbsp;&nbsp; <b>" + fi(x) + " × " + fi(y) + "</b>",
      answer: r, type: "fraction", steps: mulSteps(x, y),
      mistakes: [{ answer: fm(x.n * y.n, x.d + y.d), message: "Multiply the bottoms too (don't add them)." }]
    };
  });

  add("U2L2-mild-whole", "L2", "mild", function () {
    var w = R.int(2, 6), x = properFr([3, 4, 5, 6, 8]), r = Fr.mul(fm(w, 1), x);
    return {
      text: "Each brownie pan is " + fi(x) + " full. Sana has <b>" + w + "</b> pans. How many full pans of brownies is that? (<b>" + w + " × " + fi(x) + "</b>)",
      answer: r, type: "fraction", unit: "pans",
      steps: ["Write the whole number over 1: " + w + " = " + w + "/1."].concat(mulSteps(fm(w, 1), x)),
      mistakes: [{ answer: fm(w * x.n, w * x.d), message: "Only the top gets multiplied by " + w + ": " + w + "/1 × " + fi(x) + "." }]
    };
  });

  add("U2L2-mild-mixed", "L2", "mild", function () {
    var x = mixedFr(1, 2, [2, 3, 4]), y = properFr([2, 3, 4, 5]), r = Fr.mul(x, y);
    return {
      text: "Multiply:&nbsp;&nbsp; <b>" + f(x) + " × " + fi(y) + "</b>",
      answer: r, type: "fraction",
      steps: [convertNote([x])].concat(mulSteps(x, y))
    };
  });

  add("U2L2-mild-of", "L2", "mild", function () {
    var x = properFr([2, 3, 4]), y = properFr([3, 4, 5, 6]), r = Fr.mul(x, y), who = R.pick(CREW);
    return {
      text: "The brownie pan is " + fi(y) + " full. " + who + " takes <b>" + fi(x) + " of what's there</b>. What fraction of the whole pan does " + who + " take?",
      answer: r, type: "fraction",
      steps: ["“" + fi(x) + " of” means multiply: " + fi(x) + " × " + fi(y) + "."].concat(mulSteps(x, y))
    };
  });

  add("U2L2-med-simplify", "L2", "medium", function () {
    var v = until(function () {
      var a = R.int(2, 9), bb = R.int(2, 9), k1 = R.int(2, 4), k2 = R.int(2, 5);
      return { x: fm(a, bb * k1), y: fm(bb * k2 > 0 ? bb : 1, a * k2) };
    }, function (v) { return v.x.n < v.x.d && v.y.n < v.y.d && v.x.d > 4 && v.y.d > 4; });
    var r = Fr.mul(v.x, v.y);
    return {
      text: "Estimate, then multiply in lowest terms:&nbsp;&nbsp; <b>" + fi(v.x) + " × " + fi(v.y) + "</b>",
      answer: r, type: "fraction",
      steps: ["Shortcut: simplify a top with a bottom before multiplying."].concat(mulSteps(v.x, v.y))
    };
  });

  add("U2L2-med-mixed2", "L2", "medium", function () {
    var x = mixedFr(1, 3, [2, 3, 4]), y = mixedFr(1, 2, [2, 3, 4, 5]), r = Fr.mul(x, y);
    return {
      text: "Estimate, then multiply:&nbsp;&nbsp; <b>" + f(x) + " × " + f(y) + "</b>",
      answer: r, type: "fraction",
      steps: ["Estimate: about " + Math.round(Fr.val(x)) + " × " + Math.round(Fr.val(y)) + " = " + Math.round(Fr.val(x)) * Math.round(Fr.val(y)) + ".", convertNote([x, y])].concat(mulSteps(x, y)),
      mistakes: [{ answer: Fr.add(fm(Math.floor(Fr.val(x)) * Math.floor(Fr.val(y)), 1), Fr.mul(Fr.sub(x, fm(Math.floor(Fr.val(x)), 1)), Fr.sub(y, fm(Math.floor(Fr.val(y)), 1)))),
        message: "Don't multiply the wholes and the fractions separately — that's too small. Convert to improper fractions first." }]
    };
  });

  add("U2L2-med-mistake", "L2", "medium", function () {
    var who = R.pick(CREW), x = mixedFr(2, 3, [2, 3]), y = mixedFr(1, 1, [3, 4, 2]);
    var wx = Math.floor(Fr.val(x)), wy = Math.floor(Fr.val(y)), px = Fr.sub(x, fm(wx, 1)), py = Fr.sub(y, fm(wy, 1)), wrong = Fr.add(fm(wx * wy, 1), Fr.mul(px, py)), r = Fr.mul(x, y);
    return {
      text: who + " says " + f(x) + " × " + f(y) + " = " + f(wrong) + ", “because " + wx + " × " + wy + " = " + wx * wy + " and " + fi(px) + " × " + fi(py) + " = " + fi(Fr.mul(px, py)) + ".” <b>Find the mistake.</b> What is the correct answer?",
      answer: r, type: "fraction",
      steps: ["<b>The mistake:</b> " + who + " multiplied the wholes and fractions separately. The answer must be more than " + f(x) + " (it's multiplied by more than 1), so " + f(wrong) + " is too small.",
        convertNote([x, y])].concat(mulSteps(x, y)),
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Convert to improper fractions first." }]
    };
  });

  add("U2L2-med-recipe", "L2", "medium", function () {
    var x = mixedFr(1, 3, [4, 3, 2]), y = R.pick([fm(3, 2), fm(5, 2), fm(5, 4), fm(4, 3), fm(7, 4)]), r = Fr.mul(x, y);
    return {
      text: "Sana's brownie recipe needs <b>" + f(x) + " cups</b> of flour per batch. How many cups for <b>" + f(y) + "</b> batches?",
      answer: r, type: "fraction", unit: "cups",
      steps: [convertNote([x, y])].concat(mulSteps(x, y))
    };
  });

  add("U2L2-spicy-mini", "L2", "spicy", function () {
    var L = mixedFr(2, 4, [2, 4]), W = mixedFr(1, 3, [2, 3]), sx = properFr([3, 4, 5]), sy = properFr([4, 5, 6]);
    var A = Fr.mul(L, W), mini = Fr.mul(Fr.mul(sx, sy), A);
    return {
      text: "A brownie pan is <b>" + f(L) + " in</b> long and <b>" + f(W) + " in</b> wide. A mini pan is " + fi(sx) + " as long and " + fi(sy) + " as wide. What is the area of the mini pan?",
      answer: mini, type: "fraction", unit: "in²",
      steps: ["Big pan area: " + fi(L) + " × " + fi(W) + " = " + fb(A) + " in².",
        "The mini pan's area is " + fi(sx) + " × " + fi(sy) + " = " + fi(Fr.mul(sx, sy)) + " of that.",
        fi(Fr.mul(sx, sy)) + " × " + fi(A) + " = <b>" + fb(mini) + "</b> in²"],
      mistakes: [{ answer: A, message: "That's the big pan. Now shrink both the length and the width." }]
    };
  });

  add("U2L2-spicy-mistake", "L2", "spicy", function () {
    var who = R.pick(CREW), v = until(function () { var a = R.int(2, 5), k = R.int(2, 3), bb = R.int(a + 1, 9), dd = R.int(a * k + 1, 12); return { x: fm(a, bb), y: fm(a * k, dd), a: a, k: k }; },
      function (v) { return v.x.n === v.a && v.y.n === v.a * v.k && v.y.n < v.y.d; });
    var r = Fr.mul(v.x, v.y), wrong = fm(1 * v.k, v.x.d * v.y.d);
    return {
      text: who + " says " + fi(v.x) + " × " + fi(v.y) + " = 1/" + v.x.d + " × " + v.k + "/" + v.y.d + " = " + fi(wrong) + ", “because " + v.a + " goes into " + v.a * v.k + ".” <b>Find the mistake.</b> What is the correct product?",
      answer: r, type: "fraction",
      steps: ["<b>The mistake:</b> " + who + " cancelled two numbers that are both on TOP. You can only simplify a top with a bottom."].concat(mulSteps(v.x, v.y)),
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Only cancel a top with a bottom." }]
    };
  });

  add("U2L2-spicy-sugar", "L2", "spicy", function () {
    var S = mixedFr(1, 3, [4, 2, 3]), used = R.pick([fm(2, 3), fm(1, 2), fm(3, 4), fm(1, 3)]), part = R.pick([fm(1, 3), fm(1, 2), fm(1, 4)]);
    var left = Fr.mul(Fr.sub(fm(1, 1), used), S), icing = Fr.mul(part, left);
    return {
      text: "Sana has <b>" + f(S) + " cups</b> of sugar. " + fi(used) + " of it goes into the brownies. Then " + fi(part) + " of what is left goes into the icing. How much sugar goes into the icing?",
      answer: icing, type: "fraction", unit: "cups",
      steps: [fi(used) + " used means " + fi(Fr.sub(fm(1, 1), used)) + " is left: " + fi(Fr.sub(fm(1, 1), used)) + " × " + fi(S) + " = " + fb(left) + " cups.",
        "Icing: " + fi(part) + " × " + fi(left) + " = <b>" + fb(icing) + "</b> cups"],
      mistakes: [{ answer: Fr.mul(part, S), message: "The icing gets " + fi(part) + " of what is LEFT, not of all the sugar." }]
    };
  });

  add("U2L2-spicy-banner", "L2", "spicy", function () {
    var L = mixedFr(2, 3, [3, 2]), W = mixedFr(1, 2, [4, 2]), p = properFr([3, 4, 5]), A = Fr.mul(L, W), blue = Fr.mul(p, A);
    return {
      text: "Sana's movie-night banner is <b>" + f(L) + " m</b> long and <b>" + f(W) + " m</b> wide. " + fi(p) + " of it is painted blue. What is the area of the blue part?",
      answer: blue, type: "fraction", unit: "m²",
      steps: ["Area: " + fi(L) + " × " + fi(W) + " = " + fb(A) + " m².", "Blue: " + fi(p) + " × " + fi(A) + " = <b>" + fb(blue) + "</b> m²"],
      mistakes: [{ answer: A, message: "That's the whole banner. Find " + fi(p) + " of it." }]
    };
  });

  // =====================================================================
  // L3 — Dividing fractions (ribbon cutting)
  // =====================================================================
  add("U2L3-mild-recip", "L3", "mild", function () {
    var k = R.int(0, 2), x = k === 0 ? properFr([3, 4, 5, 7, 8]) : k === 1 ? fm(R.int(2, 9), 1) : mixedFr(1, 2, [2, 3, 4]);
    var r = fm(x.d, x.n), shown = k === 2 ? f(x) : fi(x);
    return {
      text: "Write the reciprocal of <b>" + shown + "</b>.",
      answer: r, type: "fraction",
      steps: [k === 2 ? "Convert first: " + f(x) + " = " + fi(x) + "." : k === 1 ? "A whole number is a fraction over 1: " + x.n + " = " + x.n + "/1." : "Flip the fraction.",
        "Flip it: <b>" + fb(r) + "</b> (check: " + fi(x) + " × " + fi(r) + " = 1)"],
      mistakes: k === 2 ? [{ answer: Fr.add(fm(Math.floor(Fr.val(x)), 1), fm(x.d === 1 ? 1 : (Fr.sub(x, fm(Math.floor(Fr.val(x)), 1)).d), Fr.sub(x, fm(Math.floor(Fr.val(x)), 1)).n)), message: "Convert the mixed number to an improper fraction BEFORE flipping." }] : []
    };
  });

  add("U2L3-mild-basic", "L3", "mild", function () {
    var x = properFr([2, 3, 4, 5, 6, 8]), y = properFr([3, 4, 5, 6, 9, 10]), r = Fr.div(x, y);
    return {
      text: "Divide in lowest terms:&nbsp;&nbsp; <b>" + fi(x) + " ÷ " + fi(y) + "</b>",
      answer: r, type: "fraction", steps: divSteps(x, y),
      mistakes: [{ answer: Fr.mul(fm(x.d, x.n), y), message: "Flip the SECOND fraction, not the first." }, { answer: Fr.mul(x, y), message: "Dividing: flip the second fraction and multiply." }]
    };
  });

  add("U2L3-mild-whole", "L3", "mild", function () {
    var w = R.int(2, 12), x = properFr([2, 3, 4, 5]), r = Fr.div(fm(w, 1), x);
    return {
      text: "Sana has <b>" + w + " m</b> of ribbon. Each bow needs <b>" + fi(x) + " m</b>. How many bows can she make? (" + w + " ÷ " + fi(x) + ")",
      answer: r, type: "fraction", unit: "bows",
      steps: ["How many " + fi(x) + "s fit in " + w + "?", w + " ÷ " + fi(x) + " = " + w + "/1 × " + fi(fm(x.d, x.n)) + " = " + w * x.d + "/" + x.n + " = <b>" + fb(r) + "</b>"],
      mistakes: [{ answer: Fr.mul(fm(w, 1), x), message: "Dividing by a fraction less than 1 gives MORE, not less. Flip and multiply." }]
    };
  });

  add("U2L3-mild-unit", "L3", "mild", function () {
    var n = R.int(2, 9), k = R.int(2, 6);
    return {
      text: "How many <b>1/" + k + "</b>s fit inside <b>" + n + "</b>? (" + n + " ÷ 1/" + k + ")",
      answer: fm(n * k, 1), type: "fraction",
      steps: ["Each whole holds " + k + " pieces of size 1/" + k + ".", n + " wholes hold " + n + " × " + k + " = <b>" + n * k + "</b>"],
      mistakes: [{ answer: fm(n, k), message: "That's " + n + " × 1/" + k + ". Dividing asks how many 1/" + k + "s FIT in " + n + "." }]
    };
  });

  add("U2L3-med-mixed", "L3", "medium", function () {
    var x = mixedFr(2, 4, [2, 3, 4]), y = R.pick([properFr([3, 4, 5, 6]), mixedFr(1, 1, [2, 3, 4])]), r = Fr.div(x, y);
    return {
      text: "Estimate, then divide:&nbsp;&nbsp; <b>" + f(x) + " ÷ " + f(y) + "</b>",
      answer: r, type: "fraction",
      steps: [convertNote([x, y])].concat(divSteps(x, y)),
      mistakes: [{ answer: Fr.mul(x, y), message: "That's multiplying. Keep, change, FLIP." }]
    };
  });

  add("U2L3-med-mistake", "L3", "medium", function () {
    var who = R.pick(CREW), x = properFr([3, 4, 5, 7]), y = properFr([3, 5, 7, 8]), r = Fr.div(x, y), wrong = Fr.mul(fm(x.d, x.n), fm(y.d, y.n));
    return {
      text: who + " says " + fi(x) + " ÷ " + fi(y) + " = " + fi(fm(x.d, x.n)) + " × " + fi(fm(y.d, y.n)) + " = " + fi(wrong) + ". <b>Find the mistake.</b> What is the correct answer?",
      answer: r, type: "fraction",
      steps: ["<b>The mistake:</b> " + who + " flipped both fractions. Only the second one gets flipped."].concat(divSteps(x, y)),
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Flip only the second fraction." }]
    };
  });

  add("U2L3-med-labels", "L3", "medium", function () {
    var v = until(function () { return { T: mixedFr(3, 6, [2, 4]), p: properFr([3, 4, 5, 6]) }; }, function (v) { return !Number.isInteger(Fr.val(Fr.div(v.T, v.p))); });
    var q = Fr.div(v.T, v.p), full = Math.floor(Fr.val(q));
    return {
      text: "A roll of ribbon is <b>" + f(v.T) + " m</b> long. Each label needs <b>" + fi(v.p) + " m</b>. How many <b>full</b> labels can Sana make?",
      answer: full, type: "number", unit: "labels",
      steps: [convertNote([v.T])].concat(divSteps(v.T, v.p)).concat(["Only whole labels count: <b>" + full + "</b> (the extra " + fi(Fr.sub(q, fm(full, 1))) + " isn't a full label)."]),
      mistakes: [{ answer: full + 1, message: "Round DOWN: the last piece isn't a full label." }]
    };
  });

  add("U2L3-spicy-missing", "L3", "spicy", function () {
    var y = properFr([3, 4, 5]), q = R.pick([fm(5, 2), fm(3, 2), fm(4, 3), fm(5, 4), fm(2, 1)]), r = Fr.mul(q, y);
    return {
      text: "Find the missing number:&nbsp;&nbsp; <b>___ ÷ " + fi(y) + " = " + fi(q) + "</b>",
      answer: r, type: "fraction",
      steps: ["Undo the division by multiplying: missing = " + fi(q) + " × " + fi(y) + "."].concat(mulSteps(q, y)).concat(["Check: " + fi(r) + " ÷ " + fi(y) + " = " + fi(q) + " ✓"]),
      mistakes: [{ answer: Fr.div(q, y), message: "Undo ÷ by multiplying, not dividing again." }]
    };
  });

  add("U2L3-spicy-lr", "L3", "spicy", function () {
    var x = properFr([2, 3, 4]), y = properFr([3, 4, 5]), z = properFr([5, 6, 8]), p = Fr.mul(x, y), r = Fr.div(p, z);
    return {
      text: "Calculate, working left to right:&nbsp;&nbsp; <b>" + fi(x) + " × " + fi(y) + " ÷ " + fi(z) + "</b>",
      answer: r, type: "fraction",
      steps: ["First: " + fi(x) + " × " + fi(y) + " = " + fi(p) + ".", "Then: " + fi(p) + " ÷ " + fi(z) + " = " + fi(p) + " × " + fi(fm(z.d, z.n)) + " = <b>" + fb(r) + "</b>"]
    };
  });

  add("U2L3-spicy-mistake", "L3", "spicy", function () {
    var who = R.pick(CREW), w = R.int(2, 4), k = R.pick([2, 3, 4]), x = Fr.add(fm(w, 1), fm(1, k)), r = Fr.div(x, fm(1, k)), wrong = Fr.add(fm(w * k, 1), fm(1, k));
    return {
      text: who + " says " + f(x) + " ÷ 1/" + k + " = " + f(wrong) + ", “because I flip 1/" + k + " to get " + k + ", then " + w + " × " + k + " = " + w * k + " and I add the 1/" + k + ".” <b>Find the mistake.</b> What is the correct answer?",
      answer: r, type: "fraction",
      steps: ["<b>The mistake:</b> " + who + " only multiplied the whole number by " + k + ". The 1/" + k + " must be multiplied too — convert first.",
        f(x) + " = " + fi(x) + ", so " + fi(x) + " × " + k + " = <b>" + fb(r) + "</b>"],
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Convert to an improper fraction before multiplying." }]
    };
  });

  add("U2L3-spicy-bottles", "L3", "spicy", function () {
    var v = until(function () { return { M: mixedFr(4, 9, [2]), used: R.pick([fm(2, 5), fm(1, 3), fm(1, 4), fm(1, 2)]), bot: R.pick([fm(3, 4), fm(1, 2), fm(1, 4), fm(3, 8)]) }; },
      function (v) { var left = Fr.mul(Fr.sub(fm(1, 1), v.used), v.M); return Fr.val(left) > 1; });
    var left = Fr.mul(Fr.sub(fm(1, 1), v.used), v.M), n = Fr.div(left, v.bot), full = Math.floor(Fr.val(n));
    return {
      text: "Sana has <b>" + f(v.M) + " L</b> of lemonade. She uses " + fi(v.used) + " of it for the snack table and pours the rest into bottles that each hold <b>" + fi(v.bot) + " L</b>. How many bottles can she fill completely?",
      answer: full, type: "number", unit: "bottles",
      steps: ["Left: " + fi(Fr.sub(fm(1, 1), v.used)) + " × " + fi(v.M) + " = " + fb(left) + " L.",
        "Bottles: " + fi(left) + " ÷ " + fi(v.bot) + " = " + fi(left) + " × " + fi(fm(v.bot.d, v.bot.n)) + " = " + fb(n) + ".",
        "Full bottles: <b>" + full + "</b>"]
    };
  });

  // =====================================================================
  // L4 — Adding integers (the movie fund, temperatures)
  // =====================================================================
  function nz(a, bb) { return until(function () { return R.int(a, bb); }, function (x) { return x !== 0; }); }
  function sumSteps(nums) {
    var pos = nums.filter(function (x) { return x > 0; }), neg = nums.filter(function (x) { return x < 0; });
    var P = pos.reduce(function (a, x) { return a + x; }, 0), N = neg.reduce(function (a, x) { return a + x; }, 0);
    return ["Group them: positives " + (pos.length ? pos.map(c).join(" + ") + " = " + c(P) : "0") + "; negatives " + (neg.length ? neg.map(b).join(" + ") + " = " + c(N) : "0") + ".",
      c(P) + " + " + b(N) + " = <b>" + c(P + N) + "</b>"];
  }

  add("U2L4-mild-diff", "L4", "mild", function () {
    var a = nz(-20, 20), bb = until(function () { return nz(-20, 20); }, function (x) { return (x > 0) !== (a > 0); });
    var r = a + bb, far = Math.abs(a) > Math.abs(bb) ? a : bb;
    return {
      text: "Calculate <b>" + b(a) + " + " + b(bb) + "</b>.",
      answer: r, type: "number", zeroOk: true,
      steps: ["Different signs: find the difference: " + Math.max(Math.abs(a), Math.abs(bb)) + " − " + Math.min(Math.abs(a), Math.abs(bb)) + " = " + Math.abs(r) + ".",
        r === 0 ? "They are a zero pair: <b>0</b>" : "Take the sign of the number farther from zero (" + c(far) + "): <b>" + c(r) + "</b>"],
      mistakes: [{ answer: -(Math.abs(a) + Math.abs(bb)), message: "Different signs: find the DIFFERENCE, don't add the sizes." }, { answer: -r, message: "Check the sign: it matches the number farther from zero." }]
    };
  });

  add("U2L4-mild-same", "L4", "mild", function () {
    var a = -R.int(2, 25), bb = -R.int(2, 25);
    return {
      text: "Calculate <b>" + b(a) + " + " + b(bb) + "</b>.",
      answer: a + bb, type: "number",
      steps: ["Same signs: add the sizes and keep the sign.", Math.abs(a) + " + " + Math.abs(bb) + " = " + Math.abs(a + bb) + ", so <b>" + c(a + bb) + "</b>"],
      mistakes: [{ answer: Math.abs(a - bb) || 1, message: "Same signs: add and KEEP the sign. The difference is only for different signs." }, { answer: -(a + bb), message: "Two negatives added stay negative." }]
    };
  });

  add("U2L4-mild-temp", "L4", "mild", function () {
    var t = -R.int(3, 15), rise = R.int(2, 20);
    return {
      text: "Sana checks the temperature at the outdoor screen. It is <b>" + c(t) + "°C</b>. It rises <b>" + rise + " degrees</b>. What is the new temperature?",
      answer: t + rise, type: "number", unit: "°C", zeroOk: true,
      steps: [c(t) + " + " + rise + ": start at " + c(t) + " and move " + rise + " to the right.", "= <b>" + c(t + rise) + "</b>°C"],
      mistakes: [{ answer: t - rise, message: "Rising means move RIGHT (up)." }]
    };
  });

  add("U2L4-mild-three", "L4", "mild", function () {
    var a = R.int(5, 20), x = -R.int(2, 20), y = -R.int(2, 20), nums = R.shuffle([a, x, y]);
    return {
      text: "The movie fund changes by these amounts: <b>" + nums.map(function (n) { return (n > 0 ? "+$" : "−$") + Math.abs(n); }).join(", ") + "</b>. What is the total change? (Write a negative number for a loss.)",
      answer: a + x + y, type: "number", zeroOk: true,
      steps: ["As an integer sum: " + nums.map(b).join(" + ") + "."].concat(sumSteps(nums))
    };
  });

  add("U2L4-med-four", "L4", "medium", function () {
    var nums = until(function () { return [R.int(5, 40), -R.int(5, 40), R.int(5, 40), -R.int(5, 40)].sort(function () { return Math.random() - 0.5; }); },
      function (n) { return n.reduce(function (a, x) { return a + x; }, 0) !== 0; });
    var r = nums.reduce(function (a, x) { return a + x; }, 0);
    return { text: "Calculate <b>" + nums.map(b).join(" + ") + "</b>.", answer: r, type: "number", steps: sumSteps(nums) };
  });

  add("U2L4-med-mistake", "L4", "medium", function () {
    var who = R.pick(CREW), a = -R.int(4, 15), bb = -R.int(2, 12);
    return {
      text: who + " says: “" + b(a) + " + " + b(bb) + " = " + Math.abs(Math.abs(a) - Math.abs(bb)) + ", because the difference between " + Math.abs(a) + " and " + Math.abs(bb) + " is " + Math.abs(Math.abs(a) - Math.abs(bb)) + ".” <b>Find the mistake.</b> What is the correct answer?",
      answer: a + bb, type: "number",
      steps: ["<b>The mistake:</b> the difference is only used when the signs are DIFFERENT.", "Same signs: add and keep the sign: " + Math.abs(a) + " + " + Math.abs(bb) + " = " + Math.abs(a + bb) + ", so <b>" + c(a + bb) + "</b>"],
      mistakes: [{ answer: Math.abs(Math.abs(a) - Math.abs(bb)) || 1, message: "That's " + who + "'s answer. Same signs: add and keep the sign." }]
    };
  });

  add("U2L4-med-diver", "L4", "medium", function () {
    var start = -R.int(10, 30), ch = [R.int(3, 10), -R.int(5, 15), R.int(3, 12)], r = start + ch[0] + ch[1] + ch[2];
    return {
      text: "In Sana's movie trailer, a diver starts at <b>" + c(start) + " m</b>. She rises " + ch[0] + " m, dives " + (-ch[1]) + " m, then rises " + ch[2] + " m. What is her final position (in metres; below the surface is negative)?",
      answer: r, type: "number", unit: "m", zeroOk: true,
      steps: ["As an integer sum: " + [start].concat(ch).map(b).join(" + ") + "."].concat(sumSteps([start].concat(ch)))
    };
  });

  add("U2L4-med-missing", "L4", "medium", function () {
    var a = -R.int(2, 15), target = R.int(-10, 15), m = target - a;
    return {
      text: "Find the missing integer:&nbsp;&nbsp; <b>" + b(a) + " + ___ = " + c(target) + "</b>",
      answer: m, type: "number", zeroOk: true,
      steps: ["How far is it from " + c(a) + " to " + c(target) + " on a number line?", c(target) + " − " + b(a) + " = <b>" + c(m) + "</b>", "Check: " + b(a) + " + " + b(m) + " = " + c(target) + " ✓"]
    };
  });

  add("U2L4-spicy-hockey", "L4", "spicy", function () {
    var games = [0, 1, 2].map(function () { return [R.int(0, 6), R.int(0, 6)]; }), diffs = games.map(function (g) { return g[0] - g[1]; }), tot = diffs.reduce(function (a, x) { return a + x; }, 0);
    return {
      text: "Sana's hockey team plays three games. " + games.map(function (g, i) { return "Game " + (i + 1) + ": scores " + g[0] + ", allows " + g[1] + "."; }).join(" ") + " What is the total goal difference?",
      answer: tot, type: "number", zeroOk: true,
      steps: ["Each game's difference: " + diffs.map(b).join(", ") + ".", diffs.map(b).join(" + ") + " = <b>" + c(tot) + "</b>"]
    };
  });

  add("U2L4-spicy-consecutive", "L4", "spicy", function () {
    var mid = -R.int(2, 20), S = 3 * mid;
    return {
      text: "Find three consecutive integers that add to <b>" + c(S) + "</b>.",
      parts: [{ label: "Smallest", answer: mid - 1, type: "number" }, { label: "Middle", answer: mid, type: "number" }, { label: "Largest", answer: mid + 1, type: "number" }],
      steps: ["The middle number is the sum ÷ 3: " + c(S) + " ÷ 3 = " + c(mid) + ".", "So <b>" + c(mid - 1) + "</b>, <b>" + c(mid) + "</b>, <b>" + c(mid + 1) + "</b>.", "Check: " + [mid - 1, mid, mid + 1].map(b).join(" + ") + " = " + c(S) + " ✓"]
    };
  });

  add("U2L4-spicy-pair", "L4", "spicy", function () {
    var v = until(function () { var lo = R.int(-15, 3), gap = R.int(3, 12); return { lo: lo, hi: lo + gap, gap: gap }; }, function (v) { return v.lo + v.hi < 0 && v.lo !== 0 && v.hi !== 0; });
    var S = v.lo + v.hi;
    return {
      text: "Two integers add to <b>" + c(S) + "</b>. One is <b>" + v.gap + " more</b> than the other. What are the two integers?",
      parts: [{ label: "Smaller", answer: v.lo, type: "number" }, { label: "Larger", answer: v.hi, type: "number" }],
      steps: ["Take the gap away and split the rest: (" + c(S) + " − " + v.gap + ") ÷ 2 = " + c(v.lo) + ".", "So <b>" + c(v.lo) + "</b> and " + c(v.lo) + " + " + v.gap + " = <b>" + c(v.hi) + "</b>.", "Check: " + b(v.lo) + " + " + b(v.hi) + " = " + c(S) + " ✓"]
    };
  });

  add("U2L4-spicy-elevator", "L4", "spicy", function () {
    var start = R.int(1, 4), moves = [-R.int(3, 6), R.int(4, 9), -R.int(5, 9), R.int(2, 5)], end = moves.reduce(function (a, x) { return a + x; }, start);
    return {
      text: "Sana rides an elevator while picking up supplies. It starts on floor <b>" + start + "</b> (the ground floor is 0, parking levels are negative). It goes down " + (-moves[0]) + " floors, up " + moves[1] + ", down " + (-moves[2]) + ", then up " + moves[3] + ". What floor does it end on?",
      answer: end, type: "number", zeroOk: true,
      steps: ["As an integer sum: " + [start].concat(moves).map(b).join(" + ") + ".", "Step by step: " + moves.reduce(function (acc, m) { var last = acc[acc.length - 1]; acc.push(last + m); return acc; }, [start]).map(c).join(" → ") + ".", "Floor <b>" + c(end) + "</b>"]
    };
  });

  // =====================================================================
  // L5 — Subtracting integers (Weather Watch)
  // =====================================================================
  function subSteps(a, bb) {
    return ["Add the opposite: " + b(a) + " − " + b(bb) + " = " + b(a) + " + " + b(-bb) + ".", "= <b>" + c(a - bb) + "</b>"];
  }

  add("U2L5-mild-minus-neg", "L5", "mild", function () {
    var a = R.int(-15, 15), bb = -R.int(2, 15);
    return {
      text: "Calculate <b>" + b(a) + " − " + b(bb) + "</b>.", answer: a - bb, type: "number", zeroOk: true,
      steps: subSteps(a, bb), mistakes: [{ answer: a + bb, message: "Subtracting a negative is ADDING its opposite: − " + b(bb) + " becomes + " + c(-bb) + "." }]
    };
  });

  add("U2L5-mild-neg-minus-pos", "L5", "mild", function () {
    var a = -R.int(2, 20), bb = R.int(2, 20);
    return {
      text: "Calculate <b>" + b(a) + " − " + bb + "</b>.", answer: a - bb, type: "number",
      steps: subSteps(a, bb), mistakes: [{ answer: a + bb, message: "Subtracting a positive moves LEFT: " + c(a) + " − " + bb + " = " + b(a) + " + " + b(-bb) + "." }, { answer: -a + bb, message: "Don't change the sign of the first number." }]
    };
  });

  add("U2L5-mild-change", "L5", "mild", function () {
    var s = -R.int(2, 15), e = R.int(-1, 12);
    if (e === s) e = s + 5;
    return {
      text: "Weather Watch: the temperature changes from <b>" + c(s) + "°C</b> to <b>" + c(e) + "°C</b>. What is the change?",
      answer: e - s, type: "number", unit: "degrees",
      steps: ["Change = final − start = " + b(e) + " − " + b(s) + " = " + b(e) + " + " + c(-s) + ".", "= <b>" + c(e - s) + "</b> degrees (a rise)"],
      mistakes: [{ answer: e + s, message: "Change = final − START. Subtracting a negative start means adding." }]
    };
  });

  add("U2L5-mild-below", "L5", "mild", function () {
    var a = R.int(1, 12), bb = a + R.int(1, 12);
    return {
      text: "Calculate <b>" + a + " − " + bb + "</b>.", answer: a - bb, type: "number",
      steps: subSteps(a, bb), mistakes: [{ answer: bb - a, message: "Order matters: " + a + " − " + bb + " goes below zero." }]
    };
  });

  add("U2L5-med-multi", "L5", "medium", function () {
    var a = -R.int(2, 12), bb = R.int(2, 9), cc = -R.int(2, 12), d = R.int(1, 9), r = a - bb - cc + d;
    return {
      text: "Calculate <b>" + b(a) + " − " + bb + " − " + b(cc) + " + " + d + "</b>.", answer: r, type: "number", zeroOk: true,
      steps: ["Rewrite as addition: " + b(a) + " + " + b(-bb) + " + " + c(-cc) + " + " + d + "."].concat(sumSteps([a, -bb, -cc, d]))
    };
  });

  add("U2L5-med-mistake", "L5", "medium", function () {
    var who = R.pick(CREW), a = -R.int(2, 12), bb = -R.int(2, 12);
    if (a === bb) bb = a - 3;
    return {
      text: who + " says: “" + b(a) + " − " + b(bb) + " = " + c(a + bb) + ", because both numbers are negative.” <b>Find the mistake.</b> What is the correct answer?",
      answer: a - bb, type: "number", zeroOk: true,
      steps: ["<b>The mistake:</b> subtracting a negative means adding its opposite."].concat(subSteps(a, bb)),
      mistakes: [{ answer: a + bb, message: "That's " + who + "'s answer. − " + b(bb) + " becomes + " + c(-bb) + "." }]
    };
  });

  add("U2L5-med-plane", "L5", "medium", function () {
    var up = R.int(15, 120) * 100, down = -R.int(5, 90) * 10;
    return {
      text: "In Sana's movie trailer, a plane flies at <b>" + c(up) + " m</b> and a submarine is at <b>" + c(down) + " m</b>. How far above the submarine is the plane?",
      answer: up - down, type: "number", unit: "m",
      steps: ["Distance = higher − lower = " + c(up) + " − " + b(down) + " = " + c(up) + " + " + c(-down) + ".", "= <b>" + c(up - down) + "</b> m"],
      mistakes: [{ answer: up + down, message: "Subtracting the negative depth means ADDING " + c(-down) + "." }]
    };
  });

  add("U2L5-med-record", "L5", "medium", function () {
    var lo = -R.int(40, 63), hi = F.roundTo(R.step(30, 49.6, 0.1), 1);
    return {
      text: "Weather Watch: a town's coldest day was <b>" + c(lo) + "°C</b> and its hottest was <b>" + c(hi, 1) + "°C</b>. What is the difference?",
      answer: F.roundTo(hi - lo, 1), type: "number", dp: 1, unit: "degrees",
      steps: [c(hi, 1) + " − " + b(lo) + " = " + c(hi, 1) + " + " + c(-lo) + ".", "= <b>" + c(hi - lo, 1) + "</b> degrees"],
      mistakes: [{ answer: F.roundTo(hi + lo, 1), message: "Subtracting the negative low means ADDING " + c(-lo) + "." }]
    };
  });

  add("U2L5-spicy-freezer", "L5", "spicy", function () {
    var start = -R.pick([12, 15, 18, 20, 24]), rate = R.pick([2, 3, 4]), v = until(function () { return R.int(2, 12); }, function (h) { return h * rate !== -start; });
    while (-start % rate) start -= 1;
    var h0 = -start / rate, after = start + rate * v;
    return {
      text: "Frozen juice bars sit in a freezer at <b>" + c(start) + "°C</b> when the power goes out. The temperature rises <b>" + rate + " degrees every hour</b>. After how many hours does it reach 0°C, and what is the temperature after " + v + " hours?",
      parts: [{ label: "Hours to reach 0°C", answer: h0, type: "number" }, { label: "Temperature after " + v + " h (°C)", answer: after, type: "number", zeroOk: true }],
      steps: ["To get from " + c(start) + " to 0 is " + c(-start) + " degrees: " + c(-start) + " ÷ " + rate + " = <b>" + h0 + "</b> hours.",
        "After " + v + " hours: " + c(start) + " + " + v + " × " + rate + " = " + c(start) + " + " + rate * v + " = <b>" + c(after) + "</b>°C"]
    };
  });

  add("U2L5-spicy-missing", "L5", "spicy", function () {
    var bb = -R.int(2, 12), target = R.int(-12, 5), m = target + bb;
    return {
      text: "Find the missing number:&nbsp;&nbsp; <b>___ − " + b(bb) + " = " + c(target) + "</b>",
      answer: m, type: "number", zeroOk: true,
      steps: ["− " + b(bb) + " is the same as + " + c(-bb) + ", so ___ + " + c(-bb) + " = " + c(target) + ".", "Missing = " + c(target) + " − " + c(-bb) + " = <b>" + c(m) + "</b>", "Check: " + b(m) + " − " + b(bb) + " = " + c(target) + " ✓"]
    };
  });

  add("U2L5-spicy-trivia", "L5", "spicy", function () {
    var A = -R.int(2, 15), B = R.int(3, 20), lose = R.int(2, 9), A2 = A - lose;
    return {
      text: "In Sana's movie trivia game, Team A has <b>" + c(A) + "</b> points and Team B has <b>" + B + "</b>. Team A then loses " + lose + " more points. How far ahead is Team B now?",
      answer: B - A2, type: "number", unit: "points",
      steps: ["Team A now: " + c(A) + " − " + lose + " = " + c(A2) + ".", "Gap = " + B + " − " + b(A2) + " = " + B + " + " + c(-A2) + " = <b>" + c(B - A2) + "</b> points"],
      mistakes: [{ answer: B - A, message: "Don't forget Team A lost " + lose + " more points first." }]
    };
  });

  add("U2L5-spicy-fund", "L5", "spicy", function () {
    var start = R.int(15, 40), ch = [-R.int(2, 9), R.int(2, 9), -R.int(3, 12), R.int(1, 8)], days = ["Monday", "Tuesday", "Wednesday", "Thursday"];
    var end = ch.reduce(function (a, x) { return a + x; }, start), bal = ch.reduce(function (acc, x) { acc.push(acc[acc.length - 1] + x); return acc; }, [start]);
    return {
      text: "Sana's movie fund starts the week at <b>$" + start + "</b>. " + days.map(function (d, i) { return d + ": " + (ch[i] < 0 ? "−$" : "+$") + Math.abs(ch[i]); }).join(". ") + ". What is the overall change from the start to Thursday? (Negative for a loss.)",
      answer: end - start, type: "number", zeroOk: true,
      steps: ["Balances: " + bal.map(function (x) { return "$" + x; }).join(" → ") + ".", "Change = final − start = " + end + " − " + start + " = <b>" + c(end - start) + "</b>" + (end - start < 0 ? " (a loss)" : " (a gain)")]
    };
  });

  // =====================================================================
  // L6 — Multiplying & dividing integers (Mira's mountain climb)
  // =====================================================================
  function signWord(x) { return x > 0 ? "positive" : "negative"; }

  add("U2L6-mild-mult", "L6", "mild", function () {
    var a = nz(-12, 12), bb = until(function () { return nz(-12, 12); }, function (x) { return a < 0 || x < 0; });
    return {
      text: "Calculate <b>" + b(a) + " × " + b(bb) + "</b>.", answer: a * bb, type: "number",
      steps: ["Size: " + Math.abs(a) + " × " + Math.abs(bb) + " = " + Math.abs(a * bb) + ".", ((a > 0) === (bb > 0) ? "Same signs → positive" : "Different signs → negative") + ": <b>" + c(a * bb) + "</b>"],
      mistakes: [{ answer: -a * bb, message: "Check the sign: same signs → positive, different signs → negative." }, { answer: a + bb, message: "This is multiplying, not adding." }]
    };
  });

  add("U2L6-mild-div", "L6", "mild", function () {
    var q = nz(-12, 12), d = until(function () { return nz(-9, 9); }, function (x) { return Math.abs(x) > 1 && (x < 0 || q < 0); }), a = q * d;
    return {
      text: "Calculate <b>" + b(a) + " ÷ " + b(d) + "</b>.", answer: q, type: "number",
      steps: ["Size: " + Math.abs(a) + " ÷ " + Math.abs(d) + " = " + Math.abs(q) + ".", ((a > 0) === (d > 0) ? "Same signs → positive" : "Different signs → negative") + ": <b>" + c(q) + "</b>"],
      mistakes: [{ answer: -q, message: "Division follows the same sign rules as multiplication." }]
    };
  });

  add("U2L6-mild-climb", "L6", "mild", function () {
    var rate = R.int(2, 9), t = R.int(3, 12);
    return {
      text: "Mira climbs down <b>" + rate + " m every minute</b> for <b>" + t + " minutes</b>. What is the total change in her height? (Down is negative.)",
      answer: -rate * t, type: "number", unit: "m",
      steps: ["A repeated change is multiplying: " + t + " × " + b(-rate) + ".", "Different signs → negative: <b>" + c(-rate * t) + "</b> m"],
      mistakes: [{ answer: rate * t, message: "Going down is negative, so the change is negative." }]
    };
  });

  add("U2L6-mild-rewind", "L6", "mild", function () {
    var rate = R.int(2, 9), t = R.int(2, 9);
    return {
      text: "Mira goes down <b>" + rate + " m every minute</b>. The video is <b>rewound " + t + " minutes</b>. Use (" + c(-t) + ") × (" + c(-rate) + "): how much higher was she " + t + " minutes ago?",
      answer: rate * t, type: "number", unit: "m",
      steps: ["Down " + rate + " m a minute is " + c(-rate) + "; rewinding " + t + " minutes is " + c(-t) + ".", b(-t) + " × " + b(-rate) + ": same signs → positive: <b>" + c(rate * t) + "</b> m higher"],
      mistakes: [{ answer: -rate * t, message: "Two negatives multiplied give a positive: rewinding a descent means she was HIGHER." }]
    };
  });

  add("U2L6-med-three", "L6", "medium", function () {
    var nums = [nz(-6, 6), nz(-6, 6), nz(-6, 6)].map(function (x) { return x === 1 || x === -1 ? x * 2 : x; });
    if (nums.every(function (x) { return x > 0; })) nums[0] = -nums[0];
    var p = nums[0] * nums[1] * nums[2], negs = nums.filter(function (x) { return x < 0; }).length;
    return {
      text: "Calculate <b>" + nums.map(b).join(" × ") + "</b>.", answer: p, type: "number",
      steps: ["Size: " + nums.map(Math.abs).join(" × ") + " = " + Math.abs(p) + ".", "Count the negatives: " + negs + " (" + (negs % 2 ? "odd → negative" : "even → positive") + "): <b>" + c(p) + "</b>"],
      mistakes: [{ answer: -p, message: "Count the negatives: even → positive, odd → negative." }]
    };
  });

  add("U2L6-med-mistake", "L6", "medium", function () {
    var who = R.pick(CREW), q = R.int(2, 12), d = -R.int(2, 9), a = q * d;
    return {
      text: who + " says: “" + b(a) + " ÷ " + b(d) + " = " + c(-q) + ", because the signs match.” <b>Find the mistake.</b> What is the correct answer?",
      answer: q, type: "number",
      steps: ["<b>The mistake:</b> matching signs give a POSITIVE.", Math.abs(a) + " ÷ " + Math.abs(d) + " = " + q + ", so <b>" + c(q) + "</b>"],
      mistakes: [{ answer: -q, message: "That's " + who + "'s answer. Same signs → positive." }]
    };
  });

  add("U2L6-med-intervals", "L6", "medium", function () {
    var drop = R.int(2, 6), sec = R.pick([15, 20, 30]), mins = R.int(2, 6), n = mins * 60 / sec;
    return {
      text: "Mira goes down a cliff <b>" + drop + " m every " + sec + " seconds</b>. What is the change in her height after <b>" + mins + " minutes</b>?",
      answer: -drop * n, type: "number", unit: "m",
      steps: [mins + " minutes = " + mins * 60 + " seconds = " + n + " periods of " + sec + " seconds.", n + " × " + b(-drop) + " = <b>" + c(-drop * n) + "</b> m"],
      mistakes: [{ answer: -drop * mins, message: "Count the " + sec + "-second periods in " + mins + " minutes first." }]
    };
  });

  add("U2L6-med-share", "L6", "medium", function () {
    var days = R.int(3, 9), per = -R.int(2, 15), tot = per * days;
    return {
      text: "Over <b>" + days + " days</b>, a lake's water level changed by <b>" + c(tot) + " cm</b>, the same amount each day. What was the change each day?",
      answer: per, type: "number", unit: "cm",
      steps: ["Sharing a change is dividing: " + b(tot) + " ÷ " + days + ".", "Different signs → negative: <b>" + c(per) + "</b> cm per day"],
      mistakes: [{ answer: -per, message: "The level went DOWN, so each day's change is negative." }]
    };
  });

  add("U2L6-spicy-height", "L6", "spicy", function () {
    var start = R.int(5, 30), rate = R.int(3, 9), t = R.int(3, 8), up = R.int(5, 20), r = start - rate * t + up;
    return {
      text: "Mira starts at a height of <b>" + start + " m</b>. She descends <b>" + rate + " m every minute for " + t + " minutes</b>. Then she climbs up <b>" + up + " m</b>. What is her height now?",
      answer: r, type: "number", unit: "m", zeroOk: true,
      steps: ["Descent: " + t + " × " + b(-rate) + " = " + c(-rate * t) + " m.", start + " + " + b(-rate * t) + " + " + up + " = <b>" + c(r) + "</b> m"]
    };
  });

  add("U2L6-spicy-mistake", "L6", "spicy", function () {
    var who = R.pick(CREW), k = R.pick([2, 3]), n = R.pick([4, 6]), p = Math.pow(-k, n);
    return {
      text: who + " says: “" + Array(n + 1).join(b(-k) + " × ").slice(0, -3) + " = " + c(-p) + ", because all the numbers are negative.” <b>Find the mistake.</b> What is the correct answer?",
      answer: p, type: "number",
      steps: ["<b>The mistake:</b> count the negatives: " + n + " is even, so the answer is positive.", "Size: " + k + sup(n) + " = " + p + ", so <b>" + c(p) + "</b>"],
      mistakes: [{ answer: -p, message: "That's " + who + "'s answer. An even number of negatives gives a positive." }]
    };
  });

  add("U2L6-spicy-mean", "L6", "spicy", function () {
    var v = until(function () { return [0, 1, 2, 3, 4].map(function () { return R.int(-10, 4); }); }, function (t) { var s = t.reduce(function (a, x) { return a + x; }, 0); return s % 5 === 0 && s < 0 && new Set(t).size >= 4; });
    var s = v.reduce(function (a, x) { return a + x; }, 0);
    return {
      text: "Weather Watch: the noon temperatures for five days were <b>" + v.map(function (x) { return c(x) + "°C"; }).join(", ") + "</b>. What was the mean (average) temperature?",
      answer: s / 5, type: "number", unit: "°C",
      steps: ["Add them: " + v.map(b).join(" + ") + " = " + c(s) + ".", "Divide by 5: " + b(s) + " ÷ 5 = <b>" + c(s / 5) + "</b>°C"],
      mistakes: [{ answer: -s / 5, message: "A negative total ÷ a positive count is negative." }]
    };
  });

  add("U2L6-spicy-points", "L6", "spicy", function () {
    var pts = R.pick([3, 4, 5]), fall = -R.pick([2, 3, 4]), reach = R.int(3, 8), falls = R.int(2, 7), score = reach * pts + falls * fall;
    return {
      text: "In Mira's climbing challenge, reaching a checkpoint is <b>+" + pts + "</b> points and a fall is <b>" + c(fall) + "</b> points. A climber reaches " + reach + " checkpoints and falls " + falls + " times. What is the score?",
      answer: score, type: "number", zeroOk: true,
      steps: ["Checkpoints: " + reach + " × " + pts + " = " + reach * pts + ". Falls: " + falls + " × " + b(fall) + " = " + c(falls * fall) + ".", reach * pts + " + " + b(falls * fall) + " = <b>" + c(score) + "</b>"]
    };
  });

  // =====================================================================
  // L7 — Multiplying & dividing decimals (the popcorn sale)
  // =====================================================================
  function places(x) { var s = String(x); return s.indexOf(".") < 0 ? 0 : s.split(".")[1].length; }
  function whole(x) { return Math.round(x * Math.pow(10, places(x))); }
  function mulDecSteps(x, y) {
    var p = places(x) + places(y), r = F.roundTo(x * y, 8);
    return ["Multiply as whole numbers: " + whole(x) + " × " + whole(y) + " = " + c(whole(x) * whole(y), 0) + ".",
      "Count decimal places: " + places(x) + " + " + places(y) + " = " + p + ", so <b>" + c(r, 8) + "</b>",
      "Estimate to check: about " + c(Math.round(x * 10) / 10, 1) + " × " + c(Math.round(y * 10) / 10, 1) + " ≈ " + c(Math.round(x * 10) / 10 * Math.round(y * 10) / 10, 2) + " ✓"];
  }
  function divDecSteps(x, y, q) {
    var k = Math.pow(10, places(y));
    return ["Make the divisor whole: multiply both by " + k + ": " + c(x) + " ÷ " + c(y) + " = " + c(x * k, 6) + " ÷ " + c(y * k, 0) + ".", "= <b>" + c(q, 6) + "</b>"];
  }

  add("U2L7-mild-tenths", "L7", "mild", function () {
    var x = R.step(0.2, 0.9, 0.1), y = R.step(0.2, 0.9, 0.1), r = F.roundTo(x * y, 6);
    return { text: "Calculate <b>" + c(x) + " × " + c(y) + "</b>.", answer: r, type: "number", dp: 6, steps: mulDecSteps(x, y),
      mistakes: [{ answer: F.roundTo(r * 10, 6), message: "Count the decimal places: " + places(x) + " + " + places(y) + " = 2." }] };
  });

  add("U2L7-mild-money", "L7", "mild", function () {
    var p = R.pick([1.75, 1.25, 2.5, 0.75, 1.5, 3.25, 2.25]), n = R.int(3, 9);
    return { text: "Popcorn bags cost <b>" + F.money(p) + "</b> each. What do <b>" + n + "</b> bags cost?", answer: F.roundTo(p * n, 2), type: "money",
      steps: [n + " × " + c(p) + ": " + n + " × " + whole(p) + " = " + n * whole(p) + ", 2 decimal places.", "= <b>" + F.money(p * n) + "</b>"] };
  });

  add("U2L7-mild-divide", "L7", "mild", function () {
    var y = R.step(0.2, 0.9, 0.1), q = R.int(2, 12), x = F.roundTo(y * q, 6);
    return { text: "Calculate <b>" + c(x) + " ÷ " + c(y) + "</b>.", answer: q, type: "number", steps: divDecSteps(x, y, q),
      mistakes: [{ answer: F.roundTo(q / 10, 6), message: "Multiply BOTH numbers by 10 before dividing." }] };
  });

  add("U2L7-mild-whole", "L7", "mild", function () {
    var x = R.step(1.1, 4.9, 0.1), n = R.int(2, 9), r = F.roundTo(x * n, 6);
    return { text: "Calculate <b>" + c(x) + " × " + n + "</b>.", answer: r, type: "number", dp: 6, steps: mulDecSteps(x, n) };
  });

  add("U2L7-med-hundredths", "L7", "medium", function () {
    var x = R.step(1.05, 4.95, 0.01), y = R.step(1.5, 3.5, 0.5), r = F.roundTo(x * y, 6);
    return { text: "Calculate <b>" + c(x) + " × " + c(y) + "</b>. Estimate first.", answer: r, type: "number", dp: 6, steps: mulDecSteps(x, y) };
  });

  add("U2L7-med-mistake", "L7", "medium", function () {
    var who = R.pick(CREW), y = R.step(0.2, 0.9, 0.1), q = R.int(2, 9), x = F.roundTo(y * q, 6);
    return {
      text: who + " says: “" + c(x) + " ÷ " + c(y) + " = " + c(q / 10) + ", because " + c(x * 10) + " ÷ " + c(y * 10) + " = " + q + ".” <b>Find the mistake.</b> What is the correct answer?",
      answer: q, type: "number",
      steps: ["<b>The mistake:</b> " + who + " only changed one number. Multiply BOTH by 10: " + c(x * 10) + " ÷ " + c(y * 10) + " = <b>" + q + "</b>.", "Check: dividing by a number less than 1 makes it bigger ✓"],
      mistakes: [{ answer: q / 10, message: "That's " + who + "'s answer. Dividing by " + c(y) + " (less than 1) makes the answer BIGGER." }]
    };
  });

  add("U2L7-med-sense", "L7", "medium", function () {
    var x = R.step(2.1, 8.9, 0.1), y = R.step(2.1, 8.9, 0.1), r = F.roundTo(x * y, 4), opts = [c(r / 10, 4), c(r, 4), c(r * 10, 4)];
    return {
      text: "Estimate to decide which answer is correct:&nbsp;&nbsp; <b>" + c(x) + " × " + c(y) + "</b>",
      answer: c(r, 4), type: "choice", options: opts, maxTries: 1,
      steps: ["Estimate: about " + Math.round(x) + " × " + Math.round(y) + " = " + Math.round(x) * Math.round(y) + ".", "The closest is <b>" + c(r, 4) + "</b>"]
    };
  });

  add("U2L7-med-pieces", "L7", "medium", function () {
    var piece = R.pick([0.15, 0.2, 0.25, 0.3, 0.4, 0.12]), n = R.int(6, 20), L = F.roundTo(piece * n, 6);
    return {
      text: "Sana cuts a <b>" + c(L) + " m</b> roll of ribbon into pieces <b>" + c(piece) + " m</b> long. How many pieces does she get?",
      answer: n, type: "number", unit: "pieces",
      steps: divDecSteps(L, piece, n), mistakes: [{ answer: F.roundTo(L * piece, 6), message: "How many pieces FIT: divide, don't multiply." }]
    };
  });

  add("U2L7-spicy-gas", "L7", "spicy", function () {
    var rate = R.pick([6.5, 7.5, 8, 5.5, 9]), km = R.int(12, 48) * 10, price = R.pick([1.5, 1.6, 1.4, 1.45]), L = F.roundTo(rate * km / 100, 4), cost = L * price;
    return {
      text: "The crew's car uses <b>" + c(rate) + " L per 100 km</b>. The trip to the drive-in is <b>" + km + " km</b>. Gas costs <b>" + F.money(price) + " per litre</b>. What does the gas cost?",
      answer: F.roundTo(cost, 2), type: "money",
      steps: [km + " km is " + c(km / 100) + " hundreds: " + c(rate) + " × " + c(km / 100) + " = " + c(L) + " L.", c(L) + " × " + c(price) + " = " + (F.moneyRaw(cost) === F.money(cost) ? "<b>" + F.money(cost) + "</b>" : F.moneyRaw(cost) + " → <b>" + F.money(cost) + "</b>")]
    };
  });

  add("U2L7-spicy-missing", "L7", "spicy", function () {
    var x = R.step(0.2, 0.9, 0.1), m = R.pick([0.08, 0.06, 0.4, 0.05, 0.03, 0.7]), p = F.roundTo(x * m, 6);
    return {
      text: "Find the missing number:&nbsp;&nbsp; <b>" + c(x) + " × ___ = " + c(p, 6) + "</b>",
      answer: m, type: "number", dp: 4,
      steps: ["Digits: " + whole(x) + " × ? = " + whole(p) + " → ? has digits " + whole(m) + ".", "Decimal places: " + places(p) + " in the answer, " + places(x) + " in " + c(x) + ", so " + (places(p) - places(x)) + " in the missing number: <b>" + c(m) + "</b>"]
    };
  });

  add("U2L7-spicy-grains", "L7", "spicy", function () {
    var m = R.pick([0.025, 0.02, 0.05, 0.04, 0.0125]), total = R.pick([1000, 500, 2000]), n = Math.round(total / m);
    return {
      text: "A popcorn kernel has a mass of about <b>" + c(m) + " g</b>. About how many kernels are in <b>" + c(total) + " g</b>?",
      answer: n, type: "number", unit: "kernels",
      steps: divDecSteps(total, m, n)
    };
  });

  add("U2L7-spicy-posters", "L7", "spicy", function () {
    var bags = R.int(10, 30) * 10, price = R.pick([0.75, 1.25, 1.5, 1]), cost = R.pick([0.32, 0.28, 0.45, 0.4]), poster = R.pick([12.5, 7.5, 9.25, 15]);
    var profit = F.roundTo(bags * (price - cost), 2), n = Math.floor(profit / poster + 1e-9);
    return {
      text: "Sana's crew sells <b>" + bags + " bags</b> of popcorn at <b>" + F.money(price) + "</b> each. Ingredients cost <b>" + F.money(cost) + " per bag</b>. They spend the profit on movie posters at <b>" + F.money(poster) + "</b> each. How many posters can they buy?",
      answer: n, type: "number", unit: "posters",
      steps: ["Sales: " + bags + " × " + c(price) + " = " + F.money(bags * price) + ". Costs: " + bags + " × " + c(cost) + " = " + F.money(bags * cost) + ".",
        "Profit: " + F.money(bags * price) + " − " + F.money(bags * cost) + " = " + F.money(profit) + ".", F.money(profit) + " ÷ " + F.money(poster) + " = " + c(profit / poster, 2) + ", so <b>" + n + "</b> posters"],
      mistakes: [{ answer: Math.floor(bags * price / poster), message: "Pay for the ingredients first: use the PROFIT." }]
    };
  });

  // =====================================================================
  // L8 — Order of operations
  // =====================================================================
  add("U2L8-mild-basic", "L8", "mild", function () {
    var a = R.int(2, 20), bb = R.int(2, 9), cc = R.int(2, 9), op = R.pick(["+", "−"]), r = op === "+" ? a + bb * cc : a - bb * cc;
    return {
      text: "Calculate <b>" + a + " " + op + " " + bb + " × " + cc + "</b>.", answer: r, type: "number", zeroOk: true,
      steps: ["× before " + op + ": " + bb + " × " + cc + " = " + bb * cc + ".", a + " " + op + " " + bb * cc + " = <b>" + c(r) + "</b>"],
      mistakes: [{ answer: (op === "+" ? a + bb : a - bb) * cc, message: "Multiply before you " + (op === "+" ? "add" : "subtract") + "." }]
    };
  });

  add("U2L8-mild-ltr", "L8", "mild", function () {
    var bb = R.int(2, 6), cc = R.int(2, 5), q = R.int(2, 9), a = q * bb;
    return {
      text: "Calculate <b>" + a + " ÷ " + bb + " × " + cc + "</b>.", answer: q * cc, type: "number",
      steps: ["× and ÷ are a tie: go left to right.", a + " ÷ " + bb + " = " + q + ", then " + q + " × " + cc + " = <b>" + q * cc + "</b>"],
      mistakes: Number.isInteger(a / (bb * cc)) ? [{ answer: a / (bb * cc), message: "× and ÷ go LEFT TO RIGHT: divide first here." }] : []
    };
  });

  add("U2L8-mild-squares", "L8", "mild", function () {
    var n = R.int(2, 15);
    return {
      text: "Find <b>(−" + n + ")²</b> and <b>−" + n + "²</b>.",
      parts: [{ label: "(−" + n + ")²", answer: n * n, type: "number" }, { label: "−" + n + "²", answer: -n * n, type: "number" }],
      steps: ["(−" + n + ")² = (−" + n + ") × (−" + n + ") = <b>" + n * n + "</b>.", "−" + n + "²: the exponent applies only to the " + n + ": −(" + n + " × " + n + ") = <b>" + c(-n * n) + "</b>."]
    };
  });

  add("U2L8-mild-exp", "L8", "mild", function () {
    var a = R.int(20, 60), bb = R.int(2, 4), n = R.int(2, 4), r = a - bb * n * n;
    return {
      text: "Calculate <b>" + a + " − " + bb + " × " + n + "²</b>.", answer: r, type: "number", zeroOk: true,
      steps: ["Exponent first: " + n + "² = " + n * n + ".", "Then ×: " + bb + " × " + n * n + " = " + bb * n * n + ".", "Then −: " + a + " − " + bb * n * n + " = <b>" + c(r) + "</b>"],
      mistakes: [{ answer: a - (bb * n) * (bb * n), message: "The exponent applies only to the " + n + ": " + bb + " × " + n + "², not (" + bb + " × " + n + ")²." }]
    };
  });

  add("U2L8-med-mixed", "L8", "medium", function () {
    var a = -R.int(2, 6), x = R.int(2, 6), y = R.int(x + 1, 12), e = R.int(2, 3), base = R.int(2, 3), r = a * (x - y) + Math.pow(base, e);
    return {
      text: "Calculate <b>" + b(a) + " × (" + x + " − " + y + ") + " + base + sup(e) + "</b>.", answer: r, type: "number", zeroOk: true,
      steps: ["Brackets: " + x + " − " + y + " = " + c(x - y) + ". Exponent: " + base + sup(e) + " = " + Math.pow(base, e) + ".",
        "×: " + b(a) + " × " + b(x - y) + " = " + c(a * (x - y)) + ".", "+: " + c(a * (x - y)) + " + " + Math.pow(base, e) + " = <b>" + c(r) + "</b>"]
    };
  });

  add("U2L8-med-mistake", "L8", "medium", function () {
    var who = R.pick(CREW), bb = R.int(2, 4), cc = R.int(2, 4), q = R.int(2, 6), a = q * bb * cc;
    return {
      text: who + " says: “" + a + " ÷ " + bb + " × " + cc + " = " + q + ", because " + bb + " × " + cc + " = " + bb * cc + " and " + a + " ÷ " + bb * cc + " = " + q + ".” <b>Find the mistake.</b> What is the correct answer?",
      answer: a / bb * cc, type: "number",
      steps: ["<b>The mistake:</b> × and ÷ are a tie, so go left to right.", a + " ÷ " + bb + " = " + a / bb + ", then " + a / bb + " × " + cc + " = <b>" + a / bb * cc + "</b>"],
      mistakes: [{ answer: q, message: "That's " + who + "'s answer. Left to right: divide first." }]
    };
  });

  add("U2L8-med-temp", "L8", "medium", function () {
    var start = R.int(-5, 3), drop = R.int(2, 4), h = R.int(3, 6), r = start + h * -drop;
    return {
      text: "At 4 p.m. it is <b>" + c(start) + "°C</b>. The temperature drops <b>" + drop + "°C every hour</b> for <b>" + h + " hours</b>. Write one expression and find the final temperature.",
      answer: r, type: "number", unit: "°C",
      steps: ["Expression: " + b(start) + " + " + h + " × " + b(-drop) + ".", "× first: " + h + " × " + b(-drop) + " = " + c(-drop * h) + ".", b(start) + " + " + b(-drop * h) + " = <b>" + c(r) + "</b>°C"],
      mistakes: [{ answer: (start + h) * -drop, message: "Multiply before you add." }]
    };
  });

  add("U2L8-med-fraction", "L8", "medium", function () {
    var x = properFr([2, 3, 4]), w = R.int(2, 6), y = properFr([3, 5, 6]), r = Fr.add(Fr.mul(x, fm(w, 1)), y);
    return {
      text: "Calculate <b>" + fi(x) + " × " + w + " + " + fi(y) + "</b>.",
      answer: r, type: "fraction",
      steps: ["× first: " + fi(x) + " × " + w + " = " + fb(Fr.mul(x, fm(w, 1))) + ".", "Then +: " + fi(Fr.mul(x, fm(w, 1))) + " + " + fi(y) + " = <b>" + fb(r) + "</b>"],
      mistakes: [{ answer: Fr.mul(x, Fr.add(fm(w, 1), y)), message: "Multiply before you add." }]
    };
  });

  add("U2L8-spicy-mistake", "L8", "spicy", function () {
    var who = R.pick(CREW), n = R.pick([2, 3]), e = n === 2 ? R.pick([2, 4]) : 2, val = Math.pow(n, e);
    return {
      text: who + " says: “−" + n + sup(e) + " = " + val + ", because a negative number to an even power is positive.” <b>Find the mistake.</b> What is −" + n + sup(e) + "?",
      answer: -val, type: "number",
      steps: ["<b>The mistake:</b> the exponent applies only to the " + n + " (there are no brackets).", "−" + n + sup(e) + " = −(" + Array(e + 1).join(n + " × ").slice(0, -3) + ") = <b>" + c(-val) + "</b>. (" + "(−" + n + ")" + sup(e) + " would be " + val + ".)"],
      mistakes: [{ answer: val, message: "That's " + who + "'s answer. Without brackets, the exponent doesn't touch the minus sign." }]
    };
  });

  add("U2L8-spicy-fractions", "L8", "spicy", function () {
    var v = until(function () { return { x: properFr([2, 3, 4]), y: properFr([4, 6, 8]), z: R.pick([fm(1, 8), fm(1, 4), fm(1, 6), fm(1, 12)]), k: R.pick([2, 3]) }; },
      function (v) { var d = Fr.sub(v.x, v.y); return Fr.val(d) > 0 && Fr.div(d, v.z).d === 1; });
    var d = Fr.sub(v.x, v.y), q = Fr.div(d, v.z), cube = Math.pow(-v.k, 3), r = Fr.add(q, fm(cube, 1));
    return {
      text: "Calculate <b>(" + fi(v.x) + " − " + fi(v.y) + ") ÷ " + fi(v.z) + " + (−" + v.k + ")³</b>.",
      answer: r, type: "fraction",
      steps: ["Brackets: " + fi(v.x) + " − " + fi(v.y) + " = " + fi(d) + ". Exponent: (−" + v.k + ")³ = " + c(cube) + ".",
        "÷: " + fi(d) + " ÷ " + fi(v.z) + " = " + fi(d) + " × " + fi(fm(v.z.d, v.z.n)) + " = " + fi(q) + ".", fi(q) + " + " + b(cube) + " = <b>" + fb(r) + "</b>"]
    };
  });

  add("U2L8-spicy-temp", "L8", "spicy", function () {
    var start = -R.int(2, 8), rise = R.pick([1.5, 2.5, 0.5, 3.5]), h = R.int(2, 6), fall = R.int(2, 9), r = F.roundTo(start + h * rise - fall, 2);
    return {
      text: "At 1 p.m. on movie-night day it was <b>" + c(start) + "°C</b>. The temperature rose <b>" + c(rise) + "°C each hour for " + h + " hours</b>, then fell <b>" + fall + "°C</b>. Write one expression and find the final temperature.",
      answer: r, type: "number", unit: "°C", zeroOk: true,
      steps: ["Expression: " + b(start) + " + " + h + " × " + c(rise) + " − " + fall + ".", "× first: " + h + " × " + c(rise) + " = " + c(h * rise) + ".", b(start) + " + " + c(h * rise) + " − " + fall + " = <b>" + c(r) + "</b>°C"]
    };
  });

  add("U2L8-spicy-boss", "L8", "spicy", function () {
    var a = R.int(2, 6), n = R.int(2, 3), x = R.pick([fm(1, 2), fm(1, 4), fm(1, 3)]), y = R.pick([fm(1, 4), fm(1, 6), fm(1, 2)]), s = Fr.add(x, y);
    var k = R.int(1, 4) * s.n, q = Fr.div(fm(k, 1), s), pw = n * n, r = Fr.sub(fm(a * pw, 1), q);
    return {
      text: "Find <b>" + a + " × (−" + n + ")² − " + k + " ÷ (" + fi(x) + " + " + fi(y) + ")</b>.",
      answer: r, type: "fraction",
      steps: ["Brackets: " + fi(x) + " + " + fi(y) + " = " + fi(s) + ".", "Exponent: (−" + n + ")² = " + pw + ".",
        "×: " + a + " × " + pw + " = " + a * pw + ". ÷: " + k + " ÷ " + fi(s) + " = " + k + " × " + fi(fm(s.d, s.n)) + " = " + fb(q) + ".",
        a * pw + " − " + fi(q) + " = <b>" + fb(r) + "</b>"]
    };
  });

  MP.registerUnit({
    id: "u2",
    number: 2,
    title: "Operations with Rational Numbers",
    story: "Sana's Movie Night",
    lessons: lessons,
    templates: templates
  });
})(window.MP);
