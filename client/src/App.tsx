import { useQuery } from '@tanstack/react-query'

type Team = { id: number; name: string }

async function fetchTeams(): Promise<Team[]> {
  const res = await fetch('http://localhost:3000/api/teams')
  if (!res.ok) throw new Error('Could not load teams')
  return res.json()
}

export default function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  })

  if (isLoading) return <p>Loading teams...</p>
  if (error) return <p>Something went wrong. Is the server running?</p>

  return (
    <main>
      <h1>Kipenga</h1>
      <ul>
        {data?.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </main>
  )
}