type Props = {
  label: string
  value: string | number
  hint?: string
  colour: string
}

export default function StatTile({ label, value, hint, colour }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5">
      <div className={`h-14 w-2.5 shrink-0 rounded-full ${colour}`} />
      <div>
        <p className="font-display text-3xl font-bold leading-none text-ink">{value}</p>
        <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  )
}