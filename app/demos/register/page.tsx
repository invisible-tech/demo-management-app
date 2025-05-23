"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { Typography, Box } from '@mui/material';
import DemoForm from "@/components/ui/DemoForm"

// Form schema
const registerDemoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional(),
  slug: z.string().min(1, "Slug is required"),
  authDetails: z.string().optional(),
  assignedTo: z.string().min(1, "Owner is required"),
})

type RegisterDemoFormData = z.infer<typeof registerDemoSchema>

export default function RegisterDemoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/demos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "ready",
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to register demo")
      }
      
      toast.success("Demo registered successfully")
      router.push("/demos?status=ready")
    } catch (error) {
      console.error("Error registering demo:", error)
      toast.error("Failed to register demo. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{ my: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Register a Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete this form to register a new demo
        </Typography>
      </Box>
      
      <DemoForm 
        type="register" 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
      />
    </Box>
  )
} 