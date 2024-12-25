import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import admin from 'firebase-admin';
import { z } from 'zod';

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

const reportSchema = z.object({
  scammerUsername: z.string().min(2),
  platform: z.string(),
  scamType: z.string(),
  description: z.string().min(10),
  evidence: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const validatedData = reportSchema.parse(body);

    const report = await prisma.scamReport.create({
      data: {
        ...validatedData,
        reportedBy: userId,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (_error) {
    // Optionally log the error for debugging
    console.error("Failed to create report:", _error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const reports = await prisma.scamReport.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (_error) {
    // Optionally log the error for debugging
    console.error("Failed to retrieve reports:", _error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
