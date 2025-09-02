import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, ensure the user exists in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId }
      })
    }

    const creditCards = await prisma.creditCard.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(creditCards)
  } catch (error) {
    console.error('Error fetching credit cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Ensure the user exists in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId }
      })
    }

    const creditCard = await prisma.creditCard.create({
      data: {
        ...data,
        userId: user.id
      }
    })

    return NextResponse.json(creditCard)
  } catch (error) {
    console.error('Error creating credit card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
