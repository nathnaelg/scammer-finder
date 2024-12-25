import prisma from './prisma'

interface ScamProfile {
  username: string
  platform: string
  scamType: string
  description: string
}

export async function detectScam(profile: ScamProfile): Promise<number> {
  let riskScore = 0

  // Check if the username has been reported before
  const existingReports = await prisma.scamReport.count({
    where: {
      scammerUsername: profile.username,
      status: 'Confirmed',
    },
  })

  if (existingReports > 0) {
    riskScore += 50
  }

  // Check for suspicious keywords in the description
  const suspiciousKeywords = ['free money', 'get rich quick', 'investment opportunity', 'limited time offer']
  const descriptionLower = profile.description.toLowerCase()
  for (const keyword of suspiciousKeywords) {
    if (descriptionLower.includes(keyword)) {
      riskScore += 10
    }
  }

  // Check for common scam types
  const highRiskScamTypes = ['phishing', 'financial fraud', 'identity theft']
  if (highRiskScamTypes.includes(profile.scamType.toLowerCase())) {
    riskScore += 20
  }

  // Check for newly created accounts (you would need to implement this logic based on your user data)
  // For example:
  // const user = await prisma.user.findUnique({ where: { username: profile.username } })
  // if (user && user.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000) {
  //   riskScore += 15
  // }

  // Cross-platform verification
  const crossPlatformReports = await prisma.scamReport.count({
    where: {
      scammerUsername: profile.username,
      platform: { not: profile.platform },
      status: 'Confirmed',
    },
  })

  if (crossPlatformReports > 0) {
    riskScore += 30
  }

  return Math.min(riskScore, 100)
}

export async function validateReport(report: ScamProfile): Promise<boolean> {
  // Implement additional validation logic here
  // For example, check for duplicate reports, verify user credentials, etc.
  return true
}

export async function updateRiskScores(): Promise<void> {
  const reports = await prisma.scamReport.findMany({
    where: { status: 'Confirmed' },
  })

  for (const report of reports) {
    const riskScore = await detectScam({
      username: report.scammerUsername,
      platform: report.platform,
      scamType: report.scamType,
      description: report.description,
    })

    await prisma.scamReport.update({
      where: { id: report.id },
      data: { riskScore },
    })
  }
}
