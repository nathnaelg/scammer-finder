import { NextResponse } from 'next/server';
import admin from 'firebase-admin'; // Removed unused `auth` import

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}


export async function POST(req: Request) {
  try {
    const { title, body, token } = await req.json();

    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    const response = await admin.messaging().send(message);
    return NextResponse.json({ success: true, response });
  } catch (_error) {
    // Optionally log the error for debugging
    console.error("Failed to send notification:", _error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
