import 'dotenv/config'

const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) throw new Error('API_FOOTBALL_KEY is missing in server/.env')

const BASE = 'https://v3.football.api-sports.io'

async function call(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${BASE}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const res = await fetch(url, { headers: { 'x-apisports-key': KEY! } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.pathname}`)
  const body = await res.json()
  const remaining = res.headers.get('x-ratelimit-requests-remaining') ?? 'unknown'
  return { body, remaining }
}

function showErrors(errors: unknown) {
  const has = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0
  if (has) console.log('  PROVIDER MESSAGE:', JSON.stringify(errors))
}

const wanted: { label: string; params: Record<string, string> }[] = [
  { label: 'England (Premier League and others)', params: { country: 'England' } },
  { label: 'Spain', params: { country: 'Spain' } },
  { label: 'Italy', params: { country: 'Italy' } },
  { label: 'Germany', params: { country: 'Germany' } },
  { label: 'France', params: { country: 'France' } },
  { label: 'Kenya (all competitions)', params: { country: 'Kenya' } },
  { label: 'South Africa', params: { country: 'South-Africa' } },
  { label: 'Egypt', params: { country: 'Egypt' } },
  { label: 'Nigeria', params: { country: 'Nigeria' } },
  { label: 'Tanzania', params: { country: 'Tanzania' } },
  { label: 'CAF Champions League', params: { search: 'CAF Champions' } },
  { label: 'CAF Confederation Cup', params: { search: 'CAF Confederation' } },
  { label: 'Africa Cup of Nations', params: { search: 'Africa Cup' } },
  { label: 'UEFA Champions League', params: { search: 'UEFA Champions' } },
]

async function main() {
  let remaining = 'unknown'

  console.log('\n=== Coverage by country (current competitions) ===')
  const all = await call('leagues', { current: 'true' })
  remaining = all.remaining
  showErrors(all.body.errors)
  const list: any[] = all.body.response ?? []
  console.log(`  ${list.length} current competitions in total`)

  const norm = (s: string) => s.toLowerCase().replace(/[-\s]/g, '')
  const countries = [
    'England', 'Spain', 'Italy', 'Germany', 'France',
    'Kenya', 'South-Africa', 'Egypt', 'Nigeria', 'Tanzania', 'Uganda', 'Ghana',
    'Morocco', 'Algeria', 'Tunisia', 'Ethiopia', 'Zambia', 'Rwanda', 'Cameroon', 'Senegal',
  ]
  for (const c of countries) {
    const found = list.filter((x) => norm(x.country?.name ?? '') === norm(c))
    const names = found.slice(0, 4).map((x) => x.league.name).join(', ')
    console.log(`  ${c}: ${found.length} competitions${found.length ? ` (${names})` : ''}`)
  }
  const africa = list.filter((x) => /caf|africa/i.test(x.league.name))
  console.log(
    `  Competitions with CAF or Africa in the name: ${africa.map((x) => x.league.name).join(', ') || 'none'}`,
  )

  for (const w of wanted) {
    console.log(`\n=== ${w.label} ===`)
    const { body, remaining: r } = await call('leagues', w.params)
    remaining = r
    showErrors(body.errors)
    const items = (body.response ?? []).slice(0, 25)
    if (items.length === 0) console.log('  nothing found')
    for (const item of items) {
      const seasons = item.seasons ?? []
      const latest = seasons.find((s: any) => s.current) ?? seasons[seasons.length - 1]
      const cov = latest?.coverage
      console.log(
        `  id ${item.league.id} | ${item.league.name} | ${item.league.type} | ${item.country?.name} | season ${latest?.year ?? '?'}` +
          (cov
            ? ` | fixtures events:${cov.fixtures?.events} lineups:${cov.fixtures?.lineups} stats:${cov.fixtures?.statistics_fixtures} | standings:${cov.standings}`
            : ''),
      )
    }
  }

  console.log('\n=== Fixtures today (all competitions) ===')
  const today = new Date().toISOString().slice(0, 10)
  const { body, remaining: r } = await call('fixtures', { date: today })
  remaining = r
  showErrors(body.errors)
  const fixtures: any[] = body.response ?? []
  console.log(`  ${today}: ${fixtures.length} fixtures returned`)
  const leagues = new Set(fixtures.map((f) => `${f.league.country} - ${f.league.name}`))
  console.log(`  ${leagues.size} competitions today. First 40:`)
  console.log('  ' + [...leagues].slice(0, 40).join('\n  '))

  console.log(`\nRequests remaining today (if the provider reports it): ${remaining}`)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})