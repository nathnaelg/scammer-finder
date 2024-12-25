import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import NavbarWrapper from "@/components/NavbarWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Scammer Finder",
  description: "A platform to detect and report online scams",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavbarWrapper />
          <main className="container mx-auto py-4">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}