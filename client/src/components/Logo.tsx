type Tone = 'onLight' | 'onDark' | 'onBright'
type Props = { size?: number; withText?: boolean; tone?: Tone }

const tones: Record<Tone, { whistle: string; waves: string; dot: string; text: string }> = {
  onLight: {
    whistle: 'stroke-mark-green',
    waves: 'stroke-mark-orange',
    dot: 'fill-mark-orange',
    text: 'text-ink',
  },
  onDark: {
    whistle: 'stroke-live',
    waves: 'stroke-accent',
    dot: 'fill-accent',
    text: 'text-on-dark',
  },
  onBright: {
    whistle: 'stroke-sidebar',
    waves: 'stroke-sidebar',
    dot: 'fill-sidebar',
    text: 'text-sidebar',
  },
}

export default function Logo({ size = 36, withText = true, tone = 'onLight' }: Props) {
  const t = tones[tone]
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Kipenga logo"
      >
        <g className={t.whistle} strokeWidth="4.5">
          <circle cx="24" cy="42" r="14" />
          <path d="M24 28H56V37" />
        </g>
        <g className={t.waves} strokeWidth="4">
          <path d="M40 17q6-5 12 0" />
          <path d="M36 9q10-8 20 0" />
        </g>
        <circle cx="24" cy="42" r="4" className={t.dot} stroke="none" />
      </svg>
      {withText && (
        <span className={`font-display text-2xl font-bold tracking-wide ${t.text}`}>
          Kipenga
        </span>
      )}
    </span>
  )
}