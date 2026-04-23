# דשבורד בגרות — שכבת יא׳ נעימת הלב

## מטרת הפרויקט
חישוב והצגת סיכויי בגרות לכל תלמיד בשכבת יא׳ (84 תלמידים, כיתות יא1–יא6).

## טכנולוגיות
- Next.js 14 — App Router + TypeScript
- Tailwind CSS — RTL + עברית (פונט Heebo)
- shadcn/ui — רכיבי UI
- Recharts — גרפים
- xlsx — קריאת Excel
- zod — validation
- Google Sheets API v4 — אחסון נתונים (Service Account JWT, ספריית `google-auth-library`)
- Vercel — פריסה בכתובת `neimat.vercel.app`

## מבנה קבצים מרכזי
```
src/
  app/
    page.tsx                   ← דשבורד ראשי (fetch מ-/api/data)
    student/[id]/page.tsx      ← כרטיס תלמיד
    upload/page.tsx            ← העלאת Excel
    login/page.tsx             ← כניסה בסיסמה
    api/data/route.ts          ← נקודת הקצה הראשית — קורא Sheets, מחשב סיכויים
    api/auth/route.ts          ← אימות סיסמה
    api/upload/route.ts        ← קבלת קובץ Excel
    api/update-student/route.ts
  lib/
    types.ts
    calculator.ts              ← נוסחאות הסיכוי (probLashon, probHistory וכו')
    excel-parser.ts            ← פענוח Excel עם normalizeRow()
    sheets.ts                  ← קריאת Google Sheets (fetchSheetsData, rowsToObjects)
    storage.ts
    utils.ts
  components/
    Gauge.tsx
    StudentTable.tsx
    DashboardKPI.tsx
    SubjectBar.tsx
```

## קהל יעד
רכז שכבת יא׳ בבית הספר נעימת הלב, חריש.

## משתני סביבה
- `APP_PASSWORD` — סיסמת כניסה לדשבורד
- `GOOGLE_SHEETS_ID` — מזהה גיליון Google Sheets (198KZXyXrKNqKxXf8Uh4O-lnwjlJt3khNsixxlbyTUPE)
- `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON מלא של מפתח Service Account (שורה אחת)

## Google Sheets
- אימות: Service Account JWT (ספריית `google-auth-library`)
- גיליונות: `תלמידים` (headerRow=0), `ציוני_בגרות` (headerRow=1, שורה ראשונה מוזגת), `ציוני_תעודה` (headerRow=2, שורה 0=כותרת, שורה 1=ריקה)
- `rowsToObjects()` מטפל בכפילות כותרות עמודות עם סיומת `_1`, `_2` (כמו xlsx)
- `normalizeRow()` מנרמל `\r\n` → `\n` במפתחות עמודות
- `export const dynamic = 'force-dynamic'` ב-`api/data/route.ts` למניעת pre-render סטטי

## מבנה גיליון ציוני_תעודה (עודכן)
- עמודת מזהה: `ת.ז` (במקום `תעודת זהות`)
- עברית: עמודה `לשון` (לא `עברית`)
- מתמטיקה: עמודות לפי יח"ל — `מתמטיקה 3 יח"ל`, `מתמטיקה 4 יח"ל`, `מתמטיקה 5 יח"ל` (עדיפות יורדת)
- אנגלית: `אנגלית 4 יח"ל`, `אנגלית 5 יח"ל` (בנוסף לעמודה הכללית)
- חינוך גופני: פולבק לעמודות `חינוך גופני בנות` / `חינוך גופני בנים`

## הערות
- מפתח ראשי: תעודת זהות (לא שם)
- גיליונות ה-Excel המקוריים: הגדרות, תלמידים, ציוני_בגרות, ציוני_תעודה, דוח
- `exam === null` → לא ניגש עדיין, `exam === 0` → ניגש ולא עבר/דילג
- כשיש ציון בגרות חיצוני — ציון התעודה מתעלם (override)
- `eng_final === 0` ללא מרכיבי אנגלית (A–G, Boost) → מטופל כ-null (נוסחת Sheets מחזירה 0 כשאין נתון)
