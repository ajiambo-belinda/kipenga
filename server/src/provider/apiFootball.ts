import 'dotenv/config'

const BASE = 'https://v3.football.api-sports.io'
const RESERVE = 10 // stop calling the provider when this few requests are left today

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'

export type ProviderMatch = {
  externalId: number
  kickoffAt: Date
  status: MatchStatus
  statusShort: string
  minute: number | null
  homeGoals: number | null
  awayGoals: number | null
  seasonYear: number
  competition: { externalId: number; name: string; country: string }
  homeTeam: { externalId: number; name: string }
  awayTeam: { externalId: number; name: string }
}

let remainingToday: number | null = null

export function getRemainingRequests() {
  return remainingToday
}

async function request(endpoint: string, params: Record<string, string | number> = {}) {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) throw new Error('API_FOOTBALL_KEY is missing in server/.env')
  if (remainingToday !== null && remainingToday <= RESERVE) {
    throw new Error(`Only ${remainingToday} provider requests left today. Stopping to protect the daily limit.`)
  }

  const url = new URL(`${BASE}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  const res = await fetch(url, { headers: { 'x-apisports-key': key } })

  const left = res.headers.get('x-ratelimit-requests-remaining')
  if (left !== null) remainingToday = Number(left)

  if (res.status === 429) throw new Error('Provider rate limit reached (HTTP 429). Try again later.')
  if (!res.ok) throw new Error(`Provider error: HTTP ${res.status} for ${url.pathname}`)

  const body = await res.json()
  const errors = body.errors
  const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0
  if (hasErrors) throw new Error(`Provider message: ${JSON.stringify(errors)}`)
  return body
}

function mapStatus(short: string): MatchStatus {
  switch (short) {
    case 'TBD':
    case 'NS':
      return 'SCHEDULED'
    case '1H':
    case 'HT':
    case '2H':
    case 'ET':
    case 'BT':
    case 'P':
    case 'SUSP':
    case 'INT':
    case 'LIVE':
      return 'LIVE'
    case 'FT':
    case 'AET':
    case 'PEN':
    case 'AWD':
    case 'WO':
      return 'FINISHED'
    case 'PST':
      return 'POSTPONED'
    case 'CANC':
    case 'ABD':
      return 'CANCELLED'
    default:
      return 'SCHEDULED'
  }
}

function normalize(f: any): ProviderMatch {
  const short: string = f.fixture.status.short
  return {
    externalId: f.fixture.id,
    kickoffAt: new Date(f.fixture.date),
    status: mapStatus(short),
    statusShort: short,
    minute: f.fixture.status.elapsed ?? null,
    homeGoals: f.goals.home ?? null,
    awayGoals: f.goals.away ?? null,
    seasonYear: f.league.season,
    competition: { externalId: f.league.id, name: f.league.name, country: f.league.country },
    homeTeam: { externalId: f.teams.home.id, name: f.teams.home.name },
    awayTeam: { externalId: f.teams.away.id, name: f.teams.away.name },
  }
}

export async function getFixturesByDate(date: string): Promise<ProviderMatch[]> {
  const body = await request('fixtures', { date })
  return (body.response ?? []).map(normalize)
}

export async function getLiveFixtures(): Promise<ProviderMatch[]> {
  const body = await request('fixtures', { live: 'all' })
  return (body.response ?? []).map(normalize)
}