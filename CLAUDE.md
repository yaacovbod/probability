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
- localStorage — שמירת נתונים (ממשק מוכן לחיבור Google Sheets)

## מבנה קבצים מרכזי
```
src/
  app/
    page.tsx              ← דשבורד ראשי
    student/[id]/page.tsx ← כרטיס תלמיד
    upload/page.tsx       ← העלאת Excel
    login/page.tsx        ← כניסה בסיסמה
    api/upload/route.ts
    api/update-student/route.ts
  lib/
    types.ts
    calculator.ts         ← נוסחת הסיכוי
    excel-parser.ts
    storage.ts
  components/
    Gauge.tsx
    StudentTable.tsx
    DashboardKPI.tsx
    SubjectBar.tsx
public/
  data_bagruyot.xlsx      ← קובץ הנתונים
```

## קהל יעד
רכז שכבת יא׳ בבית הספר נעימת הלב, חריש.

## משתני סביבה
- `APP_PASSWORD` — סיסמת כניסה לדשבורד

## הערות
- מפתח ראשי: תעודת זהות (לא שם)
- גיליונות ה-Excel: הגדרות, תלמידים, ציוני_בגרות, ציוני_תעודה, דוח
