import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { getDemoById } from "@/lib/db"
import { Demo } from "@/lib/schema"
import { Button } from "@/app/components/ui/button"

interface DemoDetailPageProps {
  params: {
    id: string
  }
}

export default async function DemoDetailPage({ params }: DemoDetailPageProps) {
  const demo = await getDemoById(params.id) as Demo | null
  
  if (!demo) {
    notFound()
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{demo.title}</h1>
            {demo.client && (
              <p className="text-lg text-muted-foreground">Client: {demo.client}</p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link href="/demos">Back to Demos</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose">
              {demo.description ? (
                <p>{demo.description}</p>
              ) : (
                <p className="text-muted-foreground">No description provided.</p>
              )}
            </div>
          </div>
          
          {/* Demo Access */}
          {(demo.url || demo.authDetails) && (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Demo Access</h2>
              {demo.url && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">URL</h3>
                  <a
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block"
                  >
                    {demo.url}
                  </a>
                </div>
              )}
              {demo.authDetails && (
                <div>
                  <h3 className="text-md font-medium mb-2">Authentication Details</h3>
                  <pre className="bg-muted p-3 rounded-md whitespace-pre-wrap text-sm">
                    {demo.authDetails}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* Use Case */}
          {demo.useCase && (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Use Case</h2>
              <p>{demo.useCase}</p>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground block">Status</span>
                <StatusBadge status={demo.status} />
              </div>
              
              {demo.assignedTo && (
                <div>
                  <span className="text-sm text-muted-foreground block">Assigned To</span>
                  <span>{demo.assignedTo}</span>
                </div>
              )}
              
              {demo.dueDate && (
                <div>
                  <span className="text-sm text-muted-foreground block">Due Date</span>
                  <span>{format(new Date(demo.dueDate), "MMM d, yyyy")}</span>
                </div>
              )}
              
              {demo.vertical && (
                <div>
                  <span className="text-sm text-muted-foreground block">Vertical</span>
                  <span>{demo.vertical}</span>
                </div>
              )}
              
              <div>
                <span className="text-sm text-muted-foreground block">Created</span>
                <span>{format(new Date(demo.createdAt), "MMM d, yyyy")}</span>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground block">Last Updated</span>
                <span>{format(new Date(demo.updatedAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/admin`}>
                  Manage in Admin
                </Link>
              </Button>
              {demo.url && (
                <Button asChild variant="outline" className="w-full">
                  <a href={demo.url} target="_blank" rel="noopener noreferrer">
                    Open Demo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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