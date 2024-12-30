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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import { ArrowUp, ArrowDown, Filter } from 'lucide-react'

interface ScamReport {
  id: string
  scammerUsername: string
  platform: string
  scamType: string
  status: 'Pending' | 'Under Review' | 'Confirmed' | 'Rejected' | 'Escalated'
  riskScore: number
  communityVotes: number
}

const statusColors: Record<ScamReport['status'], string> = {
  'Pending': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  'Under Review': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  'Confirmed': 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  'Rejected': 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  'Escalated': 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
}

export default function ScamDatabase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [reports, setReports] = useState<ScamReport[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()

  const fetchReports = async () => {
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch(
        `/api/reports?page=${page}&search=${searchTerm}&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch scam reports")
      }

      const data = await response.json()
      setReports(data.reports)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast({
        title: "Error",
        description: "Failed to fetch scam reports. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchReports()
  }, [user, page, searchTerm, statusFilter])

  const handleVote = async (reportId: string, voteType: 'up' | 'down') => {
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
      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit vote")
      }

      await fetchReports()
      toast({
        title: "Vote Submitted",
        description: "Thank you for your input!",
      })
    } catch (error) {
      console.error('Error submitting vote:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit vote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPage(1)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Scam Database</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by username, platform, or scam type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of reported scams and suspicious accounts.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Scam Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Risk Score</TableHead>
              <TableHead className="text-right">Community Votes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.scammerUsername}</TableCell>
                <TableCell>{report.platform}</TableCell>
                <TableCell>{report.scamType}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={statusColors[report.status]}
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                    {report.riskScore}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{report.communityVotes}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(report.id, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(report.id, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button 
          variant="outline"
          onClick={() => setPage(page - 1)} 
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button 
          variant="outline"
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

