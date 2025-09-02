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

    // Process the data, converting dates if needed
    const updateData = {
      ...data
    }

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate)
    }

    // Update EMI only if it belongs to the current user
    const emi = await prisma.emi.updateMany({
      where: { 
        id: id,
        userId: user.id 
      },
      data: updateData
    })

    if (emi.count === 0) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    // Fetch the updated EMI to return
    const updatedEmi = await prisma.emi.findUnique({
      where: { id: id }
    })

    return NextResponse.json(updatedEmi)
  } catch (error) {
    console.error('Error updating EMI:', error)
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

    // Delete EMI only if it belongs to the current user
    const emi = await prisma.emi.deleteMany({
      where: { 
        id: id,
        userId: user.id 
      }
    })

    if (emi.count === 0) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting EMI:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
