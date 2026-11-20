import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = 'http://localhost:3000'

type Team = { id: number; name: string }
type Result = 'W' | 'D' | 'L'
type FormMatch = {
  id: number
  season: string
  matchDate: string
  isHome: boolean
  opponent: string
  gf: number
  ga: number
  result: Result
}
type Form = {
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
  pointsPerGame: number
  form: Result[]
  matches: FormMatch[]
}
type SeasonRow = {
  season: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
  pointsPerGame: number
  ppgChange: number | null
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

const colours: Record<Result, string> = { W: '#1a7f37', D: '#6e7781', L: '#cf222e' }

function FormChips({ form }: { form: Result[] }) {
  return (
    <span>
      {form.map((r, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 28,
            height: 28,
            lineHeight: '28px',
            textAlign: 'center',
            borderRadius: 6,
            marginRight: 6,
            color: 'white',
            fontWeight: 700,
            background: colours[r],
          }}
        >
          {r}
        </span>
      ))}
    </span>
  )
}

export default function TeamForm({ teams }: { teams: Team[] }) {
  const [teamId, setTeamId] = useState('')

  const form = useQuery({
    queryKey: ['form', teamId],
    queryFn: () => getJson<Form>(`/api/teams/${teamId}/form?limit=5`),
    enabled: teamId !== '',
  })
  const seasons = useQuery({
    queryKey: ['seasons', teamId],
    queryFn: () => getJson<SeasonRow[]>(`/api/teams/${teamId}/seasons`),
    enabled: teamId !== '',
  })

  return (
    <section>
      <h2>Team form and improvement</h2>
      <label>
        Team{' '}
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="">Choose a team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {teamId !== '' && form.isLoading && <p>Loading form...</p>}
      {form.error && <p>Could not load form.</p>}
      {form.data && (
        <>
          <h3>Last {form.data.played} matches</h3>
          <p>
            <FormChips form={form.data.form} />
          </p>
          <p>
            {form.data.wins}W {form.data.draws}D {form.data.losses}L, goals{' '}
            {form.data.goalsFor}-{form.data.goalsAgainst}, {form.data.points} points
          </p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Venue</th>
                <th>Score</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {form.data.matches.map((m) => (
                <tr key={m.id}>
                  <td>{formatDate(m.matchDate)}</td>
                  <td>{m.opponent}</td>
                  <td>{m.isHome ? 'Home' : 'Away'}</td>
                  <td>
                    {m.gf} - {m.ga}
                  </td>
                  <td>{m.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {seasons.data && (
        <>
          <h3>Season by season</h3>
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>Pts</th>
                <th>Pts/game</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {seasons.data.map((s) => (
                <tr key={s.season}>
                  <td>{s.season}</td>
                  <td>{s.played}</td>
                  <td>{s.wins}</td>
                  <td>{s.draws}</td>
                  <td>{s.losses}</td>
                  <td>{s.goalsFor}</td>
                  <td>{s.goalsAgainst}</td>
                  <td>{s.points}</td>
                  <td>{s.pointsPerGame.toFixed(2)}</td>
                  <td>
                    {s.ppgChange === null
                      ? '-'
                      : `${s.ppgChange > 0 ? '+' : ''}${s.ppgChange.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Only seasons in the Premier League are shown. Points per game lets us compare a
            full season with the current one, which is still being played.
          </p>
        </>
      )}
    </section>
  )
}