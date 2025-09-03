import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Handle different action types
    if (data.action) {
      // Get current credit card
      const currentCard = await prisma.creditCard.findFirst({
        where: { 
          id: id,
          userId: user.id 
        }
      })

      if (!currentCard) {
        return NextResponse.json({ error: 'Credit card not found' }, { status: 404 })
      }

      let newUsedAmount = currentCard.usedAmount

      if (data.action === 'expense') {
        // Credit card expense - increase used amount (decrease available)
        newUsedAmount = currentCard.usedAmount + data.amount
        
        // Check if it exceeds the limit
        if (newUsedAmount > currentCard.limit) {
          return NextResponse.json({ 
            error: `Insufficient credit limit. Available: ₹${currentCard.availableAmount}, Required: ₹${data.amount}` 
          }, { status: 400 })
        }
      } else if (data.action === 'payment') {
        // Credit card payment - decrease used amount (increase available)
        newUsedAmount = Math.max(0, currentCard.usedAmount - data.amount)
      }

      const newAvailableAmount = currentCard.limit - newUsedAmount

      // Update credit card with new amounts
      const updatedCard = await prisma.creditCard.update({
        where: { id: id },
        data: {
          usedAmount: newUsedAmount,
          availableAmount: newAvailableAmount,
          updatedAt: new Date()
        }
      })

      return NextResponse.json(updatedCard)
    }

    // Original update logic for full credit card updates
    // Calculate available amount
    const availableAmount = data.limit - data.usedAmount

    // Update credit card only if it belongs to the current user
    const creditCard = await prisma.creditCard.updateMany({
      where: { 
        id: id,
        userId: user.id 
      },
      data: {
        name: data.name,
        limit: data.limit,
        usedAmount: data.usedAmount,
        availableAmount: availableAmount,
        dueDate: data.dueDate,
        updatedAt: new Date()
      }
    })

    if (creditCard.count === 0) {
      return NextResponse.json({ error: 'Credit card not found' }, { status: 404 })
    }

    // Fetch the updated credit card to return
    const updatedCreditCard = await prisma.creditCard.findUnique({
      where: { id: id }
    })

    return NextResponse.json(updatedCreditCard)
  } catch (error) {
    console.error('Error updating credit card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    // Delete credit card only if it belongs to the current user
    const creditCard = await prisma.creditCard.deleteMany({
      where: { 
        id: id,
        userId: user.id 
      }
    })

    if (creditCard.count === 0) {
      return NextResponse.json({ error: 'Credit card not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting credit card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
