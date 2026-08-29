import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'

import en from '../messages/en.json'
import zhCN from '../messages/zh-CN.json'
import { formatMessage } from './format-message'
import { episodePath, homePath, type Locale } from './locale'

export type Messages = typeof en

const catalogs: Record<Locale, Messages> = {
  en,
  'zh-CN': zhCN,
}

type Translator = (
  key: string,
  values?: Record<string, string | number>,
) => string

type I18nContextValue = {
  locale: Locale
  messages: Messages
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  messages: en,
})

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const value = useMemo(
    () => ({ locale, messages: catalogs[locale] ?? en }),
    [locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useLocale() {
  return useContext(I18nContext).locale
}

export function useLocalePaths() {
  const locale = useLocale()
  return useMemo(
    () => ({
      home: homePath(locale),
      episode: (id: string) => episodePath(locale, id),
    }),
    [locale],
  )
}

export function useTranslations(namespace: keyof Messages): Translator {
  const { messages } = useContext(I18nContext)
  const table = messages[namespace] as Record<string, string>
  return (key, values) => formatMessage(table[key] ?? key, values)
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en
}
