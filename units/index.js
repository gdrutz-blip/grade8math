/* List of unit data files. To add a unit: make units/unitN.js (copy unit3.js's
   shape) and add its path here. Every page loads them through MP.loadUnits(). */
window.MP = window.MP || {};

MP.UNIT_FILES = [
  "units/unit1.js",
  "units/unit2.js",
  "units/unit3.js"
];

MP.loadUnits = function () {
  return Promise.all(MP.UNIT_FILES.map(function (src) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { console.warn("Could not load " + src); resolve(); };
      document.head.appendChild(s);
    });
  })).then(function () {
    return Object.keys(MP.units).map(function (k) { return MP.units[k]; })
      .sort(function (a, b) { return a.number - b.number; });
  });
};
