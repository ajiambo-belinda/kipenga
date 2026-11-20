import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import TeamForm from './TeamForm'

const API = 'http://localhost:3000'

type Team = { id: number; name: string }
type Match = {
  id: number
  season: string
  matchDate: string
  homeGoals: number | null
  awayGoals: number | null
  homeTeam: Team
  awayTeam: Team
}
type HeadToHead = {
  played: number
  teamAWins: number
  teamBWins: number
  draws: number
  teamAGoals: number
  teamBGoals: number
  matches: Match[]
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error('Request failed')
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

function MatchTable({ matches }: { matches: Match[] }) {
  return (
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
        {matches.map((m) => (
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
  )
}

export default function App() {
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')

  const teams = useQuery({
    queryKey: ['teams'],
    queryFn: () => getJson<Team[]>('/api/teams'),
  })
  const latest = useQuery({
    queryKey: ['matches'],
    queryFn: () => getJson<Match[]>('/api/matches?limit=10'),
  })

  const ready = teamA !== '' && teamB !== '' && teamA !== teamB
  const h2h = useQuery({
    queryKey: ['h2h', teamA, teamB],
    queryFn: () => getJson<HeadToHead>(`/api/head-to-head?teamA=${teamA}&teamB=${teamB}`),
    enabled: ready,
  })

  const nameOf = (id: string) => teams.data?.find((t) => String(t.id) === id)?.name ?? ''

  if (teams.isLoading || latest.isLoading) return <p>Loading...</p>
  if (teams.error || latest.error) return <p>Something went wrong. Is the server running?</p>

  return (
    <main>
      <h1>Kipenga</h1>

      <h2>Head to head</h2>
      <div>
        <label>
          Team A{' '}
          <select value={teamA} onChange={(e) => setTeamA(e.target.value)}>
            <option value="">Choose a team</option>
            {teams.data?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>{' '}
        <label>
          Team B{' '}
          <select value={teamB} onChange={(e) => setTeamB(e.target.value)}>
            <option value="">Choose a team</option>
            {teams.data?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {teamA !== '' && teamA === teamB && <p>Please choose two different teams.</p>}
      {ready && h2h.isLoading && <p>Loading head to head...</p>}
      {ready && h2h.error && <p>Could not load head to head.</p>}
      {ready &&
        h2h.data &&
        (h2h.data.played === 0 ? (
          <p>No meetings in the matches we have loaded so far.</p>
        ) : (
          <>
            <p>
              Last {h2h.data.played} meetings: {nameOf(teamA)} {h2h.data.teamAWins} wins,{' '}
              {h2h.data.draws} draws, {nameOf(teamB)} {h2h.data.teamBWins} wins. Goals:{' '}
              {h2h.data.teamAGoals} - {h2h.data.teamBGoals}.
            </p>
            <MatchTable matches={h2h.data.matches} />
          </>
        ))}

      <TeamForm teams={teams.data ?? []} />

      <h2>Latest results</h2>
      <MatchTable matches={latest.data ?? []} />
    </main>
  )
}