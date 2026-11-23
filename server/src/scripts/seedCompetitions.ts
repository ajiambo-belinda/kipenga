import { prisma } from '../db.js'

// The ids come from your provider test output. Tier 1 gets live updates first.
const competitions = [
  { externalId: 39, name: 'Premier League', country: 'England', type: 'League', tier: 1 },
  { externalId: 40, name: 'Championship', country: 'England', type: 'League', tier: 2 },
  { externalId: 140, name: 'La Liga', country: 'Spain', type: 'League', tier: 1 },
  { externalId: 135, name: 'Serie A', country: 'Italy', type: 'League', tier: 1 },
  { externalId: 78, name: 'Bundesliga', country: 'Germany', type: 'League', tier: 1 },
  { externalId: 61, name: 'Ligue 1', country: 'France', type: 'League', tier: 1 },
  { externalId: 276, name: 'FKF Premier League', country: 'Kenya', type: 'League', tier: 1 },
  { externalId: 277, name: 'Super League', country: 'Kenya', type: 'League', tier: 2 },
  { externalId: 971, name: 'Shield Cup', country: 'Kenya', type: 'Cup', tier: 2 },
  { externalId: 288, name: 'Premier Soccer League', country: 'South-Africa', type: 'League', tier: 1 },
  { externalId: 233, name: 'Premier League', country: 'Egypt', type: 'League', tier: 2 },
  { externalId: 399, name: 'NPFL', country: 'Nigeria', type: 'League', tier: 2 },
  { externalId: 12, name: 'CAF Champions League', country: 'World', type: 'Cup', tier: 1 },
]

async function main() {
  for (const c of competitions) {
    await prisma.competition.upsert({
      where: { externalId: c.externalId },
      update: { name: c.name, country: c.country, type: c.type, tier: c.tier },
      create: { ...c, enabled: true },
    })
  }
  const total = await prisma.competition.count()
  console.log(`Competitions in the database: ${total}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())