import { getFixturesByDate, getRemainingRequests } from '../provider/apiFootball.js'

async function main() {
  const today = new Date().toISOString().slice(0, 10)
  const matches = await getFixturesByDate(today)

  const byStatus: Record<string, number> = {}
  for (const m of matches) byStatus[m.status] = (byStatus[m.status] ?? 0) + 1
  console.log(`${today}: ${matches.length} matches. By status: ${JSON.stringify(byStatus)}`)

  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' })

  const kenya = matches.filter((m) => m.competition.country === 'Kenya')
  console.log(`\nKenya: ${kenya.length} matches (times in Nairobi)`)
  for (const m of kenya) {
    console.log(
      `  ${fmt(m.kickoffAt)} | ${m.status} (${m.statusShort}) | ` +
        `${m.homeTeam.name} ${m.homeGoals ?? '-'} - ${m.awayGoals ?? '-'} ${m.awayTeam.name} | ${m.competition.name}`,
    )
  }

  const live = matches.filter((m) => m.status === 'LIVE').slice(0, 8)
  console.log(`\nLive now (first 8)`)
  for (const m of live) {
    console.log(
      `  ${m.minute ?? '?'}' | ${m.competition.country} - ${m.competition.name} | ` +
        `${m.homeTeam.name} ${m.homeGoals} - ${m.awayGoals} ${m.awayTeam.name}`,
    )
  }

  console.log(`\nProvider requests left today: ${getRemainingRequests() ?? 'unknown'}`)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})