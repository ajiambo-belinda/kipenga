import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './db.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
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

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})