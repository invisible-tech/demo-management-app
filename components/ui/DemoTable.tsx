'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Link as MuiLink,
  Box,
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { ExternalLink, Link2Off, FileText, Video } from 'lucide-react';
import Link from 'next/link';
import { Demo } from '@/lib/schema';

type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'default';

const getStatusColor = (status: string): StatusColor => {
  switch (status) {
    case 'ready':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'requested':
      return 'info';
    case 'delivered':
      return 'info';
    case 'archived':
      return 'default';
    default:
      return 'default';
  }
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

interface DemoTableProps {
  demos: Demo[];
  verticals: string[];
  clients: string[];
  statuses: string[];
}

export default function DemoTable({ demos, verticals, clients, statuses }: DemoTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    status: '',
    vertical: '',
    client: '',
    search: '',
  });

  // Handle filter changes
  const handleFilterChange = (filterName: keyof typeof filters) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFilters({
      ...filters,
      [filterName]: event.target.value as string,
    });
    setPage(0); // Reset to first page when filter changes
  };

  // Apply filters
  const filteredDemos = demos.filter((demo) => {
    // Status filter
    if (filters.status && demo.status !== filters.status) return false;
    
    // Vertical filter
    if (filters.vertical && demo.vertical !== filters.vertical) return false;
    
    // Client filter
    if (filters.client && demo.client !== filters.client) return false;
    
    // Search filter (across title and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = demo.title?.toLowerCase().includes(searchLower);
      const descMatch = demo.description?.toLowerCase().includes(searchLower);
      
      if (!(titleMatch || descMatch)) {
        return false;
      }
    }
    
    return true;
  });

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate pagination
  const paginatedDemos = filteredDemos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Utility function to validate URL
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Filters */}
      <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={handleFilterChange('search')}
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleFilterChange('status') as any}
          >
            <MenuItem value="">All</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {formatStatus(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Vertical</InputLabel>
          <Select
            value={filters.vertical}
            label="Vertical"
            onChange={handleFilterChange('vertical') as any}
          >
            <MenuItem value="">All</MenuItem>
            {verticals.map((vertical) => (
              <MenuItem key={vertical} value={vertical}>
                {vertical}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Client</InputLabel>
          <Select
            value={filters.client}
            label="Client"
            onChange={handleFilterChange('client') as any}
          >
            <MenuItem value="">All</MenuItem>
            {clients.map((client) => (
              <MenuItem key={client} value={client}>
                {client}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {/* Table */}
      <TableContainer>
        <Table stickyHeader aria-label="demos table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Vertical</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDemos.length > 0 ? (
              paginatedDemos.map((demo) => (
                <TableRow key={demo.id} hover>
                  <TableCell>
                    {demo.slug ? (
                      <Link href={`/${demo.slug}`} passHref style={{ textDecoration: 'none' }}>
                        <MuiLink color="primary" underline="hover">
                          {demo.title || 'Untitled Demo'}
                        </MuiLink>
                      </Link>
                    ) : (
                      <Typography color="textPrimary">
                        {demo.title || 'Untitled Demo'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{demo.client || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={formatStatus(demo.status)} 
                      size="small" 
                      color={getStatusColor(demo.status)} 
                    />
                  </TableCell>
                  <TableCell>{demo.vertical || '-'}</TableCell>
                  <TableCell>{demo.assignedTo || '-'}</TableCell>
                  <TableCell>
                    {demo.dueDate 
                      ? new Date(demo.dueDate).toLocaleDateString() 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {demo.slug ? (
                        <Button 
                          variant="outlined" 
                          size="small"
                          component={Link}
                          href={`/${demo.slug}`}
                        >
                          View
                        </Button>
                      ) : null}
                      
                      {isValidUrl(demo.scriptUrl) && (
                        <Tooltip title="View Script">
                          <Button
                            variant="outlined"
                            size="small"
                            color="info"
                            component="a"
                            href={demo.scriptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<FileText size={16} />}
                          >
                            Script
                          </Button>
                        </Tooltip>
                      )}
                      
                      {isValidUrl(demo.recordingUrl) && (
                        <Tooltip title="View Recording">
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            component="a"
                            href={demo.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<Video size={16} />}
                          >
                            Recording
                          </Button>
                        </Tooltip>
                      )}
                      
                      <Button 
                        variant="outlined" 
                        size="small"
                        color="secondary"
                        component={Link}
                        href={`/demos/${demo.id}/edit`}
                      >
                        Edit
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No demos found matching the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredDemos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
} 