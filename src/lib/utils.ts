import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'expense': 'Expense',
    'emi': 'EMI',
    'transfer': 'Transfer',
    'credit_card_payment': 'Credit Card Payment'
  };
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
