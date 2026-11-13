/* UNIT 3 — Proportional Relationships, Rates and Percentages
   Every question is set at Zuri's Smoothie Truck.

   HOW A TEMPLATE WORKS
   { id, lesson, level, generate() }  ->  generate() returns
   {
     text:   question shown to the student (HTML ok)
     answer: the exact numeric answer
     type:   "money" | "percent" | "number"
     dp:     (optional) decimal places to check for number/percent
     unit:   (optional) word shown after a number answer, e.g. "scoops"
     steps:  array of worked-solution lines (HTML ok)
   }
*/
(function (MP) {
  "use strict";
  var R = MP.R, F = MP.F;

  // ---------- Story pieces ----------
  // smoothie names from the class materials (wall chart, handouts)
  var SMOOTHIES = ["Berry Blast", "Green Machine", "Mango Rush", "Peach Fizz", "Sunset", "Tropical Twist"];
  var CUSTOMERS = ["Amir", "Jada", "Priya", "Mateo", "Sofia", "Kai", "Leila", "Noah",
    "Aiyana", "Wei", "Tariq", "Hannah", "Diego", "Mei", "Omar", "Chloe", "Ravi", "Zainab"];
  var HST = 13;

  function m(x) { return F.money(x); }
  function raw(x) { return F.moneyRaw(x); }
  function n(x) { return F.num(x); }
  // note shown only when a middle step has more than 2 decimal places
  function keep(x) { return F.moneyRaw(x) === F.money(x) ? "" : " <span class='note'>(keep every digit — don't round yet)</span>"; }

  // ---------- Lessons ----------
  var lessons = [
    { id: "L1", n: 1, title: "Ratios",
      keyMove: "Multiply or divide <b>both parts</b> by the same number. To split a total, <b>add the parts first</b>." },
    { id: "L2", n: 2, title: "Unit rates",
      keyMove: "Divide by the thing you want <b>“per”</b>. ($7.20 for 6 → $7.20 ÷ 6 = $1.20 each)" },
    { id: "L3", n: 3, title: "Proportions",
      keyMove: "Keep the <b>same order on both sides</b>. Find the value for <b>1</b>, then scale up." },
    { id: "L4", n: 4, title: "Percent of a number",
      keyMove: "Build it from <b>10%, 5% and 25%</b>. (45% of 80 = 40% + 5% = 32 + 4 = 36)" },
    { id: "L5", n: 5, title: "Percent change",
      keyMove: "Change ÷ <b>ORIGINAL</b>. Up 20% means × 1.2; down 20% means × 0.8." },
    { id: "L6", n: 6, title: "Discount, tax, tip",
      keyMove: "<b>Discount first</b>, then tax (× 1.13). Tip is on the pre-tax amount. <b>Round at the end.</b>" },
    { id: "L7", n: 7, title: "Simple interest",
      keyMove: "I = P × r × t. Rate as a <b>decimal</b>, time in <b>years</b>." },
    { id: "L8", n: 8, title: "Multi-step",
      keyMove: "<b>One tool per step</b>, in order. Write what each step finds." }
  ];

  var templates = [];
  function add(id, lesson, level, generate) {
    templates.push({ id: id, lesson: lesson, level: level, generate: generate });
  }

  // =====================================================================
  // L6 — Discount, tax, tip
  // =====================================================================

  // ---------- MILD: friendly numbers, one step ----------

  // Sale price after a friendly discount
  add("L6-mild-sale", "L6", "mild", function () {
    var d = R.pick([10, 20, 25, 50]);
    var price = d === 25 ? R.pick([4, 8, 12, 16, 20]) : R.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    var off = price * d / 100, sale = price - off;
    var drink = R.pick(SMOOTHIES);
    return {
      text: "Zuri is having a sale: <b>" + d + "% off</b> every smoothie. A " + drink +
        " smoothie is normally <b>" + m(price) + "</b>. What is the sale price?",
      answer: sale, type: "money",
      mistakes: [{ answer: off, message: "That's the discount — the amount you save. The sale price is what's left: take it away." }],
      steps: [
        "Find the discount: " + d + "% of " + m(price) + " = " + m(off) +
          (d === 10 ? " (10% → move the decimal one place left)" :
           d === 20 ? " (10% is " + m(price / 10) + ", so 20% is double that)" :
           d === 25 ? " (25% is one quarter: " + m(price) + " ÷ 4)" : " (50% is half)"),
        "Subtract it: " + m(price) + " − " + m(off) + " = <b>" + m(sale) + "</b>",
        "Shortcut: you pay " + (100 - d) + "%, so " + m(price) + " × " + F.dec(100 - d) + " = " + m(sale)
      ]
    };
  });

  // How much do you save?
  add("L6-mild-save", "L6", "mild", function () {
    var d = R.pick([10, 20, 25, 50]);
    var total = d === 25 ? R.pick([8, 12, 16, 20, 24, 40]) : R.pick([10, 15, 20, 30, 40, 50]);
    var save = total * d / 100;
    var who = R.pick(CUSTOMERS);
    return {
      text: "It's Smoothie Saturday at Zuri's truck — everything is <b>" + d + "% off</b>. " + who +
        "'s order is normally <b>" + m(total) + "</b>. How much money does " + who + " save?",
      answer: save, type: "money",
      steps: [
        "The amount saved is the discount: " + d + "% of " + m(total) + ".",
        d === 25 ? "25% is one quarter: " + m(total) + " ÷ 4 = <b>" + m(save) + "</b>" :
        d === 50 ? "50% is half: " + m(total) + " ÷ 2 = <b>" + m(save) + "</b>" :
        "10% of " + m(total) + " = " + m(total / 10) + (d === 20 ? ", so 20% = 2 × " + m(total / 10) + " = <b>" + m(save) + "</b>" : " → <b>" + m(save) + "</b>")
      ]
    };
  });

  // Add 13% HST
  add("L6-mild-tax", "L6", "mild", function () {
    var sub = R.int(4, 30);
    var tax = sub * HST / 100, total = sub + tax;
    var who = R.pick(CUSTOMERS);
    return {
      text: who + "'s order at Zuri's Smoothie Truck comes to <b>" + m(sub) + "</b> before tax. " +
        "Add 13% HST. What is the total?",
      answer: total, type: "money",
      mistakes: [{ answer: sub + 0.13, message: "13% is not 13 cents. Find 13% of the price (× 0.13), or multiply by 1.13." }, { answer: tax, message: "That's just the tax. Add it on to find the total." }],
      steps: [
        "Build 13% from 10% + 3%: 10% of " + m(sub) + " = " + raw(sub / 10) +
          ", 1% = " + raw(sub / 100) + ", so 3% = " + raw(sub * 3 / 100),
        "13% = " + raw(sub / 10) + " + " + raw(sub * 3 / 100) + " = " + raw(tax),
        "Total: " + m(sub) + " + " + raw(tax) + " = <b>" + m(total) + "</b>",
        "Shortcut: " + m(sub) + " × 1.13 = " + m(total)
      ]
    };
  });

  // Tip amount on a pre-tax bill
  add("L6-mild-tip", "L6", "mild", function () {
    var bill = R.pick([10, 20, 30, 40, 50, 60, 80]);
    var t = R.pick([10, 15, 20]);
    var tip = bill * t / 100;
    var who = R.pick(CUSTOMERS);
    return {
      text: who + "'s family orders smoothies from Zuri's truck. The bill is <b>" + m(bill) +
        "</b> before tax. They leave a <b>" + t + "% tip</b> on the pre-tax amount. How much is the tip?",
      answer: tip, type: "money",
      steps: [
        "10% of " + m(bill) + " = " + m(bill / 10) + " (move the decimal one place left)",
        t === 10 ? "So the tip is <b>" + m(tip) + "</b>" :
        t === 20 ? "20% = 2 × " + m(bill / 10) + " = <b>" + m(tip) + "</b>" :
        "5% is half of 10% = " + m(bill / 20) + ", so 15% = " + m(bill / 10) + " + " + m(bill / 20) + " = <b>" + m(tip) + "</b>"
      ]
    };
  });

  // ---------- MEDIUM: awkward numbers or two steps ----------

  // Discount, then tax
  add("L6-med-disc-tax", "L6", "medium", function () {
    var qty = R.int(2, 4);
    var price = R.pick([5.49, 5.75, 6.25, 6.49, 6.95, 7.25, 7.49, 7.85]);
    var d = R.pick([15, 20, 30, 35]);
    var sub = qty * price, sale = sub * (100 - d) / 100, total = sale * 1.13;
    var drink = R.pick(SMOOTHIES), who = R.pick(CUSTOMERS);
    return {
      text: who + " buys <b>" + qty + " " + drink + "</b> smoothies at <b>" + m(price) + "</b> each. " +
        "Zuri gives <b>" + d + "% off</b>, then 13% HST is added. What does " + who + " pay?",
      answer: total, type: "money",
      mistakes: [{ answer: sub * 1.13, message: "Did you take the discount? Discount first, then tax." }, { answer: sale, message: "That's the sale price. Now add the 13% HST." }, { answer: sub * (1.13 - d / 100), message: "Never add or subtract the percents. Discount first (× " + F.dec(100 - d) + "), then tax (× 1.13)." }, { answer: sale + 0.13, message: "13% is not 13 cents. Find 13% of the price (× 0.13), or multiply by 1.13." }],
      steps: [
        "Order cost: " + qty + " × " + m(price) + " = " + m(sub),
        "<b>Discount first.</b> You pay " + (100 - d) + "%: " + m(sub) + " × " + F.dec(100 - d) + " = " + raw(sale) + keep(sale),
        "<b>Then tax:</b> " + raw(sale) + " × 1.13 = " + raw(total),
        "<b>Round at the end:</b> <b>" + m(total) + "</b>"
      ]
    };
  });

  // Tip (pre-tax) and tax on an awkward bill
  add("L6-med-tip-tax", "L6", "medium", function () {
    var sub = R.step(18, 48, 0.05);
    var t = R.pick([15, 18, 20]);
    var tip = sub * t / 100, tax = sub * HST / 100, total = sub + tip + tax;
    var who = R.pick(CUSTOMERS);
    return {
      text: "Zuri's truck caters " + who + "'s team practice. The bill is <b>" + m(sub) + "</b> before tax. " +
        "They add 13% HST and a <b>" + t + "% tip</b> on the pre-tax amount. What is the total they pay?",
      answer: total, type: "money",
      mistakes: [{ answer: sub * 1.13 * (1 + t / 100), message: "The tip is on the pre-tax amount, not the bill with tax." }, { answer: sub * (1 + t / 100), message: "Don't forget the 13% HST." }],
      steps: [
        "Tip on the pre-tax amount: " + m(sub) + " × " + F.dec(t) + " = " + raw(tip),
        "Tax on the pre-tax amount: " + m(sub) + " × 0.13 = " + raw(tax),
        "Add them up: " + m(sub) + " + " + raw(tip) + " + " + raw(tax) + " = " + raw(total),
        "Round at the end: <b>" + m(total) + "</b>",
        "Shortcut: " + m(sub) + " × (1 + " + F.dec(t) + " + 0.13) = " + m(sub) + " × " + F.num(1 + t / 100 + 0.13) + " = " + m(total)
      ]
    };
  });

  // Tax on one awkward price
  add("L6-med-awk-tax", "L6", "medium", function () {
    var qty = R.int(1, 3);
    var price = R.step(4.19, 9.89, 0.1);
    var sub = qty * price, total = sub * 1.13;
    var drink = R.pick(SMOOTHIES), who = R.pick(CUSTOMERS);
    return {
      text: who + " orders <b>" + qty + " " + drink + "</b> smoothie" + (qty > 1 ? "s" : "") + " at <b>" + m(price) +
        "</b> each. What is the total with 13% HST?",
      answer: total, type: "money",
      steps: [
        qty > 1 ? "Order cost: " + qty + " × " + m(price) + " = " + m(sub) : "Order cost: " + m(sub),
        "Add 13% tax by multiplying by 1.13: " + m(sub) + " × 1.13 = " + raw(total),
        "Round to the nearest cent: <b>" + m(total) + "</b>"
      ]
    };
  });

  // Tax charged on a sale item
  add("L6-med-tax-on-sale", "L6", "medium", function () {
    var d = R.pick([20, 25, 30, 40]);
    var price = R.pick([12, 16, 18, 24, 28, 32, 36]);
    var sale = price * (100 - d) / 100, tax = sale * 0.13;
    var who = R.pick(CUSTOMERS);
    return {
      text: "Zuri sells a reusable smoothie cup for <b>" + m(price) + "</b>. Today it's <b>" + d + "% off</b>. " +
        who + " buys one. How much <b>tax</b> (13% HST) is charged? (Just the tax, not the total.)",
      answer: tax, type: "money",
      mistakes: [{ answer: price * 0.13, message: "Tax is charged on the SALE price. Take the discount first." }, { answer: sale * 1.13, message: "That's the total. The question asks for just the tax." }],
      steps: [
        "<b>Discount first.</b> You pay " + (100 - d) + "%: " + m(price) + " × " + F.dec(100 - d) + " = " + m(sale),
        "Tax is 13% of the <b>sale</b> price: " + m(sale) + " × 0.13 = " + raw(tax),
        "Round: <b>" + m(tax) + "</b>"
      ]
    };
  });

  // ---------- SPICY: work backwards or multi-step ----------

  // Work backwards from a total that includes tax
  add("L6-spicy-pretax", "L6", "spicy", function () {
    var pre = R.step(6, 45, 0.25);
    var total = F.roundTo(pre * 1.13, 2);
    var who = R.pick(CUSTOMERS);
    return {
      text: who + "'s receipt from Zuri's truck got wet. The only thing left is the total: <b>" + m(total) +
        "</b>, which includes 13% HST. What was the price <b>before tax</b>?",
      answer: pre, type: "money",
      mistakes: [{ answer: total * 0.87, message: "Taking 13% off doesn't undo the tax — the 13% was of the smaller, pre-tax price. Divide by 1.13." }],
      steps: [
        "Work backwards. The total is the pre-tax price × 1.13.",
        "So: pre-tax price × 1.13 = " + m(total),
        "Undo the × 1.13 by dividing: " + m(total) + " ÷ 1.13 = " + raw(total / 1.13),
        "Round: <b>" + m(pre) + "</b>",
        "Check: " + m(pre) + " × 1.13 = " + m(total) + " ✓",
        "<span class='note'>Careful: subtracting 13% of " + m(total) + " does <b>not</b> work — the 13% was of the smaller, pre-tax amount.</span>"
      ]
    };
  });

  // Work backwards from a sale price
  add("L6-spicy-original", "L6", "spicy", function () {
    var d = R.pick([15, 20, 25, 30, 35, 40]);
    var orig = R.int(6, 40);
    var sale = F.roundTo(orig * (100 - d) / 100, 2);
    var who = R.pick(CUSTOMERS);
    return {
      text: "After a <b>" + d + "% discount</b>, " + who + " paid <b>" + m(sale) + "</b> (before tax) for a smoothie order at Zuri's truck. " +
        "What was the original price?",
      answer: orig, type: "money",
      steps: [
        "Work backwards. " + d + "% off means " + who + " paid " + (100 - d) + "% of the original.",
        "Original × " + F.dec(100 - d) + " = " + m(sale),
        "Undo it by dividing: " + m(sale) + " ÷ " + F.dec(100 - d) + " = <b>" + m(orig) + "</b>"].concat(chainStep(100 - d, sale, F.moneyRaw)).concat([
        "Check: " + m(orig) + " × " + F.dec(100 - d) + " = " + m(sale) + " ✓",
        "<span class='note'>Adding " + d + "% back on does <b>not</b> work — the discount was " + d + "% of the bigger, original price.</span>"
      ]),
      mistakes: [{ answer: sale * (100 + d) / 100, message: "Adding " + d + "% back on doesn't undo the discount — it was " + d + "% of the bigger, original price." }]
    };
  });

  // Full chain: discount, then tip on pre-tax, then tax
  add("L6-spicy-chain", "L6", "spicy", function () {
    var pair = R.pickTwo(SMOOTHIES);
    var q1 = R.int(2, 5), q2 = R.int(2, 4);
    var p1 = R.pick([5.25, 5.75, 6.49, 6.75, 7.25]), p2 = R.pick([4.50, 4.95, 5.49, 5.95, 6.25]);
    var d = R.pick([10, 15, 20, 25]);
    var t = R.pick([15, 18, 20]);
    var sub = q1 * p1 + q2 * p2;
    var sale = sub * (100 - d) / 100;
    var tip = sale * t / 100, tax = sale * 0.13, total = sale + tip + tax;
    var who = R.pick(CUSTOMERS);
    return {
      text: who + "'s class orders <b>" + q1 + " " + pair[0] + "</b> at " + m(p1) + " each and <b>" + q2 + " " + pair[1] +
        "</b> at " + m(p2) + " each. Zuri gives a <b>" + d + "% school discount</b>. They add a <b>" + t +
        "% tip</b> on the discounted pre-tax amount, and 13% HST. What is the final total?",
      answer: total, type: "money",
      steps: [
        "Order cost: " + q1 + " × " + m(p1) + " + " + q2 + " × " + m(p2) + " = " + m(q1 * p1) + " + " + m(q2 * p2) + " = " + m(sub),
        "<b>Discount first:</b> " + m(sub) + " × " + F.dec(100 - d) + " = " + raw(sale) + keep(sale),
        "Tip on the discounted pre-tax amount: " + raw(sale) + " × " + F.dec(t) + " = " + raw(tip),
        "Tax on the discounted amount: " + raw(sale) + " × 0.13 = " + raw(tax),
        "Total: " + raw(sale) + " + " + raw(tip) + " + " + raw(tax) + " = " + raw(total),
        "<b>Round at the end:</b> <b>" + m(total) + "</b>"
      ]
    };
  });

  // Stacked discounts are not added
  add("L6-spicy-stacked", "L6", "spicy", function () {
    var combos = [[20, 10], [25, 20], [30, 10], [20, 20], [40, 10], [50, 20], [10, 10], [25, 10], [30, 20]];
    var c = R.pick(combos), a = c[0], b = c[1];
    var keepPct = (100 - a) * (100 - b) / 100;
    var off = 100 - keepPct;
    var who = R.pick(CUSTOMERS);
    var ex = 20, exAfter = ex * (100 - a) / 100 * (100 - b) / 100;
    return {
      text: "Zuri has a sale: <b>" + a + "% off</b>, and loyalty-card members get <b>another " + b + "% off</b> the sale price. " +
        who + " says that's " + (a + b) + "% off altogether. What is the <b>real</b> total percent discount?",
      answer: off, type: "percent", dp: 1,
      mistakes: [{ answer: a + b, message: "The percents don't add: the second discount is taken off the SALE price, which is smaller." }],
      steps: [
        a + "% off means you pay " + (100 - a) + "% → × " + F.dec(100 - a),
        "Another " + b + "% off the <b>new</b> price → × " + F.dec(100 - b),
        "Together: × " + F.dec(100 - a) + " × " + F.dec(100 - b) + " = × " + F.dec(keepPct) + ", so you pay " + F.pct(keepPct),
        "The discount is 100% − " + F.pct(keepPct) + " = <b>" + F.pct(off) + "</b>",
        "Try it on " + m(ex) + ": " + m(ex) + " × " + F.dec(100 - a) + " × " + F.dec(100 - b) + " = " + m(exAfter) +
          ", you save " + m(ex - exAfter) + " which is " + F.pct(off) + " of " + m(ex) + ", not " + (a + b) + "%."
      ]
    };
  });

  // Shared bits for the lessons below
  var PAIRS = [["strawberry", "blueberry"], ["mango", "pineapple"], ["banana", "strawberry"],
    ["spinach", "apple"], ["peach", "mango"], ["kiwi", "banana"], ["pineapple", "coconut"]];
  var COPRIME = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 2], [5, 2], [4, 3], [5, 3], [1, 4]];
  function c(x) { return F.num(x); }                       // plain number, e.g. 1,250 or 2.5
  function pl(n, word) { return c(n) + " " + word + (n === 1 ? "" : "s"); }
  function ratio(a) { return a.join(":"); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // "45% = 36, so 5% = 4, so 100% = 4 × 20 = 80" (the class method for finding the whole).
  // Returns "" when the in-between number isn't tidy, so the step can be left out.
  function chain(p, val, fmt) {
    fmt = fmt || c;
    var st = p % 10 === 0 ? 10 : p % 5 === 0 ? 5 : p % 12.5 === 0 ? 12.5 : 1;
    var one = val / (p / st);
    if (Math.abs(F.roundTo(one, 2) - one) > 1e-9) return "";
    return F.num(p) + "% = " + fmt(val) + (p !== st ? ", so " + F.num(st) + "% = " + fmt(val) + " ÷ " + F.num(p / st) + " = " + fmt(one) : "") +
      ", so 100% = " + fmt(one) + " × " + F.num(100 / st) + " = " + fmt(one * 100 / st);
  }
  function chainStep(p, val, fmt) { var ch = chain(p, val, fmt); return ch ? ["Or build it: " + ch] : []; }
  function fin(x) { return F.moneyRaw(x) === F.money(x) ? "<b>" + F.money(x) + "</b>" : F.moneyRaw(x) + " → <b>" + F.money(x) + "</b>"; }
  function c2(x) { return F.roundTo(x, 2); }
  function exact2(x) { return Math.abs(F.roundTo(x, 2) - x) < 1e-9; }
  // keep trying until a generated set of numbers passes the test
  function until(make, ok) { for (var i = 0; i < 500; i++) { var v = make(); if (ok(v)) return v; } return make(); }

  // =====================================================================
  // L1 — Ratios
  // =====================================================================

  add("L1-mild-equiv", "L1", "mild", function () {
    var r = R.pick(COPRIME), k = R.int(2, 6), f = R.pick(PAIRS), drink = R.pick(SMOOTHIES);
    var A = r[0] * k, B = r[1] * k;
    return {
      text: "Zuri's " + drink + " uses " + f[0] + " and " + f[1] + " in the ratio <b>" + ratio(r) + "</b>. " +
        "She uses <b>" + pl(A, "scoop") + " of " + f[0] + "</b>. How many scoops of " + f[1] + " does she need?",
      answer: B, type: "number", unit: "scoops",
      mistakes: [{ answer: r[1] + A - r[0], message: "You added the same number to both parts — that changes the mix. Multiply both parts by the same number." }],
      steps: [
        cap(f[0]) + " went from " + r[0] + " to " + A + ". That's × " + k + ".",
        "Do the same to <b>both parts</b>: " + r[1] + " × " + k + " = <b>" + c(B) + "</b> scoops of " + f[1] + ".",
        "So " + ratio(r) + " = " + A + ":" + B
      ]
    };
  });

  add("L1-mild-simplify", "L1", "mild", function () {
    var r = R.pick(COPRIME), k = R.int(2, 8);
    var d = R.pickTwo(SMOOTHIES), A = r[0] * k, B = r[1] * k;
    return {
      text: "This morning Zuri sold <b>" + A + " " + d[0] + "</b> and <b>" + B + " " + d[1] + "</b> smoothies. " +
        "Write the ratio of " + d[0] + " to " + d[1] + " in simplest form.",
      answer: [r[0], r[1]], type: "ratio",
      mistakes: [{ answer: [r[1], r[0]], message: "Check the order: the question names " + d[0] + " first." }],
      steps: [
        "Write it in the same order as the question: " + A + ":" + B,
        "Find the biggest number that divides both: " + k,
        "Divide <b>both parts</b> by " + k + ": " + A + " ÷ " + k + " = " + r[0] + ", " + B + " ÷ " + k + " = " + r[1],
        "Simplest form: <b>" + ratio(r) + "</b>"
      ]
    };
  });

  add("L1-mild-split", "L1", "mild", function () {
    var r = R.pick(COPRIME), k = R.int(2, 6), f = R.pick(PAIRS);
    var total = (r[0] + r[1]) * k;
    return {
      text: "Zuri makes a fruit mix with <b>" + total + " scoops</b> of fruit. The ratio of " + f[0] + " to " + f[1] +
        " is <b>" + ratio(r) + "</b>. How many scoops of each fruit?",
      parts: [
        { label: cap(f[0]), answer: r[0] * k, type: "number", unit: "scoops",
          mistakes: [{ answer: r[1] * k, message: "Check the order: " + f[0] + " is the " + r[0] + " in " + ratio(r) + "." }, { answer: k, message: "That's one share. How many shares is " + f[0] + "?" }] },
        { label: cap(f[1]), answer: r[1] * k, type: "number", unit: "scoops",
          mistakes: [{ answer: r[0] * k, message: "Check the order: " + f[1] + " is the " + r[1] + " in " + ratio(r) + "." }] }
      ],
      steps: [
        "<b>Add the parts first:</b> " + r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " shares",
        "One share: " + total + " ÷ " + (r[0] + r[1]) + " = " + k + " scoops",
        cap(f[0]) + ": " + r[0] + " × " + k + " = <b>" + c(r[0] * k) + "</b>",
        cap(f[1]) + ": " + r[1] + " × " + k + " = <b>" + c(r[1] * k) + "</b>",
        "Check: " + r[0] * k + " + " + r[1] * k + " = " + total + " ✓"
      ]
    };
  });

  add("L1-mild-batches", "L1", "mild", function () {
    var a = R.int(2, 5), b = R.int(1, 4), n = R.int(2, 6);
    return {
      text: "One jug of Zuri's smoothie base uses <b>" + pl(a, "banana") + "</b> and <b>" + pl(b, "cup") + " of milk</b>. " +
        "She makes <b>" + n + " jugs</b>. How many bananas and cups of milk does she need?",
      parts: [
        { label: "Bananas", answer: a * n, type: "number" },
        { label: "Cups of milk", answer: b * n, type: "number" }
      ],
      steps: [
        "The ratio for one jug is " + a + ":" + b + ". " + n + " jugs means × " + n + ".",
        "Multiply <b>both parts</b> by " + n + ": " + a + " × " + n + " = <b>" + c(a * n) + "</b> bananas, " +
          b + " × " + n + " = <b>" + c(b * n) + "</b> cups of milk",
        a + ":" + b + " = " + a * n + ":" + b * n
      ]
    };
  });

  add("L1-med-equiv", "L1", "medium", function () {
    var r = R.pick(COPRIME), m = R.int(2, 4);
    var k = until(function () { return R.int(2, 9); }, function (k) { return k % m !== 0 && k !== r[0] * m; });
    var f = R.pick(PAIRS);
    var given = r[0] * k, ans = r[1] * k;
    return {
      text: "Zuri's recipe card says " + f[0] + " to " + f[1] + " is <b>" + (r[0] * m) + ":" + (r[1] * m) + "</b>. " +
        "Today she uses <b>" + given + " cups of " + f[0] + "</b>. How many cups of " + f[1] + " does she need?",
      answer: ans, type: "number", unit: "cups",
      steps: [
        "There's no whole number that takes " + r[0] * m + " to " + given + ", so simplify first.",
        "Divide both parts by " + m + ": " + r[0] * m + ":" + r[1] * m + " = " + ratio(r),
        "Now " + r[0] + " → " + given + " is × " + k + ".",
        "Multiply both parts: " + r[1] + " × " + k + " = <b>" + c(ans) + "</b> cups of " + f[1]
      ]
    };
  });

  add("L1-med-split3", "L1", "medium", function () {
    var r = R.pick([[1, 2, 3], [2, 3, 5], [1, 3, 4], [2, 2, 1], [3, 4, 5], [1, 2, 5], [2, 3, 3]]);
    var k = R.int(3, 9), sum = r[0] + r[1] + r[2], total = sum * k;
    var names = R.shuffle(["Mango Rush", "Berry Blast", "Green Machine", "Peach Fizz"]).slice(0, 3);
    return {
      text: "Zuri sold <b>" + total + " smoothies</b> at a festival. The ratio of " + names.join(" to ") +
        " was <b>" + ratio(r) + "</b>. How many of each did she sell?",
      parts: names.map(function (nm, i) { return { label: nm, answer: r[i] * k, type: "number" }; }),
      steps: [
        "<b>Add the parts first:</b> " + r.join(" + ") + " = " + sum + " shares",
        "One share: " + total + " ÷ " + sum + " = " + k,
        names.map(function (nm, i) { return nm + ": " + r[i] + " × " + k + " = <b>" + c(r[i] * k) + "</b>"; }).join("; "),
        "Check: " + r.map(function (x) { return x * k; }).join(" + ") + " = " + total + " ✓"
      ]
    };
  });

  add("L1-med-diff", "L1", "medium", function () {
    var r = until(function () { return R.pick(COPRIME); }, function (r) { return r[1] > r[0]; });
    var k = R.int(4, 12), total = (r[0] + r[1]) * k, f = R.pick(PAIRS);
    return {
      text: "Zuri has <b>" + total + " frozen fruit packs</b>. The ratio of " + f[0] + " packs to " + f[1] + " packs is <b>" +
        ratio(r) + "</b>. How many more " + f[1] + " packs than " + f[0] + " packs are there?",
      answer: (r[1] - r[0]) * k, type: "number", unit: "packs",
      mistakes: [{ answer: r[1] * k, message: "That's how many " + f[1] + " packs. The question asks how many MORE." }, { answer: k, message: "That's one share. How many shares is the difference?" }],
      steps: [
        "<b>Add the parts first:</b> " + r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " shares",
        "One share: " + total + " ÷ " + (r[0] + r[1]) + " = " + k + " packs",
        cap(f[0]) + ": " + r[0] + " × " + k + " = " + r[0] * k + ", " + f[1] + ": " + r[1] + " × " + k + " = " + r[1] * k,
        "Difference: " + r[1] * k + " − " + r[0] * k + " = <b>" + c((r[1] - r[0]) * k) + "</b>",
        "Shortcut: the difference is " + (r[1] - r[0]) + " share" + (r[1] - r[0] > 1 ? "s" : "") + " = " + (r[1] - r[0]) + " × " + k
      ]
    };
  });

  add("L1-med-whole", "L1", "medium", function () {
    var r = until(function () { return R.pick(COPRIME); }, function (r) { return r[0] > 1; }), k = R.int(3, 12), d = R.pickTwo(SMOOTHIES);
    var A = r[0] * k, total = (r[0] + r[1]) * k;
    return {
      text: "The ratio of " + d[0] + " to " + d[1] + " smoothies sold today is <b>" + ratio(r) + "</b>. " +
        "Zuri sold <b>" + A + " " + d[0] + "</b>. How many smoothies did she sell altogether (both kinds)?",
      answer: total, type: "number", unit: "smoothies",
      mistakes: [{ answer: r[1] * k, message: "That's just the " + d[1] + ". The question asks for both kinds altogether." }],
      steps: [
        d[0] + " is " + r[0] + " share" + (r[0] > 1 ? "s" : "") + " = " + A + ", so one share = " + A + " ÷ " + r[0] + " = " + k,
        "Altogether is " + r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " shares",
        (r[0] + r[1]) + " × " + k + " = <b>" + c(total) + "</b> smoothies"
      ]
    };
  });

  add("L1-spicy-diff-total", "L1", "spicy", function () {
    var r = until(function () { return R.pick(COPRIME); }, function (r) { return r[1] > r[0]; });
    var k = R.int(3, 15), f = R.pick(PAIRS), diff = (r[1] - r[0]) * k, total = (r[0] + r[1]) * k;
    return {
      text: "In Zuri's freezer, the ratio of " + f[0] + " bags to " + f[1] + " bags is <b>" + ratio(r) + "</b>. " +
        "There are <b>" + diff + " more " + f[1] + " bags</b> than " + f[0] + " bags. How many bags are there altogether?",
      answer: total, type: "number", unit: "bags",
      steps: [
        "Work backwards. The difference is " + r[1] + " − " + r[0] + " = " + (r[1] - r[0]) + " share" + (r[1] - r[0] > 1 ? "s" : "") + ".",
        "Those shares = " + diff + " bags, so one share = " + diff + " ÷ " + (r[1] - r[0]) + " = " + k,
        "Altogether is " + (r[0] + r[1]) + " parts: " + (r[0] + r[1]) + " × " + k + " = <b>" + c(total) + "</b> bags",
        "Check: " + r[0] * k + " and " + r[1] * k + " differ by " + diff + " ✓"
      ]
    };
  });

  add("L1-spicy-add", "L1", "spicy", function () {
    var v = until(function () {
      var r = R.pick(COPRIME), k = R.int(2, 8), add = R.int(2, 9);
      return { r: r, k: k, add: add, have: r[1] * k - add };
    }, function (v) { return v.have > 0 && v.r[0] !== v.r[1]; });
    var S = v.r[0] * v.k, need = v.r[1] * v.k;
    return {
      text: "Zuri has <b>" + S + " cups of strawberries</b> and <b>" + v.have + " cups of banana</b>. " +
        "She wants strawberry to banana to be <b>" + ratio(v.r) + "</b> without changing the strawberries. " +
        "How many cups of banana should she <b>add</b>?",
      answer: v.r[1] * v.k - v.have, type: "number", unit: "cups",
      steps: [
        "Strawberries are the " + v.r[0] + " share" + (v.r[0] > 1 ? "s" : "") + ": " + v.r[0] + " → " + S + " is × " + v.k + ".",
        "Banana must be " + v.r[1] + " × " + v.k + " = " + need + " cups.",
        "She has " + v.have + ", so add " + need + " − " + v.have + " = <b>" + c(v.add) + "</b> cups"
      ]
    };
  });

  add("L1-spicy-new-ratio", "L1", "spicy", function () {
    var v = until(function () {
      var r = R.pick(COPRIME), k = R.int(4, 12), e = R.int(2, 12);
      var L = r[0] * k + e, S = r[1] * k, g = MP.gcd(L, S);
      return { r: r, k: k, e: e, L: L, S: S, g: g };
    }, function (v) { return v.g > 1 && !(v.L / v.g === v.r[0] && v.S / v.g === v.r[1]); });
    var total = (v.r[0] + v.r[1]) * v.k;
    return {
      text: "By noon Zuri had sold <b>" + total + " smoothies</b>, with large to small cups in the ratio <b>" + ratio(v.r) + "</b>. " +
        "Then she sold <b>" + v.e + " more large</b> and no more small. What is the new ratio of large to small, in simplest form?",
      answer: [v.L / v.g, v.S / v.g], type: "ratio",
      steps: [
        "<b>Add the parts first:</b> " + v.r[0] + " + " + v.r[1] + " = " + (v.r[0] + v.r[1]) + " shares; one share = " + total + " ÷ " + (v.r[0] + v.r[1]) + " = " + v.k,
        "Large: " + v.r[0] + " × " + v.k + " = " + v.r[0] * v.k + "; small: " + v.r[1] + " × " + v.k + " = " + v.S,
        "Add the new large cups: " + v.r[0] * v.k + " + " + v.e + " = " + v.L,
        "New ratio " + v.L + ":" + v.S + ". Divide both by " + v.g + ": <b>" + (v.L / v.g) + ":" + (v.S / v.g) + "</b>"
      ]
    };
  });

  add("L1-spicy-tips", "L1", "spicy", function () {
    var r = R.pick([[5, 2], [5, 3], [7, 3], [7, 4], [3, 1], [4, 1]]);
    var k = R.step(5, 30, 2.5), diff = (r[0] - r[1]) * k, total = (r[0] + r[1]) * k;
    var helper = R.pick(CUSTOMERS);
    return {
      text: "Zuri and her helper " + helper + " split the tip jar in the ratio <b>" + ratio(r) + "</b> (Zuri : " + helper + "). " +
        "Zuri gets <b>" + m(diff) + " more</b> than " + helper + ". How much money was in the tip jar?",
      answer: total, type: "money",
      steps: [
        "Work backwards. Zuri has " + r[0] + " − " + r[1] + " = " + (r[0] - r[1]) + " more share" + (r[0] - r[1] > 1 ? "s" : "") + ".",
        "One share: " + m(diff) + " ÷ " + (r[0] - r[1]) + " = " + m(k),
        "The jar is " + r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " parts: " + (r[0] + r[1]) + " × " + m(k) + " = <b>" + m(total) + "</b>",
        "Check: Zuri " + m(r[0] * k) + ", " + helper + " " + m(r[1] * k) + ", difference " + m(diff) + " ✓"
      ]
    };
  });

  // =====================================================================
  // L2 — Unit rates
  // =====================================================================

  add("L2-mild-price-each", "L2", "mild", function () {
    var u = R.pick([0.75, 0.80, 1.20, 1.25, 1.50, 2.25, 2.50, 3.00]), n = R.int(2, 8), total = u * n;
    var thing = R.pick([["reusable straws", "straw"], ["bags of ice", "bag"], ["lemons", "lemon"], ["paper cups (sleeves)", "sleeve"]]);
    return {
      text: "Zuri pays <b>" + m(total) + " for " + n + " " + thing[0] + "</b>. How much is that per " + thing[1] + "?",
      answer: u, type: "money",
      mistakes: [{ answer: n / total, message: "That's " + thing[1] + "s per dollar. For the price of one, divide the price by the number of items." }],
      steps: [
        "Divide by the thing you want “per”: per " + thing[1] + ", so ÷ " + n + ".",
        m(total) + " ÷ " + n + " = <b>" + m(u) + "</b> per " + thing[1]
      ]
    };
  });

  add("L2-mild-per-hour", "L2", "mild", function () {
    var r = R.pick([15, 20, 25, 30, 35, 40, 45]), h = R.int(2, 6);
    return {
      text: "Zuri sells <b>" + r * h + " smoothies in " + h + " hours</b>. How many smoothies is that per hour?",
      answer: r, type: "number", unit: "per hour",
      steps: [
        "Per hour, so divide by the hours.",
        r * h + " ÷ " + h + " = <b>" + c(r) + "</b> smoothies per hour"
      ]
    };
  });

  add("L2-mild-per-litre", "L2", "mild", function () {
    var u = R.pick([1.25, 1.50, 2.00, 2.50, 3.00, 3.50]), L = R.int(2, 8);
    return {
      text: "A jug of orange juice holds <b>" + L + " L</b> and costs <b>" + m(u * L) + "</b>. What is the price per litre?",
      answer: u, type: "money",
      steps: [
        "Per litre, so divide by the litres.",
        m(u * L) + " ÷ " + L + " = <b>" + m(u) + "</b> per litre"
      ]
    };
  });

  add("L2-mild-ice", "L2", "mild", function () {
    var u = R.pick([0.25, 0.5, 0.75, 1.5]), n = R.pick([2, 4, 6, 8]);
    return {
      text: "Zuri uses <b>" + c(u * n) + " cups of crushed ice for " + n + " smoothies</b>. How many cups of ice is that per smoothie?",
      answer: u, type: "number", unit: "cups",
      steps: [
        "Per smoothie, so divide by the number of smoothies.",
        c(u * n) + " ÷ " + n + " = <b>" + c(u) + "</b> cups per smoothie"
      ]
    };
  });

  add("L2-med-better-buy", "L2", "medium", function () {
    var v = until(function () {
      var nA = R.pick([4, 6, 8, 10, 12]), nB = R.pick([4, 6, 8, 10, 12]);
      var uA = R.step(0.30, 0.90, 0.01), uB = F.roundTo(uA + R.pick([-1, 1]) * R.step(0.02, 0.10, 0.01), 2);
      return { nA: nA, nB: nB, uA: uA, uB: uB };
    }, function (v) { return v.nA !== v.nB && v.uB > 0.2; });
    var best = Math.min(v.uA, v.uB);
    return {
      text: "Pack A has <b>" + v.nA + " bananas for " + m(v.nA * v.uA) + "</b>. Pack B has <b>" + v.nB + " bananas for " + m(v.nB * v.uB) +
        "</b>. Which is the better buy? Enter the <b>price per banana</b> of the better buy.",
      answer: best, type: "money",
      mistakes: [{ answer: Math.max(v.uA, v.uB), message: "That's the unit price of the more expensive pack. Which one is cheaper per banana?" }],
      steps: [
        "Find the unit price of each (divide by the number of bananas).",
        "Pack A: " + m(v.nA * v.uA) + " ÷ " + v.nA + " = " + m(v.uA) + " per banana",
        "Pack B: " + m(v.nB * v.uB) + " ÷ " + v.nB + " = " + m(v.uB) + " per banana",
        "Pack " + (v.uA < v.uB ? "A" : "B") + " is cheaper per banana: <b>" + m(best) + "</b>"
      ]
    };
  });

  add("L2-med-awkward", "L2", "medium", function () {
    var u = R.step(2.19, 5.99, 0.01), n = R.int(3, 7);
    var thing = R.pick([["L of coconut water", "litre"], ["kg of frozen berries", "kilogram"], ["bags of oats", "bag"]]);
    return {
      text: "Zuri pays <b>" + m(u * n) + " for " + n + " " + thing[0] + "</b>. What is the price per " + thing[1] + "?",
      answer: u, type: "money",
      steps: [
        "Per " + thing[1] + ", so divide by " + n + ".",
        m(u * n) + " ÷ " + n + " = <b>" + m(u) + "</b>"
      ]
    };
  });

  add("L2-med-per-minute", "L2", "medium", function () {
    var r = R.pick([12.5, 15, 20, 25, 30, 40]), s = R.pick([10, 12, 15, 20, 24, 30, 40]);
    return {
      text: "Zuri's blender pours <b>" + c(r * s) + " mL in " + s + " seconds</b>. At that rate, how many mL does it pour <b>per minute</b>?",
      answer: r * 60, type: "number", unit: "mL",
      mistakes: [{ answer: r, message: "That's mL per SECOND. A minute is 60 seconds." }],
      steps: [
        "First the rate per second: " + c(r * s) + " ÷ " + s + " = " + c(r) + " mL per second",
        "A minute is 60 seconds: " + c(r) + " × 60 = <b>" + c(r * 60) + "</b> mL per minute"
      ]
    };
  });

  add("L2-med-scale", "L2", "medium", function () {
    var u = R.step(3.75, 6.95, 0.05), n1 = R.int(3, 6), n2 = R.int(7, 12);
    return {
      text: "<b>" + n1 + " smoothies cost " + m(u * n1) + "</b>. At the same price, how much do <b>" + n2 + " smoothies</b> cost?",
      answer: u * n2, type: "money",
      steps: [
        "Unit rate first: " + m(u * n1) + " ÷ " + n1 + " = " + m(u) + " per smoothie",
        "Then " + n2 + " × " + m(u) + " = <b>" + m(u * n2) + "</b>"
      ]
    };
  });

  add("L2-spicy-how-many", "L2", "spicy", function () {
    var u = R.pick([0.85, 1.15, 1.35, 1.45, 2.25, 2.35]), n = R.int(8, 24);
    return {
      text: "Frozen mango costs <b>" + m(u) + " per cup</b>. Zuri spent <b>" + m(u * n) + "</b> on frozen mango. How many cups did she buy?",
      answer: n, type: "number", unit: "cups",
      steps: [
        "Work backwards: cost = cups × " + m(u) + ".",
        "Undo it by dividing: " + m(u * n) + " ÷ " + m(u) + " = <b>" + c(n) + "</b> cups",
        "Check: " + n + " × " + m(u) + " = " + m(u * n) + " ✓"
      ]
    };
  });

  add("L2-spicy-time", "L2", "spicy", function () {
    var v = R.pick([48, 56, 60, 64, 72, 80]), t1 = R.pick([1.5, 2.5]), t2 = R.step(1.25, 5, 0.25);
    return {
      text: "Zuri's truck drives <b>" + c(v * t1) + " km in " + c(t1) + " hours</b> on the way to a festival. " +
        "At the same speed, how many hours will it take to drive <b>" + c(v * t2) + " km</b>? (Answer in hours, as a decimal.)",
      answer: t2, type: "number", unit: "hours",
      steps: [
        "Unit rate: " + c(v * t1) + " km ÷ " + c(t1) + " h = " + v + " km per hour",
        "Time = distance ÷ speed: " + c(v * t2) + " ÷ " + v + " = <b>" + c(t2) + "</b> hours"
      ]
    };
  });

  add("L2-spicy-per-kg", "L2", "spicy", function () {
    var v = until(function () {
      var kg = R.pick([1, 2, 3]), uA = R.step(4.6, 7.6, 0.2), g = R.pick([250, 500]);
      var uB = F.roundTo(uA + R.pick([-1, 1]) * R.step(0.2, 0.8, 0.2), 2);
      return { kg: kg, uA: uA, g: g, uB: uB };
    }, function (v) { return exact2(v.uB * v.g / 1000); });
    var priceA = v.uA * v.kg, priceB = v.uB * v.g / 1000;
    return {
      text: "Store A sells strawberries at <b>" + m(priceA) + " for " + v.kg + " kg</b>. Store B sells them at <b>" + m(priceB) + " for " + v.g +
        " g</b>. How much does Zuri <b>save per kilogram</b> by buying from the cheaper store?",
      answer: Math.abs(v.uA - v.uB), type: "money",
      steps: [
        "Compare the same unit: price per kg.",
        "Store A: " + m(priceA) + " ÷ " + v.kg + " = " + m(v.uA) + " per kg",
        "Store B: " + v.g + " g is " + c(v.g / 1000) + " kg, so " + m(priceB) + " ÷ " + c(v.g / 1000) + " = " + m(v.uB) + " per kg",
        "Saving: " + m(Math.max(v.uA, v.uB)) + " − " + m(Math.min(v.uA, v.uB)) + " = <b>" + m(Math.abs(v.uA - v.uB)) + "</b> per kg"
      ]
    };
  });

  add("L2-spicy-together", "L2", "spicy", function () {
    var v = until(function () {
      return { r1: R.int(10, 24), r2: R.int(8, 20), t: R.step(1, 4, 0.5) };
    }, function (v) { return Number.isInteger((v.r1 + v.r2) * v.t); });
    var helper = R.pick(CUSTOMERS), N = (v.r1 + v.r2) * v.t;
    return {
      text: "Zuri makes <b>" + v.r1 + " smoothies per hour</b>. Her helper " + helper + " makes <b>" + v.r2 + " per hour</b>. " +
        "Working together, how many hours will it take them to make <b>" + N + " smoothies</b>?",
      answer: v.t, type: "number", unit: "hours",
      steps: [
        "Together their rate is " + v.r1 + " + " + v.r2 + " = " + (v.r1 + v.r2) + " smoothies per hour.",
        "Time = smoothies ÷ rate: " + N + " ÷ " + (v.r1 + v.r2) + " = <b>" + c(v.t) + "</b> hours"
      ]
    };
  });

  // =====================================================================
  // L3 — Proportions
  // =====================================================================

  add("L3-mild-for-one", "L3", "mild", function () {
    var per = R.int(2, 4), a = R.int(2, 5), n = until(function () { return R.int(3, 10); }, function (n) { return n !== a; });
    return {
      text: "<b>" + a + " smoothies</b> use <b>" + per * a + " bananas</b>. How many bananas do <b>" + n + " smoothies</b> use?",
      answer: per * n, type: "number", unit: "bananas",
      mistakes: [{ answer: per * a + n - a, message: "Scale, don't add: find the bananas for 1 smoothie, then multiply." }],
      steps: [
        "Same order on both sides: smoothies/bananas → " + a + "/" + per * a + " = " + n + "/?",
        "Find the value for 1: " + per * a + " ÷ " + a + " = " + per + " bananas per smoothie",
        "Scale up: " + n + " × " + per + " = <b>" + c(per * n) + "</b> bananas"
      ]
    };
  });

  add("L3-mild-scale", "L3", "mild", function () {
    var cups = R.int(2, 5), sm = cups * R.int(2, 3), k = R.int(2, 5);
    return {
      text: "<b>" + cups + " cups of juice</b> make <b>" + sm + " smoothies</b>. How many cups of juice make <b>" + sm * k + " smoothies</b>?",
      answer: cups * k, type: "number", unit: "cups",
      steps: [
        "Same order on both sides: cups/smoothies → " + cups + "/" + sm + " = ?/" + sm * k,
        sm + " → " + sm * k + " is × " + k + ", so do the same on top.",
        cups + " × " + k + " = <b>" + c(cups * k) + "</b> cups"
      ]
    };
  });

  add("L3-mild-money", "L3", "mild", function () {
    var u = R.pick([2.5, 3, 3.5, 4, 4.5, 5]), n1 = R.int(2, 4), n2 = R.int(5, 9);
    return {
      text: "<b>" + n1 + " Peach Fizz smoothies cost " + m(u * n1) + "</b>. How much do <b>" + n2 + "</b> cost?",
      answer: u * n2, type: "money",
      steps: [
        "Find the value for 1: " + m(u * n1) + " ÷ " + n1 + " = " + m(u),
        "Scale up: " + n2 + " × " + m(u) + " = <b>" + m(u * n2) + "</b>"
      ]
    };
  });

  add("L3-mild-solve", "L3", "mild", function () {
    var r = R.pick(COPRIME), k = R.int(2, 8);
    return {
      text: "In Zuri's recipe, <b>yogurt / fruit = " + r[0] + "/" + r[1] + "</b>. Solve <b>" + r[0] + "/" + r[1] + " = x/" + r[1] * k +
        "</b> to find how many cups of yogurt go with " + r[1] * k + " cups of fruit.",
      answer: r[0] * k, type: "number", unit: "cups",
      steps: [
        "Same order on both sides: yogurt on top, fruit on the bottom ✓",
        "Bottom: " + r[1] + " → " + r[1] * k + " is × " + k,
        "Top: " + r[0] + " × " + k + " = <b>" + c(r[0] * k) + "</b>, so x = " + c(r[0] * k)
      ]
    };
  });

  add("L3-med-milk", "L3", "medium", function () {
    var per = R.pick([0.25, 0.3, 0.35, 0.4, 0.45]), n1 = R.int(4, 8), n2 = R.int(9, 20);
    return {
      text: "<b>" + n1 + " smoothies</b> need <b>" + c(per * n1) + " L of milk</b>. How many litres do <b>" + n2 + " smoothies</b> need?",
      answer: per * n2, type: "number", unit: "L",
      steps: [
        "Same order: smoothies/litres → " + n1 + "/" + c(per * n1) + " = " + n2 + "/?",
        "Value for 1: " + c(per * n1) + " ÷ " + n1 + " = " + c(per) + " L per smoothie",
        "Scale up: " + n2 + " × " + c(per) + " = <b>" + c(per * n2) + "</b> L"
      ]
    };
  });

  add("L3-med-ice", "L3", "medium", function () {
    var u = R.step(1.89, 3.49, 0.01), n1 = R.int(3, 5), n2 = R.int(6, 11);
    return {
      text: "<b>" + n1 + " bags of ice cost " + m(u * n1) + "</b>. At that price, what do <b>" + n2 + " bags</b> cost?",
      answer: u * n2, type: "money",
      steps: [
        "Same order: bags/cost → " + n1 + "/" + m(u * n1) + " = " + n2 + "/?",
        "Value for 1: " + m(u * n1) + " ÷ " + n1 + " = " + m(u) + " per bag",
        "Scale up: " + n2 + " × " + m(u) + " = <b>" + m(u * n2) + "</b>"
      ]
    };
  });

  add("L3-med-map", "L3", "medium", function () {
    var s = R.pick([0.5, 1.5, 2, 2.5, 4]), cm = R.step(2.4, 12.8, 0.2);
    return {
      text: "On Zuri's route map, <b>1 cm = " + c(s) + " km</b>. The route to the farmers' market is <b>" + c(cm) + " cm</b> on the map. " +
        "How many kilometres is the real route?",
      answer: s * cm, type: "number", unit: "km",
      mistakes: [{ answer: c2(s + cm - 1), message: "Scale, don't add: every 1 cm is " + c(s) + " km, so multiply." }],
      steps: [
        "Same order: cm/km → 1/" + c(s) + " = " + c(cm) + "/?",
        "1 cm → " + c(cm) + " cm is × " + c(cm) + ", so " + c(s) + " × " + c(cm) + " = <b>" + c(s * cm) + "</b> km"
      ]
    };
  });

  add("L3-med-cross", "L3", "medium", function () {
    var v = until(function () {
      var a = R.pick([6, 8, 9, 12, 15, 16, 18, 20, 24]), cc = R.pick([4, 5, 6, 8, 10]), x = R.step(1.5, 15, 0.5);
      return { a: a, c: cc, x: x, b: x * cc / a };
    }, function (v) { return v.a !== v.c && exact2(v.b) && !Number.isInteger(v.a / v.c) && !Number.isInteger(v.c / v.a); });
    return {
      text: "Zuri sets up this proportion to scale her Tropical Twist recipe: <b>x / " + v.a + " = " + c(v.b) + " / " + v.c + "</b>. Solve for x.",
      answer: v.x, type: "number",
      steps: [
        "Value for 1 on the right: " + c(v.b) + " ÷ " + v.c + " = " + F.num(v.b / v.c, 4),
        "Scale up to " + v.a + ": x = " + v.a + " × " + c(v.b) + " ÷ " + v.c,
        v.a + " × " + c(v.b) + " = " + c(v.a * v.b) + ", and " + c(v.a * v.b) + " ÷ " + v.c + " = <b>" + c(v.x) + "</b>"
      ]
    };
  });

  add("L3-spicy-how-many", "L3", "spicy", function () {
    var u = R.pick([0.25, 0.3, 0.375, 0.4, 0.6]);
    var v = until(function () { return { n1: R.pick([5, 8, 10, 12]), N: R.int(12, 40) }; },
      function (v) { return exact2(u * v.n1) && exact2(u * v.N) && v.N !== v.n1; });
    return {
      text: "<b>" + v.n1 + " smoothies</b> use <b>" + c(u * v.n1) + " L of juice</b>. Zuri has <b>" + c(u * v.N) + " L</b> of juice. " +
        "How many smoothies can she make?",
      answer: v.N, type: "number", unit: "smoothies",
      steps: [
        "Same order: smoothies/litres → " + v.n1 + "/" + c(u * v.n1) + " = ?/" + c(u * v.N),
        "Value for 1 smoothie: " + c(u * v.n1) + " ÷ " + v.n1 + " = " + c(u) + " L per smoothie",
        "Work backwards: " + c(u * v.N) + " L ÷ " + c(u) + " L = <b>" + c(v.N) + "</b> smoothies",
        "Check: " + v.N + " × " + c(u) + " = " + c(u * v.N) + " ✓"
      ]
    };
  });

  add("L3-spicy-litres", "L3", "spicy", function () {
    var q = R.pick([125, 150, 175, 200, 225]), N = R.int(6, 30) * 2;
    var mL = q * N;
    return {
      text: "Zuri's recipe uses <b>" + 2 * q + " mL of yogurt for every 2 smoothies</b>. How many <b>litres</b> of yogurt does she need for <b>" + N + " smoothies</b>?",
      answer: mL / 1000, type: "number", unit: "L",
      steps: [
        "Value for 1: " + 2 * q + " ÷ 2 = " + q + " mL per smoothie",
        "Scale up: " + N + " × " + q + " = " + c(mL) + " mL",
        "Change to litres (÷ 1000): <b>" + c(mL / 1000) + "</b> L"
      ]
    };
  });

  add("L3-spicy-gas", "L3", "spicy", function () {
    var v = until(function () {
      var r = R.pick([7.5, 8, 9, 10, 12]), d1 = R.pick([150, 200, 240, 250, 300]), D = R.step(300, 600, 20);
      var need = r * D / 100, H = R.step(2, 30, 0.5);
      return { r: r, d1: d1, D: D, need: need, H: H };
    }, function (v) { return v.H < v.need - 1 && exact2(v.r * v.d1 / 100) && exact2(v.need); });
    var g1 = v.r * v.d1 / 100;
    return {
      text: "Zuri's truck uses <b>" + c(g1) + " L of gas for " + v.d1 + " km</b>. She has <b>" + c(v.H) + " L</b> in the tank and needs to drive <b>" +
        c(v.D) + " km</b>. How many more litres of gas does she need to buy?",
      answer: v.need - v.H, type: "number", unit: "L",
      steps: [
        "Same order: litres/km → " + c(g1) + "/" + v.d1 + " = ?/" + c(v.D),
        "Value for 1 km: " + c(g1) + " ÷ " + v.d1 + " = " + F.num(v.r / 100, 4) + " L per km",
        "For " + c(v.D) + " km: " + c(v.D) + " × " + F.num(v.r / 100, 4) + " = " + c(v.need) + " L",
        "She has " + c(v.H) + " L, so buy " + c(v.need) + " − " + c(v.H) + " = <b>" + c(v.need - v.H) + "</b> L"
      ]
    };
  });

  // =====================================================================
  // L4 — Percent of a number
  // =====================================================================

  function build(p, whole) {
    // explain p% of whole using 10%, 5%, 25%, 1% chunks
    var t = whole / 10, f = whole / 20, q = whole / 4, h = whole / 2;
    var map = {
      5: "5% is half of 10%: " + c(f), 10: "10% = " + c(t), 15: "10% + 5% = " + c(t) + " + " + c(f) + " = " + c(t + f),
      20: "2 × 10% = " + c(2 * t), 25: "25% is a quarter: " + c(whole) + " ÷ 4 = " + c(q), 30: "3 × 10% = " + c(3 * t),
      35: "30% + 5% = " + c(3 * t) + " + " + c(f) + " = " + c(3 * t + f), 40: "4 × 10% = " + c(4 * t),
      45: "40% + 5% = " + c(4 * t) + " + " + c(f) + " = " + c(4 * t + f), 50: "50% is half: " + c(h),
      55: "50% + 5% = " + c(h) + " + " + c(f) + " = " + c(h + f), 60: "50% + 10% = " + c(h) + " + " + c(t) + " = " + c(h + t),
      65: "50% + 10% + 5% = " + c(h) + " + " + c(t) + " + " + c(f) + " = " + c(h + t + f),
      75: "75% is three quarters: 3 × " + c(q) + " = " + c(3 * q), 80: "8 × 10% = " + c(8 * t),
      85: "75% + 10% = " + c(3 * q) + " + " + c(t) + " = " + c(3 * q + t), 95: "100% − 5% = " + c(whole) + " − " + c(f) + " = " + c(whole - f)
    };
    return map[p] || ("1% = " + F.num(whole / 100, 4) + ", so " + p + "% = " + p + " × " + F.num(whole / 100, 4) + " = " + c(whole * p / 100));
  }

  add("L4-mild-friendly", "L4", "mild", function () {
    var p = R.pick([10, 20, 25, 50, 75]);
    var whole = (p === 25 || p === 75) ? R.int(3, 30) * 4 : R.int(2, 30) * 10;
    var drink = R.pick(SMOOTHIES);
    return {
      text: "Zuri sold <b>" + whole + " smoothies</b> on Saturday. <b>" + p + "%</b> of them were " + drink + ". How many " + drink + " smoothies was that?",
      answer: whole * p / 100, type: "number", unit: "smoothies",
      steps: [
        "Build from friendly percents.",
        build(p, whole),
        p + "% of " + whole + " = <b>" + c(whole * p / 100) + "</b>"
      ]
    };
  });

  add("L4-mild-5-15", "L4", "mild", function () {
    var p = R.pick([5, 15]), whole = R.int(1, 20) * 20;
    return {
      text: "Of the <b>" + whole + " customers</b> at Zuri's truck this week, <b>" + p + "%</b> brought their own cup. How many customers was that?",
      answer: whole * p / 100, type: "number", unit: "customers",
      mistakes: [{ answer: whole / p, message: "Dividing by " + p + " doesn't find " + p + "%. Find 10% (÷ 10) first, then build " + p + "%." }],
      steps: [
        "10% of " + whole + " = " + c(whole / 10),
        build(p, whole),
        p + "% of " + whole + " = <b>" + c(whole * p / 100) + "</b>"
      ]
    };
  });

  add("L4-mild-money", "L4", "mild", function () {
    var p = R.pick([10, 20, 30]), whole = R.int(12, 90) * 10;
    return {
      text: "Zuri earned <b>" + m(whole) + "</b> this week. She puts <b>" + p + "%</b> into savings for a new blender. How much does she save?",
      answer: whole * p / 100, type: "money",
      steps: [
        "10% of " + m(whole) + " = " + m(whole / 10) + " (move the decimal one place left)",
        p === 10 ? "So " + p + "% = <b>" + m(whole / 10) + "</b>" : p + "% = " + p / 10 + " × " + m(whole / 10) + " = <b>" + m(whole * p / 100) + "</b>"
      ]
    };
  });

  add("L4-mild-what-percent", "L4", "mild", function () {
    var v = until(function () {
      return { whole: R.pick([20, 25, 40, 50, 80, 200]), p: R.pick([10, 20, 25, 40, 50, 60, 75, 80]) };
    }, function (v) { return Number.isInteger(v.whole * v.p / 100); });
    var part = v.whole * v.p / 100;
    return {
      text: "<b>" + part + " out of " + v.whole + "</b> customers paid with cash today. What percent paid with cash?",
      answer: v.p, type: "percent",
      steps: [
        "Write it as a fraction: " + part + "/" + v.whole,
        "Make the bottom 100: " + v.whole + " × " + c(100 / v.whole) + " = 100, so " + part + " × " + c(100 / v.whole) + " = " + c(v.p),
        part + "/" + v.whole + " = " + v.p + "/100 = <b>" + v.p + "%</b>"
      ]
    };
  });

  add("L4-med-build", "L4", "medium", function () {
    var p = R.pick([15, 35, 45, 55, 65, 85, 95]), whole = R.int(2, 30) * 20;
    return {
      text: "Zuri's truck used <b>" + whole + " cups of fruit</b> today. <b>" + p + "%</b> of it was mango. How many cups of mango was that?",
      answer: whole * p / 100, type: "number", unit: "cups",
      mistakes: [{ answer: whole / p, message: "Dividing by " + p + " doesn't find " + p + "%. Build it from 10% and 5%." }],
      steps: [
        "Build " + p + "% from 10%, 5%, 25% and 50%.",
        "10% of " + whole + " = " + c(whole / 10) + ", 5% = " + c(whole / 20),
        build(p, whole),
        p + "% of " + whole + " = <b>" + c(whole * p / 100) + "</b>"
      ]
    };
  });

  add("L4-med-eighths", "L4", "medium", function () {
    var p = R.pick([12.5, 37.5, 62.5, 87.5]), whole = R.int(3, 30) * 8, eighths = p / 12.5;
    return {
      text: "Zuri bought <b>" + whole + " bananas</b>. <b>" + c(p) + "%</b> of them were too ripe to use. How many bananas was that?",
      answer: whole * p / 100, type: "number", unit: "bananas",
      steps: [
        "25% is a quarter: " + whole + " ÷ 4 = " + c(whole / 4),
        "12.5% is half of 25%: " + c(whole / 8),
        c(p) + "% = " + eighths + " × 12.5% = " + eighths + " × " + c(whole / 8) + " = <b>" + c(whole * p / 100) + "</b>"
      ]
    };
  });

  add("L4-med-over-100", "L4", "medium", function () {
    var p = R.pick([110, 120, 125, 150, 175, 200]), whole = R.int(3, 25) * 20;
    return {
      text: "Last week Zuri sold <b>" + whole + " smoothies</b>. This week she sold <b>" + p + "%</b> of last week's amount. How many did she sell this week?",
      answer: whole * p / 100, type: "number", unit: "smoothies",
      steps: [
        p + "% = 100% + " + (p - 100) + "%",
        "100% of " + whole + " = " + whole + "; " + build(p - 100, whole),
        whole + " + " + c(whole * (p - 100) / 100) + " = <b>" + c(whole * p / 100) + "</b>"
      ]
    };
  });

  add("L4-med-what-percent", "L4", "medium", function () {
    var v = until(function () {
      return { whole: R.pick([40, 60, 80, 120, 160, 200, 240]), p: R.pick([12.5, 15, 35, 37.5, 45, 55, 62.5, 65, 85]) };
    }, function (v) { return Number.isInteger(v.whole * v.p / 100); });
    var part = v.whole * v.p / 100;
    return {
      text: "<b>" + part + " of the " + v.whole + "</b> smoothies Zuri sold had a protein boost. What percent had a protein boost?",
      answer: v.p, type: "percent", dp: 1,
      steps: [
        "Percent = part ÷ whole × 100",
        part + " ÷ " + v.whole + " = " + F.num(part / v.whole, 4),
        F.num(part / v.whole, 4) + " × 100 = <b>" + F.pct(v.p) + "</b>"
      ]
    };
  });

  add("L4-spicy-whole", "L4", "spicy", function () {
    var v = until(function () {
      return { p: R.pick([12.5, 15, 35, 45, 60, 75]), W: R.int(4, 40) * 10 };
    }, function (v) { return Number.isInteger(v.W * v.p / 100); });
    var part = v.W * v.p / 100, drink = R.pick(SMOOTHIES);
    return {
      text: "<b>" + c(v.p) + "%</b> of Zuri's customers on Friday ordered " + drink + ". That was <b>" + part + " customers</b>. " +
        "How many customers did she have on Friday?",
      answer: v.W, type: "number", unit: "customers",
      steps: [
        "Work backwards: " + c(v.p) + "% of the total = " + part + ". Step down to a benchmark, then build up to 100%.",
        chain(v.p, part) ? chain(v.p, part).replace(/= ([\d,.]+)$/, "= <b>$1</b>") + " customers" :
          "1% = " + part + " ÷ " + c(v.p) + " = " + F.num(part / v.p, 4) + ", so 100% = <b>" + c(v.W) + "</b> customers",
        "Check: " + c(v.p) + "% of " + v.W + " = " + part + " ✓"
      ]
    };
  });

  add("L4-spicy-of-a-percent", "L4", "spicy", function () {
    var v = until(function () {
      return { T: R.int(5, 20) * 40, p1: R.pick([40, 50, 60, 75]), p2: R.pick([10, 20, 25, 50]) };
    }, function (v) { return Number.isInteger(v.T * v.p1 / 100 * v.p2 / 100); });
    var a = v.T * v.p1 / 100, b = a * v.p2 / 100;
    return {
      text: "Zuri made <b>" + v.T + " smoothies</b> this month. <b>" + v.p1 + "%</b> had a protein boost, and <b>" + v.p2 +
        "%</b> of those had a <b>double</b> boost. How many smoothies had a double boost?",
      answer: b, type: "number", unit: "smoothies",
      steps: [
        "Step 1: " + v.p1 + "% of " + v.T + ": " + build(v.p1, v.T) + " → " + c(a) + " had a boost",
        "Step 2: " + v.p2 + "% of <b>those " + c(a) + "</b>: " + build(v.p2, a),
        "<b>" + c(b) + "</b> smoothies had a double boost"
      ]
    };
  });

  add("L4-spicy-left", "L4", "spicy", function () {
    var v = until(function () {
      return { S: R.int(2, 15) * 20, a: R.pick([20, 25, 40, 50, 60, 75]), b: R.pick([10, 20, 25, 50]) };
    }, function (v) { var left1 = v.S * (100 - v.a) / 100; return Number.isInteger(left1) && Number.isInteger(left1 * v.b / 100); });
    var left1 = v.S * (100 - v.a) / 100, used2 = left1 * v.b / 100, left2 = left1 - used2;
    return {
      text: "Zuri started the week with <b>" + v.S + " cups of strawberries</b>. On Monday she used <b>" + v.a + "%</b> of them. " +
        "On Tuesday she used <b>" + v.b + "% of what was left</b>. How many cups were left after Tuesday?",
      answer: left2, type: "number", unit: "cups",
      steps: [
        "Monday: " + v.a + "% of " + v.S + " = " + c(v.S * v.a / 100) + " used, so " + c(left1) + " left",
        "Tuesday: " + v.b + "% of <b>" + c(left1) + "</b> (not of " + v.S + ") = " + c(used2) + " used",
        "Left: " + c(left1) + " − " + c(used2) + " = <b>" + c(left2) + "</b> cups"
      ]
    };
  });

  add("L4-spicy-card-fee", "L4", "spicy", function () {
    var p = R.pick([0.5, 1.5, 2.5, 1.75]), X = R.int(10, 90) * 20;
    var fee = X * p / 100;
    return {
      text: "Zuri's card reader charges a fee of <b>" + c(p) + "%</b> on card sales. Today she had <b>" + m(X) + "</b> in card sales. " +
        "How much is the fee?",
      answer: fee, type: "money",
      steps: [
        "1% of " + m(X) + " = " + m(X / 100),
        p === 0.5 ? "0.5% is half of 1%: " + m(X / 200) :
          c(p) + "% = " + c(p) + " × " + m(X / 100) + " = " + F.moneyRaw(fee),
        "Fee: <b>" + m(fee) + "</b>"
      ]
    };
  });

  // =====================================================================
  // L5 — Percent change
  // =====================================================================

  add("L5-mild-up", "L5", "mild", function () {
    var P = R.pick([4, 5, 6, 8, 10, 12, 20]), p = R.pick([10, 20, 25, 50]);
    var drink = R.pick(SMOOTHIES), np = P * (100 + p) / 100;
    return {
      text: "The price of a " + drink + " goes up <b>" + p + "%</b> from <b>" + m(P) + "</b>. What is the new price?",
      answer: np, type: "money",
      steps: [
        "Up " + p + "% means you pay " + (100 + p) + "% → × " + F.dec(100 + p),
        m(P) + " × " + F.dec(100 + p) + " = <b>" + m(np) + "</b>",
        "Or: " + p + "% of " + m(P) + " = " + m(P * p / 100) + ", and " + m(P) + " + " + m(P * p / 100) + " = " + m(np)
      ]
    };
  });

  add("L5-mild-down", "L5", "mild", function () {
    var p = R.pick([10, 20, 25, 50]), N = p === 25 ? R.int(5, 25) * 4 : R.int(3, 20) * 10;
    var n2 = N * (100 - p) / 100;
    return {
      text: "Zuri sold <b>" + N + " smoothies</b> on Monday. On Tuesday (it rained) she sold <b>" + p + "% fewer</b>. How many did she sell on Tuesday?",
      answer: n2, type: "number", unit: "smoothies",
      mistakes: [{ answer: N * p / 100, message: "That's how many FEWER. Take it away from " + N + "." }],
      steps: [
        "Down " + p + "% means " + (100 - p) + "% are left → × " + F.dec(100 - p),
        N + " × " + F.dec(100 - p) + " = <b>" + c(n2) + "</b>",
        "Or: " + p + "% of " + N + " = " + c(N * p / 100) + ", and " + N + " − " + c(N * p / 100) + " = " + c(n2)
      ]
    };
  });

  add("L5-mild-pct-up", "L5", "mild", function () {
    var v = until(function () { return { O: R.pick([2, 4, 5, 6, 8, 10]), p: R.pick([10, 20, 25, 50]) }; },
      function (v) { return exact2(v.O * v.p / 100); });
    var N = v.O * (100 + v.p) / 100;
    return {
      text: "The price of a large smoothie went from <b>" + m(v.O) + "</b> to <b>" + m(N) + "</b>. What is the percent increase?",
      answer: v.p, type: "percent",
      mistakes: [{ answer: (N - v.O) / N * 100, message: "Divide the change by the ORIGINAL price, not the new one." }],
      steps: [
        "Change: " + m(N) + " − " + m(v.O) + " = " + m(N - v.O),
        "Change ÷ <b>ORIGINAL</b>: " + m(N - v.O) + " ÷ " + m(v.O) + " = " + F.num((N - v.O) / v.O, 4),
        "× 100 → <b>" + v.p + "%</b> increase"
      ]
    };
  });

  add("L5-mild-pct-down", "L5", "mild", function () {
    var O = R.pick([20, 40, 50, 80, 100, 200]), p = R.pick([10, 20, 25, 50]);
    var N = O * (100 - p) / 100;
    return {
      text: "Zuri had <b>" + O + " customers</b> last Saturday and <b>" + N + "</b> this Saturday. What is the percent decrease?",
      answer: p, type: "percent",
      mistakes: [{ answer: (O - N) / N * 100, message: "Divide the change by the ORIGINAL number (last Saturday), not the new one." }],
      steps: [
        "Change: " + O + " − " + N + " = " + c(O - N),
        "Change ÷ <b>ORIGINAL</b> (last Saturday): " + c(O - N) + " ÷ " + O + " = " + F.num((O - N) / O, 4),
        "× 100 → <b>" + p + "%</b> decrease"
      ]
    };
  });

  add("L5-med-pct-change", "L5", "medium", function () {
    var v = until(function () { var O = R.int(40, 150); return { O: O, N: O + R.int(5, 40) }; },
      function (v) { return !exact2((v.N - v.O) / v.O * 100); });
    var p = F.roundTo((v.N - v.O) / v.O * 100, 1);
    return {
      text: "Zuri sold <b>" + v.O + " smoothies</b> in May and <b>" + v.N + "</b> in June. What is the percent increase? <b>Round to one decimal place.</b>",
      answer: p, type: "percent", dp: 1,
      mistakes: [{ answer: F.roundTo((v.N - v.O) / v.N * 100, 1), message: "Divide the change by the ORIGINAL (May), not the new amount." }],
      steps: [
        "Change: " + v.N + " − " + v.O + " = " + (v.N - v.O),
        "Change ÷ <b>ORIGINAL</b> (May): " + (v.N - v.O) + " ÷ " + v.O + " = " + F.num((v.N - v.O) / v.O, 5),
        "× 100 = " + F.num((v.N - v.O) / v.O * 100, 4) + "%",
        "Rounded: <b>" + F.pct(p) + "</b>"
      ]
    };
  });

  add("L5-med-up-awkward", "L5", "medium", function () {
    var P = R.step(4.25, 9.75, 0.05), p = R.pick([3, 4, 6, 8, 12, 15]);
    var np = P * (100 + p) / 100;
    return {
      text: "Fruit costs went up, so Zuri raises the price of a smoothie by <b>" + p + "%</b>. It was <b>" + m(P) + "</b>. What is the new price?",
      answer: np, type: "money",
      steps: [
        "Up " + p + "% → × " + F.dec(100 + p),
        m(P) + " × " + F.dec(100 + p) + " = " + F.moneyRaw(np),
        "Round to the nearest cent: <b>" + m(np) + "</b>"
      ]
    };
  });

  add("L5-med-down-count", "L5", "medium", function () {
    var p = R.pick([15, 35, 45, 65]), N = R.int(4, 30) * 20;
    var n2 = N * (100 - p) / 100;
    return {
      text: "Zuri's truck used <b>" + N + " paper straws</b> last month. After switching to reusable straws, she used <b>" + p + "% fewer</b>. How many paper straws this month?",
      answer: n2, type: "number", unit: "straws",
      steps: [
        "Down " + p + "% → " + (100 - p) + "% left → × " + F.dec(100 - p),
        N + " × " + F.dec(100 - p) + " = <b>" + c(n2) + "</b>",
        "Or: " + build(p, N) + " fewer, and " + N + " − " + c(N * p / 100) + " = " + c(n2)
      ]
    };
  });

  add("L5-med-pct-down", "L5", "medium", function () {
    var v = until(function () { var O = R.int(60, 200); return { O: O, N: O - R.int(8, 45) }; },
      function (v) { return v.N > 0; });
    var p = F.roundTo((v.O - v.N) / v.O * 100, 1);
    return {
      text: "A bag of chia seeds went from <b>" + v.O + " servings</b> to <b>" + v.N + " servings</b> after the company changed the size. " +
        "What is the percent decrease? <b>Round to one decimal place.</b>",
      answer: p, type: "percent", dp: 1,
      mistakes: [{ answer: F.roundTo((v.O - v.N) / v.N * 100, 1), message: "Divide the change by the ORIGINAL amount, not the new one." }],
      steps: [
        "Change: " + v.O + " − " + v.N + " = " + (v.O - v.N),
        "Change ÷ <b>ORIGINAL</b>: " + (v.O - v.N) + " ÷ " + v.O + " = " + F.num((v.O - v.N) / v.O, 5),
        "× 100 = " + F.num((v.O - v.N) / v.O * 100, 4) + "% → <b>" + F.pct(p) + "</b> decrease"
      ]
    };
  });

  add("L5-spicy-original-up", "L5", "spicy", function () {
    var O = R.step(4, 12, 0.25), p = R.pick([8, 10, 15, 20, 25]);
    var N = F.roundTo(O * (100 + p) / 100, 2);
    return {
      text: "After a <b>" + p + "% price increase</b>, a smoothie at Zuri's truck costs <b>" + m(N) + "</b>. What was the price before the increase?",
      answer: O, type: "money",
      steps: [
        "Work backwards: original × " + F.dec(100 + p) + " = " + m(N),
        "Undo by dividing: " + m(N) + " ÷ " + F.dec(100 + p) + " = <b>" + m(O) + "</b>"].concat(chainStep(100 + p, N, F.moneyRaw)).concat([
        "Check: " + m(O) + " × " + F.dec(100 + p) + " = " + m(N) + " ✓",
        "<span class='note'>Taking " + p + "% off " + m(N) + " does <b>not</b> work: the " + p + "% was of the smaller, original price.</span>"
      ]),
      mistakes: [{ answer: N * (100 - p) / 100, message: "Taking " + p + "% off the new price doesn't undo it — the " + p + "% was of the smaller, original price." }]
    };
  });

  add("L5-spicy-up-down", "L5", "spicy", function () {
    var p = R.pick([10, 20, 25, 30, 40, 50]), who = R.pick(CUSTOMERS);
    var keep = (100 + p) * (100 - p) / 100;
    return {
      text: "Zuri raised her prices by <b>" + p + "%</b>, then a month later lowered them by <b>" + p + "%</b>. " + who +
        " says the prices are back where they started. What is the <b>overall percent decrease</b>?",
      answer: 100 - keep, type: "percent", dp: 2,
      mistakes: [{ answer: 0, message: "The two changes don't cancel: the decrease is taken from the bigger, raised price." }],
      steps: [
        "Up " + p + "% → × " + F.dec(100 + p) + "; down " + p + "% → × " + F.dec(100 - p),
        "Together: " + F.dec(100 + p) + " × " + F.dec(100 - p) + " = " + F.dec(keep),
        "Prices are " + F.pct(keep) + " of the start, so the overall decrease is 100% − " + F.pct(keep) + " = <b>" + F.pct(100 - keep) + "</b>",
        "Why: the " + p + "% decrease was of the <b>bigger</b> price, so it takes off more."
      ]
    };
  });

  add("L5-spicy-back-up", "L5", "spicy", function () {
    var d = R.pick([10, 20, 25, 40, 50]), O = R.pick([4, 5, 6, 8, 10]);
    var low = O * (100 - d) / 100, p = F.roundTo(d / (100 - d) * 100, 1);
    return {
      text: "Zuri put the " + R.pick(SMOOTHIES) + " on sale, <b>" + d + "% off</b> its usual price of <b>" + m(O) + "</b>. " +
        "After the sale, by what <b>percent</b> must the sale price go up to get back to " + m(O) + "? <b>Round to one decimal place.</b>",
      answer: p, type: "percent", dp: 1,
      mistakes: [{ answer: d, message: "Going back up, the ORIGINAL is the sale price, which is smaller — so the percent is bigger than " + d + "%." }],
      steps: [
        "Sale price: " + m(O) + " × " + F.dec(100 - d) + " = " + m(low),
        "Going back up, the <b>ORIGINAL</b> is now the sale price " + m(low) + ".",
        "Change: " + m(O) + " − " + m(low) + " = " + m(O - low) + "; " + m(O - low) + " ÷ " + m(low) + " = " + F.num((O - low) / low, 4),
        "× 100 → <b>" + F.pct(p) + "</b> (not " + d + "%!)"
      ]
    };
  });

  add("L5-spicy-original-down", "L5", "spicy", function () {
    var v = until(function () { return { p: R.pick([10, 15, 20, 25, 30, 40]), O: R.int(4, 20) * 20 }; },
      function (v) { return Number.isInteger(v.O * (100 - v.p) / 100); });
    var N = v.O * (100 - v.p) / 100;
    return {
      text: "Because of construction on her street, Zuri had <b>" + v.p + "% fewer customers</b> this month: <b>" + N + "</b>. " +
        "How many customers did she have last month?",
      answer: v.O, type: "number", unit: "customers",
      steps: [
        "Work backwards: " + v.p + "% fewer → last month × " + F.dec(100 - v.p) + " = " + N,
        "Undo by dividing: " + N + " ÷ " + F.dec(100 - v.p) + " = <b>" + c(v.O) + "</b>"].concat(chainStep(100 - v.p, N)).concat([
        "Check: " + v.O + " × " + F.dec(100 - v.p) + " = " + N + " ✓"
      ]),
      mistakes: [{ answer: N * (100 + v.p) / 100, message: "Adding " + v.p + "% back on doesn't undo it — the " + v.p + "% was of last month's bigger number." }]
    };
  });

  // =====================================================================
  // L7 — Simple interest   I = P × r × t
  // =====================================================================

  function prt(P, r, t) { return P * r / 100 * t; }

  add("L7-mild-interest", "L7", "mild", function () {
    var P = R.int(5, 50) * 100, r = R.int(2, 6), t = R.int(1, 5);
    var I = prt(P, r, t);
    return {
      text: "Zuri puts <b>" + m(P) + "</b> in a savings account that pays <b>" + r + "% simple interest</b> per year. " +
        "How much interest does she earn in <b>" + pl(t, "year") + "</b>?",
      answer: I, type: "money",
      mistakes: [{ answer: P * r * t, message: "Write the rate as a decimal: " + r + "% = " + F.dec(r) + ", not " + r + "." }],
      steps: [
        "I = P × r × t, with the rate as a decimal: " + r + "% = " + F.dec(r),
        "I = " + m(P) + " × " + F.dec(r) + " × " + t,
        "= " + m(P * r / 100) + " per year × " + t + " = <b>" + m(I) + "</b>"
      ]
    };
  });

  add("L7-mild-total", "L7", "mild", function () {
    var P = R.int(5, 40) * 100, r = R.int(2, 6), t = R.int(2, 5);
    var I = prt(P, r, t);
    return {
      text: "Zuri saves <b>" + m(P) + "</b> at <b>" + r + "% simple interest</b> per year for <b>" + t + " years</b>. " +
        "How much will be in the account at the end (savings + interest)?",
      answer: P + I, type: "money",
      mistakes: [{ answer: I, message: "That's the interest. Add the principal back on for the total." }],
      steps: [
        "I = P × r × t = " + m(P) + " × " + F.dec(r) + " × " + t + " = " + m(I),
        "Total = P + I = " + m(P) + " + " + m(I) + " = <b>" + m(P + I) + "</b>"
      ]
    };
  });

  add("L7-mild-months", "L7", "mild", function () {
    var P = R.int(5, 40) * 100, r = R.int(2, 6), t = R.int(2, 4);
    var I = prt(P, r, t);
    return {
      text: "Zuri's cousin lends her <b>" + m(P) + "</b> at <b>" + r + "% simple interest</b> per year. She pays it back after <b>" + t * 12 +
        " months</b>. How much interest does she owe?",
      answer: I, type: "money",
      mistakes: [{ answer: P * r / 100 * t * 12, message: "Time must be in YEARS: " + t * 12 + " months = " + t + " years." }],
      steps: [
        "Time must be in <b>years</b>: " + t * 12 + " months ÷ 12 = " + t + " years",
        "Rate as a decimal: " + r + "% = " + F.dec(r),
        "I = " + m(P) + " × " + F.dec(r) + " × " + t + " = <b>" + m(I) + "</b>"
      ]
    };
  });

  add("L7-med-months", "L7", "medium", function () {
    var P = R.int(8, 60) * 100, r = R.pick([3, 4, 5, 6, 7]), mo = R.pick([6, 9, 15, 18, 30]);
    var I = prt(P, r, mo / 12);
    return {
      text: "Zuri borrows <b>" + m(P) + "</b> for a new freezer at <b>" + r + "% simple interest</b> per year for <b>" + mo + " months</b>. " +
        "How much interest will she pay?",
      answer: I, type: "money",
      mistakes: [{ answer: P * r / 100 * mo, message: "Time must be in YEARS: " + mo + " months ÷ 12 = " + c(mo / 12) + " years." }],
      steps: [
        "Time in <b>years</b>: " + mo + " ÷ 12 = " + c(mo / 12) + " years",
        "I = " + m(P) + " × " + F.dec(r) + " × " + c(mo / 12) + " = " + F.moneyRaw(I),
        "Interest: <b>" + m(I) + "</b>"
      ]
    };
  });

  add("L7-med-decimal-rate", "L7", "medium", function () {
    var P = R.int(12, 96) * 50, r = R.pick([1.75, 2.5, 3.25, 3.5, 4.25, 5.5]), t = R.int(2, 5);
    var I = prt(P, r, t);
    return {
      text: "Zuri invests <b>" + m(P) + "</b> of her profits at <b>" + c(r) + "% simple interest</b> per year for <b>" + t + " years</b>. " +
        "How much interest will she earn?",
      answer: I, type: "money",
      steps: [
        "Rate as a decimal: " + c(r) + "% ÷ 100 = " + F.dec(r),
        "I = " + m(P) + " × " + F.dec(r) + " × " + t + " = " + F.moneyRaw(I),
        "Interest: <b>" + m(I) + "</b>"
      ]
    };
  });

  add("L7-med-payback", "L7", "medium", function () {
    var P = R.int(8, 40) * 150, r = R.step(4.5, 9, 0.5), t = R.pick([1.5, 2, 3]);
    var I = prt(P, r, t);
    return {
      text: "Zuri takes a loan of <b>" + m(P) + "</b> to repaint her truck, at <b>" + c(r) + "% simple interest</b> per year for <b>" + c(t) + " years</b>. " +
        "What is the total she must pay back?",
      answer: P + I, type: "money",
      mistakes: [{ answer: I, message: "That's just the interest. Add the loan back on for the total she pays." }],
      steps: [
        "I = P × r × t = " + m(P) + " × " + F.dec(r) + " × " + c(t) + " = " + F.moneyRaw(I),
        "Total = P + I = " + m(P) + " + " + F.moneyRaw(I) + " = <b>" + m(P + I) + "</b>"
      ]
    };
  });

  add("L7-med-monthly", "L7", "medium", function () {
    var P = R.int(12, 60) * 100, r = R.pick([4, 5, 6, 8]), t = R.pick([1, 2, 3]);
    var I = prt(P, r, t), A = P + I, mo = t * 12;
    return {
      text: "Zuri borrows <b>" + m(P) + "</b> at <b>" + r + "% simple interest</b> per year for <b>" + pl(t, "year") + "</b>. " +
        "She pays back the total in equal monthly payments. How much is each payment?",
      answer: A / mo, type: "money",
      steps: [
        "I = " + m(P) + " × " + F.dec(r) + " × " + t + " = " + m(I),
        "Total to pay back: " + m(P) + " + " + m(I) + " = " + m(A),
        "Number of payments: " + t + " × 12 = " + mo,
        "Each payment: " + m(A) + " ÷ " + mo + " = " + fin(A / mo)
      ]
    };
  });

  add("L7-spicy-rate", "L7", "spicy", function () {
    var P = R.int(8, 50) * 100, r = R.pick([2.5, 3, 3.5, 4, 4.5, 5, 6]), t = R.int(2, 5);
    var I = prt(P, r, t);
    return {
      text: "Zuri invested <b>" + m(P) + "</b> for <b>" + t + " years</b> and earned <b>" + m(I) + "</b> in simple interest. What was the interest <b>rate</b> per year?",
      answer: r, type: "percent", dp: 2,
      steps: [
        "Find one year's interest first: " + m(I) + " ÷ " + t + " years = " + m(I / t) + " a year",
        "Rate = one year's interest ÷ principal: " + m(I / t) + " ÷ " + m(P) + " = " + F.dec(r),
        "As a percent: " + F.dec(r) + " × 100 = <b>" + F.pct(r) + "</b>"
      ]
    };
  });

  add("L7-spicy-time", "L7", "spicy", function () {
    var P = R.int(10, 60) * 100, r = R.pick([2, 3, 4, 5, 6]), t = R.pick([0.5, 1.5, 2, 2.5, 3, 4, 5]);
    var I = prt(P, r, t);
    return {
      text: "Zuri's <b>" + m(P) + "</b> savings earn <b>" + r + "% simple interest</b> per year. How many <b>years</b> will it take to earn <b>" + m(I) + "</b> in interest?",
      answer: t, type: "number", unit: "years",
      steps: [
        "I = P × r × t, so " + m(I) + " = " + m(P) + " × " + F.dec(r) + " × t",
        "One year's interest: " + m(P) + " × " + F.dec(r) + " = " + m(P * r / 100),
        "t = " + m(I) + " ÷ " + m(P * r / 100) + " = <b>" + c(t) + "</b> years"
      ]
    };
  });

  add("L7-spicy-principal", "L7", "spicy", function () {
    var P = R.int(10, 80) * 100, r = R.pick([2, 2.5, 3, 4, 5]), t = R.int(2, 5);
    var I = prt(P, r, t);
    return {
      text: "Zuri wants to earn <b>" + m(I) + "</b> in simple interest over <b>" + t + " years</b> at <b>" + c(r) + "%</b> per year. How much must she invest?",
      answer: P, type: "money",
      steps: [
        "I = P × r × t, so " + m(I) + " = P × " + F.dec(r) + " × " + t,
        F.dec(r) + " × " + t + " = " + F.num(r / 100 * t, 4),
        "P = " + m(I) + " ÷ " + F.num(r / 100 * t, 4) + " = <b>" + m(P) + "</b>",
        "Check: " + m(P) + " × " + F.dec(r) + " × " + t + " = " + m(I) + " ✓"
      ]
    };
  });

  add("L7-spicy-compare", "L7", "spicy", function () {
    var v = until(function () {
      return { P: R.int(10, 60) * 100, r1: R.pick([3, 3.5, 4, 4.5, 5]), t1: R.int(2, 4), r2: R.pick([2.5, 3, 3.5, 4]), t2: R.int(3, 6) };
    }, function (v) { return Math.abs(prt(v.P, v.r1, v.t1) - prt(v.P, v.r2, v.t2)) > 0.5; });
    var I1 = prt(v.P, v.r1, v.t1), I2 = prt(v.P, v.r2, v.t2);
    return {
      text: "Zuri has <b>" + m(v.P) + "</b> to invest. <b>Option A:</b> " + c(v.r1) + "% simple interest for " + v.t1 + " years. " +
        "<b>Option B:</b> " + c(v.r2) + "% simple interest for " + v.t2 + " years. How much <b>more interest</b> does the better option earn?",
      answer: Math.abs(I1 - I2), type: "money",
      steps: [
        "Option A: " + m(v.P) + " × " + F.dec(v.r1) + " × " + v.t1 + " = " + m(I1),
        "Option B: " + m(v.P) + " × " + F.dec(v.r2) + " × " + v.t2 + " = " + m(I2),
        "Option " + (I1 > I2 ? "A" : "B") + " earns more: " + m(Math.max(I1, I2)) + " − " + m(Math.min(I1, I2)) + " = <b>" + m(Math.abs(I1 - I2)) + "</b>"
      ]
    };
  });

  // =====================================================================
  // L8 — Multi-step (one tool per step)
  // =====================================================================

  add("L8-mild-pack", "L8", "mild", function () {
    var per = R.pick([2, 2.5, 3, 4]), n = R.pick([4, 5, 6]), need = until(function () { return R.int(5, 15); }, function (x) { return x !== n; });
    return {
      text: "A pack of <b>" + n + " bags of frozen mango costs " + m(per * n) + "</b>. Zuri can buy single bags at the same price per bag. " +
        "She needs <b>" + need + " bags</b>. How much will they cost?",
      answer: per * need, type: "money",
      steps: [
        "<b>Step 1 — unit rate:</b> " + m(per * n) + " ÷ " + n + " = " + m(per) + " per bag",
        "<b>Step 2 — scale up:</b> " + need + " × " + m(per) + " = <b>" + m(per * need) + "</b>"
      ]
    };
  });

  add("L8-mild-profit-split", "L8", "mild", function () {
    var r = R.pick([[1, 1], [2, 1], [3, 1], [3, 2]]), k = R.int(2, 10) * 10;
    var profit = (r[0] + r[1]) * k, costs = R.int(5, 30) * 10, revenue = profit + costs, helper = R.pick(CUSTOMERS);
    return {
      text: "On Saturday Zuri's truck took in <b>" + m(revenue) + "</b>, and supplies cost <b>" + m(costs) + "</b>. " +
        "Zuri and " + helper + " split the profit in the ratio <b>" + ratio(r) + "</b> (Zuri : " + helper + "). How much does " + helper + " get?",
      answer: r[1] * k, type: "money",
      steps: [
        "<b>Step 1 — profit:</b> " + m(revenue) + " − " + m(costs) + " = " + m(profit),
        "<b>Step 2 — split:</b> add the parts first: " + r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " shares; one share = " + m(profit) + " ÷ " + (r[0] + r[1]) + " = " + m(k),
        helper + " gets " + r[1] + " share" + (r[1] > 1 ? "s" : "") + ": <b>" + m(r[1] * k) + "</b>"
      ]
    };
  });

  add("L8-mild-percent-ratio", "L8", "mild", function () {
    var T = R.int(2, 12) * 40, r = R.pick([[1, 2], [2, 1], [1, 1], [2, 3]]);
    var berry = T / 4, rest = T - berry, part = rest / (r[0] + r[1]);
    return {
      text: "Zuri sold <b>" + T + " smoothies</b>. <b>25%</b> were Berry Blast. The rest were Mango Rush and Green Machine in the ratio <b>" +
        ratio(r) + "</b>. How many Green Machine smoothies did she sell?",
      answer: r[1] * part, type: "number", unit: "smoothies",
      steps: [
        "<b>Step 1 — percent:</b> 25% of " + T + " = " + c(berry) + " Berry Blast",
        "<b>Step 2 — the rest:</b> " + T + " − " + c(berry) + " = " + c(rest),
        "<b>Step 3 — ratio:</b> " + r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " shares; one share = " + c(rest) + " ÷ " + (r[0] + r[1]) + " = " + c(part),
        "Green Machine: " + r[1] + " × " + c(part) + " = <b>" + c(r[1] * part) + "</b>"
      ]
    };
  });

  add("L8-med-rate-tax", "L8", "medium", function () {
    var u = R.step(1.85, 3.95, 0.05), n1 = 3, n = R.int(5, 12);
    var sub = u * n, total = sub * 1.13;
    return {
      text: "<b>3 cups of chia seeds cost " + m(u * n1) + "</b>. Zuri buys <b>" + n + " cups</b> and pays 13% HST. What is her total?",
      answer: total, type: "money",
      steps: [
        "<b>Step 1 — unit rate:</b> " + m(u * n1) + " ÷ 3 = " + m(u) + " per cup",
        "<b>Step 2 — scale up:</b> " + n + " × " + m(u) + " = " + m(sub),
        "<b>Step 3 — tax:</b> " + m(sub) + " × 1.13 = " + fin(total)
      ]
    };
  });

  add("L8-med-change-rate", "L8", "medium", function () {
    var L = R.pick([2, 4]), P = R.step(4.8, 9.6, 0.2), p = R.pick([5, 10, 15, 20, 25]);
    var np = P * (100 + p) / 100, per = np / L;
    return {
      text: "A <b>" + L + " L jug of milk</b> used to cost <b>" + m(P) + "</b>. The price went up <b>" + p + "%</b>. What is the new price <b>per litre</b>?",
      answer: per, type: "money",
      steps: [
        "<b>Step 1 — percent change:</b> " + m(P) + " × " + F.dec(100 + p) + " = " + F.moneyRaw(np) + " for the jug",
        "<b>Step 2 — unit rate:</b> " + F.moneyRaw(np) + " ÷ " + L + " = " + F.moneyRaw(per),
        "Round at the end: <b>" + m(per) + "</b> per litre"
      ]
    };
  });

  add("L8-med-split-save", "L8", "medium", function () {
    var r = R.pick([[3, 5], [2, 3], [1, 3], [3, 2], [4, 5]]), k = R.int(4, 20) * 5, s = R.pick([20, 25, 30, 40, 60]);
    var total = (r[0] + r[1]) * k, share = r[1] * k, saved = share * s / 100, helper = R.pick(CUSTOMERS);
    return {
      text: "Zuri and " + helper + " split <b>" + m(total) + " in tips</b> in the ratio <b>" + ratio(r) + "</b> (Zuri : " + helper + "). " +
        helper + " saves <b>" + s + "%</b> of their share. How much does " + helper + " save?",
      answer: saved, type: "money",
      steps: [
        "<b>Step 1 — ratio:</b> " + r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " shares; one share = " + m(total) + " ÷ " + (r[0] + r[1]) + " = " + m(k),
        helper + "'s share: " + r[1] + " × " + m(k) + " = " + m(share),
        "<b>Step 2 — percent:</b> " + s + "% of " + m(share) + " = " + m(share) + " × " + F.dec(s) + " = <b>" + m(saved) + "</b>"
      ]
    };
  });

  add("L8-med-percent-revenue", "L8", "medium", function () {
    var v = until(function () { return { T: R.int(8, 30) * 20, p: R.pick([15, 25, 35, 40, 45]), u: R.step(4.75, 6.75, 0.25) }; },
      function (v) { return Number.isInteger(v.T * v.p / 100); });
    var n = v.T * v.p / 100, drink = R.pick(SMOOTHIES);
    return {
      text: "Zuri sold <b>" + v.T + " smoothies</b> at a festival. <b>" + v.p + "%</b> were " + drink + ", which sell for <b>" + m(v.u) + "</b> each. " +
        "How much money did the " + drink + " smoothies bring in (before tax)?",
      answer: n * v.u, type: "money",
      steps: [
        "<b>Step 1 — percent:</b> " + v.p + "% of " + v.T + " = " + c(n) + " " + drink + " smoothies",
        "<b>Step 2 — multiply by the price:</b> " + c(n) + " × " + m(v.u) + " = <b>" + m(n * v.u) + "</b>"
      ]
    };
  });

  add("L8-spicy-profit-goal", "L8", "spicy", function () {
    var v = until(function () {
      return { cost: R.step(1.65, 2.45, 0.05), price: R.step(4.95, 6.25, 0.05), fixed: R.int(12, 30) * 10, goal: R.int(15, 50) * 10 };
    }, function (v) { return !Number.isInteger((v.fixed + v.goal) / (v.price - v.cost)); });
    var each = F.roundTo(v.price - v.cost, 2), need = v.fixed + v.goal, n = Math.ceil(need / each - 1e-9);
    return {
      text: "Each smoothie costs Zuri <b>" + m(v.cost) + "</b> to make and sells for <b>" + m(v.price) + "</b>. Running the truck costs <b>" + m(v.fixed) +
        "</b> a day. What is the <b>fewest</b> smoothies she must sell in a day to make at least <b>" + m(v.goal) + "</b> profit?",
      answer: n, type: "number", unit: "smoothies",
      mistakes: [{ answer: n - 1, message: "Check it: " + c(n - 1) + " smoothies isn't quite enough. Round UP." }, { answer: Math.ceil(v.goal / each), message: "Don't forget the truck cost: she needs the goal PLUS the " + m(v.fixed) + "." }],
      steps: [
        "<b>Step 1 — profit per smoothie:</b> " + m(v.price) + " − " + m(v.cost) + " = " + m(each),
        "<b>Step 2 — money needed:</b> truck cost + goal = " + m(v.fixed) + " + " + m(v.goal) + " = " + m(need),
        "<b>Step 3 — how many:</b> " + m(need) + " ÷ " + m(each) + " = " + F.num(need / each, 2),
        "She can't sell part of a smoothie, and " + c(Math.floor(need / each)) + " isn't quite enough, so round <b>up</b>: <b>" + c(n) + "</b>"
      ]
    };
  });

  add("L8-spicy-loan", "L8", "spicy", function () {
    var v = until(function () {
      return { P: R.int(12, 40) * 100, r: R.pick([4, 5, 6]), t: R.pick([1, 2, 3]), each: R.step(2.75, 3.95, 0.05) };
    }, function (v) { return !Number.isInteger(v.P * (1 + v.r / 100 * v.t) / v.each); });
    var I = prt(v.P, v.r, v.t), A = v.P + I, n = Math.ceil(A / v.each - 1e-9);
    return {
      text: "Zuri borrowed <b>" + m(v.P) + "</b> for a new blender at <b>" + v.r + "% simple interest</b> per year for <b>" + pl(v.t, "year") + "</b>. " +
        "She makes <b>" + m(v.each) + " profit</b> on each smoothie. How many smoothies must she sell to pay back the loan <b>and</b> interest?",
      answer: n, type: "number", unit: "smoothies",
      mistakes: [{ answer: n - 1, message: "Check it: " + c(n - 1) + " smoothies isn't quite enough. Round UP." }, { answer: Math.ceil(v.P / v.each - 1e-9), message: "Don't forget the interest: she pays back the loan PLUS interest." }],
      steps: [
        "<b>Step 1 — interest:</b> " + m(v.P) + " × " + F.dec(v.r) + " × " + v.t + " = " + m(I),
        "<b>Step 2 — total owed:</b> " + m(v.P) + " + " + m(I) + " = " + m(A),
        "<b>Step 3 — smoothies:</b> " + m(A) + " ÷ " + m(v.each) + " = " + F.num(A / v.each, 2),
        "Round <b>up</b> (" + c(Math.floor(A / v.each)) + " isn't quite enough): <b>" + c(n) + "</b> smoothies"
      ]
    };
  });

  add("L8-spicy-profit-change", "L8", "spicy", function () {
    var cost = R.step(1.5, 2.5, 0.25), price = R.step(4, 6, 0.25), p = R.pick([10, 20]);
    var oldProfit = price - cost, np = price * (100 + p) / 100, newProfit = np - cost;
    var pc = F.roundTo((newProfit - oldProfit) / oldProfit * 100, 1);
    return {
      text: "A smoothie costs Zuri <b>" + m(cost) + "</b> to make and sells for <b>" + m(price) + "</b>. She raises the selling price by <b>" + p + "%</b> " +
        "(her cost stays the same). By what percent does her <b>profit per smoothie</b> go up? <b>Round to one decimal place.</b>",
      answer: pc, type: "percent", dp: 1,
      steps: [
        "<b>Step 1 — old profit:</b> " + m(price) + " − " + m(cost) + " = " + m(oldProfit),
        "<b>Step 2 — new price:</b> " + m(price) + " × " + F.dec(100 + p) + " = " + F.moneyRaw(np),
        "<b>Step 3 — new profit:</b> " + F.moneyRaw(np) + " − " + m(cost) + " = " + F.moneyRaw(newProfit),
        "<b>Step 4 — percent change:</b> change ÷ ORIGINAL = " + F.moneyRaw(newProfit - oldProfit) + " ÷ " + m(oldProfit) + " = " + F.num((newProfit - oldProfit) / oldProfit, 4),
        "× 100 → <b>" + F.pct(pc) + "</b> (more than " + p + "%, because profit is smaller than price)"
      ]
    };
  });

  add("L8-spicy-bulk-recipe", "L8", "spicy", function () {
    var v = until(function () {
      return { kg: R.pick([2, 2.5, 4, 5]), perKg: R.step(5.5, 9.5, 0.5), g: R.pick([100, 120, 150, 180, 200]), n: R.int(4, 12) * 5 };
    }, function (v) { return exact2(v.kg * v.perKg); });
    var bag = v.kg * v.perKg, kgUsed = v.g * v.n / 1000, cost = kgUsed * v.perKg;
    return {
      text: "A <b>" + c(v.kg) + " kg bag of frozen mango costs " + m(bag) + "</b>. Each Mango Rush uses <b>" + v.g + " g</b> of mango. " +
        "What does the mango cost for <b>" + v.n + " Mango Rush smoothies</b>?",
      answer: cost, type: "money",
      steps: [
        "<b>Step 1 — unit rate:</b> " + m(bag) + " ÷ " + c(v.kg) + " kg = " + m(v.perKg) + " per kg",
        "<b>Step 2 — mango needed:</b> " + v.n + " × " + v.g + " g = " + c(v.g * v.n) + " g = " + c(kgUsed) + " kg",
        "<b>Step 3 — cost:</b> " + c(kgUsed) + " × " + m(v.perKg) + " = " + fin(cost)
      ]
    };
  });

  // =====================================================================
  // "Find the mistake" questions (like the Medium sections and the unit test)
  // A student's wrong work is shown; the student enters the CORRECT answer.
  // =====================================================================
  var CRITICS = ["Kian", "Mila", "Anika", "Callum", "Owen", "Quinn", "Hassan", "Bea", "Rafe", "Jonah", "Talia", "Nico", "Rhea", "Sofia"];
  function says(who, words) { return who + " says: “" + words + "” "; }
  var FIX = "<b>Find the mistake.</b> What is the correct answer?";

  add("L1-med-mistake", "L1", "medium", function () {
    var who = R.pick(CRITICS);
    if (R.int(0, 1) === 0) {
      // added instead of multiplying
      var r = until(function () { return R.pick(COPRIME); }, function (r) { return r[0] < r[1] || r[0] > 1; });
      var k = R.int(3, 6), A = r[0] * k, wrong = r[1] + (A - r[0]);
      return {
        text: says(who, r[0] + ":" + r[1] + " = " + A + ":?. " + A + " is " + (A - r[0]) + " more than " + r[0] + ", so I add " + (A - r[0]) +
          " to " + r[1] + " and get " + wrong + ".") + FIX,
        answer: r[1] * k, type: "number",
        mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Adding the same number to both parts changes the mix." }],
        steps: [
          "<b>The mistake:</b> " + who + " ADDED " + (A - r[0]) + " to both parts. Adding changes the mix.",
          r[0] + " → " + A + " is × " + k + ", so multiply both parts by " + k + ".",
          r[1] + " × " + k + " = <b>" + c(r[1] * k) + "</b>, so " + ratio(r) + " = " + A + ":" + r[1] * k
        ]
      };
    }
    // divided by one part instead of the number of shares
    var a = R.pick([1, 2, 3]), b = R.pick([3, 4, 5, 7]), k2 = R.int(3, 8), total = (a + b) * k2;
    var wrong2 = F.roundTo(total / b, 2);
    return {
      text: says(who, "Zuri's lemonade is lemon juice to water " + a + ":" + b + ". For " + total + " scoops in all, I need " + c(wrong2) +
        " scoops of lemon juice, because " + total + " ÷ " + b + " = " + c(wrong2) + ".") + FIX + " (How many scoops of lemon juice?)",
      answer: a * k2, type: "number", unit: "scoops",
      mistakes: [{ answer: wrong2, message: "That's " + who + "'s answer. Divide the total by the number of SHARES (" + a + " + " + b + "), not by one part." }],
      steps: [
        "<b>The mistake:</b> " + who + " divided by " + b + ", the water part. Add the parts first to find the shares.",
        a + " + " + b + " = " + (a + b) + " shares; " + total + " ÷ " + (a + b) + " = " + k2,
        "Lemon juice: " + a + " × " + k2 + " = <b>" + c(a * k2) + "</b> scoops (water " + b * k2 + "; check " + a * k2 + " + " + b * k2 + " = " + total + " ✓)"
      ]
    };
  });

  add("L2-med-mistake", "L2", "medium", function () {
    var who = R.pick(CRITICS);
    if (R.int(0, 1) === 0) {
      // compared totals instead of unit prices
      var v = until(function () {
        var a = R.pick([2, 3, 4]), b = a + R.pick([1, 2, 3]), uB = R.step(1.8, 3.2, 0.1), uA = F.roundTo(uB + R.step(0.1, 0.4, 0.1), 2);
        return { a: a, b: b, uA: uA, uB: uB };
      }, function (v) { return v.a * v.uA < v.b * v.uB; });
      return {
        text: says(who, "Juice A is " + v.a + " L for " + m(v.a * v.uA) + ". Juice B is " + v.b + " L for " + m(v.b * v.uB) +
          ". A is the better buy because " + m(v.a * v.uA) + " is less than " + m(v.b * v.uB) + ".") +
          "<b>Find the mistake.</b> What is the price per litre of the real better buy?",
        answer: v.uB, type: "money",
        mistakes: [{ answer: v.uA, message: "That's Juice A's price per litre. Compare: which is cheaper per litre?" }],
        steps: [
          "<b>The mistake:</b> " + who + " compared totals, but the amounts are different. Compare unit prices.",
          "A: " + m(v.a * v.uA) + " ÷ " + v.a + " = " + m(v.uA) + " per L.  B: " + m(v.b * v.uB) + " ÷ " + v.b + " = " + m(v.uB) + " per L",
          "Juice B is the better buy: <b>" + m(v.uB) + "</b> per litre"
        ]
      };
    }
    // added to both numbers in a rate
    var per = R.pick([2.5, 3, 3.5, 4, 4.5, 6]), t1 = R.pick([2, 4, 6]), t2 = R.pick([8, 10, 12]);
    var s1 = per * t1, add2 = t2 - t1;
    return {
      text: says(who, "The blender makes " + c(s1) + " smoothies in " + t1 + " minutes. In " + t2 + " minutes it makes " + c(s1 + add2) +
        ", because I added " + add2 + " to both numbers.") + FIX,
      answer: per * t2, type: "number", unit: "smoothies",
      mistakes: [{ answer: s1 + add2, message: "That's " + who + "'s answer. Adding to both numbers doesn't keep the rate the same." }],
      steps: [
        "<b>The mistake:</b> " + who + " added " + add2 + " to both numbers instead of using the rate.",
        "Unit rate: " + c(s1) + " ÷ " + t1 + " = " + c(per) + " smoothies per minute",
        c(per) + " × " + t2 + " = <b>" + c(per * t2) + "</b> smoothies"
      ]
    };
  });

  add("L3-med-mistake", "L3", "medium", function () {
    var who = R.pick(CRITICS);
    var v = until(function () {
      var cm = R.pick([2, 4, 5]), km = R.pick([15, 25, 30, 35, 45]), t = R.int(6, 12);
      return { cm: cm, km: km, t: t };
    }, function (v) { return exact2(v.km / v.cm * v.t) && v.t !== v.cm && v.km / v.cm !== 1; });
    var wrong = v.km + (v.t - v.cm), right = v.km / v.cm * v.t;
    return {
      text: "On Zuri's route map, <b>" + v.cm + " cm stands for " + v.km + " km</b>. " +
        says(who, "A farm " + v.t + " cm away on the map is " + wrong + " km away, because " + v.cm + " + " + (v.t - v.cm) + " = " + v.t +
          ", so " + v.km + " + " + (v.t - v.cm) + " = " + wrong + ".") + FIX + " (in km)",
      answer: right, type: "number", unit: "km",
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Scale, don't add." }],
      steps: [
        "<b>The mistake:</b> " + who + " added instead of scaling.",
        "Value for 1 cm: " + v.km + " ÷ " + v.cm + " = " + c(v.km / v.cm) + " km",
        v.t + " × " + c(v.km / v.cm) + " = <b>" + c(right) + "</b> km",
        "Check: " + v.cm + "/" + v.km + " and " + v.t + "/" + c(right) + " are the same fraction ✓"
      ]
    };
  });

  add("L4-med-mistake", "L4", "medium", function () {
    var who = R.pick(CRITICS), whole = R.int(6, 30) * 20;
    if (R.int(0, 1) === 0) {
      var p = R.pick([15, 20, 25, 30]);
      var wrong = F.roundTo(whole / p, 2);
      return {
        text: says(who, p + "% of " + whole + " is " + c(wrong) + ", because " + whole + " ÷ " + p + " = " + c(wrong) + ".") + FIX,
        answer: whole * p / 100, type: "number",
        mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Dividing by " + p + " doesn't find " + p + "%." }],
        steps: [
          "<b>The mistake:</b> " + whole + " ÷ " + p + " finds 1/" + p + " of " + whole + ", not " + p + "%.",
          "10% of " + whole + " = " + c(whole / 10),
          build(p, whole) + ", so " + p + "% of " + whole + " = <b>" + c(whole * p / 100) + "</b>"
        ]
      };
    }
    return {
      text: says(who, "5% of " + whole + " = 0.5 × " + whole + " = " + c(whole / 2) + ".") + FIX,
      answer: whole / 20, type: "number",
      mistakes: [{ answer: whole / 2, message: "That's " + who + "'s answer. 0.5 is 50%, not 5%." }],
      steps: [
        "<b>The mistake:</b> 5% = 0.05, not 0.5 (0.5 is 50%).",
        "10% of " + whole + " = " + c(whole / 10) + ", and 5% is half of that: <b>" + c(whole / 20) + "</b>",
        "Or: 0.05 × " + whole + " = " + c(whole / 20)
      ]
    };
  });

  add("L5-med-mistake", "L5", "medium", function () {
    var who = R.pick(CRITICS);
    var v = until(function () { var O = R.pick([4, 5, 8, 10, 12, 16, 20]), p = R.pick([10, 20, 25, 50]); return { O: O, p: p }; },
      function (v) { return exact2(v.O * v.p / 100); });
    var N = v.O * (100 + v.p) / 100, ch = N - v.O, wrong = F.roundTo(ch / N * 100, 1);
    return {
      text: says(who, "The price went from " + m(v.O) + " to " + m(N) + ". That's a " + F.pct(wrong) + " increase, because " + m(ch) + " ÷ " + m(N) + " = " +
        F.num(ch / N, 3) + ".") + FIX + " (percent increase)",
      answer: v.p, type: "percent",
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. Divide by the ORIGINAL price." }],
      steps: [
        "<b>The mistake:</b> " + who + " divided by the NEW price. Percent change compares the change to the ORIGINAL.",
        "Change: " + m(N) + " − " + m(v.O) + " = " + m(ch),
        m(ch) + " ÷ " + m(v.O) + " = " + F.num(ch / v.O, 4) + " → <b>" + v.p + "%</b> increase"
      ]
    };
  });

  add("L6-med-mistake", "L6", "medium", function () {
    var who = R.pick(CRITICS);
    if (R.int(0, 1) === 0) {
      var P = R.pick([20, 30, 40, 50, 60, 80]), item = R.pick(["pot", "cutting board", "cooler", "sign"]);
      return {
        text: says(who, "With 13% HST, the $" + P + " " + item + " costs $" + P + ".13.") + FIX + " (the total with tax)",
        answer: P * 1.13, type: "money",
        mistakes: [{ answer: P + 0.13, message: "That's " + who + "'s answer. 13% is not 13 cents." }],
        steps: [
          "<b>The mistake:</b> 13% is not 13 cents. 13% of $" + P + " is " + m(P * 0.13) + ".",
          "Total: " + m(P) + " + " + m(P * 0.13) + " = <b>" + m(P * 1.13) + "</b> (or " + P + " × 1.13)"
        ]
      };
    }
    var P2 = R.pick([40, 60, 90, 120]), d = R.pick([20, 25, 30, 40]);
    return {
      text: says(who, "The $" + P2 + " mixer is " + d + "% off: " + P2 + " × " + F.dec(d) + " = " + m(P2 * d / 100) + ", so the mixer costs " + m(P2 * d / 100) + ".") +
        FIX + " (the sale price, before tax)",
      answer: P2 * (100 - d) / 100, type: "money",
      mistakes: [{ answer: P2 * d / 100, message: "That's " + who + "'s answer — it's the discount, not the price." }],
      steps: [
        "<b>The mistake:</b> " + m(P2 * d / 100) + " is the discount (the amount off), not the price.",
        d + "% off means you pay the " + (100 - d) + "% that's left: " + P2 + " × " + F.dec(100 - d) + " = <b>" + m(P2 * (100 - d) / 100) + "</b>"
      ]
    };
  });

  add("L7-med-mistake", "L7", "medium", function () {
    var who = R.pick(CRITICS), P = R.int(4, 16) * 500, r = R.pick([3, 4, 5, 6]);
    if (R.int(0, 1) === 0) {
      var mo = R.pick([6, 18, 30]);
      return {
        text: says(who, "At " + r + "% for " + mo + " months, the interest is " + c(P) + " × " + F.dec(r) + " × " + mo + " = " + m(P * r / 100 * mo) + ".") + FIX,
        answer: P * r / 100 * mo / 12, type: "money",
        mistakes: [{ answer: P * r / 100 * mo, message: "That's " + who + "'s answer. Time must be in years." }],
        steps: [
          "<b>The mistake:</b> " + who + " used " + mo + " as the time. Time must be in YEARS.",
          mo + " months ÷ 12 = " + c(mo / 12) + " years",
          c(P) + " × " + F.dec(r) + " × " + c(mo / 12) + " = <b>" + m(P * r / 100 * mo / 12) + "</b>"
        ]
      };
    }
    var t = R.int(2, 4);
    return {
      text: says(who, "At " + r + "% for " + t + " years: " + c(P) + " × " + (r / 10) + " × " + t + " = " + m(P * r / 10 * t) + " of interest.") + FIX,
      answer: P * r / 100 * t, type: "money",
      mistakes: [{ answer: P * r / 10 * t, message: "That's " + who + "'s answer. Check the rate as a decimal." }],
      steps: [
        "<b>The mistake:</b> " + r + "% = " + F.dec(r) + ", not " + (r / 10) + ".",
        c(P) + " × " + F.dec(r) + " × " + t + " = <b>" + m(P * r / 100 * t) + "</b>"
      ]
    };
  });

  add("L8-med-mistake", "L8", "medium", function () {
    var who = R.pick(CRITICS);
    var v = until(function () { return { r: R.pick([6, 8, 9, 10, 12]), D: R.step(150, 480, 30) }; },
      function (v) { return exact2(v.D / 100 * v.r) && Math.abs(v.D / 100 * v.r - v.D / v.r) > 0.01; });
    var right = v.D / 100 * v.r, wrong = F.roundTo(v.D / v.r, 2);
    return {
      text: "Zuri's truck uses <b>" + v.r + " L of gas per 100 km</b>. " +
        says(who, "So a " + v.D + " km trip uses " + v.D + " ÷ " + v.r + " = " + c(wrong) + " L.") + FIX + " (in litres)",
      answer: right, type: "number", unit: "L",
      mistakes: [{ answer: wrong, message: "That's " + who + "'s answer. How many hundreds of km is the trip?" }],
      steps: [
        "<b>The mistake:</b> " + who + " divided by " + v.r + ". The rate is " + v.r + " L for every 100 km.",
        v.D + " km is " + c(v.D / 100) + " × 100 km",
        c(v.D / 100) + " × " + v.r + " = <b>" + c(right) + "</b> L"
      ]
    };
  });

  // =====================================================================
  // More Spicy (BOSS-style) questions, modelled on the handouts and test
  // =====================================================================

  add("L4-spicy-jug", "L4", "spicy", function () {
    var v = until(function () {
      var a = R.pick([20, 25, 30, 40, 50]), b = a + R.pick([10, 20, 25, 30, 40]), C = R.pick([4, 5, 6, 8, 10, 12, 20]);
      return { a: a, b: b, C: C, V: C * (b - a) / 100 };
    }, function (v) { return v.b < 100 && exact2(v.V) && v.V >= 0.5; });
    var gap = v.b - v.a;
    return {
      text: "Zuri's juice jug is <b>" + v.a + "% full</b>. She adds <b>" + c(v.V) + " L</b>, and now it is <b>" + v.b + "% full</b>. How many litres does the full jug hold?",
      answer: v.C, type: "number", unit: "L",
      steps: [
        "The " + c(v.V) + " L filled " + v.b + "% − " + v.a + "% = " + gap + "% of the jug.",
        chain(gap, v.V) ? chain(gap, v.V) + " L" : gap + "% = " + c(v.V) + " L, so 1% = " + F.num(v.V / gap, 4) + " L, so 100% = " + c(v.C) + " L",
        "The full jug holds <b>" + c(v.C) + "</b> L"
      ],
      mistakes: [{ answer: v.V / v.b * 100, message: "The " + c(v.V) + " L didn't fill " + v.b + "% — it filled the GAP between " + v.a + "% and " + v.b + "%." }]
    };
  });

  add("L6-spicy-boss-back", "L6", "spicy", function () {
    var v = until(function () {
      var d = R.pick([10, 20, 25, 40]), O = R.int(4, 30) * 5;
      return { d: d, O: O, sale: O * (100 - d) / 100 };
    }, function (v) { return Number.isInteger(v.sale); });
    var paid = F.roundTo(v.sale * 1.13, 2);
    var item = R.pick(["mixer", "blender", "cooler", "juicer"]);
    return {
      text: "A " + item + " is <b>" + v.d + "% off</b>. Then 13% HST is added, and Zuri pays <b>" + m(paid) + "</b>. What was the original price?",
      answer: v.O, type: "money",
      steps: [
        "Work backwards, undoing the LAST step first.",
        "Undo the tax: " + m(paid) + " ÷ 1.13 = " + m(v.sale) + " (the sale price)",
        "Undo the discount: the sale price is " + (100 - v.d) + "% of the original, so " + m(v.sale) + " ÷ " + F.dec(100 - v.d) + " = <b>" + m(v.O) + "</b>",
        "Check: " + m(v.O) + " × " + F.dec(100 - v.d) + " × 1.13 = " + m(paid) + " ✓"
      ],
      mistakes: [{ answer: v.sale, message: "That's the sale price. Now undo the " + v.d + "% discount too." }]
    };
  });

  add("L6-spicy-crew", "L6", "spicy", function () {
    var v = until(function () {
      return { n: R.pick([4, 5, 6, 8]), food: R.int(16, 40) * 5, t: R.pick([15, 18, 20]) };
    }, function (v) { return true; });
    var tax = v.food * 0.13, tip = v.food * v.t / 100, total = v.food + tax + tip, each = total / v.n;
    return {
      text: "Zuri takes her crew of <b>" + v.n + "</b> to a restaurant. The food costs <b>" + m(v.food) + "</b> before tax. They add 13% HST and tip <b>" + v.t +
        "% on the food</b>. They split the total equally. How much does each person pay?",
      answer: each, type: "money",
      steps: [
        "HST: " + m(v.food) + " × 0.13 = " + m(tax),
        "Tip on the food: " + m(v.food) + " × " + F.dec(v.t) + " = " + m(tip),
        "Total: " + m(v.food) + " + " + m(tax) + " + " + m(tip) + " = " + m(total),
        "Split " + v.n + " ways: " + m(total) + " ÷ " + v.n + " = " + fin(each)
      ],
      mistakes: [{ answer: (v.food * 1.13 * (1 + v.t / 100)) / v.n, message: "The tip is on the FOOD, not on the bill with tax." },
                 { answer: total, message: "That's the whole bill. Split it between the " + v.n + " of them." }]
    };
  });

  add("L7-spicy-boss-back", "L7", "spicy", function () {
    var v = until(function () {
      var r = R.pick([2, 4, 5]), t = R.pick([2, 3, 4, 5]), P = R.int(4, 40) * 100;
      return { r: r, t: t, P: P, A: P * (1 + r * t / 100) };
    }, function (v) { return exact2(v.A) && (v.r * v.t) % 5 === 0; });
    var up = v.r * v.t;
    return {
      text: "Zuri saves some money at <b>" + v.r + "% simple interest</b> per year. After <b>" + v.t + " years</b> she has <b>" + m(v.A) + "</b> in all. How much did she put in?",
      answer: v.P, type: "money",
      steps: [
        v.t + " years at " + v.r + "% adds " + v.t + " × " + v.r + "% = " + up + "% of what she put in.",
        "So " + (100 + up) + "% of her savings = " + m(v.A) + ".",
        (chain(100 + up, v.A, F.moneyRaw) || ("100% = " + m(v.A) + " ÷ " + F.dec(100 + up) + " = " + m(v.P))).replace(/= ([^=]+)$/, "= <b>$1</b>"),
        "Check: " + m(v.P) + " × " + F.dec(v.r) + " × " + v.t + " = " + m(v.A - v.P) + " interest; " + m(v.P) + " + " + m(v.A - v.P) + " = " + m(v.A) + " ✓"
      ],
      mistakes: [{ answer: v.A * (100 - up) / 100, message: "Taking " + up + "% off doesn't undo it — the interest was " + up + "% of the smaller amount she put in." }]
    };
  });

  add("L8-spicy-festival", "L8", "spicy", function () {
    var v = until(function () {
      return { n: R.int(10, 50) * 10, p: R.pick([5, 5.5, 6, 6.5]), f: R.pick([10, 15, 20]), cst: R.pick([1.5, 1.75, 1.8, 2, 2.25]) };
    }, function (v) { return true; });
    var sales = v.n * v.p, keep = sales * (100 - v.f) / 100, costs = v.n * v.cst, profit = keep - costs;
    return {
      text: "Zuri sells <b>" + v.n + " smoothies</b> at a festival for <b>" + m(v.p) + "</b> each. The festival takes <b>" + v.f + "%</b> of her sales. " +
        "Her costs are <b>" + m(v.cst) + " per smoothie</b>. What is her profit?",
      answer: profit, type: "money",
      steps: [
        "<b>Step 1 — sales:</b> " + v.n + " × " + m(v.p) + " = " + m(sales),
        "<b>Step 2 — after the festival's " + v.f + "%:</b> she keeps " + (100 - v.f) + "%: " + m(sales) + " × " + F.dec(100 - v.f) + " = " + m(keep),
        "<b>Step 3 — costs:</b> " + v.n + " × " + m(v.cst) + " = " + m(costs),
        "<b>Step 4 — profit:</b> " + m(keep) + " − " + m(costs) + " = <b>" + m(profit) + "</b>"
      ],
      mistakes: [{ answer: sales - costs, message: "Don't forget the festival takes " + v.f + "% of her sales first." },
                 { answer: sales * v.f / 100 - costs, message: "The " + v.f + "% is what the festival TAKES. She keeps " + (100 - v.f) + "%." }]
    };
  });

  MP.registerUnit({
    id: "u3",
    number: 3,
    title: "Proportional Relationships, Rates and Percentages",
    story: "Zuri's Smoothie Truck",
    lessons: lessons,
    templates: templates
  });
})(window.MP);
