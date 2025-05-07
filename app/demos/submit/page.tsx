"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"

// Schema for submitting a completed demo
const submitDemoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  client: z.string().optional(),
  useCase: z.string().optional(),
  vertical: z.string().optional(),
  url: z.string().url("Please enter a valid URL").or(z.literal("")),
  authDetails: z.string().optional(),
})

type SubmitDemoFormData = z.infer<typeof submitDemoSchema>

export default function SubmitDemoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubmitDemoFormData>({
    resolver: zodResolver(submitDemoSchema),
    defaultValues: {
      title: "",
      description: "",
      client: "",
      useCase: "",
      vertical: "",
      url: "",
      authDetails: "",
    },
  })

  // Verticals - this could come from an API in a real application
  const verticals = ["Finance", "Healthcare", "Retail", "Technology", "Education"]

  const onSubmit = async (data: SubmitDemoFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/demos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "ready", // Mark as ready since this is a completed demo
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to submit demo")
      }
      
      toast.success("Demo submitted successfully")
      reset()
      router.push("/demos?status=ready")
    } catch (error) {
      console.error("Error submitting demo:", error)
      toast.error("Failed to submit demo. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit a Demo</h1>
        <p className="text-muted-foreground">
          Submit a completed demo to be added to the demo library
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
              placeholder="Describe what this demo does and how to use it"
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
              placeholder="Leave blank if this is a general demo"
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
              placeholder="What problem does this demo solve?"
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
          
          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">
              Demo URL
            </label>
            <input
              id="url"
              type="url"
              className="w-full p-2 border rounded-md"
              {...register("url")}
              placeholder="https://demo-url.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>
          
          {/* Auth Details */}
          <div>
            <label htmlFor="authDetails" className="block text-sm font-medium mb-1">
              Authentication Details
            </label>
            <textarea
              id="authDetails"
              rows={3}
              className="w-full p-2 border rounded-md"
              {...register("authDetails")}
              placeholder="Login credentials or instructions for accessing the demo"
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
            {isSubmitting ? "Submitting..." : "Submit Demo"}
          </Button>
        </div>
      </form>
    </div>
  )
} 