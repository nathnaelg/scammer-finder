import { NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const firebaseUid = decodedToken.uid

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 403 })
    }

    // Count the number of reports reviewed by this admin
    const reportsReviewed = await prisma.scamReport.count({
      where: {
        status: { in: ['RESOLVED', 'REJECTED'] },
        updatedBy: user.id,
      },
    })

    return NextResponse.json({
      username: user.username,
      email: user.email,
      role: user.role,
      joinDate: user.createdAt.toISOString(),
      reportsReviewed,
    })
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const firebaseUid = decodedToken.uid

    const body = await req.json()
    const { username, email } = body

    const updatedUser = await prisma.user.update({
      where: { firebaseUid },
      data: { username, email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (updatedUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 403 })
    }

    const reportsReviewed = await prisma.scamReport.count({
      where: {
        status: { in: ['RESOLVED', 'REJECTED'] },
        updatedBy: updatedUser.id,
      },
    })

    return NextResponse.json({
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      joinDate: updatedUser.createdAt.toISOString(),
      reportsReviewed,
    })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

