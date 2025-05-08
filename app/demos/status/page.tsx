"use client"

import { useEffect, useState } from "react"
import { Box, Typography, Paper } from '@mui/material'
import { Demo } from "@/lib/schema"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Link as MuiLink
} from '@mui/material'
import Link from 'next/link'

export default function DemoStatusPage() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const response = await fetch('/api/demos?status=requested')
        if (!response.ok) {
          throw new Error('Failed to fetch demos')
        }
        const data = await response.json()
        setDemos(data.demos || [])
      } catch (error) {
        console.error('Error fetching demos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDemos()
  }, [])

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Demo Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View all requested demos
        </Typography>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading demos...</Box>
        ) : demos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>No requested demos found</Typography>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demos.map((demo) => (
                  <TableRow key={demo.id} hover>
                    <TableCell>
                      <Link href={`/demos/${demo.id}`} passHref style={{ textDecoration: 'none' }}>
                        <MuiLink color="primary" underline="hover">
                          {demo.title || 'Untitled Demo'}
                        </MuiLink>
                      </Link>
                    </TableCell>
                    <TableCell>{demo.client || '-'}</TableCell>
                    <TableCell>
                      {demo.description 
                        ? demo.description.length > 100 
                          ? `${demo.description.substring(0, 100)}...` 
                          : demo.description
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {demo.dueDate 
                        ? new Date(demo.dueDate).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell>{demo.assignedTo || '-'}</TableCell>
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