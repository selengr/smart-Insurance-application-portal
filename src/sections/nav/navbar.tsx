import Link from "next/link"
import styles from "./nav.module.css"
import { Locale } from "../../../i18n.config"
import LocaleSwitcher from "./locale-switcher"
import { getDictionary } from "@/lib/dictionary"
import { ThemeToggle } from "@/components/theme/theme-toggle"

const Navbar = async ({ lang }: { lang: Locale }) => {
  const { navigation, page } = await getDictionary(lang)

  return (
    <nav className={styles["landing-top"]} aria-label="Main">
      <div className={styles.inner}>
        <Link href={`/${lang}`} className={styles.brand}>
          {page.home.brand}
        </Link>

        <div className={styles.links}>
          <a href={`/${lang}#products`} className={styles.link}>
            {navigation.products}
          </a>
          <Link href={`/${lang}/purchased-insurances`} className={styles.link}>
            {navigation.policies}
          </Link>
        </div>

        <div className={styles.actions}>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
