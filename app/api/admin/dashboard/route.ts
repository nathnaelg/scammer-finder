import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin status
    const decodedToken = await auth.verifyIdToken(token)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get dashboard statistics
    const [
      totalReports,
      pendingReview,
      confirmedScams,
      escalatedCases,
      reports
    ] = await Promise.all([
      prisma.scamReport.count(),
      prisma.scamReport.count({
        where: { status: 'Pending' },
      }),
      prisma.scamReport.count({
        where: { status: 'Confirmed' },
      }),
      prisma.scamReport.count({
        where: { status: 'Escalated' },
      }),
      prisma.scamReport.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to 50 most recent reports
        select: {
          id: true,
          scammerUsername: true,
          platform: true,
          scamType: true,
          status: true,
          createdAt: true,
          description: true,
        },
      }),
    ])

    // Transform reports data
    const formattedReports = reports.map(report => ({
      ...report,
      reportedAt: report.createdAt.toISOString(),
    }))

    return NextResponse.json({
      stats: {
        totalReports,
        pendingReview,
        confirmedScams,
        escalatedCases,
      },
      reports: formattedReports,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

