import Link from "next/link"
import { Locale } from "../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"

export default async function SiteFooter({ lang }: { lang: Locale }) {
  const { page, navigation } = await getDictionary(lang)
  const year = new Date().getFullYear()
  const footer = page.footer

  return (
    <footer className="relative mt-auto border-t border-border bg-background/80">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.1),_transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight">
            {page.home.brand}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {footer.tagline}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {footer.demoNote}
          </p>
        </div>

        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {footer.explore}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href={`/${lang}`} className="text-muted-foreground hover:text-foreground">
                {navigation.home}
              </Link>
            </li>
            <li>
              <a href={`/${lang}#products`} className="text-muted-foreground hover:text-foreground">
                {navigation.products}
              </a>
            </li>
            <li>
              <Link
                href={`/${lang}/purchased-insurances`}
                className="text-muted-foreground hover:text-foreground"
              >
                {navigation.policies}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/about`} className="text-muted-foreground hover:text-foreground">
                {navigation.about}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {footer.legalLabel}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href={`/${lang}/privacy`} className="text-muted-foreground hover:text-foreground">
                {footer.privacy}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/terms`} className="text-muted-foreground hover:text-foreground">
                {footer.terms}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {year} {page.home.brand}. {footer.rights}
        </p>
      </div>
    </footer>
  )
}
