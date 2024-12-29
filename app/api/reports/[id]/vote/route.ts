import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/firebase-admin"
import { z } from "zod"

// Define the schema for validating the vote request
const voteSchema = z.object({
  voteType: z.enum(["up", "down"]),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.get("Authorization")?.split("Bearer ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(token).catch((error) => {
      console.error("Error verifying token:", error)
      return null
    })
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decodedToken.uid

    // Parse the request body and validate against the schema
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { voteType } = voteSchema.parse(body)

    // Safely access `params.id` from the dynamic route
    const reportId = params.id
    if (!reportId) {
      return NextResponse.json({ error: "Report ID is missing" }, { status: 400 })
    }

    // Fetch the scam report by ID
    const report = await prisma.scamReport.findUnique({ where: { id: reportId } })
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Update the communityVotes based on the vote type
    const voteValue = voteType === "up" ? 1 : -1
    const updatedReport = await prisma.scamReport.update({
      where: { id: reportId },
      data: {
        communityVotes: {
          increment: voteValue,
        },
      },
    })

    // Return the updated report
    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Error submitting vote:", error)

    // Handle schema validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    // Return a generic 500 error for unexpected issues
    return NextResponse.json(
      { error: "Failed to submit vote", details: String(error) },
      { status: 500 }
    )
  }
}
