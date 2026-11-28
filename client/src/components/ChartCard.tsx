import type { ReactNode } from 'react'

type Props = { title: string; subtitle?: string; children: ReactNode }

export default function ChartCard({ title, subtitle, children }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="m-0 text-lg">{title}</h2>
      {subtitle && <p className="m-0 mt-1 text-xs text-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}