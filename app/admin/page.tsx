"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ScamReport {
  id: number
  scammerUsername: string
  platform: string
  scamType: string
  status: string
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<ScamReport[]>([])
  const { user } = useAuth()
  const router = useRouter()

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      router.push("/signin")
      return
    }

    try {
      const token = await user.getIdToken()
      const response = await fetch("/api/admin/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Not authorized")
    } catch {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [user, router])

  const fetchReports = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch("/api/admin/reports", {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch reports")

      const data = await response.json()
      setReports(data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive",
      })
    }
  }, [user])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleStatusChange = async (reportId: number, newStatus: string) => {
    if (!user) return

    try {
      const response = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ id: reportId, status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update report status")

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      )

      toast({
        title: "Status Updated",
        description: "The report status has been successfully updated.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update report status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReport = async (reportId: number) => {
    if (!user) return

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete report")

      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== reportId)
      )

      toast({
        title: "Report Deleted",
        description: "The report has been successfully deleted.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Table>
        <TableCaption>Reported scams requiring review.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Reported Username</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Scam Type</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell>
                <Select
                  onValueChange={(value) => handleStatusChange(report.id, value)}
                  defaultValue={report.status}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="ml-2"
                  onClick={() => handleDeleteReport(report.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
