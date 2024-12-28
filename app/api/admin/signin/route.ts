import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'
import { z } from 'zod'

const signinSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { email } = signinSchema.parse(body)

    const decodedToken = await auth.verifyIdToken(token)
    const firebaseUid = decodedToken.uid

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

    // Set custom claims for admin
    await auth.setCustomUserClaims(firebaseUid, { admin: true })

    return NextResponse.json({ message: 'Admin signed in successfully' })
  } catch (error) {
    console.error('Admin signin error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

