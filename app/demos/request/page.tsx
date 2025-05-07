"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"

// Create a form schema based on the demo schema but with only the fields needed for requesting
const requestDemoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  client: z.string().optional(),
  useCase: z.string().optional(),
  vertical: z.string().optional(),
  dueDate: z.string().optional(),
})

type RequestDemoFormData = z.infer<typeof requestDemoSchema>

export default function RequestDemoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestDemoFormData>({
    resolver: zodResolver(requestDemoSchema),
    defaultValues: {
      title: "",
      description: "",
      client: "",
      useCase: "",
      vertical: "",
      dueDate: "",
    },
  })

  // Verticals - this could come from an API in a real application
  const verticals = ["Finance", "Healthcare", "Retail", "Technology", "Education"]

  const onSubmit = async (data: RequestDemoFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/demos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "requested",
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create demo request")
      }
      
      toast.success("Demo request submitted successfully")
      reset()
      router.push("/demos?status=requested")
    } catch (error) {
      console.error("Error submitting demo request:", error)
      toast.error("Failed to submit demo request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Request a Demo</h1>
        <p className="text-muted-foreground">
          Fill out the form below to request a new demo for your client needs
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Demo Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              className="w-full p-2 border rounded-md"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full p-2 border rounded-md"
              {...register("description")}
            />
          </div>
          
          {/* Client */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium mb-1">
              Client Name
            </label>
            <input
              id="client"
              className="w-full p-2 border rounded-md"
              {...register("client")}
            />
          </div>
          
          {/* Use Case */}
          <div>
            <label htmlFor="useCase" className="block text-sm font-medium mb-1">
              Use Case
            </label>
            <input
              id="useCase"
              className="w-full p-2 border rounded-md"
              {...register("useCase")}
            />
          </div>
          
          {/* Vertical */}
          <div>
            <label htmlFor="vertical" className="block text-sm font-medium mb-1">
              Vertical
            </label>
            <select
              id="vertical"
              className="w-full p-2 border rounded-md"
              {...register("vertical")}
            >
              <option value="">Select a vertical</option>
              {verticals.map((vertical) => (
                <option key={vertical} value={vertical}>
                  {vertical}
                </option>
              ))}
            </select>
          </div>
          
          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              className="w-full p-2 border rounded-md"
              {...register("dueDate")}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  )
} 