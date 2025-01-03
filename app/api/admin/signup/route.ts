import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Add password field
  adminKey: z.string(),
})

export async function POST(req: Request) {
  console.log('Admin signup attempt initiated')
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const firebaseUid = decodedToken.uid

    const body = await req.json()
    console.log('Received body:', JSON.stringify(body, null, 2))
    const { email, password, adminKey } = signupSchema.parse(body)

    console.log('ADMIN_REGISTRATION_KEY:', process.env.ADMIN_REGISTRATION_KEY)
    console.log('Received admin key:', adminKey)

    // Verify admin registration key
    if (!process.env.ADMIN_REGISTRATION_KEY) {
      console.error('ADMIN_REGISTRATION_KEY is not set in environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      console.log('Admin key mismatch')
      return NextResponse.json({ error: 'Invalid admin key' }, { status: 403 })
    }

    // Check if the user already exists in our database
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    })

    if (user) {
      // User exists, check if they're already an admin
      if (user.role === 'ADMIN') {
        return NextResponse.json({ error: 'Admin account already exists' }, { status: 409 })
      } else {
        // Existing user is not an admin, upgrade their role
        user = await prisma.user.update({
          where: { firebaseUid },
          data: { role: 'ADMIN' },
        })
        await auth.setCustomUserClaims(firebaseUid, { admin: true })
        return NextResponse.json({ message: 'User upgraded to admin successfully' }, { status: 200 })
      }
    } else {
      // User doesn't exist in our database, create a new admin user
      user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0], // Using email as username for simplicity
          firebaseUid,
          role: 'ADMIN',
        },
      })
      await auth.setCustomUserClaims(firebaseUid, { admin: true })
    }

    return NextResponse.json({
      message: 'Admin account created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Admin signup error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create admin account', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

