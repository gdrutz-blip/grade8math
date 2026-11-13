# Connecting results to a Google Sheet

The site sends each student's (or pair's) running results to a Google Form after
every question. The Form saves them into a Google Sheet. No login, no server.
The site works fully without this; it just doesn't save results anywhere.

What gets sent: first names, date, unit, lessons, results by level, attempted,
correct, correct on the first try, minutes active, and the mission.

## 1. Make the Form (about 5 minutes)

1. Go to **forms.google.com** (signed in to your personal Google account) → **Blank form**.
2. Title it **Smoothie Truck Math results**.
3. Add **11 questions**, all **Short answer**, none required, named exactly:

   | # | Question name |
   |---|---|
   | 1 | Session |
   | 2 | Names |
   | 3 | Date |
   | 4 | Unit |
   | 5 | Lessons |
   | 6 | Levels |
   | 7 | Attempted |
   | 8 | Correct |
   | 9 | First try |
   | 10 | Minutes |
   | 11 | Mission |

   Tip: make question 1, then use the **Duplicate** button (two squares) and rename.
4. **Settings** tab → **Responses**: make sure **Collect email addresses** is
   **Do not collect**, and **Limit to 1 response** is **off**.
5. **Responses** tab → **Link to Sheets** → **Create a new spreadsheet** → **Create**.

## 2. Get the pre-filled link (this is how the site finds the entry IDs)

1. In the Form editor, click the **⋮** menu (top right) → **Get pre-filled link**.
2. In each box, type the question's code word in CAPITALS:

   | Question | Type |
   |---|---|
   | Session | `SESSION` |
   | Names | `NAMES` |
   | Date | `DATE` |
   | Unit | `UNIT` |
   | Lessons | `LESSONS` |
   | Levels | `LEVELS` |
   | Attempted | `ATTEMPTED` |
   | Correct | `CORRECT` |
   | First try | `FIRSTTRY` |
   | Minutes | `MINUTES` |
   | Mission | `MISSION` |

3. Click **Get link** → **Copy link**.
4. Paste that link into `js/config.js` (between the quotes), or send it to Claude.

## 3. Test it

1. Open the site's **Teacher page**. Under **Results tracking** it should say
   **Connected**.
2. Click **Send a test row**, then look at the Sheet: a row with
   `TEST (teacher page)` should appear within a few seconds.

## 4. Reading the Sheet

The site sends a **running total** after every question, so each session has
several rows; the **newest row** for a session is the full picture.

To see just the latest row per session, add a new tab called **Latest**:

1. In cell A1, copy the header row from the responses tab (or type your own).
2. In cell A2, paste:

   ```
   =SORT(FILTER('Form Responses 1'!A2:L, 'Form Responses 1'!B2:B<>"", XMATCH('Form Responses 1'!B2:B, 'Form Responses 1'!B2:B, 0, -1) = SEQUENCE(ROWS('Form Responses 1'!B2:B))), 1, FALSE)
   ```

   (If your responses tab has a different name, change `Form Responses 1`.)
