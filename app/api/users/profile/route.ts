import { NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token)
    } catch (error) {
      console.error('Error verifying token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const firebaseUid = decodedToken.uid

    let user = await prisma.user.findUnique({
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
      // If user doesn't exist in the database, create a new user record
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email: decodedToken.email || '',
          username: decodedToken.email?.split('@')[0] || 'user',
          role: 'USER',
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })
    }

    return NextResponse.json({
      username: user.username,
      email: user.email,
      role: user.role,
      joinDate: user.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token)
    } catch (error) {
      console.error('Error verifying token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

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

    return NextResponse.json({
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      joinDate: updatedUser.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

