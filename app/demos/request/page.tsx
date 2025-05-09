"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { Typography, Box } from '@mui/material';
import DemoForm from "@/components/ui/DemoForm"

// Create a form schema based on the demo schema but with only the fields needed for requesting
const requestDemoSchema = z.object({
  title: z.string().optional().default("Demo Request"),
  description: z.string().min(1, "Description is required"),
  requestedBy: z.string().min(1, "Requested By is required"),
  dueDate: z.string().optional(),
})

type RequestDemoFormData = z.infer<typeof requestDemoSchema>

export default function RequestDemoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    console.log("Submitting demo request with data:", data);
    
    try {
      const response = await fetch("/api/demos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "requested",
          assignedTo: "n/a",
          url: "",
          authDetails: "",
          client: data.requestedBy
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server response:", response.status, errorData);
        
        if (errorData?.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      toast.success("Demo request submitted successfully")
      router.push("/demos?status=requested")
    } catch (error: any) {
      console.error("Error submitting demo request:", error)
      toast.error(error.message || "Failed to submit demo request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{ my: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Request a Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill out the form below to request a demo. Contact Nick Agresti for questions.
        </Typography>
      </Box>
      
      <DemoForm 
        type="request" 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  )
} 