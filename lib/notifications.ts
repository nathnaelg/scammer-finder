import { auth } from './firebase-admin'
import prisma from './prisma'

export async function sendNotification(userId: string, message: string) {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: userId } })
    if (!user) {
      throw new Error('User not found')
    }

    // In a real-world scenario, you would integrate with a push notification service
    // or send an email here. For now, we'll just console.log the notification.
    console.log(`Sending notification to ${user.email}: ${message}`)

    // Store the notification in the database
    await prisma.notification.create({
      data: {
        userId: user.id,
        message,
        read: false,
      },
    })
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

export async function notifyUserOfSuspiciousActivity(userId: string, scammerUsername: string) {
  const message = `Warning: You have interacted with a potentially suspicious account: ${scammerUsername}`
  await sendNotification(userId, message)
}

