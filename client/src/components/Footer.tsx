import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t-4 border-live bg-night text-on-dark">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo size={28} tone="onDark" />
          <p className="mt-3 max-w-sm text-sm text-on-dark/70">
            Football analysis and VAR insights, explained clearly and fairly.
          </p>
        </div>
        <nav className="flex gap-6 text-sm font-semibold text-on-dark/80">
          <Link to="/" className="hover:text-on-dark">
            Home
          </Link>
          <Link to="/app" className="hover:text-on-dark">
            Match analysis
          </Link>
        </nav>
      </div>

      <div className="border-t border-on-dark/10 px-6 py-4 text-center text-xs text-on-dark/60">
        © {new Date().getFullYear()} Kipenga. Statistics are based on public match results.
        Estimates are not guarantees. 18+. Please gamble responsibly.
      </div>
    </footer>
  )
}