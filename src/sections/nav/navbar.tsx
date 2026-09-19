import Link from "next/link"
import { cookies } from "next/headers"
import styles from "./nav.module.css"
import { Locale } from "../../../i18n.config"
import LocaleSwitcher from "./locale-switcher"
import { getDictionary } from "@/lib/dictionary"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { DEMO_SESSION_COOKIE } from "@/lib/auth-session"
import { signOutDemo } from "@/lib/auth-actions"

const Navbar = async ({ lang }: { lang: Locale }) => {
  const { navigation, page } = await getDictionary(lang)
  const jar = await cookies()
  const signedIn = jar.get(DEMO_SESSION_COOKIE)?.value === "1"

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
          <Link href={`/${lang}/about`} className={styles.link}>
            {navigation.about}
          </Link>
        </div>

        <div className={styles.actions}>
          <LocaleSwitcher />
          {signedIn ? (
            <form action={signOutDemo.bind(null, lang)}>
              <button type="submit" className={styles.link}>
                {navigation.signOut}
              </button>
            </form>
          ) : (
            <Link href={`/${lang}/login`} className={styles.link}>
              {navigation.signIn}
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
