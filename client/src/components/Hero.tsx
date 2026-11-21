import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-page">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-live/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
        <span className="inline-block rounded-full border border-line bg-card px-4 py-1.5 text-xs font-semibold tracking-wide text-muted">
          Football analysis · VAR insights · AI assistant
        </span>

        <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-ink sm:text-6xl">
          See the game behind the whistle.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Compare teams head to head, check their recent form and see how their seasons stack
          up, all from real match data. VAR insights and an AI assistant are on the way.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/app"
            className="rounded-xl bg-chocolate px-7 py-3.5 font-bold text-page hover:opacity-90"
          >
            Open the app
          </Link>
          <Link
            to="/app"
            className="rounded-xl border-2 border-chocolate px-7 py-3.5 font-bold text-ink hover:bg-card"
          >
            Compare two teams
          </Link>
        </div>
      </div>
    </section>
  )
}