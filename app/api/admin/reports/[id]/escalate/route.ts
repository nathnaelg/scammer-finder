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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const { status } = await req.json()

    const updatedReport = await prisma.scamReport.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    )
  }
}

