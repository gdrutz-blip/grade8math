# Zuri's Smoothie Truck Math — Grade 8 practice generator

Students pick a unit, lessons and a level (Mild / Medium / Spicy) and get
freshly generated practice questions with instant feedback and worked steps.
Plain HTML, CSS and JavaScript — no build step.

## Files

| File | What it does |
|---|---|
| `index.html` + `js/start.js` | Student start: names → unit → lessons → level |
| `practice.html` + `js/app.js` | Question screen, tries, steps, level switch, partner roles |
| `teacher.html` + `js/teacher.js` | Mission builder: lessons, targets, calculator on/off → link + supply note |
| `js/mission.js` | Packs a mission into the link; saves progress on the device |
| `js/calculator.js` | Built-in calculator (hidden when a mission turns it off) |
| `js/engine.js` | Random numbers, $ / % formatting, answer checking, common-mistake messages |
| `units/index.js` | List of unit files (add a line here for a new unit) |
| `units/unit3.js` | Unit 3 lessons and question templates |
| `tests/check-templates.js` | Generates thousands of questions per template and checks the answers |

## Adding a unit later

1. Copy `units/unit3.js` to `units/unit4.js`, change `id`, `number`, `title`, lessons and templates.
2. Add `"units/unit4.js"` to the list in `units/index.js`.
3. Run `node tests/check-templates.js` (optional, needs Node) to check every template.

## Turning on GitHub Pages (one time)

1. **Make the repo public**: Settings → General → scroll to *Danger Zone* →
   *Change visibility* → Public. (Free GitHub Pages needs a public repo.
   No student data is ever stored in the repo.)
2. **Create `main`** (first time only, because the repo started empty):
   go to the repo's main page → branch dropdown → type `main` →
   *Create branch: main from claude/math-practice-generator-setup-ewa164*.
   Then Settings → General → *Default branch* → switch to `main`.
3. **Turn on Pages**: Settings → Pages → *Build and deployment* →
   Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
4. Wait 1–2 minutes. The site appears at
   `https://gdrutz-blip.github.io/grade8math/`.

After that, each new stage arrives as a pull request: open it, click
**Merge**, and the live site updates within a couple of minutes.

## Testing locally

Open `index.html` in Chrome, or run `python3 -m http.server` in this folder
and visit `http://localhost:8000`.
