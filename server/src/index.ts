import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './db.js'
import { getHeadToHead } from './analysis/headToHead.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/teams', async (_req, res) => {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } })
  res.json(teams)
})

app.get('/api/matches', async (req, res) => {
  const season = typeof req.query.season === 'string' ? req.query.season : undefined
  const limit = Math.min(Number(req.query.limit) || 20, 100)

  const matches = await prisma.match.findMany({
    where: season ? { season } : undefined,
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
  res.json(matches)
})

app.get('/api/head-to-head', async (req, res) => {
  const teamA = Number(req.query.teamA)
  const teamB = Number(req.query.teamB)
  if (!Number.isInteger(teamA) || !Number.isInteger(teamB) || teamA === teamB) {
    res.status(400).json({ error: 'Provide two different team ids, like ?teamA=1&teamB=2' })
    return
  }
  const limit = Math.min(Number(req.query.limit) || 10, 50)
  res.json(await getHeadToHead(teamA, teamB, limit))
})

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})