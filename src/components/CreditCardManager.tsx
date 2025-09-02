'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Edit, Trash2, CreditCard as CreditCardIcon, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { CreditCard } from '@/types'
import { generateId, formatCurrency } from '@/lib/utils'

const creditCardSchema = z.object({
  name: z.string().min(1, 'Card name is required'),
  limit: z.number().min(1, 'Credit limit must be greater than 0'),
  usedAmount: z.number().min(0, 'Used amount cannot be negative'),
  dueDate: z.number().min(1).max(31),
})

type CreditCardFormData = z.infer<typeof creditCardSchema>

interface CreditCardManagerProps {
  creditCards: CreditCard[]
  onClose: () => void
  onUpdate: (creditCards: CreditCard[]) => void
}

export default function CreditCardManager({ 
  creditCards, 
  onClose, 
  onUpdate 
}: CreditCardManagerProps) {
  console.log('CreditCardManager received creditCards:', creditCards)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [paymentCard, setPaymentCard] = useState<CreditCard | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
  })

  const onFormSubmit = async (data: CreditCardFormData) => {
    try {
      const availableAmount = data.limit - data.usedAmount
      
      if (editingCard) {
        // Update existing card via API
        const response = await fetch(`/api/credit-cards/${editingCard.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            limit: data.limit,
            usedAmount: data.usedAmount,
            availableAmount,
            dueDate: data.dueDate,
          }),
        })

        if (response.ok) {
          const updatedCard = await response.json()
          const updatedCards = creditCards.map(card => 
            card.id === editingCard.id ? updatedCard : card
          )
          onUpdate(updatedCards)
          setEditingCard(null)
          toast.success('Credit card updated successfully!')
        } else {
          console.error('Failed to update credit card')
          toast.error('Failed to update credit card')
          return
        }
      } else {
        // Create new card via API
        const response = await fetch('/api/credit-cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            limit: data.limit,
            usedAmount: data.usedAmount,
            availableAmount,
            dueDate: data.dueDate,
          }),
        })

        if (response.ok) {
          const newCard = await response.json()
          onUpdate([...creditCards, newCard])
          toast.success('Credit card added successfully!')
        } else {
          console.error('Failed to create credit card')
          toast.error('Failed to create credit card')
          return
        }
      }
      
      reset()
      setShowForm(false)
    } catch (error) {
      console.error('Error submitting credit card form:', error)
      toast.error('An error occurred while saving the credit card')
    }
  }

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card)
    reset({
      name: card.name,
      limit: card.limit,
      usedAmount: card.usedAmount,
      dueDate: card.dueDate,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credit card? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdate(creditCards.filter(card => card.id !== id))
        toast.success('Credit card deleted successfully!')
      } else {
        console.error('Failed to delete credit card')
        toast.error('Failed to delete credit card')
      }
    } catch (error) {
      console.error('Error deleting credit card:', error)
      toast.error('An error occurred while deleting the credit card')
    }
  }

  const handlePayment = (card: CreditCard) => {
    setPaymentCard(card)
    setPaymentAmount('')
  }

  const handlePaymentSubmit = async () => {
    if (!paymentCard || !paymentAmount) {
      toast.error('Please enter a payment amount')
      return
    }

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (amount > paymentCard.usedAmount) {
      toast.error('Payment amount cannot exceed the used amount')
      return
    }

    try {
      // Make payment API call
      const response = await fetch(`/api/credit-cards/${paymentCard.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update the credit card in the list
        const updatedCards = creditCards.map(card => 
          card.id === paymentCard.id ? result.updatedCard : card
        )
        onUpdate(updatedCards)
        setPaymentCard(null)
        setPaymentAmount('')
        toast.success('Payment recorded successfully!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to process payment. Status:', response.status, 'Error:', errorData)
        toast.error(`Failed to process payment: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('An error occurred while processing the payment')
    }
  }

  const calculateUtilization = (card: CreditCard) => {
    return (card.usedAmount / card.limit) * 100
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-dark-950">
            Credit Card Manager
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showForm ? (
            <div className="space-y-6">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Credit Card</span>
              </button>

              {creditCards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCardIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No credit cards added</p>
                  <p className="text-sm">Add your first credit card to track expenses</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {creditCards.map((card) => {
                    const utilization = calculateUtilization(card)
                    const utilizationColor = utilization > 80 ? 'bg-red-400' : 
                                           utilization > 60 ? 'bg-yellow-400' : 'bg-green-400'
                    
                    return (
                      <div key={card.id} className="card border-2">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-dark-950">
                              {card.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Due: {card.dueDate} of every month
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(card)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(card.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Credit Limit</span>
                            <span className="font-semibold">{formatCurrency(card.limit)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Used Amount</span>
                            <span className="font-semibold text-accent-600">
                              {formatCurrency(card.usedAmount)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Available</span>
                            <span className="font-semibold text-primary-600">
                              {formatCurrency(card.availableAmount)}
                            </span>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Utilization</span>
                              <span className="font-semibold">{utilization.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${utilizationColor}`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Pay Button */}
                          <div className="pt-2">
                            <button
                              onClick={() => handlePayment(card)}
                              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              Make Payment
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-950">
                  {editingCard ? 'Edit Credit Card' : 'Add Credit Card'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingCard(null)
                    reset()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="input-field"
                    placeholder="e.g., HDFC MoneyBack"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    {...register('limit', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="100000"
                  />
                  {errors.limit && (
                    <p className="text-red-500 text-sm mt-1">{errors.limit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Used Amount (₹)
                  </label>
                  <input
                    {...register('usedAmount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                  />
                  {errors.usedAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.usedAmount.message}</p>
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

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCard(null)
                      reset()
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingCard ? 'Update' : 'Add'} Card
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-dark-950">
                Make Payment - {paymentCard.name}
              </h3>
              <button
                onClick={() => setPaymentCard(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Used Amount: <span className="font-semibold">{formatCurrency(paymentCard.usedAmount)}</span></p>
                <p className="text-sm text-gray-600 mb-4">Available Credit: <span className="font-semibold">{formatCurrency(paymentCard.availableAmount)}</span></p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  max={paymentCard.usedAmount}
                  step="0.01"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentCard(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
