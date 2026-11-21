import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  return (
    <header className="bg-chocolate text-on-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Kipenga home">
          <Logo tone="onDark" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold sm:gap-8">
          <Link to="/app" className="hidden text-on-dark/70 hover:text-on-dark sm:inline">
            Match analysis
          </Link>
          <Link
            to="/app"
            className="rounded-lg bg-live px-4 py-2 text-sidebar hover:opacity-90"
          >
            Open the app
          </Link>
        </nav>
      </div>
    </header>
  )
}