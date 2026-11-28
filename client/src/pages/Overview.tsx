import { useQuery } from '@tanstack/react-query'
import StatTile from '../components/StatTile'
import ChartCard from '../components/ChartCard'
import ResultsChart from '../components/ResultsChart'
import GoalsChart from '../components/GoalsChart'
import StatusRing from '../components/StatusRing'
import { localDate, hoursAheadOfUtc } from '../lib/dates'

type Fixture = {
  id: number
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
}

type SeasonStat = {
  season: string
  home: number
  draw: number
  away: number
  played: number
  goalsPerMatch: number
}

async function fetchToday(date: string): Promise<Fixture[]> {
  const res = await fetch(
    `http://localhost:3000/api/fixtures?date=${date}&offset=${hoursAheadOfUtc}`,
  )
  if (!res.ok) throw new Error('Could not load matches')
  return res.json()
}

async function fetchSeasons(): Promise<SeasonStat[]> {
  const res = await fetch('http://localhost:3000/api/stats/seasons')
  if (!res.ok) throw new Error('Could not load season statistics')
  return res.json()
}

export default function Overview() {
  const date = localDate(0)
  const today = useQuery({
    queryKey: ['fixtures', date],
    queryFn: () => fetchToday(date),
    refetchInterval: 60_000,
  })
  const seasons = useQuery({ queryKey: ['stats', 'seasons'], queryFn: fetchSeasons })

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (today.isLoading) return <p>Loading overview...</p>
  if (today.error || !today.data) return <p>Something went wrong. Is the server running?</p>

  const fixtures = today.data
  const counts = {
    live: fixtures.filter((f) => f.status === 'LIVE').length,
    finished: fixtures.filter((f) => f.status === 'FINISHED').length,
    scheduled: fixtures.filter((f) => f.status === 'SCHEDULED').length,
    other: fixtures.filter((f) => f.status === 'POSTPONED' || f.status === 'CANCELLED').length,
  }

  return (
    <div>
      <h1 className="mb-0">Overview</h1>
      <p className="text-sm text-muted">{dateLabel}</p>

      <h2 className="mb-3 mt-8 text-lg">Today</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon="live" label="Live matches" value={counts.live} hint="Right now" colour="bg-live" />
        <StatTile icon="matches" label="Matches today" value={fixtures.length} hint="In competitions we track" colour="bg-accent" />
        <StatTile icon="var" label="VAR checks today" value="Soon" hint="Needs live event data" colour="bg-var" />
        <StatTile icon="ai" label="Ask Kipenga" value="Soon" hint="AI assistant" colour="bg-ai" />
      </div>
      <p className="mt-3 text-xs text-muted">
        Scores update when matches are synced from the data provider.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Results by season" subtitle="Premier League, share of finished matches">
          {seasons.isLoading && <p className="text-sm text-muted">Loading...</p>}
          {seasons.error && <p className="text-sm">Could not load season statistics.</p>}
          {seasons.data && <ResultsChart data={seasons.data} />}
        </ChartCard>

        <ChartCard title="Goals per match" subtitle="Premier League, average by season">
          {seasons.isLoading && <p className="text-sm text-muted">Loading...</p>}
          {seasons.error && <p className="text-sm">Could not load season statistics.</p>}
          {seasons.data && <GoalsChart data={seasons.data} />}
        </ChartCard>

        <ChartCard title="Today's matches" subtitle="By status, in competitions we track">
          <StatusRing counts={counts} />
        </ChartCard>
      </div>
      <p className="mt-3 text-xs text-muted">
        Season charts use finished Premier League matches only. The latest season is still being played.
      </p>
    </div>
  )
}