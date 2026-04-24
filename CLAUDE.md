# דשבורד בגרות — מחזור ג׳ נעימת הלב

## מטרת הפרויקט
חישוב והצגת סיכויי בגרות לכל תלמיד במחזור ג׳ (כיתות יא1–יא6).

## טכנולוגיות
- Next.js 14 — App Router + TypeScript
- Tailwind CSS — RTL + עברית (פונט Heebo) + פלטת Clarity (טורקיז #0891B2, לבן)
- shadcn/ui — רכיבי UI
- lucide-react — אייקונים
- Recharts — גרפים
- xlsx — קריאת Excel
- zod — validation
- Google Sheets API v4 — אחסון נתונים (Service Account JWT, ספריית `google-auth-library`)
- Vercel — פריסה בכתובת `neimat.vercel.app`

## מבנה קבצים מרכזי
```
src/
  app/
    page.tsx                        ← דשבורד ראשי — Server Component, revalidate=60
    loading.tsx                     ← Suspense fallback
    student/[id]/page.tsx           ← כרטיס תלמיד — כולל ציוני בגרות, תעודה+מגמה, טיימסטמפ render
    upload/page.tsx                 ← העלאת Excel
    login/page.tsx                  ← כניסה בסיסמה
    api/data/route.ts               ← מחזיר את כל נתוני התלמידים (revalidate=60)
    api/auth/route.ts               ← אימות סיסמה
    api/upload/route.ts             ← קבלת קובץ Excel
    api/debug-columns/route.ts      ← מחזיר כותרות עמודות ציוני_תעודה (לאבחון)
  lib/
    types.ts                        ← Student (כולל majorName), BagrutScores (11 שדות מגמה), SchoolGrades (כולל majorSubject)
    calculator.ts                   ← נוסחאות הסיכוי — probMajor משתמש בכל 11 שדות המגמה
    data.ts                         ← getStudentsData() עם React cache — נקודת גישה מרכזית
    exam-schedule.ts                ← EXAM_SCHEDULE[] + daysUntil() — bagrutField+schoolMajorKey לכל מגמה
    excel-parser.ts                 ← פענוח Excel — עמודות מגמה ספציפיות לכל מגמה
    parsers.ts                      ← parseStudentRow (majorName) / parseSchoolGradesRow (majorSubject)
    sheets.ts                       ← קריאת Google Sheets — rowsToObjects מנרמל \n→רווח בכותרות
    constants.ts                    ← RISK_HEX_COLORS, RISK_BADGE_CLASSES, RISK_LABEL_ORDER
    styling.ts                      ← scoreHexColor / scoreBarColor / scoreTextColor
    utils.ts
  components/
    DashboardKPI.tsx        ← KPI לחיצים — לחיצה מסננת דרך URL ?risk=
    RiskCharts.tsx          ← פאי רמות סיכון + היסטוגרמת ציונים
    ExamCountdown.tsx       ← ספירה לאחור — סינון לפי bagrutField ואחר כך schoolMajorKey
    NoMajorStudents.tsx     ← תלמידים ללא ציון בגרות ותעודה בשום מגמה
    BorderlineStudents.tsx  ← תלמידים בגבול כישלון (40-55) ובגבול עלייה (60-75)
    SubjectSummary.tsx      ← % עוברים/בסיכון לכל מקצוע שכבתי
    ClassComparison.tsx     ← השוואת ממוצעים יא1-יא6
    DraggableDashboard.tsx  ← עטיפה client לסדר גרירת sections — 8 sections כולל nomajor
    StudentsView.tsx        ← טוגל סולם/טבלה + קריאת URL ?risk=
    StudentLadder.tsx       ← סולם SVG אנכי 0–100, מסתנכרן עם urlRiskFilter
    StudentTable.tsx        ← טבלה עם חיפוש (שם+ת"ז), ייצוא CSV, 8 עמודות מקצוע
    Gauge.tsx               ← גיג' SVG לציון תלמיד
    ClassPosition.tsx       ← מקום תלמיד בכיתה + בר גרדיאנט
    SubjectBar.tsx          ← בר ציון עם צבע לפי סף
    BackButton.tsx          ← כפתור חזרה (client)
    PrintButton.tsx         ← כפתור הדפס (client) — window.print()
    ViewToggle.tsx          ← טוגל בין סולם לטבלה
```

## קהל יעד
רכז מחזור ג׳ בבית הספר נעימת הלב, חריש.

## משתני סביבה
- `APP_PASSWORD` — סיסמת כניסה לדשבורד
- `GOOGLE_SHEETS_ID` — מזהה גיליון Google Sheets (198KZXyXrKNqKxXf8Uh4O-lnwjlJt3khNsixxlbyTUPE)
- `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON מלא של מפתח Service Account (שורה אחת)

## Google Sheets
- אימות: Service Account JWT (ספריית `google-auth-library`)
- גיליונות: `תלמידים` (headerRow=0), `ציוני_בגרות` (עמודות לפי אינדקס, מגמות ב-AN-AX), `ציוני_תעודה` (headerRow=0)
- `rowsToObjects()` מטפל בכפילות כותרות עם סיומת `_1`, `_2` ומנרמל `\r?\n` → רווח בכותרות
- `revalidate = 60` ב-`page.tsx`, `student/[id]/page.tsx`, `api/data/route.ts` — ISR, לא force-dynamic
- `getStudentsData()` ב-`src/lib/data.ts` משתמש ב-`React.cache` — deduplicate בין Server Components באותו request

## מבנה גיליון ציוני_תעודה
- עמודת מזהה: `ת.ז`
- עברית: עמודה `לשון`, מתמטיקה: `מתמטיקה 3/4/5 יח"ל`, אנגלית: `אנגלית 4/5 יח"ל`
- חינוך גופני: פולבק לעמודות `חינוך גופני בנות` / `חינוך גופני בנים`
- מגמות: עמודה ספציפית לכל מגמה — `ביולוגיה`, `פסיכולוגיה`, `פיזיקה`, `מידע ונתונים`, `אומנות`, `תקשורת`, `כימיה`, `מדעי המחשב`, `ניהול עסקי`, `ניהול עסקי - יזמות`, `מוט"ל`, `שפות`

## מבנה גיליון ציוני_בגרות (אינדקסים)
- עמודות מגמה (0-based): AN(39)=ביולוגיה, AO(40)=פסיכולוגיה, AP(41)=פיזיקה, AQ(42)=מידע ונתונים, AR(43)=אומנות, AS(44)=תקשורת, AT(45)=כימיה, AU(46)=מדעי המחשב, AV(47)=ניהול עסקי, AW(48)=מוט"ל, AX(49)=שפות

## לוגיקת שיוך מגמה
- תלמיד שייך למגמה X אם: יש לו `bagrut.major_X !== null` (כולל 0) **או** `school.majorSubject === X`
- `school.majorSubject` נקבע מהעמודה הספציפית הראשונה עם ציון בגיליון `ציוני_תעודה`
- תלמיד ללא ציון בגרות ובלי ציון תעודה בשום מגמה — מוצג בסקציית "ללא מגמה"

## הערות
- מפתח ראשי: תעודת זהות (לא שם)
- `exam === null` → לא ניגש עדיין, `exam === 0` → ניגש ולא עבר/דילג
- `eng_final === 0` ללא מרכיבי אנגלית (A–G, Boost) → מטופל כ-null (נוסחת Sheets מחזירה 0 כשאין נתון)
- הדפסת כרטיס תלמיד: `zoom: 0.72` ב-print CSS כדי להכניס לדף אחד
- `/api/debug-columns` — route זמני לאבחון שמות עמודות ציוני_תעודה
