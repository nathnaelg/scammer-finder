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

interface ScamReport {
  id: number
  scammerUsername: string
  platform: string
  scamType: string
  status: string
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
  }, [user, page, searchTerm])

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.scammerUsername}</TableCell>
              <TableCell>{report.platform}</TableCell>
              <TableCell>{report.scamType}</TableCell>
              <TableCell>{report.status}</TableCell>
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

