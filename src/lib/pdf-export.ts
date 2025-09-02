import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, Income, EMI } from '@/types';

interface StatementData {
  expenses: Expense[];
  income: Income[];
  emis: EMI[];
  startDate: Date;
  endDate: Date;
  userName?: string;
}

export class PDFExportService {
  private static formatCurrency(amount: number): string {
    // Ensure amount is a number and handle edge cases
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(numAmount));
  }

  private static formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private static getFrequencyMultiplier(frequency: string): number {
    switch (frequency) {
      case 'daily': return 30; // Approximate monthly equivalent
      case 'weekly': return 4;
      case 'monthly': return 1;
      case 'yearly': return 1/12;
      case 'one-time': return 0; // Handled separately
      default: return 1;
    }
  }

  static async generateStatement(data: StatementData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header with company branding
    doc.setFillColor(4, 19, 42); // squid ink color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPENSE TRACKER', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Financial Statement', margin, 35);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Statement period
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statement Period', margin, 60);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${this.formatDate(data.startDate)} to ${this.formatDate(data.endDate)}`,
      margin,
      70
    );

    if (data.userName) {
      doc.text(`Account Holder: ${data.userName}`, margin, 80);
    }

    doc.text(`Generated on: ${this.formatDate(new Date())}`, margin, 90);

    let yPosition = 110;

    // Income Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(117, 154, 183); // Walden Pond color
    doc.text('INCOME SOURCES', margin, yPosition);
    yPosition += 10;

    const incomeData = data.income.map(income => {
      // Ensure amount is properly converted to number
      const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
      const frequency = income.frequency || 'monthly';
      
      let monthlyAmount;
      if (frequency === 'one-time') {
        monthlyAmount = amount; // One-time income shows as-is
      } else {
        monthlyAmount = amount * this.getFrequencyMultiplier(frequency);
      }
      
      return [
        income.source || 'Unknown Source',
        frequency.charAt(0).toUpperCase() + frequency.slice(1),
        this.formatCurrency(amount),
        this.formatCurrency(monthlyAmount),
        this.formatDate(income.createdAt),
      ];
    });

    // Calculate total income properly
    const totalIncome = data.income.reduce((sum, income) => {
      const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
      const frequency = income.frequency || 'monthly';
      
      if (frequency === 'one-time') {
        return sum + amount;
      } else {
        return sum + (amount * this.getFrequencyMultiplier(frequency));
      }
    }, 0);

    if (incomeData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Source', 'Frequency', 'Amount', 'Monthly Equiv.', 'Added On']],
        body: incomeData,
        foot: [['TOTAL INCOME', '', '', this.formatCurrency(totalIncome), '']],
        theme: 'grid',
        headStyles: { 
          fillColor: [117, 154, 183],
          fontSize: 10,
          fontStyle: 'bold',
          textColor: [255, 255, 255]
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        footStyles: { 
          fillColor: [117, 154, 183], 
          fontStyle: 'bold',
          fontSize: 10,
          textColor: [255, 255, 255]
        },
        columnStyles: {
          2: { halign: 'right' }, // Amount column
          3: { halign: 'right' }, // Monthly equiv column
        },
        margin: { left: margin, right: margin },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('No income sources found for this period.', margin, yPosition);
      yPosition += 20;
    }

    // Check for new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Expenses Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(206, 110, 85); // Burnt sienna color
    doc.text('EXPENSES', margin, yPosition);
    yPosition += 10;

    const expenseData = data.expenses.map(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      return [
        expense.title || 'Untitled Expense',
        expense.category.toUpperCase(),
        `${expense.dueDate}${expense.dueDate === 1 ? 'st' : expense.dueDate === 2 ? 'nd' : expense.dueDate === 3 ? 'rd' : 'th'}`,
        this.formatCurrency(amount),
        expense.isPaid ? 'Paid' : 'Pending',
        expense.source || '-',
        expense.destination || '-',
      ];
    });

    const totalExpenses = data.expenses.reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      return sum + amount;
    }, 0);

    if (expenseData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Title', 'Category', 'Due Date', 'Amount', 'Status', 'Source', 'Destination']],
        body: expenseData,
        foot: [['TOTAL EXPENSES', '', '', this.formatCurrency(totalExpenses), '', '', '']],
        theme: 'grid',
        headStyles: { 
          fillColor: [206, 110, 85],
          fontSize: 10,
          fontStyle: 'bold',
          textColor: [255, 255, 255]
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        footStyles: { 
          fillColor: [206, 110, 85], 
          fontStyle: 'bold',
          fontSize: 10,
          textColor: [255, 255, 255]
        },
        columnStyles: {
          3: { halign: 'right' }, // Amount column
        },
        margin: { left: margin, right: margin },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('No expenses found for this period.', margin, yPosition);
      yPosition += 20;
    }

    // Check for new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // EMIs Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 19, 42); // squid ink color
    doc.text('EMIs & INSTALLMENTS', margin, yPosition);
    yPosition += 10;

    const emiData = data.emis.map(emi => {
      const amount = typeof emi.amount === 'string' ? parseFloat(emi.amount) : emi.amount;
      return [
        emi.title || 'Untitled EMI',
        `${emi.dueDate}${emi.dueDate === 1 ? 'st' : emi.dueDate === 2 ? 'nd' : emi.dueDate === 3 ? 'rd' : 'th'}`,
        this.formatCurrency(amount),
        `${emi.remainingInstallments}/${emi.totalInstallments}`,
        this.formatDate(emi.startDate),
        emi.creditCardId || 'Direct',
      ];
    });

    const totalEMIs = data.emis.reduce((sum, emi) => {
      const amount = typeof emi.amount === 'string' ? parseFloat(emi.amount) : emi.amount;
      return sum + amount;
    }, 0);

    if (emiData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Title', 'Due Date', 'Amount', 'Remaining/Total', 'Start Date', 'Payment Mode']],
        body: emiData,
        foot: [['TOTAL EMIs', '', this.formatCurrency(totalEMIs), '', '', '']],
        theme: 'grid',
        headStyles: { 
          fillColor: [4, 19, 42],
          fontSize: 10,
          fontStyle: 'bold',
          textColor: [255, 255, 255]
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        footStyles: { 
          fillColor: [4, 19, 42], 
          fontStyle: 'bold',
          fontSize: 10,
          textColor: [255, 255, 255]
        },
        columnStyles: {
          2: { halign: 'right' }, // Amount column
        },
        margin: { left: margin, right: margin },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('No EMIs found for this period.', margin, yPosition);
      yPosition += 20;
    }

    // Check for new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Summary Section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), 60, 'F');
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 19, 42);
    doc.text('FINANCIAL SUMMARY', margin + 10, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const summaryItems = [
      ['Total Monthly Income:', this.formatCurrency(totalIncome)],
      ['Total Expenses:', this.formatCurrency(totalExpenses)],
      ['Total EMIs:', this.formatCurrency(totalEMIs)],
      ['Total Outgoing:', this.formatCurrency(totalExpenses + totalEMIs)],
      ['Net Balance:', this.formatCurrency(totalIncome - totalExpenses - totalEMIs)],
    ];

    summaryItems.forEach(([label, value], index) => {
      doc.setFont('helvetica', 'normal');
      doc.text(label, margin + 10, yPosition);
      doc.setFont('helvetica', 'bold');
      
      // Color code the net balance
      if (label.includes('Net Balance')) {
        const netBalance = totalIncome - totalExpenses - totalEMIs;
        doc.setTextColor(netBalance >= 0 ? 0 : 255, netBalance >= 0 ? 128 : 0, 0);
      }
      
      doc.text(value, pageWidth - margin - 60, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount} | Generated by Expense Tracker`,
        margin,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    const filename = `expense-statement-${this.formatDate(data.startDate)}-to-${this.formatDate(data.endDate)}.pdf`;
    doc.save(filename);
  }
}
