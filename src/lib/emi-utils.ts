import { differenceInMonths, isAfter, isBefore, addMonths, startOfMonth } from 'date-fns';
import { EMI } from '@/types';

export function calculateRemainingEMIs(emi: EMI): number {
  const currentDate = new Date();
  const currentMonthStart = startOfMonth(currentDate);
  const emiStartMonth = startOfMonth(new Date(emi.startDate));
  
  // Calculate how many months have passed since EMI started
  const monthsPassed = Math.max(0, differenceInMonths(currentMonthStart, emiStartMonth));
  
  // If current date is past the due date of current month, count current month as paid
  const currentDayOfMonth = currentDate.getDate();
  const extraMonth = currentDayOfMonth > emi.dueDate ? 1 : 0;
  
  const totalPaidMonths = monthsPassed + extraMonth;
  const calculatedRemaining = emi.totalInstallments - totalPaidMonths;
  
  // Don't let it go below 0 or above initial remaining installments
  return Math.max(0, Math.min(calculatedRemaining, emi.remainingInstallments));
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
  const newRemaining = Math.max(0, emi.remainingInstallments - 1);
  return {
    ...emi,
    remainingInstallments: newRemaining,
    updatedAt: new Date()
  };
}
