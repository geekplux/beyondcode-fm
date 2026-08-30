/** English-only. Messages keep next-intl-style tokens; formatMessage interpolates them. */

import { useMemo } from 'react'

import en from '../messages/en.json'
import { formatMessage } from './format-message'
import { episodePath, homePath, statsPath } from './locale'

export type Messages = typeof en

type Translator = (
  key: string,
  values?: Record<string, string | number>,
) => string

export function useLocalePaths() {
  return useMemo(
    () => ({
      home: homePath(),
      stats: statsPath(),
      episode: (id: string) => episodePath(id),
    }),
    [],
  )
}

export function useTranslations(namespace: keyof Messages): Translator {
  const table = en[namespace] as Record<string, string>
  return (key, values) => formatMessage(table[key] ?? key, values)
}
