"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth"

export default function AdminSignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin/dashboard")
    }
  }, [user, loading, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      
      // Verify admin status with our backend
      const response = await fetch('/api/admin/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Unauthorized access')
      }

      toast({
        title: "Signed in successfully",
        description: "Welcome back, admin!",
      })
      router.push("/admin/dashboard")
    } catch (error) {
      console.error('Sign-in error:', error)
      toast({
        title: "Error",
        description: "Failed to sign in. Please check your credentials or admin status.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    return null // or a loading spinner if you prefer
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-full max-w-lg p-10 bg-card text-foreground rounded-lg shadow-lg dark:shadow-black">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Log In</h1>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              required
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black"
          >
            Log In as Admin
          </Button>
        </form>
      </div>
    </div>
  )
}

