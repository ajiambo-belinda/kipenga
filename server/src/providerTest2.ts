import 'dotenv/config'

const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) throw new Error('API_FOOTBALL_KEY is missing in server/.env')

const BASE = 'https://v3.football.api-sports.io'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function call(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${BASE}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const res = await fetch(url, { headers: { 'x-apisports-key': KEY! } })
  if (res.status === 429) {
    throw new Error('Rate limit reached (HTTP 429). Wait a few minutes and run again.')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.pathname}`)
  const body = await res.json()
  await sleep(3000) // pause so we stay inside the per-minute limit
  return body
}

function showErrors(errors: unknown) {
  const has = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0
  if (has) console.log('  PROVIDER MESSAGE:', JSON.stringify(errors))
}

function dayOffset(n: number) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function listFixtures(fixtures: any[], max = 12) {
  for (const f of fixtures.slice(0, max)) {
    console.log(
      `  ${f.fixture.id} | ${f.fixture.date?.slice(0, 16)} | ${f.fixture.status.short} | ` +
        `${f.teams.home.name} ${f.goals.home ?? '-'} - ${f.goals.away ?? '-'} ${f.teams.away.name}`,
    )
  }
}

async function main() {
  console.log('\n=== Plan and usage ===')
  const status = await call('status')
  showErrors(status.errors)
  const plan = status.response?.subscription?.plan ?? '?'
  const used = status.response?.requests?.current ?? '?'
  const limit = status.response?.requests?.limit_day ?? '?'
  console.log(`  plan: ${plan} | requests used today: ${used} of ${limit}`)

  const today = dayOffset(0)
  console.log(`\n=== Premier League (id 39) on ${today} ===`)
  const pl = await call('fixtures', { league: 39, season: 2026, date: today })
  showErrors(pl.errors)
  const plFixtures: any[] = pl.response ?? []
  console.log(`  ${plFixtures.length} fixtures`)
  listFixtures(plFixtures)

  const finished = plFixtures.find((f) => f.fixture.status.short === 'FT')
  if (finished) {
    console.log(`\n=== Match events for fixture ${finished.fixture.id} ===`)
    const ev = await call('fixtures/events', { fixture: finished.fixture.id })
    showErrors(ev.errors)
    const events: any[] = ev.response ?? []
    const counts = new Map<string, number>()
    for (const e of events) counts.set(e.type, (counts.get(e.type) ?? 0) + 1)
    console.log(`  ${events.length} events. By type: ${JSON.stringify(Object.fromEntries(counts))}`)
    const varEvents = events.filter((e) => String(e.type).toLowerCase() === 'var')
    if (varEvents.length === 0) console.log('  No VAR events in this match')
    for (const e of varEvents) {
      console.log(`  VAR | minute ${e.time?.elapsed} | ${e.team?.name} | ${e.detail}`)
    }
  }

  console.log(`\n=== Kenya FKF Premier League (id 276), two weeks either side of today ===`)
  const ke = await call('fixtures', {
    league: 276,
    season: 2026,
    from: dayOffset(-14),
    to: dayOffset(14),
  })
  showErrors(ke.errors)
  const keFixtures: any[] = ke.response ?? []
  console.log(`  ${keFixtures.length} fixtures`)
  listFixtures(keFixtures)

  console.log('\n=== CAF Champions League ===')
  const caf = await call('leagues', { search: 'CAF Champions' })
  showErrors(caf.errors)
  for (const item of (caf.response ?? []).slice(0, 5)) {
    const seasons = item.seasons ?? []
    const latest = seasons.find((s: any) => s.current) ?? seasons[seasons.length - 1]
    const c = latest?.coverage
    console.log(
      `  id ${item.league.id} | ${item.league.name} | season ${latest?.year ?? '?'}` +
        (c ? ` | events:${c.fixtures?.events} lineups:${c.fixtures?.lineups} stats:${c.fixtures?.statistics_fixtures}` : ''),
    )
  }

  console.log('\n=== Live right now (all competitions) ===')
  const live = await call('fixtures', { live: 'all' })
  showErrors(live.errors)
  const liveFixtures: any[] = live.response ?? []
  console.log(`  ${liveFixtures.length} live matches`)
  for (const f of liveFixtures.slice(0, 10)) {
    console.log(
      `  ${f.league.country} - ${f.league.name} | ${f.fixture.status.elapsed ?? '?'}' | ` +
        `${f.teams.home.name} ${f.goals.home} - ${f.goals.away} ${f.teams.away.name}`,
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})