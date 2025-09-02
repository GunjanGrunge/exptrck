import { differenceInMonths, isAfter, isBefore, addMonths, startOfMonth } from 'date-fns';
import { EMI } from '@/types';

export function calculateRemainingEMIs(emi: EMI): number {
  try {
    const currentDate = new Date();
    const currentMonthStart = startOfMonth(currentDate);
    const emiStartMonth = startOfMonth(new Date(emi.startDate));
    
    // Ensure we have valid numbers
    const totalInstallments = Number(emi.totalInstallments);
    const paidInstallments = Number(emi.paidInstallments) || 0;
    const dueDate = Number(emi.dueDate);
    
    if (isNaN(totalInstallments) || isNaN(dueDate)) {
      console.warn('Invalid EMI data:', { totalInstallments, dueDate });
      return Math.max(0, totalInstallments - paidInstallments);
    }
    
    // Calculate how many months have passed since EMI started
    const monthsPassed = Math.max(0, differenceInMonths(currentMonthStart, emiStartMonth));
    
    // If current date is past the due date of current month, count current month as due
    const currentDayOfMonth = currentDate.getDate();
    const extraMonth = currentDayOfMonth > dueDate ? 1 : 0;
    
    // Total installments that should be due by now based on time
    const installmentsDueByTime = Math.min(totalInstallments, monthsPassed + extraMonth);
    
    // Use the maximum of manually paid installments or time-based calculations
    // This ensures we don't go backwards when someone manually marks payments
    const effectivePaidInstallments = Math.max(paidInstallments, installmentsDueByTime);
    
    const calculatedRemaining = totalInstallments - effectivePaidInstallments;
    
    // Don't let it go below 0
    const result = Math.max(0, calculatedRemaining);
    
    return isNaN(result) ? Math.max(0, totalInstallments - paidInstallments) : result;
  } catch (error) {
    console.error('Error calculating remaining EMIs:', error);
    return Math.max(0, Number(emi.totalInstallments) - Number(emi.paidInstallments || 0));
  }
}

export function updateEMIRemainingInstallments(emi: EMI): EMI {
  const currentRemaining = calculateRemainingEMIs(emi);
  return {
    ...emi,
    remainingInstallments: currentRemaining,
    updatedAt: new Date()
  };
}

export function getNextEMIDate(emi: EMI): Date {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const dueDate = emi.dueDate;
  
  // Create next EMI date for current month
  let nextEMIDate = new Date(currentYear, currentMonth, dueDate);
  
  // If the due date has passed this month, move to next month
  if (isBefore(nextEMIDate, currentDate)) {
    nextEMIDate = addMonths(nextEMIDate, 1);
  }
  
  return nextEMIDate;
}

export function isEMIActive(emi: EMI): boolean {
  const currentDate = new Date();
  const remaining = calculateRemainingEMIs(emi);
  
  // EMI is active if:
  // 1. Current date is after start date
  // 2. There are remaining installments
  return isAfter(currentDate, new Date(emi.startDate)) && remaining > 0;
}

export function calculateTotalEMIAmount(emis: EMI[]): number {
  return emis
    .filter(emi => isEMIActive(emi))
    .reduce((total, emi) => total + emi.amount, 0);
}

export function markEMIPaid(emi: EMI): EMI {
  const currentPaidInstallments = Number(emi.paidInstallments) || 0;
  const newPaidInstallments = currentPaidInstallments + 1;
  const newRemainingInstallments = Math.max(0, emi.totalInstallments - newPaidInstallments);
  
  return {
    ...emi,
    paidInstallments: newPaidInstallments,
    remainingInstallments: newRemainingInstallments,
    lastPaymentDate: new Date(),
    updatedAt: new Date()
  };
}
