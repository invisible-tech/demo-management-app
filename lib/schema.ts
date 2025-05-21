import { z } from "zod"

export const demoStatusEnum = [
  "requested",
  "in_progress",
  "ready",
  "delivered",
  "archived"
] as const

export const demoTypeEnum = [
  "general",
  "specific"
] as const

// Schema for demo data validation
export const demoSchema = z.object({
  id: z.string(),
  title: z.string().optional().default("Demo Request"),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(demoStatusEnum).default("requested"),
  type: z.enum(demoTypeEnum).default("general"),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
  useCase: z.string().optional(),
  url: z.union([z.string().url(), z.literal("")]).optional(),
  scriptUrl: z.union([z.string().url(), z.literal("")]).optional(),
  recordingUrl: z.union([z.string().url(), z.literal("")]).optional(),
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
  type: z.enum(demoTypeEnum).optional(),
  vertical: z.string().optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
})

export type Demo = z.infer<typeof demoSchema>
export type CreateDemoInput = z.infer<typeof createDemoSchema>
export type UpdateDemoInput = z.infer<typeof updateDemoSchema>
export type FilterDemoInput = z.infer<typeof filterDemoSchema> 