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

    const emis = await prisma.emi.findMany({
      where: { userId: user.id },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(emis)
  } catch (error) {
    console.error('Error fetching EMIs:', error)
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

    const emi = await prisma.emi.create({
      data: {
        ...data,
        userId: user.id,
        startDate: new Date(data.startDate),
        dueDate: data.dueDate
      }
    })

    return NextResponse.json(emi)
  } catch (error) {
    console.error('Error creating EMI:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
