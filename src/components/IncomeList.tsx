'use client'

import { useState } from 'react'
import { Edit, Trash2, DollarSign, Calendar, Clock, RefreshCw, TrendingUp, Plus } from 'lucide-react'
import { Income } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface IncomeListProps {
  incomes: Income[]
  onEdit: (income: Income) => void
  onDelete: (id: string) => void
  onAdd: () => void
  showActions?: boolean
}

export default function IncomeList({ 
  incomes, 
  onEdit, 
  onDelete, 
  onAdd,
  showActions = true 
}: IncomeListProps) {
  const [sortBy, setSortBy] = useState<'amount' | 'source' | 'frequency'>('amount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: 'amount' | 'source' | 'frequency') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedIncomes = [...incomes].sort((a, b) => {
    let aValue: any = a[sortBy]
    let bValue: any = b[sortBy]
    
    if (sortBy === 'amount') {
      aValue = Number(aValue)
      bValue = Number(bValue)
    } else {
      aValue = String(aValue).toLowerCase()
      bValue = String(bValue).toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const recurringIncome = incomes.filter(income => income.isRecurring).reduce((sum, income) => sum + income.amount, 0)
  const oneTimeIncome = incomes.filter(income => !income.isRecurring).reduce((sum, income) => sum + income.amount, 0)

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Clock className="w-4 h-4 text-green-500" />
      case 'weekly': return <Calendar className="w-4 h-4 text-blue-500" />
      case 'monthly': return <RefreshCw className="w-4 h-4 text-purple-500" />
      case 'yearly': return <TrendingUp className="w-4 h-4 text-orange-500" />
      case 'one-time': return <DollarSign className="w-4 h-4 text-gray-500" />
      default: return <RefreshCw className="w-4 h-4 text-purple-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'salary': return 'bg-blue-100 text-blue-800'
      case 'freelance': return 'bg-green-100 text-green-800'
      case 'investment': return 'bg-purple-100 text-purple-800'
      case 'business': return 'bg-orange-100 text-orange-800'
      case 'rental': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (incomes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Income Sources</h3>
          <p className="text-gray-500 mb-6">Add your first income source to start tracking your earnings</p>
          {showActions && (
            <button
              onClick={onAdd}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Income Source</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Income</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalIncome)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Recurring</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(recurringIncome)}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">One-time</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(oneTimeIncome)}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Income Sources</h3>
          {showActions && (
            <button
              onClick={onAdd}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Income</span>
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Source</span>
                    {sortBy === 'source' && (
                      <span className="text-primary-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    {sortBy === 'amount' && (
                      <span className="text-primary-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('frequency')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Frequency</span>
                    {sortBy === 'frequency' && (
                      <span className="text-primary-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{income.source}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(income.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(income.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {income.category && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(income.category)}`}>
                        {income.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getFrequencyIcon(income.frequency || 'monthly')}
                      <span className="text-sm text-gray-900 capitalize">
                        {income.isRecurring ? (income.frequency || 'monthly') : 'one-time'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {income.description || '-'}
                    </div>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(income)}
                          className="text-primary-400 hover:text-primary-600 transition-colors"
                          title="Edit income"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(income.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete income"
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
        </div>
      </div>
    </div>
  )
}
