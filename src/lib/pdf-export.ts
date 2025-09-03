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
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'Rs. 0.00';
    
    // Safe formatting without special Unicode characters
    const formatted = Math.abs(numAmount).toFixed(2);
    const parts = formatted.split('.');
    let wholePart = parts[0];
    
    // Add commas for thousands
    wholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    const sign = numAmount < 0 ? '-' : '';
    return `${sign}Rs. ${wholePart}.${parts[1]}`;
  }

  private static formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private static getFrequencyMultiplier(frequency: string): number {
    switch (frequency?.toLowerCase()) {
      case 'daily': return 30;
      case 'weekly': return 4.33;
      case 'monthly': return 1;
      case 'yearly': return 1/12;
      case 'one-time': return 0;
      default: return 1;
    }
  }

  private static addPageHeader(doc: jsPDF, pageNumber: number, totalPages: number): void {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Professional header background
    doc.setFillColor(4, 19, 42);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPENSE TRACKER', margin, 25);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Financial Statement Report', margin, 38);

    doc.setFontSize(10);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 60, 25);
    
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 60, 35);
  }

  private static addPageFooter(doc: jsPDF): void {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('A Vayu Innovation', pageWidth / 2, pageHeight - 14, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('This document contains confidential financial information', pageWidth / 2, pageHeight - 7, { align: 'center' });
  }

  static async generateStatement(data: StatementData): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let currentPage = 1;

    this.addPageHeader(doc, currentPage, 1);

    doc.setTextColor(0, 0, 0);
    let yPosition = 65;

    // Statement Info Section
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), 35, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), 35);
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 19, 42);
    doc.text('STATEMENT PERIOD', margin + 10, yPosition);
    
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`From: ${this.formatDate(data.startDate)}`, margin + 10, yPosition);
    doc.text(`To: ${this.formatDate(data.endDate)}`, margin + 80, yPosition);
    
    if (data.userName) {
      yPosition += 8;
      doc.text(`Account Holder: ${data.userName}`, margin + 10, yPosition);
    }
    
    yPosition += 25;

    // Calculate totals
    const totalIncome = data.income.reduce((sum, income) => {
      const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
      if (isNaN(amount)) return sum;
      const frequency = income.frequency || 'monthly';
      
      if (frequency === 'one-time') {
        return sum + amount;
      } else {
        return sum + (amount * this.getFrequencyMultiplier(frequency));
      }
    }, 0);

    const totalExpenses = data.expenses.reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalOutstandingEMIs = data.emis
      .filter(emi => emi.remainingInstallments > 0)
      .reduce((sum, emi) => {
        const amount = typeof emi.amount === 'string' ? parseFloat(emi.amount) : emi.amount;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    // INCOME SECTION
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      currentPage++;
      this.addPageHeader(doc, currentPage, 1);
      yPosition = 65;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 160, 133);
    doc.text('INCOME SOURCES', margin, yPosition);
    yPosition += 12;

    if (data.income.length > 0) {
      const incomeData = data.income.map(income => {
        const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
        const displayAmount = isNaN(amount) ? 0 : amount;
        const frequency = income.frequency || 'monthly';
        
        let monthlyAmount;
        if (frequency === 'one-time') {
          monthlyAmount = displayAmount;
        } else {
          monthlyAmount = displayAmount * this.getFrequencyMultiplier(frequency);
        }
        
        return [
          income.source || 'Unknown Source',
          frequency.charAt(0).toUpperCase() + frequency.slice(1),
          this.formatCurrency(displayAmount),
          this.formatCurrency(monthlyAmount),
          this.formatDate(income.createdAt),
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Income Source', 'Frequency', 'Base Amount', 'Monthly Equivalent', 'Date Added']],
        body: incomeData,
        foot: [['TOTAL MONTHLY INCOME', '', '', this.formatCurrency(totalIncome), '']],
        theme: 'striped',
        headStyles: { 
          fillColor: [22, 160, 133],
          fontSize: 11,
          fontStyle: 'bold',
          textColor: [255, 255, 255],
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: [50, 50, 50]
        },
        footStyles: { 
          fillColor: [22, 160, 133], 
          fontStyle: 'bold',
          fontSize: 11,
          textColor: [255, 255, 255]
        },
        columnStyles: {
          2: { halign: 'right', fontStyle: 'bold' },
          3: { halign: 'right', fontStyle: 'bold' },
          4: { halign: 'center' }
        },
        margin: { left: margin, right: margin },
        alternateRowStyles: { fillColor: [248, 249, 250] }
      });
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('No income sources found for this period.', margin, yPosition);
      yPosition += 20;
    }

    // EXPENSES SECTION
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      currentPage++;
      this.addPageHeader(doc, currentPage, 1);
      yPosition = 65;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(231, 76, 60);
    doc.text('EXPENSES & PAYMENTS', margin, yPosition);
    yPosition += 12;

    if (data.expenses.length > 0) {
      const expenseData = data.expenses.map(expense => {
        const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
        const displayAmount = isNaN(amount) ? 0 : amount;
        
        const getDaySuffix = (day: number) => {
          if (day >= 11 && day <= 13) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };

        return [
          expense.title || 'Untitled Expense',
          expense.category.replace('_', ' ').toUpperCase(),
          `${expense.dueDate}${getDaySuffix(expense.dueDate)} of month`,
          this.formatCurrency(displayAmount),
          expense.isPaid ? 'PAID' : 'PENDING',
          expense.source || '—',
          expense.destination || '—',
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Expense Title', 'Category', 'Due Date', 'Amount', 'Status', 'From', 'To']],
        body: expenseData,
        foot: [['TOTAL EXPENSES', '', '', this.formatCurrency(totalExpenses), '', '', '']],
        theme: 'striped',
        headStyles: { 
          fillColor: [231, 76, 60],
          fontSize: 11,
          fontStyle: 'bold',
          textColor: [255, 255, 255],
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: [50, 50, 50]
        },
        footStyles: { 
          fillColor: [231, 76, 60], 
          fontStyle: 'bold',
          fontSize: 11,
          textColor: [255, 255, 255]
        },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'right', fontStyle: 'bold' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center' }
        },
        margin: { left: margin, right: margin },
        alternateRowStyles: { fillColor: [248, 249, 250] }
      });
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('No expenses found for this period.', margin, yPosition);
      yPosition += 20;
    }

    // OUTSTANDING EMIs SECTION
    const outstandingEMIs = data.emis.filter(emi => emi.remainingInstallments > 0);
    
    if (outstandingEMIs.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        currentPage++;
        this.addPageHeader(doc, currentPage, 1);
        yPosition = 65;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(155, 89, 182);
      doc.text('OUTSTANDING EMIs', margin, yPosition);
      yPosition += 12;

      const emiData = outstandingEMIs.map(emi => {
        const amount = typeof emi.amount === 'string' ? parseFloat(emi.amount) : emi.amount;
        const displayAmount = isNaN(amount) ? 0 : amount;
        
        const getDaySuffix = (day: number) => {
          if (day >= 11 && day <= 13) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };

        return [
          emi.title || 'Untitled EMI',
          `${emi.dueDate}${getDaySuffix(emi.dueDate)} of month`,
          this.formatCurrency(displayAmount),
          `${emi.remainingInstallments} / ${emi.totalInstallments}`,
          this.formatDate(emi.startDate),
          emi.creditCardId ? 'Credit Card' : 'Direct Payment',
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['EMI Title', 'Due Date', 'Monthly Amount', 'Remaining/Total', 'Start Date', 'Payment Mode']],
        body: emiData,
        foot: [['TOTAL MONTHLY EMI BURDEN', '', this.formatCurrency(totalOutstandingEMIs), '', '', '']],
        theme: 'striped',
        headStyles: { 
          fillColor: [155, 89, 182],
          fontSize: 11,
          fontStyle: 'bold',
          textColor: [255, 255, 255],
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: [50, 50, 50]
        },
        footStyles: { 
          fillColor: [155, 89, 182], 
          fontStyle: 'bold',
          fontSize: 11,
          textColor: [255, 255, 255]
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right', fontStyle: 'bold' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' }
        },
        margin: { left: margin, right: margin },
        alternateRowStyles: { fillColor: [248, 249, 250] }
      });
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // FINANCIAL SUMMARY SECTION
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      currentPage++;
      this.addPageHeader(doc, currentPage, 1);
      yPosition = 65;
    }

    const summaryHeight = 85;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), summaryHeight, 'F');
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(1);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), summaryHeight);
    
    yPosition += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 19, 42);
    doc.text('FINANCIAL SUMMARY', margin + 15, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const netBalance = totalIncome - totalExpenses - totalOutstandingEMIs;
    
    const summaryItems = [
      ['Total Monthly Income:', this.formatCurrency(totalIncome), 'income'],
      ['Total Expenses:', this.formatCurrency(totalExpenses), 'expense'],
      ['Outstanding EMI Burden:', this.formatCurrency(totalOutstandingEMIs), 'emi'],
      ['Net Available Balance:', this.formatCurrency(netBalance), netBalance >= 0 ? 'positive' : 'negative'],
    ];

    summaryItems.forEach(([label, value, type]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(label, margin + 15, yPosition);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      
      switch (type) {
        case 'income':
          doc.setTextColor(22, 160, 133);
          break;
        case 'expense':
          doc.setTextColor(231, 76, 60);
          break;
        case 'emi':
          doc.setTextColor(155, 89, 182);
          break;
        case 'positive':
          doc.setTextColor(46, 125, 50);
          break;
        case 'negative':
          doc.setTextColor(198, 40, 40);
          break;
        default:
          doc.setTextColor(0, 0, 0);
      }
      
      doc.text(value, pageWidth - margin - 15, yPosition, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      yPosition += 12;
    });

    // Update total pages and add footer only to last page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      if (i > 1) {
        this.addPageHeader(doc, i, totalPages);
      } else {
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 60, 25);
      }
      
      // Add footer only to the last page
      if (i === totalPages) {
        this.addPageFooter(doc);
      }
    }

    const startDateStr = this.formatDate(data.startDate).replace(/\s+/g, '-');
    const endDateStr = this.formatDate(data.endDate).replace(/\s+/g, '-');
    const filename = `Financial-Statement-${startDateStr}-to-${endDateStr}.pdf`;
    
    doc.save(filename);
  }
}
