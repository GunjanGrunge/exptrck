'use client'

import { Edit, Trash2, Calendar, Clock, Check } from 'lucide-react'
import { EMI } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { calculateRemainingEMIs, getNextEMIDate, isEMIActive, markEMIPaid, updateEMIRemainingInstallments } from '@/lib/emi-utils'

interface EMIListProps {
  emis: EMI[]
  onEdit: (emi: EMI) => void
  onDelete: (id: string) => void
  onUpdate: (emi: EMI) => void
  showActions?: boolean
}

export default function EMIList({ 
  emis, 
  onEdit, 
  onDelete, 
  onUpdate,
  showActions = true 
}: EMIListProps) {
  
  const handleMarkPaid = (emi: EMI) => {
    const updatedEMI = markEMIPaid(emi);
    onUpdate(updatedEMI);
  };

  if (emis.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No EMIs found</p>
        <p className="text-sm">Add your first EMI to track payments</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              EMI Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emis.map((emi) => {
            // Update remaining installments based on current date
            const updatedEMI = updateEMIRemainingInstallments(emi);
            const remainingInstallments = updatedEMI.remainingInstallments;
            const nextEMIDate = getNextEMIDate(updatedEMI);
            const isActive = isEMIActive(updatedEMI);
            const paidInstallments = emi.totalInstallments - remainingInstallments;
            
            return (
              <tr key={emi.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {emi.title}
                    </div>
                    {emi.creditCardId && (
                      <div className="text-xs text-gray-500">
                        Credit Card: {emi.creditCardId}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Started: {new Date(emi.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-accent-600">
                    {formatCurrency(emi.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    per month
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {emi.dueDate}
                    <span className="text-gray-500 text-xs ml-1 block">
                      Next: {nextEMIDate.toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 mb-1">
                    <span className="font-semibold">{remainingInstallments}</span> remaining
                    <span className="text-gray-500"> / {emi.totalInstallments} total</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Paid: {paidInstallments} installments
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(paidInstallments / emi.totalInstallments) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((paidInstallments / emi.totalInstallments) * 100).toFixed(1)}% complete
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    remainingInstallments === 0
                      ? 'bg-gray-100 text-gray-800'
                      : isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {remainingInstallments === 0 ? 'Completed' : isActive ? 'Active' : 'Pending'}
                  </span>
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {isActive && remainingInstallments > 0 && (
                        <button
                          onClick={() => handleMarkPaid(emi)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Mark as Paid"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(emi)}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded"
                        title="Edit EMI"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(emi.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete EMI"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total: {emis.length} EMIs ({emis.filter(emi => isEMIActive(updateEMIRemainingInstallments(emi))).length} active)
          </span>
          <span className="text-sm font-semibold text-gray-900">
            Monthly EMI Amount: {formatCurrency(
              emis
                .map(emi => updateEMIRemainingInstallments(emi))
                .filter(emi => isEMIActive(emi))
                .reduce((sum, emi) => sum + emi.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
