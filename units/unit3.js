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
  var SMOOTHIES = ["Mango Tango", "Berry Blast", "Green Machine", "Pineapple Punch",
    "Strawberry Sunrise", "Choco-Banana", "Peach Breeze", "Tropical Storm"];
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
        "Undo it by dividing: " + m(sale) + " ÷ " + F.dec(100 - d) + " = <b>" + m(orig) + "</b>",
        "Check: " + m(orig) + " × " + F.dec(100 - d) + " = " + m(sale) + " ✓",
        "<span class='note'>Adding " + d + "% back on does <b>not</b> work — the discount was " + d + "% of the bigger, original price.</span>"
      ]
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

  MP.registerUnit({
    id: "u3",
    number: 3,
    title: "Proportional Relationships, Rates and Percentages",
    story: "Zuri's Smoothie Truck",
    lessons: lessons,
    templates: templates
  });
})(window.MP);
