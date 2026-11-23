import 'dotenv/config'

const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) throw new Error('API_FOOTBALL_KEY is missing in server/.env')

const BASE = 'https://v3.football.api-sports.io'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function call(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${BASE}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const res = await fetch(url, { headers: { 'x-apisports-key': KEY! } })
  if (res.status === 429) throw new Error('Rate limit reached (HTTP 429). Wait and try again.')
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.pathname}`)
  const body = await res.json()
  await sleep(3000) // stay inside the per-minute limit
  return body
}

function showErrors(errors: unknown) {
  const has = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0
  if (has) console.log('  PROVIDER MESSAGE:', JSON.stringify(errors))
}

function line(f: any) {
  return (
    `${f.fixture.id} | ${f.fixture.date?.slice(0, 10)} | ${f.fixture.status.short} | ` +
    `${f.teams.home.name} ${f.goals.home ?? '-'} - ${f.goals.away ?? '-'} ${f.teams.away.name}`
  )
}

async function eventSummary(fixtureId: number) {
  const ev = await call('fixtures/events', { fixture: fixtureId })
  showErrors(ev.errors)
  const events: any[] = ev.response ?? []
  const counts: Record<string, number> = {}
  for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1
  console.log(`    ${events.length} events: ${JSON.stringify(counts)}`)
  for (const e of events.filter((x) => String(x.type).toLowerCase() === 'var')) {
    console.log(`    VAR | minute ${e.time?.elapsed} | ${e.team?.name} | ${e.detail}`)
  }
}

async function main() {
  const today = new Date().toISOString().slice(0, 10)

  console.log(`\n=== Test 1: fixtures by date only (no league, no season) for ${today} ===`)
  const d = await call('fixtures', { date: today })
  showErrors(d.errors)
  const dayFixtures: any[] = d.response ?? []
  console.log(`  ${dayFixtures.length} fixtures returned`)
  const comps = new Set(dayFixtures.map((f) => `${f.league.country} - ${f.league.name}`))
  console.log('  ' + [...comps].slice(0, 15).join('\n  '))

  console.log('\n=== Test 2: Premier League 2024 season, 1 to 3 November 2024 ===')
  const pl = await call('fixtures', { league: 39, season: 2024, from: '2024-11-01', to: '2024-11-03' })
  showErrors(pl.errors)
  const plFixtures: any[] = pl.response ?? []
  console.log(`  ${plFixtures.length} fixtures`)
  for (const f of plFixtures) console.log('  ' + line(f))
  for (const f of plFixtures.filter((x) => x.fixture.status.short === 'FT').slice(0, 5)) {
    console.log(`\n  Events for ${f.teams.home.name} v ${f.teams.away.name}`)
    await eventSummary(f.fixture.id)
  }

  console.log('\n=== Test 3: Kenya FKF Premier League 2024, last 5 fixtures ===')
  const ke = await call('fixtures', { league: 276, season: 2024, last: 5 })
  showErrors(ke.errors)
  const keFixtures: any[] = ke.response ?? []
  console.log(`  ${keFixtures.length} fixtures`)
  for (const f of keFixtures) console.log('  ' + line(f))
  const keDone = keFixtures.find((x) => x.fixture.status.short === 'FT')
  if (keDone) {
    console.log(`\n  Events for ${keDone.teams.home.name} v ${keDone.teams.away.name}`)
    await eventSummary(keDone.fixture.id)
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})