import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { markEMIPaid } from '@/lib/emi-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the current EMI
    const currentEmi = await prisma.emi.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    })

    if (!currentEmi) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    // Use the utility function to calculate new remaining installments safely
    const updatedEMIData = markEMIPaid(currentEmi)

    // Validate EMI data before creating expense
    if (!currentEmi.title || !currentEmi.amount) {
      console.error('EMI validation failed:', { title: currentEmi.title, amount: currentEmi.amount })
      return NextResponse.json({ 
        error: 'EMI data is incomplete. Missing title or amount.' 
      }, { status: 400 })
    }

    // Clean up the EMI title (remove extra whitespace)
    const cleanTitle = currentEmi.title.trim()

    // Start a transaction to update EMI and create expense
    const result = await prisma.$transaction(async (tx: any) => {
      // Update the EMI
      const updatedEmi = await tx.emi.update({
        where: { id: id },
        data: {
          paidInstallments: updatedEMIData.paidInstallments,
          remainingInstallments: updatedEMIData.remainingInstallments,
          lastPaymentDate: new Date(),
          updatedAt: new Date()
        }
      })

      // Create an expense entry for this EMI payment
      const currentDate = new Date()
      const expenseEntry = await tx.expense.create({
        data: {
          title: `${cleanTitle} - EMI Payment`,
          amount: Number(currentEmi.amount),
          dueDate: currentDate.getDate(),
          category: 'emi',
          isRecurring: false,
          isPaid: true,
          paidAt: currentDate,
          source: 'Bank Account',
          destination: cleanTitle,
          userId: user.id,
          createdAt: currentDate,
          updatedAt: currentDate
        }
      })

      return { updatedEmi, expenseEntry }
    })

    return NextResponse.json({
      ...result.updatedEmi,
      expenseCreated: true,
      expenseId: result.expenseEntry.id
    })

  } catch (error) {
    console.error('Error marking EMI payment:', error)
    return NextResponse.json(
      { error: 'Failed to mark EMI payment' },
      { status: 500 }
    )
  }
}