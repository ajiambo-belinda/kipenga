import { prisma } from '../db.js'

export async function getHeadToHead(teamAId: number, teamBId: number, limit = 10) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeamId: teamAId, awayTeamId: teamBId },
        { homeTeamId: teamBId, awayTeamId: teamAId },
      ],
      homeGoals: { not: null },
      awayGoals: { not: null },
    },
    orderBy: { matchDate: 'desc' },
    take: limit,
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

  let teamAWins = 0
  let teamBWins = 0
  let draws = 0
  let teamAGoals = 0
  let teamBGoals = 0

  for (const m of matches) {
    const aIsHome = m.homeTeam.id === teamAId
    const aGoals = aIsHome ? m.homeGoals! : m.awayGoals!
    const bGoals = aIsHome ? m.awayGoals! : m.homeGoals!
    teamAGoals += aGoals
    teamBGoals += bGoals
    if (aGoals > bGoals) teamAWins++
    else if (aGoals < bGoals) teamBWins++
    else draws++
  }

  return { played: matches.length, teamAWins, teamBWins, draws, teamAGoals, teamBGoals, matches }
}