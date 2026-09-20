"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import styles from "./nav.module.css"

type Props = {
  lang: string
  products: string
  policies: string
  about: string
  menuLabel: string
  closeLabel: string
}

export function MobileNav({
  lang,
  products,
  policies,
  about,
  menuLabel,
  closeLabel,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.mobileNav}>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? closeLabel : menuLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div id="mobile-nav-panel" className={styles.mobilePanel}>
          <a
            href={`/${lang}#products`}
            className={styles.mobileLink}
            onClick={() => setOpen(false)}
          >
            {products}
          </a>
          <Link
            href={`/${lang}/purchased-insurances`}
            className={styles.mobileLink}
            onClick={() => setOpen(false)}
          >
            {policies}
          </Link>
          <Link
            href={`/${lang}/about`}
            className={styles.mobileLink}
            onClick={() => setOpen(false)}
          >
            {about}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
