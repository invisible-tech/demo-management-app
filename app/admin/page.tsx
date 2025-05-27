"use client"

import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardActionArea,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from "@mui/material";
import Link from "next/link";
import { Demo } from "@/lib/schema";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [pendingDemosCount, setPendingDemosCount] = useState(0);
  const [inProgressDemos, setInProgressDemos] = useState<Demo[]>([]);

  // Load admin dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Auth0 is fully disabled - always grant admin access
        console.log('[Admin] Auth0 is fully disabled - granting admin access');
  
        // Fetch count of pending demos
        const pendingResponse = await fetch('/api/demos?status=pending_approval');
        
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingDemosCount(pendingData.length);
        }

        // Fetch in-progress demos
        const inProgressResponse = await fetch('/api/demos?status=in_progress');
        
        if (inProgressResponse.ok) {
          const inProgressData = await inProgressResponse.json();
          setInProgressDemos(inProgressData);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get detailed status message
  const getDetailedStatus = (demo: Demo) => {
    const hasUrl = !!demo.url;
    const hasScript = !!demo.scriptUrl;
    const hasRecording = !!demo.recordingUrl;
    
    if (hasUrl && hasScript && hasRecording) {
      return 'Ready (all items complete)';
    }
    
    const missingItems = [];
    if (!hasUrl) missingItems.push('demo URL');
    if (!hasScript) missingItems.push('script');
    if (!hasRecording) missingItems.push('recording');
    
    if (missingItems.length >= 2) {
      return `Missing ${missingItems.length} items`;
    } else {
      return `Missing ${missingItems[0]}`;
    }
  };

  // Get component status for detailed view
  const getComponentStatus = (demo: Demo) => {
    return {
      url: !!demo.url,
      script: !!demo.scriptUrl,
      recording: !!demo.recordingUrl
    };
  };

  // Render component status chips
  const renderComponentStatus = (demo: Demo) => {
    const status = getComponentStatus(demo);
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip 
            label="URL" 
            size="small"
            color={status.url ? 'success' : 'error'}
            variant={status.url ? 'filled' : 'outlined'}
          />
          <Chip 
            label="Script" 
            size="small"
            color={status.script ? 'success' : 'error'}
            variant={status.script ? 'filled' : 'outlined'}
          />
          <Chip 
            label="Recording" 
            size="small"
            color={status.recording ? 'success' : 'error'}
            variant={status.recording ? 'filled' : 'outlined'}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {getDetailedStatus(demo)}
        </Typography>
      </Box>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and administer the demo system
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              component={Link} 
              href="/admin/demos"
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Demo Approvals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review and approve new demos or request changes
                </Typography>
                {pendingDemosCount > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {pendingDemosCount} demo{pendingDemosCount > 1 ? 's' : ''} pending approval
                  </Alert>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                In Progress Demos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Demos currently being developed
              </Typography>
              {inProgressDemos.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {inProgressDemos.length} demo{inProgressDemos.length > 1 ? 's' : ''} in progress
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea component={Link} href="/demos" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Back to Demos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Return to the main demo management interface
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* In Progress Demos Table */}
      {inProgressDemos.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            In Progress Demos Details
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Components Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inProgressDemos.map((demo) => (
                  <TableRow key={demo.id}>
                    <TableCell>
                      <Link href={`/demos/${demo.slug}`} style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                          {demo.title}
                        </Typography>
                      </Link>
                      {demo.client && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Client: {demo.client}
                        </Typography>
                      )}
                      {demo.vertical && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Vertical: {demo.vertical}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={demo.type === 'specific' ? 'Client-Specific' : 'General'} 
                        size="small"
                        color={demo.type === 'specific' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{demo.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell>
                      {demo.dueDate ? (
                        <Typography 
                          variant="body2" 
                          color={new Date(demo.dueDate) < new Date() ? 'error' : 'text.primary'}
                        >
                          {formatDate(demo.dueDate)}
                        </Typography>
                      ) : (
                        'No due date'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="In Progress" 
                        size="small"
                        color="warning"
                      />
                    </TableCell>
                    <TableCell>
                      {renderComponentStatus(demo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
} 