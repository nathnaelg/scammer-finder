import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Shield, AlertTriangle, Search, Users, BarChart, Send } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Protect Yourself from Online Scams
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Join our community in making the internet safer. Report scams, check our database, and stay informed about the latest threats.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="mr-4">Get Started</Button>
              </Link>
              <Link href="/database">
                <Button size="lg" variant="outline">View Database</Button>
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
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Scam Detection</CardTitle>
                <CardDescription>
                  Advanced algorithms to identify and verify potential scams across multiple platforms.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Early Warnings</CardTitle>
                <CardDescription>
                  Real-time alerts about new scams in your area or industry.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Search className="w-12 h-12 text-primary mb-4" />
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
      <section className="py-20">
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

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Making the Internet Safer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">1000+</p>
              <p className="text-muted-foreground">Scams Reported</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">95%</p>
              <p className="text-muted-foreground">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Business Owner",
                content: "Thanks to Scammer Finder, I was able to avoid a potential business scam that could have cost thousands.",
              },
              {
                name: "Michael Chen",
                role: "Online Shopper",
                content: "The database helped me identify a fraudulent seller before making a purchase. This platform is invaluable!",
              },
              {
                name: "Emma Williams",
                role: "Social Media User",
                content: "I regularly check Scammer Finder before accepting new connections. It's become an essential part of my online safety routine.",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <p className="mb-4 italic">{testimonial.content}</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/50">
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
      <section className="py-20">
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
    </div>
  )
}

