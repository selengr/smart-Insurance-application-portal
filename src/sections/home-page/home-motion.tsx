"use client"

import { motion, useReducedMotion } from "motion/react"

const ease = [0.22, 1, 0.36, 1] as const

type ChildrenProps = {
  children: React.ReactNode
  className?: string
}

export function HomeHeroCopyMotion({ children, className }: ChildrenProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.09, delayChildren: 0.04 },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function HomeHeroItemMotion({ children, className }: ChildrenProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function HomeHeroMediaMotion({ children, className }: ChildrenProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1.045, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease }}
    >
      {children}
    </motion.div>
  )
}

export function HomeProductCardMotion({
  children,
  index,
}: {
  children: React.ReactNode
  index: number
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <li>{children}</li>
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.18 + index * 0.07,
        ease,
      }}
    >
      {children}
    </motion.li>
  )
}
