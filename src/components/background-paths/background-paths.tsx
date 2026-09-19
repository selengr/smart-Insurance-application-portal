"use client"

import { motion } from "motion/react"

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.45 + i * 0.025,
  }))

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg className="h-full w-full text-foreground" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.04 + path.id * 0.012}
            initial={{ pathLength: 0.25, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.45, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 22 + path.id * 0.35,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

/** Quiet atmospheric layer — no competing headline */
export default function BackgroundPaths({
  children,
}: {
  children: React.ReactNode
  title?: string
  lang?: string
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.85_0.06_195/0.35),transparent_55%),radial-gradient(ellipse_at_90%_20%,oklch(0.9_0.07_85/0.28),transparent_50%),linear-gradient(180deg,var(--background),oklch(0.94_0.02_200/0.5))] dark:bg-[radial-gradient(ellipse_at_15%_0%,oklch(0.35_0.06_195/0.35),transparent_55%),radial-gradient(ellipse_at_85%_10%,oklch(0.35_0.05_85/0.2),transparent_50%),linear-gradient(180deg,var(--background),oklch(0.14_0.02_220))]" />
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
