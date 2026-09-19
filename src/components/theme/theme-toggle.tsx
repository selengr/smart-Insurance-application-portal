"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useParams } from "next/navigation"

import { useThemeContext } from "./use-theme-context"
import useMounted from "@/hooks/use-mounted"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"

export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext()
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const label = (lang === "fa" ? fa : en).page.common.toggleTheme

  const mounted = useMounted()
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 transition-colors hover:bg-muted"
      aria-label={label}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  )
}
