import prisma from './prisma'

interface ScamProfile {
  username: string
  platform: string
  description: string
  createdAt: Date
}

export async function calculateRiskScore(profile: ScamProfile): Promise<number> {
  let riskScore = 0

  // Check if the account is newly created (less than 7 days old)
  const accountAge = Date.now() - profile.createdAt.getTime()
  if (accountAge < 7 * 24 * 60 * 60 * 1000) {
    riskScore += 20
  }

  // Check for suspicious keywords in the description
  const suspiciousKeywords = ['free money', 'get rich quick', 'investment opportunity', 'limited time offer']
  const descriptionLower = profile.description.toLowerCase()
  for (const keyword of suspiciousKeywords) {
    if (descriptionLower.includes(keyword)) {
      riskScore += 10
    }
  }

  // Check for suspicious links in the description
  const suspiciousLinkPatterns = [/bit\.ly/, /goo\.gl/, /tinyurl\.com/]
  for (const pattern of suspiciousLinkPatterns) {
    if (pattern.test(descriptionLower)) {
      riskScore += 15
    }
  }

  // Check for cross-platform matches
  const crossPlatformMatches = await prisma.scamReport.count({
    where: {
      scammerUsername: profile.username,
      platform: { not: profile.platform },
      status: 'Confirmed',
    },
  })

  if (crossPlatformMatches > 0) {
    riskScore += 30
  }

  return Math.min(riskScore, 100)
}

export async function checkAgainstKnownScams(username: string): Promise<boolean> {
  // This is a placeholder for integrating with external scam databases
  // In a real-world scenario, you would make an API call to a service like PhishTank or similar
  return false
}

