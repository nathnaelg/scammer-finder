import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'
import { z } from 'zod'
import { calculateRiskScore, checkAgainstKnownScams } from '@/lib/scamDetection'
import { Prisma } from '@prisma/client';

const reportSchema = z.object({
  scammerUsername: z.string().min(2),
  platform: z.string(),
  scamType: z.string(),
  description: z.string().min(10),
  evidence: z.string().optional(),
})

export async function POST(req: Request) {
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
    let validatedData;
    try {
      validatedData = reportSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 })
      }
      throw error
    }

    const riskScore = await calculateRiskScore({
      username: validatedData.scammerUsername,
      platform: validatedData.platform,
      description: validatedData.description,
      createdAt: new Date(),
    })

    const isKnownScam = await checkAgainstKnownScams(validatedData.scammerUsername)

    const report = await prisma.scamReport.create({
      data: {
        ...validatedData,
        reportedBy: userId,
        riskScore,
        status: isKnownScam ? 'Confirmed' : 'Pending',
      },
    })

    return NextResponse.json({ ...report, riskScore }, { status: 201 })
  } catch (error) {
    console.error('Error submitting report:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const pageSize = 10

    const whereClause: Prisma.ScamReportWhereInput = {
      AND: [
        status !== 'all' ? { status } : {},
        {
          OR: [
            { scammerUsername: { contains: search, mode: 'insensitive' } },
            { platform: { contains: search, mode: 'insensitive' } },
            { scamType: { contains: search, mode: 'insensitive' } },
          ],
        },
      ],
    };

    const reports = await prisma.scamReport.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    const totalReports = await prisma.scamReport.count({
      where: whereClause,
    })

    const totalPages = Math.ceil(totalReports / pageSize)

    return NextResponse.json({
      reports,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

