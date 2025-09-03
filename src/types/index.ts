export interface Expense {
  id: string;
  title: string;
  amount: number;
  dueDate: number; // Day of the month (1-31)
  category: 'expense' | 'emi' | 'transfer' | 'credit_card_payment';
  isRecurring: boolean;
  isPaid: boolean;
  paidAt: Date | null;
  source: string | null;
  destination: string | null;
  creditCardId: string | null; // Optional: For credit card expenses
  creditCard?: CreditCard; // Optional: Populated credit card info (not from Prisma directly)
  createdAt: Date;
  updatedAt: Date;
}

export interface EMI {
  id: string;
  title: string;
  amount: number;
  dueDate: number; // Day of the month (1-31)
  startDate: Date;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  lastPaymentDate: Date | null;
  creditCardId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  isRecurring: boolean;
  frequency: string | null; // 'monthly' | 'weekly' | 'yearly' | 'daily' | 'one-time'
  category: string | null; // 'salary' | 'freelance' | 'investment' | 'business' | 'rental' | 'other'
  description: string | null;
  nextPaymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  usedAmount: number;
  availableAmount: number;
  dueDate: number; // Day of the month (1-31)
  createdAt: Date;
  updatedAt: Date;
}

export interface Transfer {
  id: string;
  amount: number;
  source: string;
  destination: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyBudget {
  totalIncome: number;
  totalExpenses: number;
  totalEMIs: number;
  balance: number;
  month: number;
  year: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
