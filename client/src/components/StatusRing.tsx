type Counts = { live: number; finished: number; scheduled: number; other: number }

export default function StatusRing({ counts }: { counts: Counts }) {
  const total = counts.live + counts.finished + counts.scheduled + counts.other
  if (total === 0) return <p className="text-sm text-muted">No matches today.</p>

  const r = 70
  const c = 2 * Math.PI * r
  const segments = [
    { label: 'Live', value: counts.live, stroke: 'stroke-live', dot: 'bg-live' },
    { label: 'Finished', value: counts.finished, stroke: 'stroke-purple', dot: 'bg-purple' },
    { label: 'Not started', value: counts.scheduled, stroke: 'stroke-accent', dot: 'bg-accent' },
    { label: 'Postponed or cancelled', value: counts.other, stroke: 'stroke-muted', dot: 'bg-muted' },
  ]
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 200" role="img" aria-label={`${total} matches today by status`} className="w-40 shrink-0">
        <circle cx="100" cy="100" r={r} fill="none" strokeWidth="26" className="stroke-line" />
        {segments.map((s) => {
          if (s.value === 0) return null
          const len = (s.value / total) * c
          const el = (
            <circle
              key={s.label}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              strokeWidth="26"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 100 100)"
              className={s.stroke}
            />
          )
          offset += len
          return el
        })}
        <text x="100" y="104" textAnchor="middle" fontSize="34" fontWeight="700" className="fill-ink">{total}</text>
        <text x="100" y="128" textAnchor="middle" fontSize="13" className="fill-muted">matches</text>
      </svg>
      <ul className="m-0 list-none p-0 text-sm text-ink">
        {segments.map((s) => (
          <li key={s.label} className="mb-1.5">
            <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-sm ${s.dot}`} />
            {s.label}: <b>{s.value}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}