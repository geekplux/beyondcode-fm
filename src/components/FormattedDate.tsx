import type { TimeHTMLAttributes } from 'react'
import { useMemo } from 'react'

import { useLocale } from '../lib/i18n'

export function FormattedDate({
  date,
  ...props
}: TimeHTMLAttributes<HTMLTimeElement> & { date: Date }) {
  const locale = useLocale()
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [locale],
  )

  return (
    <time dateTime={date.toISOString()} {...props}>
      {dateFormatter.format(date)}
    </time>
  )
}
