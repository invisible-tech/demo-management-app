import { NextRequest, NextResponse } from "next/server"
import { createDemo, getAllDemos, checkRedisConnection } from "@/lib/db"
import { createDemoSchema, filterDemoSchema, Demo } from "@/lib/schema"

// GET /api/demos
export async function GET(request: NextRequest) {
  try {
    // Get filter parameters from query string
    const url = new URL(request.url)
    const status = url.searchParams.get("status") || undefined
    const template = url.searchParams.get("template") || undefined
    const vertical = url.searchParams.get("vertical") || undefined
    const assignedTo = url.searchParams.get("assignedTo") || undefined
    const search = url.searchParams.get("search") || undefined

    // Validate filters
    const filterResult = filterDemoSchema.safeParse({
      status,
      template,
      vertical,
      assignedTo,
      search,
    })

    if (!filterResult.success) {
      return NextResponse.json(
        { error: "Invalid filter parameters" },
        { status: 400 }
      )
    }

    // Get all demos
    const allDemos = await getAllDemos() as Demo[]

    // Apply filters
    const filteredDemos = allDemos.filter((demo) => {
      // Status filter
      if (status && demo.status !== status) {
        return false
      }

      // Template filter
      if (template && demo.template !== template) {
        return false
      }

      // Vertical filter
      if (vertical && demo.vertical !== vertical) {
        return false
      }

      // Assigned to filter
      if (assignedTo && demo.assignedTo !== assignedTo) {
        return false
      }

      // Search filter (search in title, description, client, and useCase)
      if (search) {
        const searchLower = search.toLowerCase()
        const titleMatch = demo.title?.toLowerCase().includes(searchLower)
        const descMatch = demo.description?.toLowerCase().includes(searchLower)
        const clientMatch = demo.client?.toLowerCase().includes(searchLower)
        const useCaseMatch = demo.useCase?.toLowerCase().includes(searchLower)

        if (!(titleMatch || descMatch || clientMatch || useCaseMatch)) {
          return false
        }
      }

      return true
    })

    // Sort demos alphabetically by title (case-insensitive)
    const sortedDemos = filteredDemos.sort((a, b) => {
      const titleA = (a.title || 'Untitled Demo').toLowerCase()
      const titleB = (b.title || 'Untitled Demo').toLowerCase()
      return titleA.localeCompare(titleB)
    })

    return NextResponse.json(sortedDemos)
  } catch (error: unknown) {
    console.error("Error fetching demos:", error)
    return NextResponse.json(
      { error: "Failed to fetch demos" },
      { status: 500 }
    )
  }
}

// POST /api/demos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received demo creation request:", body);

    // Validate demo data
    const result = createDemoSchema.safeParse(body)

    if (!result.success) {
      console.error("Validation error:", result.error.format());
      return NextResponse.json(
        { error: "Invalid demo data", details: result.error.format() },
        { status: 400 }
      )
    }

    // Check Redis connection before attempting to create
    const connectionCheck = await checkRedisConnection();
    if (!connectionCheck.success) {
      console.error("Redis connection check failed:", connectionCheck);
      return NextResponse.json(
        { error: "Database connection error: " + connectionCheck.error },
        { status: 503 }
      )
    }

    try {
    // Create demo
    const demo = await createDemo(result.data)
      console.log("Demo created successfully:", demo.id);
    return NextResponse.json(demo, { status: 201 })
    } catch (dbError: any) {
      console.error("Database error creating demo:", dbError);
      return NextResponse.json(
        { error: "Database error: " + (dbError.message || "Unknown database error") },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error creating demo:", error);
    return NextResponse.json(
      { error: "Failed to create demo: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
} 