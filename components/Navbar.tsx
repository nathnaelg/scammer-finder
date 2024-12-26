"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useAuth } from "@/hooks/useAuth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Navbar() {
  const { user, loading } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-bold">
          Scammer Finder
        </Link>
        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/report">
                    <Button variant="outline">Report Scam</Button>
                  </Link>
                  <Link href="/database">
                    <Button variant="outline">Scam Database</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline">Profile</Button>
                  </Link>
                  <Button onClick={handleSignOut}>Sign Out</Button>
                </>
              ) : (
                <>
                </>
              )}
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}

