'use client'

export default function DashboardScoreRing({ score }: { score: number | null }) {
  const s = score ?? 0
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (s / 100) * circ

  const color =
    s >= 70 ? '#22c55e' :
    s >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          strokeWidth="8"
          stroke={score !== null ? color : 'transparent'}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-foreground">
          {score !== null ? s : '—'}
        </span>
        {score !== null && (
          <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
        )}
      </div>
    </div>
  )
}