'use client'

import { Edit, Trash2, Calendar, Check } from 'lucide-react'
import { Expense } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  onMarkPaid?: (expense: Expense) => void
  showActions?: boolean
  keyPrefix?: string
}

export default function ExpenseList({ 
  expenses, 
  onEdit, 
  onDelete, 
  onMarkPaid,
  showActions = true,
  keyPrefix = ''
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No expenses found</p>
        <p className="text-sm">Add your first expense to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr key={`${keyPrefix}-${expense.id}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {expense.title}
                  </div>
                  {expense.category === 'transfer' && (
                    <div className="text-xs text-gray-500">
                      {expense.source} → {expense.destination}
                    </div>
                  )}
                  {expense.isRecurring && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800 mt-1 w-fit">
                      Recurring
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-1 w-fit ${
                    expense.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-accent-600">
                  {formatCurrency(expense.amount)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {expense.dueDate}
                  <span className="text-gray-500 text-xs ml-1">
                    of month
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  expense.category === 'emi' 
                    ? 'bg-accent-100 text-accent-800'
                    : expense.category === 'transfer'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {expense.category.toUpperCase()}
                </span>
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {!expense.isPaid && onMarkPaid && (
                      <button
                        onClick={() => onMarkPaid(expense)}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as Paid"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total: {expenses.length} expenses
          </span>
          <span className="text-sm font-semibold text-gray-900">
            Total Amount: {formatCurrency(
              expenses.reduce((sum, expense) => sum + expense.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
