"use client"

import { useEffect, useState } from "react"
import { 
  Box, 
  Typography, 
  Paper,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Link as MuiLink,
  Chip
} from '@mui/material'
import { Demo } from "@/lib/schema"
import Link from 'next/link'

export default function DemoStatusPage() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        // Fetch both "requested" and "in_progress" demos
        const requestedResponse = await fetch('/api/demos?status=requested')
        const inProgressResponse = await fetch('/api/demos?status=in_progress')
        
        if (!requestedResponse.ok || !inProgressResponse.ok) {
          throw new Error('Failed to fetch demos')
        }
        
        const requestedData = await requestedResponse.json()
        const inProgressData = await inProgressResponse.json()
        
        // Combine both sets of demos
        const allDemos = [...requestedData, ...inProgressData]
        
        // Sort demos by due date (soonest first)
        const sortedDemos = [...allDemos].sort((a, b) => {
          // Handle cases where dueDate might be missing
          if (!a.dueDate) return 1;  // Put items without due date at the end
          if (!b.dueDate) return -1;
          
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        
        setDemos(sortedDemos || [])
      } catch (error) {
        console.error('Error fetching demos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDemos()
  }, [])

  // Function to get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'ready':
        return 'success';
      case 'delivered':
        return 'secondary';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  }

  // Format status text for display
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Demo Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View status of requested and in-progress demos
        </Typography>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading demos...</Box>
        ) : demos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>No demos found</Typography>
            <Typography color="text.secondary" paragraph>
              All demo requests have been processed.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader aria-label="demos table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Requested By</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demos.map((demo) => (
                  <TableRow key={demo.id} hover>
                    <TableCell>
                      <Typography color="textPrimary">
                        {demo.title || 'Untitled Demo'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {demo.description 
                        ? demo.description.length > 100 
                          ? `${demo.description.substring(0, 100)}...` 
                          : demo.description
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatStatus(demo.status)} 
                        color={getStatusColor(demo.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {demo.dueDate 
                        ? new Date(demo.dueDate).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell>{demo.assignedTo || '-'}</TableCell>
                    <TableCell>{demo.client || '-'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        color="secondary"
                        component={Link}
                        href={`/demos/${demo.id}/edit`}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
} 