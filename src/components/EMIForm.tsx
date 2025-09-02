'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { EMI } from '@/types'
import { generateId } from '@/lib/utils'

const emiSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  dueDate: z.number().min(1).max(31),
  startDate: z.string().min(1, 'Start date is required'),
  totalInstallments: z.number().min(1, 'Total installments must be at least 1'),
  paidInstallments: z.number().min(0, 'Paid installments cannot be negative'),
  creditCardId: z.string().optional(),
})

type EMIFormData = z.infer<typeof emiSchema>

interface EMIFormProps {
  onClose: () => void
  onSubmit: (emi: EMI) => void
  emi?: EMI
}

export default function EMIForm({ onClose, onSubmit, emi }: EMIFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EMIFormData>({
    resolver: zodResolver(emiSchema),
    defaultValues: emi ? {
      title: emi.title,
      amount: emi.amount,
      dueDate: emi.dueDate,
      startDate: emi.startDate.toISOString().split('T')[0],
      totalInstallments: emi.totalInstallments,
      paidInstallments: emi.totalInstallments - emi.remainingInstallments,
      creditCardId: emi.creditCardId || '',
    } : {
      dueDate: 1,
      totalInstallments: 12,
      paidInstallments: 0,
    }
  })

  const totalInstallments = watch('totalInstallments')
  const paidInstallments = watch('paidInstallments')
  const remainingInstallments = totalInstallments - paidInstallments

  const onFormSubmit = (data: EMIFormData) => {
    const startDate = new Date(data.startDate)
    const remaining = data.totalInstallments - data.paidInstallments
    
    const newEMI: EMI = {
      id: emi?.id || generateId(),
      title: data.title,
      amount: data.amount,
      dueDate: data.dueDate,
      startDate: startDate,
      totalInstallments: data.totalInstallments,
      remainingInstallments: remaining,
      creditCardId: data.creditCardId || undefined,
      createdAt: emi?.createdAt || new Date(),
      updatedAt: new Date(),
    }
    
    onSubmit(newEMI)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-dark-950">
            {emi ? 'Edit EMI' : 'Add EMI'}
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
              EMI Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="input-field"
              placeholder="e.g., Car Loan, Home Loan"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EMI Amount (₹)
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input-field"
              placeholder="15000.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Day of Month)
            </label>
            <input
              {...register('dueDate', { valueAsNumber: true })}
              type="number"
              min="1"
              max="31"
              className="input-field"
              placeholder="15"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EMI Start Date
            </label>
            <input
              {...register('startDate')}
              type="date"
              className="input-field"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Installments
            </label>
            <input
              {...register('totalInstallments', { valueAsNumber: true })}
              type="number"
              min="1"
              className="input-field"
              placeholder="24"
            />
            {errors.totalInstallments && (
              <p className="text-red-500 text-sm mt-1">{errors.totalInstallments.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Already Paid Installments
            </label>
            <input
              {...register('paidInstallments', { valueAsNumber: true })}
              type="number"
              min="0"
              max={totalInstallments}
              className="input-field"
              placeholder="0"
            />
            {errors.paidInstallments && (
              <p className="text-red-500 text-sm mt-1">{errors.paidInstallments.message}</p>
            )}
          </div>

          {/* Remaining Installments Display */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">Remaining Installments:</div>
            <div className="text-lg font-semibold text-primary-600">
              {remainingInstallments} / {totalInstallments}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalInstallments > 0 ? ((paidInstallments / totalInstallments) * 100) : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Card (Optional)
            </label>
            <input
              {...register('creditCardId')}
              type="text"
              className="input-field"
              placeholder="e.g., HDFC Credit Card"
            />
          </div>

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
              {emi ? 'Update' : 'Add'} EMI
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
