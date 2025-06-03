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
  Typography,
  Menu,
  ClickAwayListener,
  Grow,
  Popper,
  MenuList,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { ExternalLink, Link2Off, FileText, Video, ChevronDown } from 'lucide-react';
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';
import Link from 'next/link';
import { Demo } from '@/lib/schema';
import styles from './DemoTable.module.css';

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
      return status.includes('In Progress') ? 'warning' : 'default';
  }
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Get detailed status based on missing items
const getDetailedStatus = (demo: Demo): string => {
  const hasUrl = !!demo.url;
  const hasScript = !!demo.scriptUrl;
  const hasRecording = !!demo.recordingUrl;
  
  // Check if all items are present
  if (hasUrl && hasScript && hasRecording) {
    return 'ready';
  }
  
  // Count missing items
  const missingItems = [];
  if (!hasUrl) missingItems.push('demo URL');
  if (!hasScript) missingItems.push('script');
  if (!hasRecording) missingItems.push('recording');
  
  // Return appropriate status message
  if (missingItems.length >= 2) {
    return 'In Progress (2 or more)';
  } else {
    return `In Progress (needs ${missingItems[0]})`;
  }
};

interface DemoTableProps {
  demos: Demo[];
  verticals: string[];
  clients: string[];
  statuses: string[];
  tabType?: 'general' | 'client-specific' | 'all';
}

// New component for multi-URL demo button
interface DemoUrlButtonProps {
  demo: Demo;
}

function DemoUrlButton({ demo }: DemoUrlButtonProps) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const hasUrl = !!demo.url || !!demo.slug;
  const hasUrl2 = !!demo.url2;
  const hasMultipleUrls = hasUrl && hasUrl2;
  
  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    if (hasMultipleUrls) {
      setAnchorEl(event.currentTarget);
      setOpen((prevOpen) => !prevOpen);
    } else if (hasUrl) {
      // Single URL - redirect directly
      if (demo.slug) {
        window.open(`/${demo.slug}`, '_blank', 'noopener,noreferrer');
      } else if (demo.url) {
        window.open(demo.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuItemClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  if (!hasUrl) {
    return (
      <AwesomeButton
        type="secondary"
        size="small"
        disabled
        style={{ 
          minWidth: '80px',
          '--button-secondary-color': '#f44336',
          '--button-secondary-color-dark': '#d32f2f',
          '--button-secondary-color-light': '#ffcdd2',
          '--button-secondary-color-hover': '#e53935',
          '--button-secondary-border': '#f44336'
        } as any}
      >
        Missing
      </AwesomeButton>
    );
  }

  if (!hasMultipleUrls) {
    // Single URL - show regular button
    return (
      <AwesomeButton
        type="primary"
        size="small"
        onPress={handleToggle}
        style={{ 
          minWidth: '80px',
          '--button-primary-color': '#4caf50',
          '--button-primary-color-dark': '#388e3c',
          '--button-primary-color-light': '#c8e6c9',
          '--button-primary-color-hover': '#66bb6a'
        } as any}
      >
        View
      </AwesomeButton>
    );
  }

  // Multiple URLs - show dropdown button
  return (
    <>
      <AwesomeButton
        type="primary"
        size="small"
        onPress={handleToggle}
        style={{ 
          minWidth: '80px',
          '--button-primary-color': '#4caf50',
          '--button-primary-color-dark': '#388e3c',
          '--button-primary-color-light': '#c8e6c9',
          '--button-primary-color-hover': '#66bb6a'
        } as any}
      >
        View <ChevronDown size={14} style={{ marginLeft: '4px' }} />
      </AwesomeButton>
      <Popper
        open={open}
        anchorEl={anchorEl}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {demo.slug && (
                    <MenuItem
                      key="primary"
                      onClick={() => handleMenuItemClick(`/${demo.slug}`)}
                    >
                      <ListItemIcon>
                        <ExternalLink size={16} />
                      </ListItemIcon>
                      <ListItemText>
                        Primary Demo
                      </ListItemText>
                    </MenuItem>
                  )}
                  {demo.url && demo.slug && (
                    <MenuItem
                      key="url1"
                      onClick={() => handleMenuItemClick(demo.url!)}
                    >
                      <ListItemIcon>
                        <ExternalLink size={16} />
                      </ListItemIcon>
                      <ListItemText>
                        Demo URL 1
                      </ListItemText>
                    </MenuItem>
                  )}
                  {demo.url && !demo.slug && (
                    <MenuItem
                      key="url1"
                      onClick={() => handleMenuItemClick(demo.url!)}
                    >
                      <ListItemIcon>
                        <ExternalLink size={16} />
                      </ListItemIcon>
                      <ListItemText>
                        Demo URL 1
                      </ListItemText>
                    </MenuItem>
                  )}
                  {demo.url2 && (
                    <MenuItem
                      key="url2"
                      onClick={() => handleMenuItemClick(demo.url2!)}
                    >
                      <ListItemIcon>
                        <ExternalLink size={16} />
                      </ListItemIcon>
                      <ListItemText>
                        Demo URL 2
                      </ListItemText>
                    </MenuItem>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default function DemoTable({ demos, verticals, clients, statuses, tabType = 'all' }: DemoTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    template: '',
    vertical: '',
    client: '',
    search: '',
  });
  
  // Check if all demos in this table are complete
  const isCompleteTable = demos.length > 0 && demos.every(demo => 
    !!demo.url && !!demo.scriptUrl && !!demo.recordingUrl
  );
  
  // Determine which columns to show based on tab type
  const showClientColumn = tabType !== 'general';
  const showVerticalColumn = tabType !== 'client-specific';
  
  // Demo types for filter
  const demoTypes = ['general', 'specific'];

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
    // Debug logging for template filtering
    if (filters.template) {
      console.log('Filtering by template:', filters.template);
      console.log('Demo template value:', demo.template);
    }
    
    // Status filter
    if (filters.status && demo.status !== filters.status) return false;
    
    // Type filter
    if (filters.type && demo.type !== filters.type) return false;
    
    // Template filter
    if (filters.template && demo.template !== filters.template) return false;
    
    // Vertical filter
    if (filters.vertical && demo.vertical !== filters.vertical) return false;
    
    // Client filter
    if (filters.client && demo.client !== filters.client) return false;
    
    // Search filter (across title and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = demo.title?.toLowerCase().includes(searchLower);
      const descMatch = demo.description?.toLowerCase().includes(searchLower);
      const clientMatch = demo.client?.toLowerCase().includes(searchLower);
      const useCaseMatch = demo.useCase?.toLowerCase().includes(searchLower);
      
      if (!(titleMatch || descMatch || clientMatch || useCaseMatch)) {
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

  // Display URL in a readable format
  const formatUrl = (url: string | undefined): string => {
    if (!url) return '-';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname : "");
    } catch (e) {
      return url;
    }
  };

  return (
    <Paper className={styles.tableContainer}>
      {/* Filters */}
      <Box 
        className={styles.filterContainer}
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1 
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={handleFilterChange('search')}
          className={styles.searchField}
          sx={{ minWidth: '200px' }}
        />
        
        <FormControl 
          size="small" 
          className={styles.filterSelect}
          sx={{ minWidth: '150px' }}
        >
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
        
        <FormControl 
          size="small" 
          className={styles.filterSelect}
          sx={{ minWidth: '150px' }}
        >
          <InputLabel>Template</InputLabel>
          <Select
            value={filters.template}
            label="Template"
            onChange={handleFilterChange('template') as any}
          >
            <MenuItem value="">All Templates</MenuItem>
            <MenuItem value="old_template">Old Template</MenuItem>
            <MenuItem value="new_template">New Template</MenuItem>
          </Select>
        </FormControl>
        
        {showVerticalColumn && (
          <FormControl 
            size="small" 
            className={styles.filterSelect}
            sx={{ minWidth: '150px' }}
          >
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
        )}
        
        {showClientColumn && (
          <FormControl 
            size="small" 
            className={styles.filterSelect}
            sx={{ minWidth: '150px' }}
          >
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
        )}
      </Box>
      
      {/* Table */}
      <TableContainer>
        <Table stickyHeader aria-label="demos table">
          <TableHead>
            <TableRow>
              <TableCell className={`${styles.headerCell} ${styles.titleColumn}`}>Title</TableCell>
              {tabType === 'general' && showVerticalColumn && (
                <TableCell className={`${styles.headerCell} ${styles.verticalColumn}`}>Vertical</TableCell>
              )}
              {showClientColumn && (
                <TableCell className={`${styles.headerCell} ${styles.clientColumn}`}>Client</TableCell>
              )}
              <TableCell className={`${styles.headerCell} ${styles.statusColumn}`}>Status</TableCell>
              {tabType !== 'general' && showVerticalColumn && (
                <TableCell className={`${styles.headerCell} ${styles.verticalColumn}`}>Vertical</TableCell>
              )}
              <TableCell className={`${styles.headerCell} ${styles.assignedToColumn}`}>Assigned To</TableCell>
              <TableCell className={`${styles.headerCell} ${styles.demoColumn}`}>Demo</TableCell>
              <TableCell className={`${styles.headerCell} ${styles.scriptColumn}`}>Script</TableCell>
              <TableCell className={`${styles.headerCell} ${styles.recordingColumn}`}>Recording</TableCell>
              <TableCell className={`${styles.headerCell} ${styles.dueDateColumn}`}>Due Date</TableCell>
              <TableCell className={`${styles.headerCell} ${styles.actionColumn}`}>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDemos.length > 0 ? (
              paginatedDemos.map((demo) => (
                <TableRow key={demo.id} hover>
                  <TableCell>
                    <Box>
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
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                        {demo.template === 'new_template' ? 'New Template' : 'Old Template'}
                      </Typography>
                    </Box>
                  </TableCell>
                  {tabType === 'general' && showVerticalColumn && (
                    <TableCell>{demo.vertical || '-'}</TableCell>
                  )}
                  {showClientColumn && (
                    <TableCell>{demo.client || '-'}</TableCell>
                  )}
                  <TableCell>
                    <Chip 
                      label={formatStatus(getDetailedStatus(demo))} 
                      size="small" 
                      color={getStatusColor(getDetailedStatus(demo))} 
                    />
                  </TableCell>
                  {tabType !== 'general' && showVerticalColumn && (
                    <TableCell>{demo.vertical || '-'}</TableCell>
                  )}
                  <TableCell>{demo.assignedTo || '-'}</TableCell>
                  
                  {/* Demo URL button */}
                  <TableCell className={styles.centered}>
                    <DemoUrlButton demo={demo} />
                  </TableCell>
                  
                  {/* Script button */}
                  <TableCell className={styles.centered}>
                    {isValidUrl(demo.scriptUrl) ? (
                      <AwesomeButton
                        type="primary"
                        size="small"
                        onPress={() => window.open(demo.scriptUrl, '_blank', 'noopener,noreferrer')}
                        style={{ 
                          minWidth: '80px',
                          '--button-primary-color': '#4caf50',
                          '--button-primary-color-dark': '#388e3c',
                          '--button-primary-color-light': '#c8e6c9',
                          '--button-primary-color-hover': '#66bb6a'
                        } as any}
                      >
                        Script
                      </AwesomeButton>
                    ) : (
                      <AwesomeButton
                        type="secondary"
                        size="small"
                        disabled
                        style={{ 
                          minWidth: '80px',
                          '--button-secondary-color': '#f44336',
                          '--button-secondary-color-dark': '#d32f2f',
                          '--button-secondary-color-light': '#ffcdd2',
                          '--button-secondary-color-hover': '#e53935',
                          '--button-secondary-border': '#f44336'
                        } as any}
                      >
                        Missing
                      </AwesomeButton>
                    )}
                  </TableCell>
                  
                  {/* Recording button */}
                  <TableCell className={styles.centered}>
                    {isValidUrl(demo.recordingUrl) ? (
                      <AwesomeButton
                        type="primary"
                        size="small"
                        onPress={() => window.open(demo.recordingUrl, '_blank', 'noopener,noreferrer')}
                        style={{ 
                          minWidth: '80px',
                          '--button-primary-color': '#4caf50',
                          '--button-primary-color-dark': '#388e3c',
                          '--button-primary-color-light': '#c8e6c9',
                          '--button-primary-color-hover': '#66bb6a'
                        } as any}
                      >
                        Recording
                      </AwesomeButton>
                    ) : (
                      <AwesomeButton
                        type="secondary"
                        size="small"
                        disabled
                        style={{ 
                          minWidth: '80px',
                          '--button-secondary-color': '#f44336',
                          '--button-secondary-color-dark': '#d32f2f',
                          '--button-secondary-color-light': '#ffcdd2',
                          '--button-secondary-color-hover': '#e53935',
                          '--button-secondary-border': '#f44336'
                        } as any}
                      >
                        Missing
                      </AwesomeButton>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {demo.dueDate 
                      ? new Date(demo.dueDate).toLocaleDateString() 
                      : '-'}
                  </TableCell>
                  
                  <TableCell className={styles.centered}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      color="secondary"
                      component={Link}
                      href={`/demos/${demo.id}/edit`}
                      className={styles.actionButton}
                      sx={{ minWidth: '80px' }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={8 + (showClientColumn ? 1 : 0) + (showVerticalColumn ? 1 : 0)} 
                  className={styles.emptyMessage}
                >
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