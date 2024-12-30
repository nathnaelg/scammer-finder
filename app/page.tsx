"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, AlertTriangle, Search, Users, BarChart, Send } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 min-h-[70vh] ">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <Typewriter
                  words={["Protect Yourself from Online Scams", "Join Our Community", "Stay Safe Online"]}
                  loop={true}
                  cursor
                  cursorStyle="_"
                  typeSpeed={200}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Join our community in making the internet safer. Report scams, check our database, and stay informed about the latest threats.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="mr-4">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="/images/Illustration.png?height=400&width=400"
                alt="Security Illustration"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/50 min-h-[50vh]">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-16 h-16 text-primary mb-4" />
                <CardTitle>Scam Detection</CardTitle>
                <CardDescription>
                  Advanced algorithms to identify and verify potential scams across multiple platforms.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="w-16 h-16 text-primary mb-4" />
                <CardTitle>Early Warnings</CardTitle>
                <CardDescription>
                  Real-time alerts about new scams in your area or industry.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Search className="w-16 h-16 text-primary mb-4" />
                <CardTitle>Scam Database</CardTitle>
                <CardDescription>
                  Comprehensive database of verified scams and scammers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 min-h-[50vh]">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create Account</h3>
              <p className="text-muted-foreground">Sign up and join our community of vigilant users.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Report Scams</h3>
              <p className="text-muted-foreground">Submit details about scams you've encountered.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Stay Informed</h3>
              <p className="text-muted-foreground">Access reports and receive alerts about new threats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/50 min-h-[50vh]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Get Started Today</h2>
            <form className="space-y-4">
              <Input type="email" placeholder="Enter your email" />
              <Textarea placeholder="Your message (optional)" />
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Join the Community
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 min-h-[40vh]">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Help Make the Internet Safer?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our community and start contributing to a safer online environment for everyone.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Get Started Now</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-6 min-h-[20vh]">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-muted-foreground mb-4">© 2024 Scammer Finder. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <Link href="/about" className="text-primary hover:underline">
              About Us
            </Link>
            <Link href="/contact" className="text-primary hover:underline">
              Contact
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}