import Link from 'next/link'
import styles from "./nav.module.css"
import { Locale } from '../../../i18n.config'
import LocaleSwitcher from './locale-switcher'
import { getDictionary } from '@/lib/dictionary'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const Navbar = async ({ lang }: { lang: Locale }) => {
  const { navigation } = await getDictionary(lang)

  return (
    <nav className="border-b py-3" aria-label="Main">
      <div className={`${styles["landing-top"]} flex items-center justify-between`}>
        <div className="flex justify-end flex-row align-middle items-center w-full pr-[1%] gap-3">
          <Link
            href={`/${lang}`}
            className="text-sm font-medium hover:underline"
          >
            {navigation.home}
          </Link>
          <ThemeToggle />
        </div>

        <div className="cover-individuals fixed sm:left-2 left-0 flex justify-center align-middle items-center">
          <LocaleSwitcher />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
