"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle, CheckCircle, XCircle, ArrowUpCircle, Search, Users, ShieldAlert, Activity } from 'lucide-react'

interface ScamReport {
  id: string
  scammerUsername: string
  platform: string
  scamType: string
  status: 'Pending' | 'Under Review' | 'Confirmed' | 'Rejected' | 'Escalated'
  reportedAt: string
  description: string
}

interface DashboardStats {
  totalReports: number
  pendingReview: number
  confirmedScams: number
  escalatedCases: number
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<ScamReport[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReview: 0,
    confirmedScams: 0,
    escalatedCases: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/signin")
      } else {
        checkAdminStatus()
      }
    }
  }, [user, loading, router])

  const checkAdminStatus = async () => {
    try {
      const token = await user?.getIdToken()
      const response = await fetch("/api/admin/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsAdmin(true)
        fetchDashboardData()
      } else {
        throw new Error("User is not an admin")
      }
    } catch (error) {
      console.error("Admin check error:", error)
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      })
      router.push("/")
    }
  }

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch dashboard data")
      }

      const data = await response.json()
      console.log("Dashboard data:", data)
      setReports(data.reports || [])
      setStats(data.stats || {
        totalReports: 0,
        pendingReview: 0,
        confirmedScams: 0,
        escalatedCases: 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load dashboard data",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (reportId: string, newStatus: ScamReport['status']) => {
    try {
      const token = await user?.getIdToken()
      if (!token) {
        throw new Error("No authentication token available")
      }

      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update report status")
      }

      const updatedReport = await response.json()
      console.log("Updated report:", updatedReport)

      fetchDashboardData()
      toast({
        title: "Status Updated",
        description: `The report status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating report status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleEscalate = async (reportId: string) => {
    await handleStatusChange(reportId, 'Escalated')
  }

  const filteredReports = reports.filter(report => 
    (filterStatus === "all" || report.status === filterStatus) &&
    (report.scammerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
     report.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
     report.scamType.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Scams</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedScams}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.escalatedCases}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reported Scams</CardTitle>
          <CardDescription>
            Manage and review reported scam profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="Pending">Pending Review</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.scammerUsername}
                  </TableCell>
                  <TableCell>{report.platform}</TableCell>
                  <TableCell>{report.scamType}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "Confirmed"
                          ? "default"
                          : report.status === "Rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.reportedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, "Confirmed")}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, "Rejected")}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(report.id)}
                      >
                        <ArrowUpCircle className="h-4 w-4 text-blue-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

