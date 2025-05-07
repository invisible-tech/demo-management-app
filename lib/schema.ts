import { z } from "zod"

export const demoStatusEnum = [
  "requested",
  "in_progress",
  "ready",
  "delivered",
  "archived"
] as const

// Schema for demo data validation
export const demoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(demoStatusEnum).default("requested"),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
  useCase: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  authDetails: z.string().optional(),
  dueDate: z.string().optional(), // ISO date string
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
  vertical: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export const createDemoSchema = demoSchema.omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
})

export const updateDemoSchema = createDemoSchema.partial()

export const filterDemoSchema = z.object({
  status: z.enum(demoStatusEnum).optional(),
  vertical: z.string().optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
})

export type Demo = z.infer<typeof demoSchema>
export type CreateDemoInput = z.infer<typeof createDemoSchema>
export type UpdateDemoInput = z.infer<typeof updateDemoSchema>
export type FilterDemoInput = z.infer<typeof filterDemoSchema> 