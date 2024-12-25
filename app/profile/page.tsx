"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function UserProfile() {
  const [username, setUsername] = useState("JohnDoe")
  const [email, setEmail] = useState("johndoe@example.com")
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // Here you would typically call an API to update the user's profile
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        {isEditing ? (
          <Button onClick={handleSave}>Save Changes</Button>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>
    </div>
  )
}

