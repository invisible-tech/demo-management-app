"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useTransition } from "react"
import { demoStatusEnum } from "@/lib/schema"
import { Button } from "@/app/components/ui/button"
import { Search } from "lucide-react"

export default function DemoFilters({
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
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [filters, setFilters] = useState({
    status: status || "",
    vertical: vertical || "",
    assignedTo: assignedTo || "",
    search: search || "",
  })

  // Update filters state when props change
  useEffect(() => {
    setFilters({
      status: status || "",
      vertical: vertical || "",
      assignedTo: assignedTo || "",
      search: search || "",
    })
  }, [status, vertical, assignedTo, search])

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (filters.status) params.set("status", filters.status)
    if (filters.vertical) params.set("vertical", filters.vertical)
    if (filters.assignedTo) params.set("assignedTo", filters.assignedTo)
    if (filters.search) params.set("search", filters.search)
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "",
      vertical: "",
      assignedTo: "",
      search: "",
    })
    
    startTransition(() => {
      router.push(pathname)
    })
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }
  
  // Handle search submission on enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters()
    }
  }

  // Verticals - this could come from an API in a real application
  const verticals = ["Finance", "Healthcare", "Retail", "Technology", "Education"]

  // Demo makers - this could come from an API in a real application
  const demoMakers = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Williams"]

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <h2 className="text-lg font-medium mb-4">Filter Demos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            name="search"
            placeholder="Search demos..."
            className="bg-background border border-input rounded-md py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.search}
            onChange={handleChange}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        
        {/* Status filter */}
        <div>
          <select
            name="status"
            className="bg-background border border-input rounded-md py-2 px-3 w-full focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            {demoStatusEnum.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        
        {/* Vertical filter */}
        <div>
          <select
            name="vertical"
            className="bg-background border border-input rounded-md py-2 px-3 w-full focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.vertical}
            onChange={handleChange}
          >
            <option value="">All Verticals</option>
            {verticals.map((vertical) => (
              <option key={vertical} value={vertical}>
                {vertical}
              </option>
            ))}
          </select>
        </div>
        
        {/* Assigned to filter */}
        <div>
          <select
            name="assignedTo"
            className="bg-background border border-input rounded-md py-2 px-3 w-full focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.assignedTo}
            onChange={handleChange}
          >
            <option value="">Any Assignee</option>
            {demoMakers.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={resetFilters}
          disabled={isPending}
        >
          Reset
        </Button>
        <Button 
          onClick={applyFilters}
          disabled={isPending}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
} 