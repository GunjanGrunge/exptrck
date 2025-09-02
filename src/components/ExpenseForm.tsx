'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Expense } from '@/types'
import { generateId } from '@/lib/utils'

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  dueDate: z.number().min(1).max(31),
  category: z.enum(['expense', 'emi', 'transfer']),
  isRecurring: z.boolean(),
  source: z.string().optional(),
  destination: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  onClose: () => void
  onSubmit: (expense: Expense) => void
  expense?: Expense
}

export default function ExpenseForm({ onClose, onSubmit, expense }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      title: expense.title,
      amount: expense.amount,
      dueDate: expense.dueDate,
      category: expense.category,
      isRecurring: expense.isRecurring,
      source: expense.source || '',
      destination: expense.destination || '',
    } : {
      category: 'expense',
      isRecurring: false,
      dueDate: 1,
    }
  })

  const category = watch('category')

  const onFormSubmit = (data: ExpenseFormData) => {
    const newExpense: Expense = {
      id: expense?.id || generateId(),
      title: data.title,
      amount: data.amount,
      dueDate: data.dueDate,
      category: data.category,
      isRecurring: data.isRecurring,
      isPaid: expense?.isPaid || false,
      paidAt: expense?.paidAt || null,
      source: data.source || null,
      destination: data.destination || null,
      creditCardId: expense?.creditCardId || null,
      createdAt: expense?.createdAt || new Date(),
      updatedAt: new Date(),
    }
    
    onSubmit(newExpense)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-dark-950">
            {expense ? 'Edit Expense' : 'Add Expense'}
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
              Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="input-field"
              placeholder="Enter expense title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
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
              Category
            </label>
            <select {...register('category')} className="input-field">
              <option value="expense">Regular Expense</option>
              <option value="emi">EMI</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {category === 'transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <input
                  {...register('source')}
                  type="text"
                  className="input-field"
                  placeholder="From account/source"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  {...register('destination')}
                  type="text"
                  className="input-field"
                  placeholder="To account/destination"
                />
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              {...register('isRecurring')}
              type="checkbox"
              className="h-4 w-4 text-primary-400 focus:ring-primary-400 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Recurring expense
            </label>
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
              {expense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
