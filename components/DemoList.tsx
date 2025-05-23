"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Demo } from "@/lib/schema"
import { Button } from "@/app/components/ui/button"

export default function DemoList({ demos }: { demos: Demo[] }) {
  if (!demos.length) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No demos found</h3>
        <p className="text-muted-foreground mb-4">Try adjusting your filters or creating a new demo.</p>
        <Button asChild>
          <Link href="/demos/request">Request New Demo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted border-b">
            <th className="text-left py-3 px-4 font-medium">Title</th>
            <th className="text-left py-3 px-4 font-medium">Client</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Assigned To</th>
            <th className="text-left py-3 px-4 font-medium">Due Date</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {demos.map((demo) => (
            <tr key={demo.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">{demo.title}</td>
              <td className="py-3 px-4">{demo.client || "-"}</td>
              <td className="py-3 px-4">
                <StatusBadge status={demo.status} />
              </td>
              <td className="py-3 px-4">{demo.assignedTo || "-"}</td>
              <td className="py-3 px-4">
                {demo.dueDate 
                  ? format(new Date(demo.dueDate), "MMM d, yyyy") 
                  : "-"}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                  >
                    <Link href={`/demos/${demo.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    pending_approval: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  }

  const style = statusStyles[status] || statusStyles.requested
  const label = status.replace("_", " ")

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
} 