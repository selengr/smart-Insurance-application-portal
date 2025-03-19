"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { useThemeContext } from "./use-theme-context";
import useMounted from "@/hooks/use-mounted";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();

  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}
