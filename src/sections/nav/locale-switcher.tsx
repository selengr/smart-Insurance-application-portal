'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { i18n } from '../../../i18n.config'

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  fa: 'FA',
}

export default function LocaleSwitcher({ label }: { label?: string }) {
  const pathName = usePathname()
  const activeLocale = pathName?.split('/')[1]

  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <div
      className="inline-flex items-center rounded-md border border-border bg-background/70 p-0.5"
      role="navigation"
      aria-label={label ?? 'Language'}
    >
      {i18n.locales.map((locale) => {
        const isActive = locale === activeLocale
        return (
          <Link
            key={locale}
            href={redirectedPathName(locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded px-2.5 py-1 text-xs font-semibold tracking-wide transition ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {LOCALE_LABELS[locale] ?? locale}
          </Link>
        )
      })}
    </div>
  )
}
