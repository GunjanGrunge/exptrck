'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, DollarSign, Calendar, RefreshCw, Clock } from 'lucide-react'
import { Income } from '@/types'
import { generateId } from '@/lib/utils'

const incomeSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  isRecurring: z.boolean(),
  frequency: z.enum(['monthly', 'weekly', 'yearly', 'daily', 'one-time']).optional(),
  category: z.enum(['salary', 'freelance', 'investment', 'business', 'rental', 'other']).optional(),
  description: z.string().optional(),
  nextPaymentDate: z.string().optional(),
})

type IncomeFormData = z.infer<typeof incomeSchema>

interface IncomeFormProps {
  onClose: () => void
  onSubmit: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => void
  income?: Income
}

export default function IncomeForm({ onClose, onSubmit, income }: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: income ? {
      source: income.source,
      amount: income.amount,
      isRecurring: income.isRecurring,
      frequency: (income.frequency && ['monthly', 'weekly', 'yearly', 'daily', 'one-time'].includes(income.frequency)) 
        ? income.frequency as 'monthly' | 'weekly' | 'yearly' | 'daily' | 'one-time'
        : 'monthly',
      category: (income.category && ['salary', 'freelance', 'investment', 'business', 'rental', 'other'].includes(income.category))
        ? income.category as 'salary' | 'freelance' | 'investment' | 'business' | 'rental' | 'other'
        : 'other',
      description: income.description || '',
      nextPaymentDate: income.nextPaymentDate ? new Date(income.nextPaymentDate).toISOString().split('T')[0] : '',
    } : {
      isRecurring: true,
      frequency: 'monthly',
      category: 'salary',
    }
  })

  const isRecurring = watch('isRecurring')

  const onFormSubmit = (data: IncomeFormData) => {
    const incomeData = {
      source: data.source,
      amount: data.amount,
      isRecurring: data.isRecurring,
      frequency: data.frequency || null,
      category: data.category || null,
      description: data.description || null,
      nextPaymentDate: data.nextPaymentDate ? new Date(data.nextPaymentDate) : null,
    }
    
    onSubmit(incomeData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-400 to-primary-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {income ? 'Edit Income Source' : 'Add New Income Source'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Source and Amount Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Income Source *
              </label>
              <input
                {...register('source')}
                type="text"
                className="input-field"
                placeholder="e.g., Main Job, Freelance Project, Dividends"
              />
              {errors.source && (
                <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (₹) *
              </label>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select {...register('category')} className="input-field">
              <option value="salary">💼 Salary</option>
              <option value="freelance">💻 Freelance</option>
              <option value="investment">📈 Investment</option>
              <option value="business">🏢 Business</option>
              <option value="rental">🏠 Rental</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Add any additional details about this income source..."
            />
          </div>

          {/* Recurring Toggle */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-primary-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Recurring Income</h3>
                  <p className="text-sm text-gray-600">This income repeats on a schedule</p>
                </div>
              </div>
              <input
                {...register('isRecurring')}
                type="checkbox"
                className="h-5 w-5 text-primary-400 focus:ring-primary-400 border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Frequency and Next Payment */}
          {isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Frequency</span>
                  </div>
                </label>
                <select {...register('frequency')} className="input-field">
                  <option value="daily">📅 Daily</option>
                  <option value="weekly">🗓️ Weekly</option>
                  <option value="monthly">📆 Monthly</option>
                  <option value="yearly">🎯 Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Next Payment Date</span>
                  </div>
                </label>
                <input
                  {...register('nextPaymentDate')}
                  type="date"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 font-medium"
            >
              {income ? 'Update Income' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
