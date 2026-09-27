import Link from "next/link"
import styles from "./nav.module.css"
import { Locale } from "../../../i18n.config"
import LocaleSwitcher from "./locale-switcher"
import { getDictionary } from "@/lib/dictionary"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { auth } from "@/lib/auth"
import { signOutDemo } from "@/lib/auth-actions"
import { MobileNav } from "./mobile-nav"

const Navbar = async ({ lang }: { lang: Locale }) => {
  const { navigation, page } = await getDictionary(lang)
  const session = await auth()
  const signedIn = Boolean(session)

  return (
    <nav className={styles["landing-top"]} aria-label={page.common.mainNav}>
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
          <MobileNav
            lang={lang}
            products={navigation.products}
            policies={navigation.policies}
            about={navigation.about}
            menuLabel={page.common.openMenu}
            closeLabel={page.common.closeMenu}
            signedIn={signedIn}
            signInLabel={navigation.signIn}
            signOutLabel={navigation.signOut}
          />
          <LocaleSwitcher label={page.common.language} />
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
