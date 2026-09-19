import Link from 'next/link'
import styles from "./nav.module.css"
import { Locale } from '../../../i18n.config'
import LocaleSwitcher from './locale-switcher'
import { getDictionary } from '@/lib/dictionary'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const Navbar = async ({ lang }: { lang: Locale }) => {
  const { navigation } = await getDictionary(lang)

  return (
    <nav
      className={`${styles["landing-top"]} border-b border-border/60`}
      aria-label="Main"
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/${lang}`}
          className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight text-foreground"
        >
          Smart Insurance
        </Link>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href={`/${lang}`}
            className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline"
          >
            {navigation.home}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
