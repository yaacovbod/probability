type Props = {
  studentId: string
  score: number
  classGroup: string
  allData: { studentId: string; score: number; classGroup: string }[]
}

function extractClassNum(classGroup: string): number {
  const m = classGroup.match(/(\d+)\s*$/)
  return m ? parseInt(m[1], 10) : 0
}

export function ClassPosition({ studentId, score, classGroup, allData }: Props) {
  const classNum = extractClassNum(classGroup)
  const classmates = allData.filter(d => extractClassNum(d.classGroup) === classNum)
  if (classmates.length < 2) return null

  const sorted = [...classmates].sort((a, b) => b.score - a.score)
  const rank = sorted.findIndex(d => d.studentId === studentId) + 1
  const classAvg = Math.round(classmates.reduce((s, d) => s + d.score, 0) / classmates.length)
  const gradeAvg = Math.round(allData.reduce((s, d) => s + d.score, 0) / allData.length)
  const pctRank = Math.round((rank / classmates.length) * 100)

  return (
    <div className="flex flex-col gap-2 mt-3 px-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>מקום <span className="font-black text-foreground text-sm">{rank}</span> מתוך {classmates.length} ביא{classNum}</span>
      </div>

      {/* position bar */}
      <div className="relative h-5 bg-muted rounded-full overflow-visible">
        <div
          className="absolute inset-0 bg-gradient-to-r from-destructive via-amber-400 to-emerald-500 rounded-full"
        />
        {/* class avg marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-80 shadow"
          style={{ left: `calc(${classAvg}% - 6px)` }}
          title={`ממוצע כיתה: ${classAvg}`}
        />
        {/* student marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-foreground shadow-md"
          style={{ left: `calc(${score}% - 10px)` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>ממוצע כיתה: <span className="font-bold text-foreground">{classAvg}</span></span>
        <span>ממוצע שכבה: <span className="font-bold text-foreground">{gradeAvg}</span></span>
      </div>
    </div>
  )
}
