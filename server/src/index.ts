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

app.get('/api/teams', async (_req, res) => {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } })
  res.json(teams)
})

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})