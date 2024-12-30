"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  scammerUsername: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  platform: z.string({
    required_error: "Please select a platform.",
  }),
  scamType: z.string({
    required_error: "Please select a scam type.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  evidence: z.instanceof(File).optional(),
})

const scamTypes = [
  { value: "phishing", label: "Phishing" },
  { value: "fake_profile", label: "Fake Profile" },
  { value: "spam", label: "Spam" },
  { value: "financial_fraud", label: "Financial Fraud" },
  { value: "product_scam", label: "Product Scam" },
  { value: "unsolicited_messaging", label: "Unsolicited Messaging" },
  { value: "identity_theft", label: "Identity Theft" },
  { value: "other", label: "Other" },
]

export default function ReportScamForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scammerUsername: "",
      platform: "",
      scamType: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to submit a report.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit report')
      }

      const reportData = await response.json()

      toast({
        title: "Scam report submitted",
        description: `Thank you for helping to make the internet safer. The risk score for this report is ${reportData.riskScore}.`,
      })
      form.reset()
      router.push("/database")
    } catch (error) {
      console.error('Error submitting report:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Report a Scam</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="scammerUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scammer's Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the scammer's username" {...field} />
                </FormControl>
                <FormDescription>
                  This is the username of the account you're reporting.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the platform where you encountered the scam" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scamType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scam Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of scam" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {scamTypes.map((scamType) => (
                      <SelectItem key={scamType.value} value={scamType.value}>
                        {scamType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide details about the scam"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the scam in detail. What happened? How did you identify it as a scam?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="evidence"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Evidence (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => onChange(e.target.files?.[0])}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Upload any screenshots or evidence you have of the scam.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

