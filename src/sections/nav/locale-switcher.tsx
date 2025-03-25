'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { i18n } from '../../../i18n.config'

export default function LocaleSwitcher() {
  const pathName = usePathname()

  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <ul className='flex gap-x-3 pl-[20%]'>
      {i18n.locales.map(locale => {
        return (
          <li key={locale}>
            <Link
              href={redirectedPathName(locale)}
              className='rounded-md border py-1 px-2 md:px-3 md:py-2 dark:border-black'
            >
              {locale}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}