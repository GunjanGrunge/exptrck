'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { Plus, CreditCard as CreditCardIcon, TrendingUp, TrendingDown, Calendar, Download, LogOut, Wallet, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { AnimatedCard, FadeIn, SlideUp, StaggerContainer, StaggerItem } from './ui/AnimatedComponents'
import { AnimatedButton } from './ui/AnimatedButton'
import { Skeleton, TableSkeleton, CardSkeleton } from './ui/Skeleton'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import EMIList from './EMIList'
import EMIForm from './EMIForm'
import IncomeForm from './IncomeForm'
import IncomeList from './IncomeList'
import CreditCardManager from './CreditCardManager'
import ExportModal from './ExportModal'
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
  const [showExportModal, setShowExportModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
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
    const toastId = toast.loading('Adding expense...')
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
        toast.success('Expense added successfully!', { id: toastId })
      } else {
        toast.error('Failed to add expense', { id: toastId })
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense', { id: toastId })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    const toastId = toast.loading('Deleting expense...')
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setExpenses(prev => prev.filter(expense => expense.id !== id))
        toast.success('Expense deleted successfully!', { id: toastId })
      } else {
        toast.error('Failed to delete expense', { id: toastId })
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense', { id: toastId })
    }
  }

  const handleUpdateExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowExpenseForm(true)
  }

  const handleSubmitExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      // Update existing expense
      const toastId = toast.loading('Updating expense...')
      try {
        const response = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        })

        if (response.ok) {
          const updated = await response.json()
          setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updated : e))
          toast.success('Expense updated successfully!', { id: toastId })
          setShowExpenseForm(false)
          setEditingExpense(null)
        } else {
          toast.error('Failed to update expense', { id: toastId })
        }
      } catch (error) {
        console.error('Error updating expense:', error)
        toast.error('Failed to update expense', { id: toastId })
      }
    } else {
      // Add new expense
      await handleAddExpense(expenseData)
    }
  }

  const handleAddEMI = async (emi: Omit<EMI, 'id' | 'createdAt' | 'updatedAt'>) => {
    const toastId = toast.loading('Adding EMI...')
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
        toast.success('EMI added successfully!', { id: toastId })
      } else {
        toast.error('Failed to add EMI', { id: toastId })
      }
    } catch (error) {
      console.error('Error adding EMI:', error)
      toast.error('Failed to add EMI', { id: toastId })
    }
  }

  const handleAddIncome = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    const toastId = toast.loading('Adding income...')
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
        toast.success('Income added successfully!', { id: toastId })
      } else {
        toast.error('Failed to add income', { id: toastId })
      }
    } catch (error) {
      console.error('Error adding income:', error)
      toast.error('Failed to add income', { id: toastId })
    }
  }

  const handleUpdateIncome = (income: Income) => {
    setEditingIncome(income)
    setShowIncomeForm(true)
  }

  const handleSubmitIncome = async (incomeData: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingIncome) {
      // Update existing income
      const toastId = toast.loading('Updating income...')
      try {
        const response = await fetch(`/api/income/${editingIncome.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incomeData)
        })

        if (response.ok) {
          const updated = await response.json()
          setIncomes(prev => prev.map(i => i.id === editingIncome.id ? updated : i))
          toast.success('Income updated successfully!', { id: toastId })
          setShowIncomeForm(false)
          setEditingIncome(null)
        } else {
          toast.error('Failed to update income', { id: toastId })
        }
      } catch (error) {
        console.error('Error updating income:', error)
        toast.error('Failed to update income', { id: toastId })
      }
    } else {
      // Add new income
      await handleAddIncome(incomeData)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    const toastId = toast.loading('Deleting income...')
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setIncomes(prev => prev.filter(income => income.id !== id))
        toast.success('Income deleted successfully!', { id: toastId })
      } else {
        toast.error('Failed to delete income', { id: toastId })
      }
    } catch (error) {
      console.error('Error deleting income:', error)
      toast.error('Failed to delete income', { id: toastId })
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

  const handleUpdateEMI = (emi: EMI) => {
    setEditingEMI(emi)
    setShowEMIForm(true)
  }

  const handleSubmitEMI = async (emiData: Omit<EMI, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEMI) {
      // Update existing EMI
      const toastId = toast.loading('Updating EMI...')
      try {
        const response = await fetch(`/api/emis/${editingEMI.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emiData)
        })

        if (response.ok) {
          const updated = await response.json()
          setEMIs(prev => prev.map(e => e.id === editingEMI.id ? updated : e))
          toast.success('EMI updated successfully!', { id: toastId })
          setShowEMIForm(false)
          setEditingEMI(null)
        } else {
          toast.error('Failed to update EMI', { id: toastId })
        }
      } catch (error) {
        console.error('Error updating EMI:', error)
        toast.error('Failed to update EMI', { id: toastId })
      }
    } else {
      // Add new EMI
      await handleAddEMI(emiData)
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
        toast.success('EMI marked as paid!')
      }
    } catch (error) {
      console.error('Error marking EMI as paid:', error)
      toast.error('Failed to mark EMI as paid')
    }
  }

  const handleMarkExpensePaid = async (expense: Expense) => {
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expense,
          isPaid: true,
          paidAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setExpenses(prev => prev.map(e => e.id === expense.id ? updated : e))
        toast.success('Expense marked as paid!')
      }
    } catch (error) {
      console.error('Error marking expense as paid:', error)
      toast.error('Failed to mark expense as paid')
    }
  }

  const budget = calculateMonthlyBudget()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <FadeIn>
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-lg text-gray-600 font-medium"
            >
              Loading your financial data...
            </motion.p>
          </div>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <AnimatedCard className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-xl border-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <SlideUp className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
            </SlideUp>
            <FadeIn delay={0.2} className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="font-semibold text-gray-800">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</p>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 ring-2 ring-primary-200 hover:ring-primary-300 transition-all duration-200',
                  }
                }}
                showName={false}
              />
            </FadeIn>
          </div>
        </div>
      </AnimatedCard>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <SlideUp delay={0.1} className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <StaggerContainer className="flex flex-wrap gap-4">
            <StaggerItem>
              <AnimatedButton
                onClick={() => {
                  setEditingExpense(null)
                  setShowExpenseForm(true)
                }}
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
              >
                Add Expense
              </AnimatedButton>
            </StaggerItem>
            <StaggerItem>
              <AnimatedButton
                onClick={() => {
                  setEditingIncome(null)
                  setShowIncomeForm(true)
                }}
                variant="success"
                size="lg"
                icon={<TrendingUp className="w-5 h-5" />}
              >
                Add Income
              </AnimatedButton>
            </StaggerItem>
            <StaggerItem>
              <AnimatedButton
                onClick={() => {
                  setEditingEMI(null)
                  setShowEMIForm(true)
                }}
                variant="secondary"
                size="lg"
                icon={<Calendar className="w-5 h-5" />}
              >
                Add EMI
              </AnimatedButton>
            </StaggerItem>
            <StaggerItem>
              <AnimatedButton
                onClick={() => setShowCreditCardManager(true)}
                variant="secondary"
                size="lg"
                icon={<CreditCardIcon className="w-5 h-5" />}
              >
                Manage Cards
              </AnimatedButton>
            </StaggerItem>
            <StaggerItem>
              <AnimatedButton
                onClick={() => setShowExportModal(true)}
                variant="secondary"
                size="lg"
                icon={<Download className="w-5 h-5" />}
              >
                Export PDF
              </AnimatedButton>
            </StaggerItem>
          </StaggerContainer>
        </SlideUp>

        {/* Budget Overview Cards */}
        <SlideUp delay={0.2} className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Overview</h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem>
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Total Income</p>
                    <motion.p 
                      className="text-3xl font-bold text-green-600"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {formatCurrency(budget.totalIncome)}
                    </motion.p>
                    <p className="text-xs text-gray-400 mt-1">This month</p>
                  </div>
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 5 }}
                  >
                    <TrendingUp className="w-7 h-7 text-green-600" />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
            
            <StaggerItem>
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Total Expenses</p>
                    <motion.p 
                      className="text-3xl font-bold text-red-600"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {formatCurrency(budget.totalExpenses)}
                    </motion.p>
                    <p className="text-xs text-gray-400 mt-1">This month</p>
                  </div>
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: -5 }}
                  >
                    <TrendingDown className="w-7 h-7 text-red-600" />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
            
            <StaggerItem>
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Total EMIs</p>
                    <motion.p 
                      className="text-3xl font-bold text-orange-600"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {formatCurrency(budget.totalEMIs)}
                    </motion.p>
                    <p className="text-xs text-gray-400 mt-1">Monthly payments</p>
                  </div>
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 5 }}
                  >
                    <Calendar className="w-7 h-7 text-orange-600" />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
            
            <StaggerItem>
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Balance</p>
                    <motion.p 
                      className={`text-3xl font-bold ${budget.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {formatCurrency(budget.balance)}
                    </motion.p>
                    <p className="text-xs text-gray-400 mt-1">
                      {budget.balance >= 0 ? 'Remaining' : 'Deficit'}
                    </p>
                  </div>
                  <motion.div 
                    className={`w-14 h-14 bg-gradient-to-br ${
                      budget.balance >= 0 
                        ? 'from-blue-100 to-blue-200' 
                        : 'from-red-100 to-red-200'
                    } rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: budget.balance >= 0 ? 5 : -5 }}
                  >
                    <DollarSign className={`w-7 h-7 ${
                      budget.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`} />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
          </StaggerContainer>
        </SlideUp>

        {/* Tabs */}
        <SlideUp delay={0.3} className="mb-8">
          <AnimatedCard className="p-2 bg-white/50 backdrop-blur-sm">
            <nav className="flex space-x-2">
              {[
                { key: 'overview', label: 'Overview', icon: DollarSign },
                { key: 'expenses', label: 'Expenses', icon: TrendingDown },
                { key: 'emis', label: 'EMIs', icon: Calendar },
                { key: 'income', label: 'Income', icon: TrendingUp },
              ].map(({ key, label, icon: Icon }) => (
                <motion.button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {activeTab === key && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl"
                      layoutId="activeTab"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </AnimatedCard>
        </SlideUp>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <AnimatedCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
                  Recent Expenses
                </h3>
                <ExpenseList 
                  expenses={expenses.slice(0, 5)} 
                  onEdit={() => {}} 
                  onDelete={() => {}}
                  showActions={false}
                  keyPrefix="overview"
                />
              </AnimatedCard>
              <AnimatedCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                  Upcoming EMIs
                </h3>
                <EMIList 
                  emis={emis.slice(0, 5)} 
                  onEdit={() => {}} 
                  onDelete={() => {}}
                  onUpdate={() => {}}
                  showActions={false}
                  keyPrefix="overview"
                />
              </AnimatedCard>
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
                  All Expenses
                </h3>
                <ExpenseList 
                  expenses={expenses} 
                  onEdit={handleUpdateExpense} 
                  onDelete={handleDeleteExpense}
                  onMarkPaid={handleMarkExpensePaid}
                  keyPrefix="management"
                />
              </AnimatedCard>
            </motion.div>
          )}

          {activeTab === 'emis' && (
            <motion.div
              key="emis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                  EMI Management
                </h3>
                <EMIList 
                  emis={emis} 
                  onEdit={handleUpdateEMI} 
                  onDelete={handleDeleteEMI}
                  onUpdate={handleMarkEMIPaid}
                  keyPrefix="management"
                />
              </AnimatedCard>
            </motion.div>
          )}

          {activeTab === 'income' && (
            <motion.div
              key="income"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Income Sources
                </h3>
                <IncomeList 
                  incomes={incomes} 
                  onEdit={handleUpdateIncome} 
                  onDelete={handleDeleteIncome}
                  onAdd={() => {
                    setEditingIncome(null)
                    setShowIncomeForm(true)
                  }}
                />
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showExpenseForm && (
          <ExpenseForm
            key="expense-form"
            expense={editingExpense || undefined}
            onClose={() => {
              setShowExpenseForm(false)
              setEditingExpense(null)
            }}
            onSubmit={handleSubmitExpense}
          />
        )}

        {showEMIForm && (
          <EMIForm
            key="emi-form"
            emi={editingEMI || undefined}
            onClose={() => {
              setShowEMIForm(false)
              setEditingEMI(null)
            }}
            onSubmit={handleSubmitEMI}
          />
        )}

        {showIncomeForm && (
          <IncomeForm
            key="income-form"
            income={editingIncome || undefined}
            onClose={() => {
              setShowIncomeForm(false)
              setEditingIncome(null)
            }}
            onSubmit={handleSubmitIncome}
          />
        )}

        {showCreditCardManager && (
          <CreditCardManager
            key="credit-card-manager"
            creditCards={creditCards}
            onClose={() => setShowCreditCardManager(false)}
            onUpdate={setCreditCards}
          />
        )}

        {showExportModal && (
          <ExportModal
            key="export-modal"
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            expenses={expenses}
            income={incomes}
            emis={emis}
            userName={user?.firstName || user?.emailAddresses[0]?.emailAddress}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
