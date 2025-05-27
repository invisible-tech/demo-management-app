"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { Typography, Box } from '@mui/material';
import DemoForm from "@/components/ui/DemoForm"
import { auth0 } from "@/lib/auth0"

// Form schema
const registerDemoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional(),
  slug: z.string().min(1, "Slug is required"),
  authDetails: z.string().optional(),
  assignedTo: z.string().optional(),
})

type RegisterDemoFormData = z.infer<typeof registerDemoSchema>

export default function RegisterDemoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Get user email from Auth0 session
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const session = await auth0.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          console.log("User email captured:", session.user.email);
        }
      } catch (error) {
        console.error("Error getting user session:", error);
      }
    };
    
    getUserEmail();
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      // Add the user's email to the demo data
      const demoData = {
        ...data,
        status: "pending_approval",
        createdBy: userEmail || "unknown@example.com", // Fall back to a default if no email
      };
      
      console.log("Submitting demo with user:", demoData.createdBy);
      
      const response = await fetch("/api/demos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(demoData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to register demo")
      }
      
      const createdDemo = await response.json();
      
      // Send email notification to admin
      try {
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: ["Vince Guan <vince.guan@invisible.email>", "Nick Agresti <nick.agresti@invisible.email>"], // Admin's email address
            subject: "New Demo Registration Pending Approval",
            text: `A new demo "${demoData.title}" has been registered by ${demoData.createdBy} and is pending approval.`,
            html: `
              <h2>New Demo Registration</h2>
              <p>A new demo has been registered and requires your approval:</p>
              <ul>
                <li><strong>Title:</strong> ${demoData.title}</li>
                <li><strong>Registered by:</strong> ${demoData.createdBy}</li>
                <li><strong>Description:</strong> ${demoData.description || 'N/A'}</li>
              </ul>
              <p>Please review and approve this demo through the admin interface.</p>
            `
          })
        });
        console.log("Email notification sent to admin");
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue with the success flow even if email fails
      }
      
      toast.success("Demo registered successfully and pending admin approval")
      router.push("/demos")
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
          Complete this form to register a new demo. All demos require admin approval before appearing in the main list.
        </Typography>
        {userEmail && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Registering as: {userEmail}
          </Typography>
        )}
      </Box>
      
      <DemoForm 
        type="register" 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  )
} 