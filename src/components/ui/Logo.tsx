'use client'

import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      className={`${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background Circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="url(#gradient1)"
          stroke="url(#gradient2)"
          strokeWidth="2"
        />
        
        {/* Money Symbol */}
        <path
          d="M20 8v2.5M20 29.5V32M14 15h12c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Dollar Sign */}
        <motion.path
          d="M20 13v14M16 18h8M16 22h8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#759ab7" />
            <stop offset="50%" stopColor="#5a7a94" />
            <stop offset="100%" stopColor="#ce6e55" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#04132a" />
            <stop offset="100%" stopColor="#759ab7" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}
