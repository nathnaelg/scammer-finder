import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await auth.verifyIdToken(token)
    } catch (error) {
      console.error('Error verifying token:', error)
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 })
    }

    const { id } = params
    const { status } = await req.json()

    if (!['Pending', 'Under Review', 'Confirmed', 'Rejected', 'Escalated'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 })
    }

    const updatedReport = await prisma.scamReport.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json(
      { error: 'Failed to update report: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

