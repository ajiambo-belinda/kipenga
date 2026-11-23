import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

type Fixture = {
  id: number
  kickoffAt: string
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
  statusShort: string | null
  minute: number | null
  homeGoals: number | null
  awayGoals: number | null
  competition: { id: number; name: string; country: string; tier: number } | null
  homeTeam: { id: number; name: string }
  awayTeam: { id: number; name: string }
}

const tabs = [
  { label: 'Yesterday', days: -1 },
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
]

// The visitor's own calendar date, not the UTC date
function localDate(daysFromToday: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// Nairobi is 3 hours ahead of UTC
const hoursAheadOfUtc = -new Date().getTimezoneOffset() / 60

async function fetchFixtures(date: string): Promise<Fixture[]> {
  const res = await fetch(
    `http://localhost:3000/api/fixtures?date=${date}&offset=${hoursAheadOfUtc}`,
  )
  if (!res.ok) throw new Error('Could not load matches')
  return res.json()
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function groupByCompetition(fixtures: Fixture[]) {
  const groups = new Map<string, { title: string; tier: number; items: Fixture[] }>()
  for (const f of fixtures) {
    const key = f.competition ? String(f.competition.id) : 'other'
    const title = f.competition
      ? `${f.competition.country.replace('-', ' ')} · ${f.competition.name}`
      : 'Other'
    if (!groups.has(key)) {
      groups.set(key, { title, tier: f.competition?.tier ?? 9, items: [] })
    }
    groups.get(key)!.items.push(f)
  }
  return [...groups.values()].sort((a, b) => a.tier - b.tier || a.title.localeCompare(b.title))
}

function StatusBadge({ f }: { f: Fixture }) {
  if (f.status === 'LIVE') {
    const label = f.statusShort === 'HT' ? 'HT' : f.minute ? `${f.minute}'` : 'LIVE'
    return <span className="rounded bg-live px-2 py-0.5 text-xs font-bold text-sidebar">{label}</span>
  }
  if (f.status === 'FINISHED') {
    return <span className="text-xs font-semibold text-muted">FT</span>
  }
  if (f.status === 'POSTPONED') {
    return <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold text-sidebar">PST</span>
  }
  if (f.status === 'CANCELLED') {
    return <span className="text-xs font-semibold text-muted">CANC</span>
  }
  return <span className="text-sm font-semibold text-ink">{formatTime(f.kickoffAt)}</span>
}

export default function Matches() {
  const [days, setDays] = useState(0)
  const date = localDate(days)

  const { data, isLoading, error } = useQuery({
    queryKey: ['fixtures', date],
    queryFn: () => fetchFixtures(date),
    refetchInterval: 60_000,
  })

  const groups = groupByCompetition(data ?? [])

  return (
    <div>
      <h1>Matches</h1>
      <p className="text-muted">Kick-off times are shown in your local time.</p>

      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.days}
            type="button"
            aria-pressed={days === t.days}
            onClick={() => setDays(t.days)}
            className={
              days === t.days
                ? 'rounded-lg bg-chocolate px-4 py-2 text-sm font-bold text-page'
                : 'rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:bg-white'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-6">Loading matches...</p>}
      {error && <p className="mt-6">Something went wrong. Is the server running?</p>}
      {!isLoading && !error && groups.length === 0 && (
        <p className="mt-6 text-muted">No matches found for this day in the competitions we track.</p>
      )}

      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <section key={g.title} className="overflow-hidden rounded-2xl border border-line bg-card">
            <h2 className="m-0 border-b border-line bg-white/60 px-4 py-2 text-sm font-bold">
              {g.title}
            </h2>
            <ul>
              {g.items.map((f) => (
                <li
                  key={f.id}
                  className="grid grid-cols-[4rem_1fr_4.5rem_1fr] items-center gap-2 border-b border-line px-4 py-3 last:border-b-0"
                >
                  <StatusBadge f={f} />
                  <span className="text-right font-semibold">{f.homeTeam.name}</span>
                  <span className="text-center font-display text-lg font-bold">
                    {f.status === 'LIVE' || f.status === 'FINISHED'
                      ? `${f.homeGoals ?? 0} - ${f.awayGoals ?? 0}`
                      : 'v'}
                  </span>
                  <span className="font-semibold">{f.awayTeam.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}