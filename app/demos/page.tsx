import { Suspense } from "react"
import Link from "next/link"
import { getAllDemos } from "@/lib/db"
import { Button } from "@/app/components/ui/button"
import DemoList from "@/components/DemoList"
import DemoFilters from "@/components/DemoFilters"
import { Demo } from "@/lib/schema"

export const dynamic = "force-dynamic"

export default async function DemosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined
  const vertical = typeof searchParams.vertical === "string" ? searchParams.vertical : undefined
  const assignedTo = typeof searchParams.assignedTo === "string" ? searchParams.assignedTo : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">All Demos</h1>
          <p className="text-muted-foreground">Browse, search, and filter all available demos</p>
        </div>
        <Button asChild>
          <Link href="/demos/request">Request New Demo</Link>
        </Button>
      </div>

      <DemoFilters 
        status={status} 
        vertical={vertical} 
        assignedTo={assignedTo} 
        search={search}
      />

      <Suspense fallback={<div>Loading demos...</div>}>
        <DemoListWrapper 
          status={status}
          vertical={vertical}
          assignedTo={assignedTo}
          search={search}
        />
      </Suspense>
    </div>
  )
}

async function DemoListWrapper({
  status,
  vertical,
  assignedTo,
  search,
}: {
  status?: string
  vertical?: string
  assignedTo?: string
  search?: string
}) {
  // Fetch demos with filters applied
  const allDemos = await getAllDemos() as Demo[]
  
  // Apply filters - this is a fallback if the API filters don't work
  const filteredDemos = allDemos.filter((demo) => {
    if (status && demo.status !== status) return false
    if (vertical && demo.vertical !== vertical) return false
    if (assignedTo && demo.assignedTo !== assignedTo) return false
    
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

  return <DemoList demos={filteredDemos} />
} 