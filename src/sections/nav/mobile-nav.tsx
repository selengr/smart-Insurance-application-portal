"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"
import { Menu, X } from "lucide-react"
import styles from "./nav.module.css"
import { signOutDemo } from "@/lib/auth-actions"

type Props = {
  lang: string
  products: string
  policies: string
  about: string
  menuLabel: string
  closeLabel: string
  signedIn: boolean
  signInLabel: string
  signOutLabel: string
}

export function MobileNav({
  lang,
  products,
  policies,
  about,
  menuLabel,
  closeLabel,
  signedIn,
  signInLabel,
  signOutLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    const firstLink = panelRef.current?.querySelector<HTMLElement>("a,button")
    firstLink?.focus()

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <div className={styles.mobileNav}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : menuLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className={styles.mobilePanel}
          role="menu"
        >
          <a
            href={`/${lang}#products`}
            className={styles.mobileLink}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {products}
          </a>
          <Link
            href={`/${lang}/purchased-insurances`}
            className={styles.mobileLink}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {policies}
          </Link>
          <Link
            href={`/${lang}/about`}
            className={styles.mobileLink}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {about}
          </Link>
          <div className={styles.mobileDivider} aria-hidden />
          {signedIn ? (
            <form action={signOutDemo.bind(null, lang)}>
              <button type="submit" className={styles.mobileLink} role="menuitem">
                {signOutLabel}
              </button>
            </form>
          ) : (
            <Link
              href={`/${lang}/login`}
              className={styles.mobileLink}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {signInLabel}
            </Link>
          )}
        </div>
      ) : null}
    </div>
  )
}
