type Season = { season: string; home: number; draw: number; away: number }

export default function ResultsChart({ data }: { data: Season[] }) {
  const W = 600
  const H = 280
  const top = 12
  const bottom = 36
  const plotH = H - top - bottom
  const slot = W / Math.max(data.length, 1)

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Premier League results by season: share of home wins, draws and away wins"
        className="w-full"
      >
        {data.map((s, i) => {
          const total = s.home + s.draw + s.away || 1
          const awayH = (s.away / total) * plotH
          const drawH = (s.draw / total) * plotH
          const homeH = (s.home / total) * plotH
          const x = i * slot + slot * 0.15
          const w = slot * 0.7
          return (
            <g key={s.season}>
              <rect x={x} y={top} width={w} height={awayH} className="fill-sidebar" />
              <rect x={x} y={top + awayH} width={w} height={drawH} className="fill-accent" />
              <rect x={x} y={top + awayH + drawH} width={w} height={homeH} className="fill-purple" />
              <text x={x + w / 2} y={H - 12} textAnchor="middle" fontSize="13" className="fill-muted">
                {s.season.slice(2)}
              </text>
              <title>{`${s.season}: ${s.home} home wins, ${s.draw} draws, ${s.away} away wins`}</title>
            </g>
          )
        })}
      </svg>
      <ul className="m-0 mt-2 flex list-none flex-wrap gap-4 p-0 text-xs text-ink">
        <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-purple" />Home wins</li>
        <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-accent" />Draws</li>
        <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-sidebar" />Away wins</li>
      </ul>
    </div>
  )
}