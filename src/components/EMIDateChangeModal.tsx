'use client'

import { useState } from 'react'
import { X, Calendar, AlertTriangle } from 'lucide-react'
import { EMI } from '@/types'
import { AnimatedButton } from './ui/AnimatedButton'

interface EMIDateChangeModalProps {
  emi: EMI
  onClose: () => void
  onConfirm: (emi: EMI, newDate: Date, willDeleteExpense: boolean) => void
  relatedExpenseExists: boolean
}

export default function EMIDateChangeModal({ 
  emi, 
  onClose, 
  onConfirm,
  relatedExpenseExists 
}: EMIDateChangeModalProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const currentDate = new Date()
    const nextEMIDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), emi.dueDate)
    
    // If the due date has passed this month, show next month
    if (nextEMIDate <= currentDate) {
      nextEMIDate.setMonth(nextEMIDate.getMonth() + 1)
    }
    
    return nextEMIDate.toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newDate = new Date(selectedDate)
    
    if (isNaN(newDate.getTime())) {
      return
    }

    // Check if user is changing to a past date (which means reversing a payment)
    const currentEMIDate = new Date()
    currentEMIDate.setDate(emi.dueDate)
    
    const willDeleteExpense = newDate < currentEMIDate && relatedExpenseExists
    
    onConfirm(emi, newDate, willDeleteExpense)
  }

  const isDateInPast = () => {
    const newDate = new Date(selectedDate)
    const currentEMIDate = new Date()
    currentEMIDate.setDate(emi.dueDate)
    return newDate < currentEMIDate
  }

  const willAddInstallmentBack = () => {
    const newDate = new Date(selectedDate)
    const currentEMIDate = new Date()
    currentEMIDate.setDate(emi.dueDate)
    return newDate < currentEMIDate && emi.lastPaymentDate
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Change EMI Date
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              EMI: {emi.title}
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Current: {emi.dueDate}th of every month
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New EMI Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {isDateInPast() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Warning: Moving to Past Date</p>
                  <ul className="mt-1 text-yellow-700 space-y-1">
                    {willAddInstallmentBack() && (
                      <li>• Will add 1 installment back to remaining count</li>
                    )}
                    {relatedExpenseExists && (
                      <li>• Will delete the related expense entry</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <AnimatedButton
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {isDateInPast() ? 'Confirm & Reverse' : 'Update Date'}
            </AnimatedButton>
          </div>
        </form>
      </div>
    </div>
  )
}
