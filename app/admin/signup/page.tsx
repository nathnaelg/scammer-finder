"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function AdminSignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    try {
      let userCredential;
      try {
        // Try to create a new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
      } catch (error: any) {
        // If the email is already in use, try to sign in instead
        if (error.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(auth, email, password)
        } else {
          throw error;
        }
      }

      const idToken = await userCredential.user.getIdToken()

      // Register as admin with our backend
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email,
          password, // Include password in the request
          adminKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create admin account')
      }

      toast({
        title: "Admin account created successfully",
        description: "You can now log in with your new admin account.",
      })
      router.push("/admin/signin")
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create an admin account. Please check your admin key and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-full max-w-lg p-10 bg-card text-foreground rounded-lg shadow-lg dark:shadow-black">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Sign Up</h1>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
          <div className="mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="adminKey">Admin Registration Key</Label>
            <Input
              id="adminKey"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin registration key"
              required
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black"
          >
            Create Admin Account
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/admin/signin" className="text-primary hover:underline">
            Already have an admin account? Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

