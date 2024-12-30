import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'
import { z } from 'zod'

const voteSchema = z.object({
  voteType: z.enum(['up', 'down']),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const userId = decodedToken.uid

    const body = await req.json()
    const { voteType } = voteSchema.parse(body)

    // Properly await and validate params
    const { id } = await Promise.resolve(params)
    if (!id) {
      return NextResponse.json({ error: "Report ID is missing" }, { status: 400 })
    }

    const report = await prisma.scamReport.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const voteValue = voteType === 'up' ? 1 : -1

    const updatedReport = await prisma.scamReport.update({
      where: { id },
      data: {
        communityVotes: {
          increment: voteValue,
        },
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Error submitting vote:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to submit vote', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

