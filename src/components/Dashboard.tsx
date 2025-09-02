'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { Plus, CreditCard as CreditCardIcon, TrendingUp, TrendingDown, Calendar, Download, LogOut } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import EMIList from './EMIList'
import EMIForm from './EMIForm'
import IncomeForm from './IncomeForm'
import IncomeList from './IncomeList'
import CreditCardManager from './CreditCardManager'
import { Expense, EMI, Income, CreditCard, MonthlyBudget } from '@/types'

export default function Dashboard() {
  const { user } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [emis, setEMIs] = useState<EMI[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showEMIForm, setShowEMIForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showCreditCardManager, setShowCreditCardManager] = useState(false)
  const [activeTab, setActiveTab] = useState<'expenses' | 'emis' | 'income' | 'overview'>('overview')
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  const fetchData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [expensesRes, emisRes, incomeRes, creditCardsRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/emis'),
        fetch('/api/income'),
        fetch('/api/credit-cards')
      ])

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData)
      }

      if (emisRes.ok) {
        const emisData = await emisRes.json()
        setEMIs(emisData)
      }

      if (incomeRes.ok) {
        const incomeData = await incomeRes.json()
        setIncomes(incomeData)
      }

      if (creditCardsRes.ok) {
        const creditCardsData = await creditCardsRes.json()
        setCreditCards(creditCardsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate monthly budget
  const calculateMonthlyBudget = (): MonthlyBudget => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalEMIs = emis.reduce((sum, emi) => sum + emi.amount, 0)
    const balance = totalIncome - totalExpenses - totalEMIs

    return {
      totalIncome,
      totalExpenses,
      totalEMIs,
      balance,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }
  }

  // Handler functions for CRUD operations
  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      })

      if (response.ok) {
        const newExpense = await response.json()
        setExpenses(prev => [newExpense, ...prev])
        setShowExpenseForm(false)
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setExpenses(prev => prev.filter(expense => expense.id !== id))
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const handleAddEMI = async (emi: Omit<EMI, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/emis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emi)
      })

      if (response.ok) {
        const newEMI = await response.json()
        setEMIs(prev => [newEMI, ...prev])
        setShowEMIForm(false)
      }
    } catch (error) {
      console.error('Error adding EMI:', error)
    }
  }

  const handleAddIncome = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(income)
      })

      if (response.ok) {
        const newIncome = await response.json()
        setIncomes(prev => [newIncome, ...prev])
        setShowIncomeForm(false)
      }
    } catch (error) {
      console.error('Error adding income:', error)
    }
  }

  const handleUpdateIncome = async (income: Income) => {
    try {
      const response = await fetch(`/api/income/${income.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(income)
      })

      if (response.ok) {
        const updated = await response.json()
        setIncomes(prev => prev.map(i => i.id === income.id ? updated : i))
      }
    } catch (error) {
      console.error('Error updating income:', error)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setIncomes(prev => prev.filter(income => income.id !== id))
      }
    } catch (error) {
      console.error('Error deleting income:', error)
    }
  }

  const handleDeleteEMI = async (id: string) => {
    try {
      const response = await fetch(`/api/emis/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEMIs(prev => prev.filter(emi => emi.id !== id))
      }
    } catch (error) {
      console.error('Error deleting EMI:', error)
    }
  }

  const handleUpdateEMI = async (emi: EMI) => {
    try {
      const response = await fetch(`/api/emis/${emi.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emi)
      })

      if (response.ok) {
        const updated = await response.json()
        setEMIs(prev => prev.map(e => e.id === emi.id ? updated : e))
      }
    } catch (error) {
      console.error('Error updating EMI:', error)
    }
  }

  const handleMarkEMIPaid = async (emi: EMI) => {
    try {
      const response = await fetch(`/api/emis/${emi.id}/mark-paid`, {
        method: 'POST'
      })

      if (response.ok) {
        const updated = await response.json()
        setEMIs(prev => prev.map(e => e.id === emi.id ? updated : e))
      }
    } catch (error) {
      console.error('Error marking EMI as paid:', error)
    }
  }

  const budget = calculateMonthlyBudget()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-dark-950">Expense Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}</span>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  }
                }}
                showName={false}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowExpenseForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={() => setShowIncomeForm(true)}
              className="btn-outline flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Add Income</span>
            </button>
            <button
              onClick={() => setShowEMIForm(true)}
              className="btn-outline flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Add EMI</span>
            </button>
            <button
              onClick={() => setShowCreditCardManager(true)}
              className="btn-outline flex items-center space-x-2"
            >
              <CreditCardIcon className="w-4 h-4" />
              <span>Manage Cards</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold currency-positive">
                  {formatCurrency(budget.totalIncome)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-400" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold currency-negative">
                  {formatCurrency(budget.totalExpenses)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-accent-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total EMIs</p>
                <p className="text-2xl font-bold currency-negative">
                  {formatCurrency(budget.totalEMIs)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-accent-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className={`text-2xl font-bold ${budget.balance >= 0 ? 'currency-positive' : 'currency-negative'}`}>
                  {formatCurrency(budget.balance)}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                budget.balance >= 0 ? 'bg-primary-100' : 'bg-accent-100'
              }`}>
                <span className={`text-sm font-bold ${
                  budget.balance >= 0 ? 'text-primary-600' : 'text-accent-600'
                }`}>
                  ₹
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-400 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-primary-400 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('emis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'emis'
                  ? 'border-primary-400 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              EMIs
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'income'
                  ? 'border-primary-400 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Income
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-950 mb-4">Recent Expenses</h3>
              <ExpenseList 
                expenses={expenses.slice(0, 5)} 
                onEdit={() => {}} 
                onDelete={() => {}}
                showActions={false}
              />
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-950 mb-4">Upcoming EMIs</h3>
              <EMIList 
                emis={emis.slice(0, 5)} 
                onEdit={() => {}} 
                onDelete={() => {}}
                onUpdate={() => {}}
                showActions={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <ExpenseList 
            expenses={expenses} 
            onEdit={() => {}} 
            onDelete={handleDeleteExpense}
          />
        )}

        {activeTab === 'emis' && (
          <EMIList 
            emis={emis} 
            onEdit={handleUpdateEMI} 
            onDelete={handleDeleteEMI}
            onUpdate={handleMarkEMIPaid}
          />
        )}

        {activeTab === 'income' && (
          <IncomeList 
            incomes={incomes} 
            onEdit={handleUpdateIncome} 
            onDelete={handleDeleteIncome}
            onAdd={() => setShowIncomeForm(true)}
          />
        )}
      </main>

      {/* Modals */}
      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onSubmit={handleAddExpense}
        />
      )}

      {showEMIForm && (
        <EMIForm
          onClose={() => setShowEMIForm(false)}
          onSubmit={handleAddEMI}
        />
      )}

      {showIncomeForm && (
        <IncomeForm
          onClose={() => setShowIncomeForm(false)}
          onSubmit={handleAddIncome}
        />
      )}

      {showCreditCardManager && (
        <CreditCardManager
          creditCards={creditCards}
          onClose={() => setShowCreditCardManager(false)}
          onUpdate={setCreditCards}
        />
      )}
    </div>
  )
}
