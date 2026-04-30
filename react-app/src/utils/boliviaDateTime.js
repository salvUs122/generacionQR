const BOLIVIA_TIMEZONE = 'America/La_Paz'

const boliviaDateFormatter = new Intl.DateTimeFormat('es-BO', {
  timeZone: BOLIVIA_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const boliviaDateTimeFormatter = new Intl.DateTimeFormat('es-BO', {
  timeZone: BOLIVIA_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function normalizeDate(value) {
  if (!value) return null
  const dateValue = value instanceof Date ? value : new Date(value)
  return Number.isNaN(dateValue.getTime()) ? null : dateValue
}

export function formatBoliviaDate(value) {
  const normalized = normalizeDate(value)
  if (!normalized) return '--'
  return boliviaDateFormatter.format(normalized)
}

export function formatBoliviaDateTime(value) {
  const normalized = normalizeDate(value)
  if (!normalized) return '--'
  return boliviaDateTimeFormatter.format(normalized)
}
