import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Welcome to Scammer Finder</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Help us make the internet safer by reporting and identifying scams across various platforms.
      </p>
      <div className="flex space-x-4">
        <Link href="/report">
          <Button size="lg">Report a Scam</Button>
        </Link>
        <Link href="/database">
          <Button size="lg" variant="outline">View Scam Database</Button>
        </Link>
        
      </div>
    </div>
  )
}
