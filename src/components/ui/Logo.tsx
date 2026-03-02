'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  // If logo image fails to load or doesn't exist, show the text fallback
  if (imageError) {
    return (
      <motion.div
        className={`${sizes[size]} ${className} flex items-center justify-center rounded-full bg-accent-100`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-sm font-bold text-accent-600">V</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`${sizes[size]} ${className} rounded-full overflow-hidden border-2 border-accent-200 shadow-md`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img
        src="/logo.png"
        alt="Vyay"
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </motion.div>
  )
}
