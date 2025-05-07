import { NextRequest, NextResponse } from "next/server"
import { getDemoById, updateDemo, deleteDemo } from "@/lib/db"
import { updateDemoSchema } from "@/lib/schema"

// GET /api/demos/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const demo = await getDemoById(id)

    if (!demo) {
      return NextResponse.json(
        { error: "Demo not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(demo)
  } catch (error: unknown) {
    console.error(`Error fetching demo:`, error)
    return NextResponse.json(
      { error: "Failed to fetch demo" },
      { status: 500 }
    )
  }
}

// PATCH /api/demos/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate update data
    const result = updateDemoSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid demo data", details: result.error.format() },
        { status: 400 }
      )
    }

    // Check if demo exists
    const existingDemo = await getDemoById(id)

    if (!existingDemo) {
      return NextResponse.json(
        { error: "Demo not found" },
        { status: 404 }
      )
    }

    // Update demo
    const updatedDemo = await updateDemo(id, result.data)

    return NextResponse.json(updatedDemo)
  } catch (error: unknown) {
    console.error(`Error updating demo:`, error)
    return NextResponse.json(
      { error: "Failed to update demo" },
      { status: 500 }
    )
  }
}

// DELETE /api/demos/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if demo exists
    const existingDemo = await getDemoById(id)

    if (!existingDemo) {
      return NextResponse.json(
        { error: "Demo not found" },
        { status: 404 }
      )
    }

    // Delete demo
    await deleteDemo(id)

    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    console.error(`Error deleting demo:`, error)
    return NextResponse.json(
      { error: "Failed to delete demo" },
      { status: 500 }
    )
  }
} 