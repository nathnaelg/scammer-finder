"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface AdminProfile {
  username: string
  email: string
  role: string
  joinDate: string
  reportsReviewed: number
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (!user) {
        router.push("/admin/signin")
      } else {
        try {
          await fetchAdminProfile()
        } catch (error) {
          console.error("Error fetching admin profile:", error)
          if (error instanceof Error && error.message === "Unauthorized") {
            toast({
              title: "Authentication Error",
              description: "Please sign in again as an admin.",
              variant: "destructive",
            })
            router.push("/admin/signin")
          } else {
            toast({
              title: "Error",
              description: "Failed to load admin profile. Please try again.",
              variant: "destructive",
            })
          }
        }
      }
    }
    checkAuth()
  }, [user, loading, router])

  const fetchAdminProfile = async () => {
    const token = await user?.getIdToken()
    if (!token) throw new Error("No authentication token")
    
    const response = await fetch("/api/admin/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized")
      }
      throw new Error("Failed to fetch admin profile")
    }

    const data = await response.json()
    setProfile(data)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await user?.getIdToken()
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })
      if (!response.ok) {
        throw new Error("Failed to update profile")
      }
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your admin profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating admin profile:", error)
      toast({
        title: "Error",
        description: "Failed to update admin profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading || !profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center mb-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-0 md:mr-6">
              <AvatarImage src="/placeholder-admin.jpg" alt={profile.username} />
              <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{profile.username}</h2>
              <p className="text-muted-foreground">{profile.role}</p>
              <p className="text-sm text-muted-foreground">Joined on {new Date(profile.joinDate).toLocaleDateString()}</p>
              <p className="text-sm font-medium mt-2">Reports Reviewed: {profile.reportsReviewed}</p>
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

