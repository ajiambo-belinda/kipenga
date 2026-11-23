import { useQuery } from '@tanstack/react-query'
import StatTile from '../components/StatTile'
import { localDate, hoursAheadOfUtc } from '../lib/dates'

type Fixture = {
  id: number
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
}

async function fetchToday(date: string): Promise<Fixture[]> {
  const res = await fetch(
    `http://localhost:3000/api/fixtures?date=${date}&offset=${hoursAheadOfUtc}`,
  )
  if (!res.ok) throw new Error('Could not load matches')
  return res.json()
}

export default function Overview() {
  const date = localDate(0)
  const { data, isLoading, error } = useQuery({
    queryKey: ['fixtures', date],
    queryFn: () => fetchToday(date),
    refetchInterval: 60_000,
  })

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (isLoading) return <p>Loading overview...</p>
  if (error || !data) return <p>Something went wrong. Is the server running?</p>

  const live = data.filter((f) => f.status === 'LIVE').length

  return (
    <div>
      <h1 className="mb-0">Overview</h1>
      <p className="text-sm text-muted">{today}</p>

      <h2 className="mb-3 mt-8 text-lg">Today</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon="live" label="Live matches" value={live} hint="Right now" colour="bg-live" />
        <StatTile
          icon="matches"
          label="Matches today"
          value={data.length}
          hint="In competitions we track"
          colour="bg-accent"
        />
        <StatTile
          icon="var"
          label="VAR checks today"
          value="Soon"
          hint="Needs live event data"
          colour="bg-var"
        />
        <StatTile icon="ai" label="Ask Kipenga" value="Soon" hint="AI assistant" colour="bg-ai" />
      </div>
      <p className="mt-3 text-xs text-muted">
        Scores update when matches are synced from the data provider.
      </p>
    </div>
  )
}