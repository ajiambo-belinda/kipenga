import { useQuery } from '@tanstack/react-query'
import StatTile from '../components/StatTile'

type Overview = {
  teams: number
  matchesPlayed: number
  seasons: string[]
  latestMatch: {
    matchDate: string
    homeGoals: number
    awayGoals: number
    homeTeam: { name: string }
    awayTeam: { name: string }
  } | null
}

async function fetchOverview(): Promise<Overview> {
  const res = await fetch('http://localhost:3000/api/overview')
  if (!res.ok) throw new Error('Could not load overview')
  return res.json()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function Overview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['overview'],
    queryFn: fetchOverview,
  })

  if (isLoading) return <p>Loading overview...</p>
  if (error || !data) return <p>Something went wrong. Is the server running?</p>

  const oldest = data.seasons[data.seasons.length - 1]
  const newest = data.seasons[0]

  return (
    <div>
      <h1>Overview</h1>
      <p className="text-muted">Premier League data stored in Kipenga.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Teams" value={data.teams} hint="Clubs in the data" colour="bg-purple" />
        <StatTile
          label="Matches played"
          value={data.matchesPlayed.toLocaleString('en-GB')}
          hint="With a final score"
          colour="bg-accent"
        />
        <StatTile
          label="Seasons"
          value={data.seasons.length}
          hint={`${oldest} to ${newest}`}
          colour="bg-lime"
        />
        <StatTile
          label="Latest result"
          value={data.latestMatch ? formatDate(data.latestMatch.matchDate) : '-'}
          hint="Most recent match in the data"
          colour="bg-ink"
        />
      </div>

      {data.latestMatch && (
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <p className="text-xs font-semibold tracking-wide text-muted">LATEST RESULT</p>
          <p className="mt-2 font-display text-2xl font-bold">
            {data.latestMatch.homeTeam.name} {data.latestMatch.homeGoals} -{' '}
            {data.latestMatch.awayGoals} {data.latestMatch.awayTeam.name}
          </p>
          <p className="text-sm text-muted">{formatDate(data.latestMatch.matchDate)}</p>
        </div>
      )}
    </div>
  )
}
  
