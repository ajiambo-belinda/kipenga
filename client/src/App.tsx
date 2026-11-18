import { useQuery } from '@tanstack/react-query'

type Match = {
  id: number
  season: string
  matchDate: string
  homeGoals: number | null
  awayGoals: number | null
  homeTeam: { id: number; name: string }
  awayTeam: { id: number; name: string }
}

async function fetchMatches(): Promise<Match[]> {
  const res = await fetch('http://localhost:3000/api/matches?limit=20')
  if (!res.ok) throw new Error('Could not load matches')
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

export default function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
  })

  if (isLoading) return <p>Loading matches...</p>
  if (error) return <p>Something went wrong. Is the server running?</p>

  return (
    <main>
      <h1>Kipenga</h1>
      <h2>Latest Premier League results</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Home</th>
            <th>Score</th>
            <th>Away</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((m) => (
            <tr key={m.id}>
              <td>{formatDate(m.matchDate)}</td>
              <td>{m.homeTeam.name}</td>
              <td>
                {m.homeGoals === null || m.awayGoals === null
                  ? 'v'
                  : `${m.homeGoals} - ${m.awayGoals}`}
              </td>
              <td>{m.awayTeam.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}