'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { EMI } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface EMISummaryModalProps {
  emis: EMI[]
  isOpen: boolean
  onClose: () => void
}

interface EMISummaryBySate {
  date: number
  emis: EMI[]
  total: number
}

export default function EMISummaryModal({ emis, isOpen, onClose }: EMISummaryModalProps) {
  // Group EMIs by due date
  const summaryByDate: EMISummaryBySate[] = emis
    .reduce((acc: EMISummaryBySate[], emi) => {
      const existingDate = acc.find(item => item.date === emi.dueDate)
      
      if (existingDate) {
        existingDate.emis.push(emi)
        existingDate.total += emi.amount
      } else {
        acc.push({
          date: emi.dueDate,
          emis: [emi],
          total: emi.amount
        })
      }
      
      return acc
    }, [])
    .sort((a, b) => a.date - b.date) // Sort by date

  const grandTotal = summaryByDate.reduce((sum, item) => sum + item.total, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="emi-summary-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            key="emi-summary-modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 p-6 flex items-center justify-between border-b border-primary-200">
              <h2 className="text-2xl font-bold text-white">EMI Summary by Date</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {summaryByDate.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No EMIs to summarize</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {summaryByDate.map((summary) => (
                    <motion.div
                      key={summary.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Date Header */}
                      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 border-b border-primary-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-primary-900">
                            {summary.date}
                            <span className="text-sm text-primary-600 ml-2">
                              (Monthly)
                            </span>
                          </h3>
                          <span className="text-lg font-bold text-primary-700">
                            {formatCurrency(summary.total)}
                          </span>
                        </div>
                      </div>

                      {/* EMI Items */}
                      <div className="divide-y divide-gray-200">
                        {summary.emis.map((emi) => (
                          <div
                            key={emi.id}
                            className="p-4 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{emi.title}</p>
                                {emi.creditCardId && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Credit Card: {emi.creditCardId}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-accent-600 ml-4">
                                {formatCurrency(emi.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {/* Grand Total */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-accent-50 to-accent-100 p-6 rounded-lg border-2 border-accent-200 mt-8"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-accent-900">
                        Total Monthly EMI Obligation
                      </span>
                      <span className="text-3xl font-bold text-accent-700">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </motion.div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                        Payment Dates
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {summaryByDate.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                        Total EMIs
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {emis.length}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600 font-semibold uppercase mb-1">
                        Average per Date
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(grandTotal / summaryByDate.length)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
