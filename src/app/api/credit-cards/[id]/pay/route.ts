import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    console.log('Payment API called. User ID:', userId, 'Card ID:', id)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount } = await request.json()
    console.log('Payment amount:', amount)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    console.log('User found:', user?.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the current credit card
    const currentCard = await prisma.creditCard.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    })

    console.log('Current card found:', currentCard?.name)

    if (!currentCard) {
      return NextResponse.json({ error: 'Credit card not found' }, { status: 404 })
    }

    // Validate payment amount
    if (amount > currentCard.usedAmount) {
      return NextResponse.json({ 
        error: 'Payment amount cannot exceed the used amount' 
      }, { status: 400 })
    }

    // Calculate new amounts
    const newUsedAmount = currentCard.usedAmount - amount
    const newAvailableAmount = currentCard.limit - newUsedAmount

    // Start a transaction to update credit card and create expense
    const result = await prisma.$transaction(async (tx: any) => {
      // Update the credit card
      const updatedCard = await tx.creditCard.update({
        where: { id: id },
        data: {
          usedAmount: newUsedAmount,
          availableAmount: newAvailableAmount,
          updatedAt: new Date()
        }
      })

      // Create an expense entry for this credit card payment
      const currentDate = new Date()
      const expenseEntry = await tx.expense.create({
        data: {
          title: `${currentCard.name} - Credit Card Payment`,
          amount: Number(amount),
          dueDate: currentDate.getDate(),
          category: 'expense',
          isRecurring: false,
          isPaid: true,
          paidAt: currentDate,
          source: 'Bank Account',
          destination: currentCard.name,
          userId: user.id,
          createdAt: currentDate,
          updatedAt: currentDate
        }
      })

      console.log('Expense created:', expenseEntry.id)
      return { updatedCard, expenseEntry }
    })

    return NextResponse.json({
      updatedCard: result.updatedCard,
      expenseCreated: true,
      expenseId: result.expenseEntry.id,
      message: 'Payment processed successfully'
    })

  } catch (error: any) {
    console.error('Error processing credit card payment:', error)
    
    // Provide more specific error messages
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Credit card not found' },
        { status: 404 }
      )
    }
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Database constraint error' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: `Failed to process payment: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
