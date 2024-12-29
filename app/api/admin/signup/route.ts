import { config } from 'dotenv'
config() // This will load the .env file

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  adminKey: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, adminKey } = signupSchema.parse(body)

    console.log('Received admin key:', adminKey)
    console.log('Expected admin key:', process.env.ADMIN_REGISTRATION_KEY)

    // Verify admin registration key
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      console.log('Admin key mismatch')
      return NextResponse.json({ error: 'Invalid admin key' }, { status: 403 })
    }

    // Create user in Firebase
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
    })

    // Create user in database with admin role
    const user = await prisma.user.create({
      data: {
        email,
        username: email.split('@')[0], // Using email as username for simplicity
        firebaseUid: userRecord.uid,
        role: 'ADMIN',
      },
    })

    // Set custom claims for admin
    await auth.setCustomUserClaims(userRecord.uid, { admin: true })

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
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    )
  }
}

