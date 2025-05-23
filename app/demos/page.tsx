import { Suspense } from "react"
import { getAllDemos } from "@/lib/db"
import { Demo } from "@/lib/schema"
import { Box, Typography, Button } from '@mui/material';
import DemoTabs from "@/components/ui/DemoTabs"
import Link from "next/link"

export const dynamic = "force-dynamic"
import * as dotenv from "dotenv"
dotenv.config()

export default async function DemosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  // Default status to empty string to show all demos
  const status = typeof params.status === "string" ? params.status : ""
  const vertical = typeof params.vertical === "string" ? params.vertical : undefined
  const assignedTo = typeof params.assignedTo === "string" ? params.assignedTo : undefined
  const search = typeof params.search === "string" ? params.search : undefined

  return (
    <Box sx={{ my: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            All Demos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse, search, and filter all available demos
          </Typography>
        </div>
        <Link href="/demos/register" passHref style={{ textDecoration: 'none' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ 
              fontWeight: 'medium',
              boxShadow: 2,
              px: 3
            }}
          >
            Register New Demo
          </Button>
        </Link>
      </Box>

      <Suspense fallback={<Box sx={{ textAlign: 'center', py: 4 }}>Loading demos...</Box>}>
        <DemoListWrapper 
          status={status}
          vertical={vertical}
          assignedTo={assignedTo}
          search={search}
        />
      </Suspense>
    </Box>
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
  
  // First filter out pending_approval demos unless specifically requested
  const statusFilteredDemos = status === 'pending_approval'
    ? allDemos
    : allDemos.filter(demo => demo.status !== 'pending_approval');
  
  // Apply filters - this is a fallback if the API filters don't work
  const filteredDemos = statusFilteredDemos.filter((demo) => {
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

  // Extract unique values for filter dropdowns
  const verticals = Array.from(new Set(allDemos.map(demo => demo.vertical).filter(Boolean) as string[]));
  const clients = Array.from(new Set(allDemos.map(demo => demo.client).filter(Boolean) as string[]));
  const statuses = Array.from(new Set(allDemos.map(demo => demo.status).filter(Boolean) as string[]));

  return filteredDemos.length ? (
    <DemoTabs 
      demos={filteredDemos} 
      verticals={verticals}
      clients={clients}
      statuses={statuses}
    />
  ) : (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" gutterBottom>No demos found</Typography>
      <Typography color="text.secondary" paragraph>
        Try adjusting your filters or creating a new demo.
      </Typography>
    </Box>
  );
} 