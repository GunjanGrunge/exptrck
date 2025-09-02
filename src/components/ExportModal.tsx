import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertCircle } from 'lucide-react';
import DateRangeSelector from './DateRangeSelector';
import { PDFExportService } from '@/lib/pdf-export';
import { formatCurrency } from '@/lib/utils';
import { Expense, Income, EMI } from '@/types';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  income: Income[];
  emis: EMI[];
  userName?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  income,
  emis,
  userName,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (startDate: Date, endDate: Date) => {
    setIsExporting(true);
    
    try {
      // For expenses: include all expenses within date range or all recurring expenses
      const filteredExpenses = expenses.filter(expense => {
        if (expense.isRecurring) {
          // Include all recurring expenses regardless of creation date
          return true;
        } else {
          // For one-time expenses, check if they fall within the date range
          const expenseDate = new Date(expense.createdAt);
          return expenseDate >= startDate && expenseDate <= endDate;
        }
      });

      // For income: include ALL income sources since they represent ongoing income
      // that affects the financial situation during any reporting period
      const filteredIncome = income.filter(inc => {
        // Include all recurring income
        if (inc.isRecurring || inc.frequency !== 'one-time') {
          return true;
        } else {
          // For one-time income, check if it falls within the date range
          const incomeDate = new Date(inc.createdAt);
          return incomeDate >= startDate && incomeDate <= endDate;
        }
      });

      // For EMIs: include EMIs that are active during the selected period
      const filteredEMIs = emis.filter(emi => {
        const emiStartDate = new Date(emi.startDate);
        // Include EMI if it started before the end date and still has remaining installments
        return emiStartDate <= endDate && emi.remainingInstallments > 0;
      });

      // Always include data if we have any financial records
      // Don't show error for empty date ranges since financial summaries are still valuable
      console.log('Filtered data:', {
        expenses: filteredExpenses.length,
        income: filteredIncome.length,
        emis: filteredEMIs.length
      });

      console.log('Sample data:', {
        sampleExpense: filteredExpenses[0],
        sampleIncome: filteredIncome[0],
        sampleEMI: filteredEMIs[0]
      });

      await PDFExportService.generateStatement({
        expenses: filteredExpenses,
        income: filteredIncome,
        emis: filteredEMIs,
        startDate,
        endDate,
        userName,
      });

      toast.success('PDF statement exported successfully!');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Export Financial Statement
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Generate a comprehensive PDF report of your finances</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {/* Data Summary */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Available Data Overview</h4>
                      <div className="grid grid-cols-3 gap-6">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
                        >
                          <div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {income.length}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-1">Income Sources</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(income.reduce((sum, inc) => sum + inc.amount, 0))} total
                          </div>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
                        >
                          <div className="text-3xl font-bold bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent">
                            {expenses.length}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-1">Expenses</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))} total
                          </div>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
                        >
                          <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {emis.length}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-1">EMIs</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(emis.reduce((sum, emi) => sum + emi.amount, 0))} monthly
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Date Range Selector */}
                <DateRangeSelector
                  onExport={handleExport}
                  isExporting={isExporting}
                />

                {/* Features List */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100"
                >
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full"></div>
                    Professional PDF Report Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">Detailed income analysis with frequency breakdown</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">Complete expense categorization and payment status</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">EMI tracking with remaining installments</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">Financial summary with net balance calculation</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">Professional formatting with custom branding</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">Date range filtering and categorized tables</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;
