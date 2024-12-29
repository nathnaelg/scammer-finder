import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const search = searchParams.get('search') || ''
    const pageSize = 10

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

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    const isAdmin = user?.role === 'ADMIN'

    const whereClause: Prisma.ScamReportWhereInput = {
      OR: [
        { scammerUsername: { contains: search, mode: 'insensitive' } },
        { platform: { contains: search, mode: 'insensitive' } },
        { scamType: { contains: search, mode: 'insensitive' } },
      ],
      ...(isAdmin ? {} : { status: 'Confirmed' }),
    }

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
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

