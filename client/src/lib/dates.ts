// The visitor's own calendar date (not the UTC date), as YYYY-MM-DD
export function localDate(daysFromToday = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// How many hours the visitor's clock is ahead of UTC (Nairobi: 3)
export const hoursAheadOfUtc = -new Date().getTimezoneOffset() / 60