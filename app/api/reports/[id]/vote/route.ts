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

    const firebaseUid = decodedToken.uid

    const body = await req.json()
    const { voteType } = voteSchema.parse(body)

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Report ID is missing" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const report = await prisma.scamReport.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_reportId: {
          userId: user.id,
          reportId: report.id,
        },
      },
    })

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        return NextResponse.json({ error: 'You have already voted' }, { status: 400 })
      }

      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { voteType },
      })
    } else {
      await prisma.vote.create({
        data: {
          userId: user.id,
          reportId: report.id,
          voteType,
        },
      })
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

