import { Link, NavLink, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

const items = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/matches', label: 'Matches', end: false },
  { to: '/app/analysis', label: 'Match analysis', end: false },
  
]
const comingSoon = ['Live matches', 'VAR Room', 'Ask Kipenga']

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2.5 text-sm font-semibold ${
    isActive
      ? 'bg-white/10 text-on-dark'
      : 'text-on-dark/70 hover:bg-white/5 hover:text-on-dark'
  }`

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-page text-ink">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar p-5 text-on-dark md:flex">
        <Link to="/" aria-label="Kipenga home" className="mb-8 px-2">
          <Logo tone="onDark" />
        </Link>

        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          {comingSoon.map((label) => (
            <span
              key={label}
              className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-on-dark/40"
            >
              {label}
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] tracking-wide">
                SOON
              </span>
            </span>
          ))}
        </nav>

        <Link to="/" className="mt-auto px-4 py-2 text-sm text-on-dark/60 hover:text-on-dark">
          ← Back to site
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between bg-sidebar px-5 py-3 text-on-dark md:hidden">
          <Link to="/" aria-label="Kipenga home">
            <Logo size={28} tone="onDark" />
          </Link>
          <nav className="flex gap-4 text-sm font-semibold">
            <NavLink to="/app" end className="text-on-dark/80 hover:text-on-dark">
              Overview
            </NavLink>
            <NavLink to="/app/matches" className="text-on-dark/80 hover:text-on-dark">
              Matches
            </NavLink>
            <NavLink to="/app/analysis" className="text-on-dark/80 hover:text-on-dark">
              Analysis
            </NavLink>
          </nav>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}