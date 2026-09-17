'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { i18n } from '../../../i18n.config'

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  fa: 'فارسی',
}

export default function LocaleSwitcher() {
  const pathName = usePathname()
  const activeLocale = pathName?.split('/')[1]

  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <nav aria-label="Language">
      <ul className="flex gap-x-3 pl-[20%]">
        {i18n.locales.map((locale) => {
          const isActive = locale === activeLocale
          return (
            <li key={locale}>
              <Link
                href={redirectedPathName(locale)}
                hrefLang={locale}
                lang={locale}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-md border py-1 px-2 md:px-3 md:py-2 dark:border-black ${
                  isActive ? 'bg-muted font-semibold' : ''
                }`}
              >
                {LOCALE_LABELS[locale] ?? locale}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
