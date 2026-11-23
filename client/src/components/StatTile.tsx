type IconName = 'live' | 'matches' | 'var' | 'ai'

type Props = {
  icon: IconName
  label: string
  value: string | number
  hint?: string
  colour: string // background class for the icon block, for example bg-live
}

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 26 26"
      fill="none"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="stroke-sidebar"
    >
      {name === 'live' && (
        <>
          <circle cx="13" cy="13" r="3.5" className="fill-sidebar" />
          <circle cx="13" cy="13" r="9" />
        </>
      )}
      {name === 'matches' && (
        <>
          <rect x="3" y="5" width="20" height="16" rx="3" />
          <path d="M3 10h20M9 3v4M17 3v4" />
        </>
      )}
      {name === 'var' && (
        <>
          <rect x="3" y="5" width="20" height="14" rx="3" />
          <path d="M11 9l5 3-5 3z" className="fill-sidebar" />
        </>
      )}
      {name === 'ai' && <path d="M4 5h18v12H12l-5 4v-4H4z" />}
    </svg>
  )
}

export default function StatTile({ icon, label, value, hint, colour }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${colour}`}>
        <Icon name={icon} />
      </div>
      <div className="min-w-0">
        <p className="font-display text-3xl font-bold leading-none text-ink">{value}</p>
        <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  )
}