import { parse } from 'csv-parse/sync'
import { prisma } from './db.js'

const SEASONS = [ '1516', '1617', '1718', '1819', '1920', '2021', '2122', '2223', '2324', '2425', '2526', '2627']
const BASE_URL = 'https://www.football-data.co.uk/mmz4281'

function seasonLabel(code: string) {
  return `20${code.slice(0, 2)}/${code.slice(2)}`
}

function parseDate(value: string): Date | null {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/)
  if (!m) return null
  let year = Number(m[3])
  if (year < 100) year += 2000
  return new Date(Date.UTC(year, Number(m[2]) - 1, Number(m[1])))
}

function toGoals(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null
  const n = Number(value)
  return Number.isInteger(n) ? n : null
}

async function main() {
  // Remove the two test teams from earlier
  await prisma.team.deleteMany({ where: { name: { in: ['Team A', 'Team B'] } } })

  const teamIds = new Map<string, number>()
  async function getTeamId(name: string) {
    const cached = teamIds.get(name)
    if (cached) return cached
    const team = await prisma.team.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    teamIds.set(name, team.id)
    return team.id
  }

  for (const code of SEASONS) {
    const url = `${BASE_URL}/${code}/E0.csv`
    const res = await fetch(url)
    if (!res.ok) {
      console.log(`Skipping ${seasonLabel(code)}: could not download (${res.status})`)
      continue
    }

    const rows = parse(await res.text(), {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_column_count: true,
    }) as Record<string, string>[]

    let saved = 0
    for (const row of rows) {
      const matchDate = parseDate(row.Date ?? '')
      const home = row.HomeTeam?.trim()
      const away = row.AwayTeam?.trim()
      if (!matchDate || !home || !away) continue

      const homeTeamId = await getTeamId(home)
      const awayTeamId = await getTeamId(away)
      const homeGoals = toGoals(row.FTHG)
      const awayGoals = toGoals(row.FTAG)

      await prisma.match.upsert({
        where: { matchDate_homeTeamId_awayTeamId: { matchDate, homeTeamId, awayTeamId } },
        update: { homeGoals, awayGoals },
        create: {
          season: seasonLabel(code),
          matchDate,
          homeTeamId,
          awayTeamId,
          homeGoals,
          awayGoals,
        },
      })
      saved++
    }
    console.log(`${seasonLabel(code)}: ${saved} matches saved`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())