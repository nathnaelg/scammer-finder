"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface ScamReport {
  id: number
  scammerUsername: string
  platform: string
  scamType: string
  status: string
  riskScore: number
  communityVotes: number
}

export default function ScamDatabase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [reports, setReports] = useState<ScamReport[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()

  const fetchReports = async () => {
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch(`/api/reports?page=${page}&search=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch scam reports")
      }

      const data = await response.json()
      setReports(data.reports)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch scam reports. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchReports()
  }, [user, page, searchTerm])

  const handleVote = async (reportId: number, voteType: "up" | "down") => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to vote.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = await user.getIdToken()
      console.log("Submitting vote with token:", token)

      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const contentType = response.headers.get("Content-Type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          console.error("Vote submission error details:", errorData)
          throw new Error(errorData.error || "Failed to submit vote")
        } else {
          throw new Error("Unexpected response from server")
        }
      }

      const result = await response.json()
      console.log("Vote submission result:", result)

      await fetchReports()
      toast({
        title: "Vote Submitted",
        description: "Thank you for your input!",
      })
    } catch (error: any) {
      console.error("Error submitting vote:", error.message || error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote. Please try again.",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Scam Database</h1>
      <div className="flex mb-4">
        <Input
          type="text"
          placeholder="Search by username, platform, or scam type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
        <Button onClick={() => setSearchTerm("")}>Clear</Button>
      </div>
      <Table>
        <TableCaption>A list of reported scams and suspicious accounts.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Scam Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Community Votes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.scammerUsername}</TableCell>
              <TableCell>{report.platform}</TableCell>
              <TableCell>{report.scamType}</TableCell>
              <TableCell>{report.status}</TableCell>
              <TableCell>{report.riskScore}</TableCell>
              <TableCell>{report.communityVotes}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(report.id, "up")}
                  className="mr-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(report.id, "down")}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between mt-4">
        <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </Button>
      </div>
    </div>
  )
}
