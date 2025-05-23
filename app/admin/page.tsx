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
  CircularProgress
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingDemosCount, setPendingDemosCount] = useState(0);

  // Load admin dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Auth0 is fully disabled - always grant admin access
        console.log('[Admin] Auth0 is fully disabled - granting admin access');
  
        // Fetch count of pending demos
        const response = await fetch('/api/demos?status=pending_approval');
        
        if (response.ok) {
          const data = await response.json();
          setPendingDemosCount(data.length);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
    </Box>
  );
} 