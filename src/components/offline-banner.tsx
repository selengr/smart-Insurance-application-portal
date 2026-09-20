"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

type Props = {
  offlineLabel: string
  backOnlineLabel: string
}

export function OfflineBanner({ offlineLabel, backOnlineLabel }: Props) {
  const [offline, setOffline] = useState(false)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined

    const goOffline = () => {
      setOffline(true)
      setJustReconnected(false)
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }

    const goOnline = () => {
      setOffline(false)
      setJustReconnected(true)
      window.dispatchEvent(new Event("sip:applications-changed"))
      reconnectTimer = setTimeout(() => setJustReconnected(false), 3200)
    }

    setOffline(!navigator.onLine)
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }
  }, [])

  if (!offline && !justReconnected) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        offline
          ? "border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-100"
          : "border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-950 dark:text-emerald-100"
      }
    >
      <span className="inline-flex items-center justify-center gap-2">
        {offline ? <WifiOff className="h-4 w-4 shrink-0" aria-hidden /> : null}
        {offline ? offlineLabel : backOnlineLabel}
      </span>
    </div>
  )
}
