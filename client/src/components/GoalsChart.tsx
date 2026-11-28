type Season = { season: string; goalsPerMatch: number }

export default function GoalsChart({ data }: { data: Season[] }) {
  if (data.length === 0) return <p className="text-sm text-muted">No data yet.</p>

  const W = 600
  const H = 280
  const left = 44
  const right = 16
  const top = 24
  const bottom = 36
  const values = data.map((d) => d.goalsPerMatch)
  const min = Math.floor(Math.min(...values) * 2) / 2
  const max = Math.max(Math.ceil(Math.max(...values) * 2) / 2, min + 0.5)

  const x = (i: number) =>
    data.length === 1 ? left : left + (i * (W - left - right)) / (data.length - 1)
  const y = (v: number) => top + ((max - v) / (max - min)) * (H - top - bottom)

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(d.goalsPerMatch)}`).join(' ')
  const area = `${line} L${x(data.length - 1)} ${H - bottom} L${x(0)} ${H - bottom} Z`
  const ticks = [min, (min + max) / 2, max]
  const last = data[data.length - 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Average goals per Premier League match, by season"
      className="w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} className="stroke-line" />
          <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize="12" className="fill-muted">
            {t.toFixed(1)}
          </text>
        </g>
      ))}
      <path d={area} className="fill-purple/20" />
      <path d={line} fill="none" strokeWidth="3" className="stroke-purple" />
      {data.map((d, i) => (
        <g key={d.season}>
          <circle cx={x(i)} cy={y(d.goalsPerMatch)} r="4" className="fill-purple" />
          <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="12" className="fill-muted">
            {d.season.slice(2)}
          </text>
          <title>{`${d.season}: ${d.goalsPerMatch} goals per match`}</title>
        </g>
      ))}
      <text x={x(data.length - 1)} y={y(last.goalsPerMatch) - 10} textAnchor="end" fontSize="13" fontWeight="700" className="fill-ink">
        {last.goalsPerMatch.toFixed(2)}
      </text>
    </svg>
  )
}