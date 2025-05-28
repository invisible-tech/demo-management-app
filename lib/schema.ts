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

export const demoTemplateEnum = [
  "old_template",
  "new_template"
] as const

// Base schema without refinement
export const demoBaseSchema = z.object({
  id: z.string(),
  title: z.string().optional().default("Demo Request"),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(demoStatusEnum).default("requested"),
  type: z.enum(demoTypeEnum).default("general"),
  template: z.enum(demoTemplateEnum).default("old_template"),
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
});

// Schema for demo data validation with refinement
export const demoSchema = demoBaseSchema.refine(data => !!data.client || !!data.vertical, {
  message: "Either client or vertical must be provided",
  path: ["clientOrVertical"],
})

export const createDemoSchema = demoBaseSchema.omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
}).refine(data => !!data.client || !!data.vertical, {
  message: "Either client or vertical must be provided",
  path: ["clientOrVertical"],
})

// Make all fields optional for updates but still enforce the client or vertical rule
export const updateDemoSchema = demoBaseSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial()
  .refine(data => {
    // If neither client nor vertical is included in the update, that's fine
    // If at least one is included, at least one must have a value
    if (data.client === undefined && data.vertical === undefined) {
      return true;
    }
    return !!data.client || !!data.vertical;
  }, {
    message: "If updating client or vertical, at least one must have a value",
    path: ["clientOrVertical"],
  })

export const filterDemoSchema = z.object({
  status: z.enum(demoStatusEnum).optional(),
  type: z.enum(demoTypeEnum).optional(),
  template: z.enum(demoTemplateEnum).optional(),
  vertical: z.string().optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
})

export type Demo = z.infer<typeof demoSchema>
export type CreateDemoInput = z.infer<typeof createDemoSchema>
export type UpdateDemoInput = z.infer<typeof updateDemoSchema>
export type FilterDemoInput = z.infer<typeof filterDemoSchema> 