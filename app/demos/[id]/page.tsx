import { notFound } from "next/navigation"
import { getDemoById } from "@/lib/db"
import { Demo } from "@/lib/schema"
import { Box } from "@mui/material"
import DemoStatus from "@/components/ui/DemoStatus"

interface DemoDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DemoDetailPage({ params }: DemoDetailPageProps) {
  const { id } = await params
  const demo = await getDemoById(id) as Demo | null
  
  if (!demo) {
    notFound()
  }

  // Format the demo data for the DemoStatus component
  const statusData = {
    title: demo.title || "Untitled Demo",
    status: demo.status?.replace("_", " ") || "unknown",
    requestedBy: demo.client || "Unknown Client",
    createdDate: new Date(demo.createdAt).toLocaleDateString(),
    lastUpdated: new Date(demo.updatedAt).toLocaleDateString(),
    description: demo.description || "No description provided",
    assignedTo: demo.assignedTo,
    comments: [] // In a real app, you'd load comments from an API
  };
  
  return (
    <Box sx={{ my: 4 }}>
      <DemoStatus {...statusData} />
    </Box>
  )
}

function StatusBadge({ status }: { status: Demo["status"] }) {
  const statusStyles = {
    requested: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    delivered: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  }

  const style = statusStyles[status] || statusStyles.requested
  const label = status.replace("_", " ")

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
} 