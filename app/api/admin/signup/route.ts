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
  console.log('Admin signup attempt initiated')
  try {
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

    // Check if the user already exists in Firebase
    try {
      const existingUser = await auth.getUserByEmail(email)
      if (existingUser) {
        // User exists, check if they're already an admin in our database
        const dbUser = await prisma.user.findUnique({
          where: { firebaseUid: existingUser.uid },
        })

        if (dbUser && dbUser.role === 'ADMIN') {
          return NextResponse.json({ error: 'Admin account already exists' }, { status: 409 })
        } else if (dbUser) {
          // Existing user is not an admin, upgrade their role
          await prisma.user.update({
            where: { firebaseUid: existingUser.uid },
            data: { role: 'ADMIN' },
          })
          await auth.setCustomUserClaims(existingUser.uid, { admin: true })
          return NextResponse.json({ message: 'User upgraded to admin successfully' }, { status: 200 })
        }
      }
    } catch (error) {
      // User doesn't exist in Firebase, proceed with creation
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create admin account', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

