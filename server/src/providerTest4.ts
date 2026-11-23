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
  await sleep(3000)
  return body
}

function showErrors(errors: unknown) {
  const has = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0
  if (has) console.log('  PROVIDER MESSAGE:', JSON.stringify(errors))
}

const norm = (s: string) => s.toLowerCase().replace(/[-\s]/g, '')
const africanCountries = [
  'kenya', 'tanzania', 'uganda', 'rwanda', 'ethiopia', 'southafrica', 'nigeria', 'ghana',
  'egypt', 'morocco', 'algeria', 'tunisia', 'cameroon', 'senegal', 'zambia', 'zimbabwe',
  'ivorycoast', 'drcongo', 'angola', 'mali', 'sudan', 'libya',
]

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
}

async function main() {
  const today = new Date().toISOString().slice(0, 10)

  console.log(`\n=== African fixtures on ${today} (from one date request) ===`)
  const d = await call('fixtures', { date: today })
  showErrors(d.errors)
  const all: any[] = d.response ?? []

  const statuses: Record<string, number> = {}
  for (const f of all) statuses[f.fixture.status.short] = (statuses[f.fixture.status.short] ?? 0) + 1
  console.log(`  ${all.length} fixtures in total. By status: ${JSON.stringify(statuses)}`)

  const african = all.filter(
    (f) => africanCountries.includes(norm(f.league.country ?? '')) || /caf|africa|cecafa/i.test(f.league.name),
  )
  console.log(`  ${african.length} African fixtures`)
  for (const f of african.slice(0, 30)) {
    console.log(
      `  ${f.league.country} - ${f.league.name} | ${f.fixture.date?.slice(11, 16)} UTC | ` +
        `${f.fixture.status.short} ${f.fixture.status.elapsed ?? ''} | ` +
        `${f.teams.home.name} ${f.goals.home ?? '-'} - ${f.goals.away ?? '-'} ${f.teams.away.name}`,
    )
  }

  console.log('\n=== Kenya FKF Premier League, 2024 season ===')
  const ke = await call('fixtures', { league: 276, season: 2024 })
  showErrors(ke.errors)
  const keAll: any[] = ke.response ?? []
  const keDone = keAll.filter((f) => f.fixture.status.short === 'FT')
  console.log(`  ${keAll.length} fixtures, ${keDone.length} finished`)
  for (const f of keDone.slice(0, 5)) console.log('  ' + line(f))
  for (const f of keDone.slice(0, 2)) {
    console.log(`\n  Events for ${f.teams.home.name} v ${f.teams.away.name}`)
    await eventSummary(f.fixture.id)
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})