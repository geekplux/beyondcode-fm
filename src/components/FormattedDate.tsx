import type { TimeHTMLAttributes } from 'react'
import { useMemo } from 'react'

export function FormattedDate({
  date,
  ...props
}: TimeHTMLAttributes<HTMLTimeElement> & { date: Date }) {
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [],
  )

  return (
    <time dateTime={date.toISOString()} {...props}>
      {dateFormatter.format(date)}
    </time>
  )
}
