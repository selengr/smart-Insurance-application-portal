import Link from "next/link"
import { Locale } from "../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"

export default async function SiteFooter({ lang }: { lang: Locale }) {
  const { page, navigation } = await getDictionary(lang)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight">
            {page.home.brand}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{page.footer.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href={`/${lang}`} className="text-muted-foreground hover:text-foreground">
            {navigation.home}
          </Link>
          <a href={`/${lang}#products`} className="text-muted-foreground hover:text-foreground">
            {navigation.products}
          </a>
          <Link
            href={`/${lang}/purchased-insurances`}
            className="text-muted-foreground hover:text-foreground"
          >
            {navigation.policies}
          </Link>
          <Link href={`/${lang}/privacy`} className="text-muted-foreground hover:text-foreground">
            {page.footer.privacy}
          </Link>
          <Link href={`/${lang}/terms`} className="text-muted-foreground hover:text-foreground">
            {page.footer.terms}
          </Link>
        </div>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {year} {page.home.brand}. {page.footer.rights}
        </p>
      </div>
    </footer>
  )
}
