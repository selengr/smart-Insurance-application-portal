"use client"

import { motion } from "motion/react"

type Props = {
  children: React.ReactNode
}

export function ConfirmationMotion({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="contents"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
