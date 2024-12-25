import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import admin from 'firebase-admin';
import { z } from 'zod';

const updateReportSchema = z.object({
  id: z.number(),
  status: z.enum(['Pending', 'Under Review', 'Confirmed', 'Rejected']),
});

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin.auth() to verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateReportSchema.parse(body);

    const updatedReport = await prisma.scamReport.update({
      where: { id: validatedData.id },
      data: { status: validatedData.status },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
