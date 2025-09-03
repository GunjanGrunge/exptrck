'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { Plus, CreditCard as CreditCardIcon, TrendingUp, TrendingDown, Calendar, Download, LogOut, Wallet, DollarSign, ArrowUpCircle, ArrowDownCircle, Banknote, PiggyBank } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { updateEMIRemainingInstallments } from '@/lib/emi-utils'
import { AnimatedCard, FadeIn, SlideUp, StaggerContainer, StaggerItem } from './ui/AnimatedComponents'
import { AnimatedButton } from './ui/AnimatedButton'
import { Skeleton, TableSkeleton, CardSkeleton } from './ui/Skeleton'
import Logo from './ui/Logo'
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
  const { user, isLoaded } = useUser()
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
    if (!user?.id) {
      console.log('No user ID available for data fetch')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Fetching data for user:', user.id)
      
      // Fetch all data in parallel
      const [expensesRes, emisRes, incomeRes, creditCardsRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/emis'),
        fetch('/api/income'),
        fetch('/api/credit-cards')
      ])

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        console.log('Expenses loaded:', expensesData.length)
        setExpenses(expensesData)
      } else {
        console.error('Failed to fetch expenses:', expensesRes.status)
      }

      if (emisRes.ok) {
        const emisData = await emisRes.json()
        console.log('EMIs loaded:', emisData.length)
        
        // Update EMI remaining installments based on current date
        const updatedEMIs = emisData.map((emi: EMI) => updateEMIRemainingInstallments(emi))
        console.log('EMIs updated with current calculations:', updatedEMIs.length)
        
        setEMIs(updatedEMIs)
      } else {
        console.error('Failed to fetch EMIs:', emisRes.status)
      }

      if (incomeRes.ok) {
        const incomeData = await incomeRes.json()
        console.log('Income loaded:', incomeData.length)
        setIncomes(incomeData)
      } else {
        console.error('Failed to fetch income:', incomeRes.status)
      }

      if (creditCardsRes.ok) {
        const creditCardsData = await creditCardsRes.json()
        console.log('Credit cards loaded:', creditCardsData.length, creditCardsData)
        setCreditCards(creditCardsData)
      } else {
        console.error('Failed to fetch credit cards:', creditCardsRes.status, creditCardsRes.statusText)
        const errorText = await creditCardsRes.text()
        console.error('Credit cards error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Load data when user is available and Clerk has finished loading
  useEffect(() => {
    console.log('Auth state changed. isLoaded:', isLoaded, 'User ID:', user?.id)
    
    if (!isLoaded) {
      // Clerk is still loading, keep our loading state true
      console.log('Clerk still loading...')
      return
    }
    
    if (user?.id) {
      // User is authenticated, fetch data
      console.log('User authenticated, fetching data...')
      fetchData()
    } else {
      // No user (not authenticated), stop loading
      console.log('No user, stopping loading state')
      setLoading(false)
    }
  }, [isLoaded, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate monthly budget
  const calculateMonthlyBudget = (): MonthlyBudget => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
    
    // Separate regular expenses from EMI payment expenses
    const regularExpenses = expenses.filter(expense => expense.category !== 'emi')
    const emiPaymentExpenses = expenses.filter(expense => expense.category === 'emi')
    
    const totalRegularExpenses = regularExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalEMIPayments = emiPaymentExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Get current month and year
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11
    const currentYear = currentDate.getFullYear()
    const currentDay = currentDate.getDate()
    
    // Calculate outstanding EMIs for current month only
    // An EMI is outstanding for current month if:
    // 1. It has remaining installments > 0
    // 2. Its due date has passed or is today in current month
    // 3. It hasn't been paid this month (check lastPaymentDate)
    const currentMonthOutstandingEMIs = emis
      .filter(emi => {
        if (emi.remainingInstallments <= 0) return false
        
        // Check if EMI is due this month
        const isDueThisMonth = emi.dueDate <= currentDay
        if (!isDueThisMonth) return false
        
        // Check if already paid this month
        if (emi.lastPaymentDate) {
          const lastPayment = new Date(emi.lastPaymentDate)
          const isPaidThisMonth = lastPayment.getMonth() + 1 === currentMonth && 
                                  lastPayment.getFullYear() === currentYear
          if (isPaidThisMonth) return false
        }
        
        return true
      })
      .reduce((sum, emi) => sum + emi.amount, 0)
    
    // Total expenses includes both regular expenses and EMI payments
    const totalExpenses = totalRegularExpenses + totalEMIPayments
    
    // Balance calculation: Income - All Expenses - Current Month Outstanding EMIs
    // Note: EMI payments are already in expenses, outstanding EMIs are unpaid current month obligations
    const balance = totalIncome - totalExpenses - currentMonthOutstandingEMIs

    // Debug logging
    console.log('Budget Calculation:', {
      totalIncome,
      totalRegularExpenses,
      totalEMIPayments,
      totalExpenses,
      currentMonthOutstandingEMIs,
      balance,
      currentMonth,
      currentYear,
      currentDay,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
      emiCount: emis.length
    })

    return {
      totalIncome,
      totalExpenses,
      totalEMIs: currentMonthOutstandingEMIs, // Only show current month outstanding EMIs
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
        const result = await response.json()
        
        // Update EMI list
        setEMIs(prev => prev.map(e => e.id === emi.id ? result : e))
        
        // Refresh expenses to show the new EMI payment expense
        if (result.expenseCreated) {
          await fetchData() // Refresh all data to ensure consistency
          toast.success(`EMI marked as paid! Expense of ${formatCurrency(emi.amount)} added automatically.`)
        } else {
          toast.success('EMI marked as paid!')
        }
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

  // Show loading spinner while Clerk is loading authentication state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 relative">
      {/* Dotted Background Pattern */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #759ab7 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}
      />
      
      {/* Content Wrapper */}
      <div className="relative z-10">
      {/* Header */}
      <AnimatedCard className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl shadow-2xl border-0 rounded-none border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-20">
            <SlideUp className="flex items-center space-x-4">
              <Logo size="lg" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#04132a] via-[#759ab7] to-[#ce6e55] bg-clip-text text-transparent">
                  ExpenseTracker
                </h1>
                <p className="text-xs text-gray-600/80 font-medium tracking-wider uppercase">
                  Financial Management
                </p>
              </div>
            </SlideUp>
            <FadeIn delay={0.2} className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="font-semibold text-gray-800">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</p>
              </div>
              <div className="flex items-center gap-2">
                <AnimatedButton
                  onClick={fetchData}
                  disabled={loading}
                  variant="secondary"
                  size="sm"
                  className="text-xs px-3 py-1.5"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </AnimatedButton>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10 ring-2 ring-primary-200 hover:ring-primary-300 transition-all duration-200',
                    }
                  }}
                  showName={false}
                />
              </div>
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
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer min-h-[140px]">
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1">
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
                    <ArrowUpCircle className="w-7 h-7 text-green-600" />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
            
            <StaggerItem>
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer min-h-[140px]">
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Total Expenses</p>
                    <motion.p 
                      className="text-3xl font-bold text-red-600"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {formatCurrency(budget.totalExpenses)}
                    </motion.p>
                    <p className="text-xs text-gray-400 mt-1">Includes paid EMIs</p>
                  </div>
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: -5 }}
                  >
                    <ArrowDownCircle className="w-7 h-7 text-red-600" />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
            
            <StaggerItem>
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer min-h-[140px]">
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Outstanding EMIs</p>
                    <motion.p 
                      className="text-3xl font-bold text-orange-600"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {formatCurrency(budget.totalEMIs)}
                    </motion.p>
                    <p className="text-xs text-gray-400 mt-1">This month</p>
                  </div>
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 5 }}
                  >
                    <Banknote className="w-7 h-7 text-orange-600" />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
            
            <StaggerItem>
              <AnimatedCard className="p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer min-h-[140px]">
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1">
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
                    <PiggyBank className={`w-7 h-7 ${
                      budget.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`} />
                  </motion.div>
                </div>
              </AnimatedCard>
            </StaggerItem>
          </StaggerContainer>
          
          {/* Debugging breakdown */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Calculation Breakdown:</h3>
            <p>Income: ₹{budget.totalIncome.toLocaleString()} - Expenses: ₹{budget.totalExpenses.toLocaleString()} - Outstanding EMIs (This Month): ₹{budget.totalEMIs.toLocaleString()} = Balance: ₹{budget.balance.toLocaleString()}</p>
            <p className="text-xs mt-1">Note: Outstanding EMIs shows only unpaid EMIs due this month. As you mark EMIs as paid, this amount decreases.</p>
          </div>
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
      
      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.p 
              className="text-sm text-gray-500 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              A <span className="text-[#759ab7] font-semibold">Vayu</span> innovation
            </motion.p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
