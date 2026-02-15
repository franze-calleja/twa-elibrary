'use client'

import { PropsWithChildren } from 'react'
import { motion, Variants } from 'framer-motion'

type Props = PropsWithChildren<{
  className?: string
  variants?: Variants
  delay?: number
}>

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
}

export default function MotionWrapper({ children, className = '', variants, delay = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants || defaultVariants}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
