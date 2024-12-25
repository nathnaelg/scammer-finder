"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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
      await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "Account created successfully",
        description: "You can now log in with your new account.",
      })
      router.push("/auth/signin")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create an account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider()

    try {
      await signInWithPopup(auth, provider)
      toast({
        title: "Google Sign-Up Success",
        description: "Your Google account is linked. You can now start using the application.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with Google. Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-full max-w-lg p-10 bg-card text-foreground rounded-lg shadow-lg dark:shadow-black">
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
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
          <Button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black"
          >
            Sign Up
          </Button>
        </form>
        <div className="mt-4">
          <Button
            onClick={handleGoogleSignUp}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-transparent dark:hover:bg-transparent"
          >
            <img
              src="/google-icon.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
          </Button>
        </div>
        <div className="mt-4 text-center">
          <span className="text-sm">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>.
          </span>
        </div>
        <div className="mt-4 text-center">
          <Link href="/auth/signin" className="text-primary hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
