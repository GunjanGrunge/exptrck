'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  rows?: number
}

export function Skeleton({ className = '', rows = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg h-4 mb-3 last:mb-0"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            backgroundSize: '200% 100%'
          }}
        />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-8 mb-4"></div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 mb-3">
          <div className="bg-gray-200 rounded-lg h-6 w-1/4"></div>
          <div className="bg-gray-200 rounded-lg h-6 w-1/4"></div>
          <div className="bg-gray-200 rounded-lg h-6 w-1/4"></div>
          <div className="bg-gray-200 rounded-lg h-6 w-1/4"></div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="bg-gray-200 rounded-lg h-6 w-3/4 mb-4"></div>
      <div className="bg-gray-200 rounded-lg h-4 w-1/2 mb-2"></div>
      <div className="bg-gray-200 rounded-lg h-4 w-2/3"></div>
    </div>
  )
}
