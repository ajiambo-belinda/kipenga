import { prisma } from '../db.js'
import { getFixturesByDate, getRemainingRequests } from '../provider/apiFootball.js'

// Provider name -> the name used in our history (from the CSV files).
// Names that don't exist are harmless. Add more when the dry run shows gaps.
const aliases: Record<string, string> = {
  'Manchester City': 'Man City',
  'Manchester United': 'Man United',
  'Nottingham Forest': "Nott'm Forest",
  'Hull City': 'Hull',
  'Leeds United': 'Leeds',
  'Leicester City': 'Leicester',
  'Norwich City': 'Norwich',
  'Cardiff City': 'Cardiff',
  'Swansea City': 'Swansea',
  'Stoke City': 'Stoke',
  'Huddersfield Town': 'Huddersfield',
  'Sheffield Utd': 'Sheffield United',
  'Luton Town': 'Luton',
  'Queens Park Rangers': 'QPR',
  'Wolverhampton Wanderers': 'Wolves',
  'Newcastle United': 'Newcastle',
  'Tottenham Hotspur': 'Tottenham',
  'West Ham United': 'West Ham',
  'Brighton & Hove Albion': 'Brighton',
}

const args = process.argv.slice(2)
const save = args.includes('--save')
const date = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? new Date().toISOString().slice(0, 10)

function seasonLabel(year: number) {
  return `${year}/${String((year + 1) % 100).padStart(2, '0')}`
}

function dateOnly(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

async function main() {
  console.log(save ? `SAVING matches for ${date}` : `DRY RUN for ${date} (nothing is written)`)

  const enabled = await prisma.competition.findMany({ where: { enabled: true } })
  const compByExternal = new Map(enabled.map((c) => [c.externalId, c]))

  const all = await getFixturesByDate(date)
  const wanted = all.filter((m) => compByExternal.has(m.competition.externalId))
  console.log(`Provider returned ${all.length} matches, ${wanted.length} in enabled competitions`)

  const teamCache = new Map<number, number | null>() // provider id -> our id
  const stats = { byId: 0, byName: 0, byAlias: 0, created: 0 }
  const newTeams: string[] = []
  const aliasUsed: string[] = []

  async function resolveTeam(t: { externalId: number; name: string }, country: string | null) {
    const cached = teamCache.get(t.externalId)
    if (cached !== undefined) return cached

    const byId = await prisma.team.findUnique({ where: { externalId: t.externalId } })
    if (byId) {
      stats.byId++
      teamCache.set(t.externalId, byId.id)
      return byId.id
    }

    // Only history teams that have no provider id yet can be matched by name
    const candidates = [t.name, aliases[t.name]].filter((x): x is string => Boolean(x))
    for (const name of candidates) {
      const history = await prisma.team.findFirst({ where: { name, externalId: null } })
      if (history) {
        if (name === t.name) stats.byName++
        else {
          stats.byAlias++
          aliasUsed.push(`${t.name} -> ${name}`)
        }
        if (save) {
          await prisma.team.update({ where: { id: history.id }, data: { externalId: t.externalId, country } })
        }
        teamCache.set(t.externalId, history.id)
        return history.id
      }
    }

    newTeams.push(`${t.name}${country ? ` (${country})` : ''}`)
    if (!save) {
      teamCache.set(t.externalId, null)
      return null
    }
    let created
    try {
      created = await prisma.team.create({ data: { name: t.name, externalId: t.externalId, country } })
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e
      // The name is already taken by another club, so add the country
      created = await prisma.team.create({
        data: { name: `${t.name} (${country ?? 'other'})`, externalId: t.externalId, country },
      })
    }
    stats.created++
    teamCache.set(t.externalId, created.id)
    return created.id
  }

  let matchCreate = 0
  let matchUpdate = 0

  for (const m of wanted) {
    const comp = compByExternal.get(m.competition.externalId)!
    const teamCountry = m.competition.country === 'World' ? null : m.competition.country
    const homeId = await resolveTeam(m.homeTeam, teamCountry)
    const awayId = await resolveTeam(m.awayTeam, teamCountry)

    const matchDate = dateOnly(m.kickoffAt)
    let existing = await prisma.match.findUnique({ where: { externalId: m.externalId } })
    if (!existing && homeId !== null && awayId !== null) {
      existing = await prisma.match.findFirst({
        where: { matchDate, homeTeamId: homeId, awayTeamId: awayId },
      })
    }
    if (existing) matchUpdate++
    else matchCreate++
    if (!save) continue

    const fields = {
      kickoffAt: m.kickoffAt,
      status: m.status,
      statusShort: m.statusShort,
      minute: m.minute,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
    }
    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: { ...fields, externalId: m.externalId, competitionId: comp.id },
      })
    } else {
      await prisma.match.create({
        data: {
          ...fields,
          externalId: m.externalId,
          competitionId: comp.id,
          season: seasonLabel(m.seasonYear),
          matchDate,
          homeTeamId: homeId!,
          awayTeamId: awayId!,
        },
      })
    }
  }

  console.log(`\nTeams: ${stats.byId} matched by provider id, ${stats.byName} by name, ${stats.byAlias} by alias`)
  if (aliasUsed.length) console.log(`  Aliases used: ${[...new Set(aliasUsed)].join('; ')}`)
  console.log(`  ${save ? 'Created' : 'Would create'} ${newTeams.length} new teams`)
  for (const n of newTeams.slice(0, 50)) console.log(`    + ${n}`)
  console.log(`Matches: ${save ? '' : 'would '}update ${matchUpdate}, ${save ? '' : 'would '}create ${matchCreate}`)
  console.log(`Provider requests left today: ${getRemainingRequests() ?? 'unknown'}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())