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

    // Calculate remaining installments
    const newRemainingInstallments = Math.max(0, currentEmi.remainingInstallments - 1)

    // Update the EMI
    const updatedEmi = await prisma.emi.update({
      where: { id: id },
      data: {
        remainingInstallments: newRemainingInstallments,
        lastPaymentDate: new Date()
      }
    })

    return NextResponse.json(updatedEmi)
  } catch (error) {
    console.error('Error marking EMI as paid:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
