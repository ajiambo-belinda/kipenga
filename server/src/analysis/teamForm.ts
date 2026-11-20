import { prisma } from '../db.js'

type Result = 'W' | 'D' | 'L'

async function getPlayedMatches(teamId: number) {
  return prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      homeGoals: { not: null },
      awayGoals: { not: null },
    },
    orderBy: { matchDate: 'asc' },
    select: {
      id: true,
      season: true,
      matchDate: true,
      homeGoals: true,
      awayGoals: true,
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
    },
  })
}

function toResult(
  m: Awaited<ReturnType<typeof getPlayedMatches>>[number],
  teamId: number,
) {
  const isHome = m.homeTeam.id === teamId
  const gf = isHome ? m.homeGoals! : m.awayGoals!
  const ga = isHome ? m.awayGoals! : m.homeGoals!
  const result: Result = gf > ga ? 'W' : gf < ga ? 'L' : 'D'
  const points = result === 'W' ? 3 : result === 'D' ? 1 : 0
  return {
    id: m.id,
    season: m.season,
    matchDate: m.matchDate,
    isHome,
    opponent: isHome ? m.awayTeam.name : m.homeTeam.name,
    gf,
    ga,
    result,
    points,
  }
}

function summarise(rows: ReturnType<typeof toResult>[]) {
  const played = rows.length
  const wins = rows.filter((r) => r.result === 'W').length
  const draws = rows.filter((r) => r.result === 'D').length
  const losses = rows.filter((r) => r.result === 'L').length
  const goalsFor = rows.reduce((sum, r) => sum + r.gf, 0)
  const goalsAgainst = rows.reduce((sum, r) => sum + r.ga, 0)
  const points = rows.reduce((sum, r) => sum + r.points, 0)
  const pointsPerGame = played === 0 ? 0 : Math.round((points / played) * 100) / 100
  return { played, wins, draws, losses, goalsFor, goalsAgainst, points, pointsPerGame }
}

export async function getTeamForm(teamId: number, limit = 5) {
  const all = (await getPlayedMatches(teamId)).map((m) => toResult(m, teamId))
  const recent = all.slice(-limit).reverse() // newest first
  return {
    ...summarise(recent),
    form: recent.map((r) => r.result),
    matches: recent,
  }
}

export async function getSeasonSummaries(teamId: number) {
  const all = (await getPlayedMatches(teamId)).map((m) => toResult(m, teamId))

  const bySeason = new Map<string, ReturnType<typeof toResult>[]>()
  for (const r of all) {
    const list = bySeason.get(r.season) ?? []
    list.push(r)
    bySeason.set(r.season, list)
  }

  const seasons = [...bySeason.keys()].sort() // oldest first
  let previousPpg: number | null = null
  const summaries = seasons.map((season) => {
    const s = summarise(bySeason.get(season)!)
    const ppgChange: number | null =
      previousPpg === null ? null : Math.round((s.pointsPerGame - previousPpg) * 100) / 100
    previousPpg = s.pointsPerGame
    return { season, ...s, ppgChange }
  })

  return summaries.reverse() // newest first
}