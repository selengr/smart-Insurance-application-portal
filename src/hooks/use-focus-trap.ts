"use client"

import { useEffect, useRef } from "react"

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

function getFocusable(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => {
    if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") {
      return false
    }
    if (el.tabIndex < 0) return false
    // offsetParent is null for some fixed/absolute trees — use client rects
    return el.getClientRects().length > 0
  })
}

/**
 * Traps Tab focus inside a dialog while active, focuses the first control
 * (or `[data-autofocus]`), and restores focus to the opener on close.
 */
export function useFocusTrap(
  active: boolean,
  onEscape?: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onEscapeRef = useRef(onEscape)
  onEscapeRef.current = onEscape

  useEffect(() => {
    if (!active) return

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const container = containerRef.current
    if (!container) return

    if (!container.hasAttribute("tabindex")) {
      container.tabIndex = -1
    }

    const focusInitial = () => {
      const preferred = container.querySelector<HTMLElement>("[data-autofocus]")
      const focusables = getFocusable(container)
      const target = preferred ?? focusables[0] ?? container
      target.focus()
    }

    const frame = requestAnimationFrame(focusInitial)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onEscapeRef.current?.()
        return
      }

      if (event.key !== "Tab") return

      const focusables = getFocusable(container)
      if (focusables.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const activeEl = document.activeElement

      if (event.shiftKey) {
        if (activeEl === first || activeEl === container) {
          event.preventDefault()
          last.focus()
        }
      } else if (activeEl === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("keydown", onKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [active])

  return containerRef
}
