'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Income } from '@/types'
import { generateId } from '@/lib/utils'

const incomeSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  isRecurring: z.boolean(),
  frequency: z.enum(['monthly', 'weekly', 'yearly']).optional(),
})

type IncomeFormData = z.infer<typeof incomeSchema>

interface IncomeFormProps {
  onClose: () => void
  onSubmit: (income: Income) => void
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
      frequency: income.frequency || 'monthly',
    } : {
      isRecurring: true,
      frequency: 'monthly',
    }
  })

  const isRecurring = watch('isRecurring')

  const onFormSubmit = (data: IncomeFormData) => {
    const newIncome: Income = {
      id: income?.id || generateId(),
      source: data.source,
      amount: data.amount,
      isRecurring: data.isRecurring,
      frequency: data.frequency,
      createdAt: income?.createdAt || new Date(),
      updatedAt: new Date(),
    }
    
    onSubmit(newIncome)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-dark-950">
            {income ? 'Edit Income' : 'Add Income'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Income Source
            </label>
            <input
              {...register('source')}
              type="text"
              className="input-field"
              placeholder="e.g., Salary, Freelancing, Investment"
            />
            {errors.source && (
              <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
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

          <div className="flex items-center">
            <input
              {...register('isRecurring')}
              type="checkbox"
              className="h-4 w-4 text-primary-400 focus:ring-primary-400 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Recurring income
            </label>
          </div>

          {isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select {...register('frequency')} className="input-field">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {income ? 'Update' : 'Add'} Income
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
