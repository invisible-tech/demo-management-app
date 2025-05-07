"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Demo } from "@/lib/schema"
import { Button } from "@/app/components/ui/button"

export default function AdminPage() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null)
  const [assignee, setAssignee] = useState("")
  
  // Demo makers - this could come from an API in a real application
  const demoMakers = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Williams"]

  // Load demos
  useEffect(() => {
    async function loadDemos() {
      try {
        const response = await fetch("/api/demos")
        if (!response.ok) {
          throw new Error("Failed to fetch demos")
        }
        
        const data = await response.json()
        setDemos(data)
      } catch (error) {
        console.error("Error loading demos:", error)
        toast.error("Failed to load demos")
      } finally {
        setLoading(false)
      }
    }
    
    loadDemos()
  }, [])

  // Handle assignee change
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssignee(e.target.value)
  }

  // Assign demo to a demo maker
  const handleAssignDemo = async () => {
    if (!selectedDemoId || !assignee) {
      toast.error("Please select a demo and an assignee")
      return
    }
    
    try {
      const response = await fetch(`/api/demos/${selectedDemoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedTo: assignee,
          status: "in_progress",
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to assign demo")
      }
      
      const updatedDemo = await response.json()
      
      // Update demos array with the updated demo
      setDemos(demos.map(demo => 
        demo.id === selectedDemoId ? updatedDemo : demo
      ))
      
      toast.success(`Demo assigned to ${assignee}`)
      setSelectedDemoId(null)
      setAssignee("")
    } catch (error) {
      console.error("Error assigning demo:", error)
      toast.error("Failed to assign demo")
    }
  }

  // Handle status update
  const handleUpdateStatus = async (demoId: string, newStatus: Demo["status"]) => {
    try {
      const response = await fetch(`/api/demos/${demoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update demo status")
      }
      
      const updatedDemo = await response.json()
      
      // Update demos array with the updated demo
      setDemos(demos.map(demo => 
        demo.id === demoId ? updatedDemo : demo
      ))
      
      toast.success(`Demo status updated to ${newStatus.replace("_", " ")}`)
    } catch (error) {
      console.error("Error updating demo status:", error)
      toast.error("Failed to update demo status")
    }
  }

  // Filter demos by status
  const requestedDemos = demos.filter(demo => demo.status === "requested")
  const inProgressDemos = demos.filter(demo => demo.status === "in_progress")
  const readyDemos = demos.filter(demo => demo.status === "ready")
  const deliveredDemos = demos.filter(demo => demo.status === "delivered")

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage demos, assign tasks, and track progress</p>
      </div>
      
      {/* Assign Demo Section */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Assign Demo</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="demo" className="block text-sm font-medium mb-1">
              Select Demo
            </label>
            <select
              id="demo"
              className="w-full p-2 border rounded-md"
              value={selectedDemoId || ""}
              onChange={(e) => setSelectedDemoId(e.target.value)}
            >
              <option value="">Select a demo</option>
              {requestedDemos.map((demo) => (
                <option key={demo.id} value={demo.id}>
                  {demo.title} - {demo.client || "No client"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="assignee" className="block text-sm font-medium mb-1">
              Assign To
            </label>
            <select
              id="assignee"
              className="w-full p-2 border rounded-md"
              value={assignee}
              onChange={handleAssigneeChange}
            >
              <option value="">Select a demo maker</option>
              {demoMakers.map((maker) => (
                <option key={maker} value={maker}>
                  {maker}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleAssignDemo}
              disabled={!selectedDemoId || !assignee}
            >
              Assign Demo
            </Button>
          </div>
        </div>
      </div>
      
      {/* Status Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Requested Demos */}
        <DemoStatusCard
          title="Requested Demos"
          demos={requestedDemos}
          onUpdateStatus={handleUpdateStatus}
          statusActions={["in_progress"]}
        />
        
        {/* In Progress Demos */}
        <DemoStatusCard
          title="In Progress Demos"
          demos={inProgressDemos}
          onUpdateStatus={handleUpdateStatus}
          statusActions={["ready"]}
        />
        
        {/* Ready Demos */}
        <DemoStatusCard
          title="Ready Demos"
          demos={readyDemos}
          onUpdateStatus={handleUpdateStatus}
          statusActions={["delivered"]}
        />
        
        {/* Delivered Demos */}
        <DemoStatusCard
          title="Delivered Demos"
          demos={deliveredDemos}
          onUpdateStatus={handleUpdateStatus}
          statusActions={["archived"]}
        />
      </div>
    </div>
  )
}

function DemoStatusCard({
  title,
  demos,
  onUpdateStatus,
  statusActions,
}: {
  title: string
  demos: Demo[]
  onUpdateStatus: (demoId: string, status: Demo["status"]) => void
  statusActions: Demo["status"][]
}) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="bg-muted p-4 border-b">
        <h3 className="font-medium">{title} ({demos.length})</h3>
      </div>
      <div className="divide-y">
        {demos.length === 0 ? (
          <div className="p-4 text-muted-foreground text-center">No demos</div>
        ) : (
          demos.map((demo) => (
            <div key={demo.id} className="p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{demo.title}</h4>
                <Link 
                  href={`/demos/${demo.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View
                </Link>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {demo.client && <span className="mr-3">Client: {demo.client}</span>}
                {demo.assignedTo && <span>Assigned to: {demo.assignedTo}</span>}
              </div>
              <div className="flex gap-2 mt-2">
                {statusActions.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateStatus(demo.id, status)}
                  >
                    Mark as {status.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 