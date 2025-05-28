'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import AppBar from './AppBar';
import LeftNavDrawer from './ui/LeftNavDrawer';

// This is a client component that handles auth status and renders appropriate layout
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  // We'll use client-side state to track authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check authentication status on mount
    async function checkAuthStatus() {
      try {
        // Simple fetch to a protected endpoint to check auth
        const res = await fetch('/api/auth/me', { 
          method: 'GET',
          // credentials needed to send/receive cookies
          credentials: 'include' 
        });
        
        // If 200 OK, user is authenticated
        setIsAuthenticated(res.ok);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    }
    
    checkAuthStatus();
  }, []);
  
  // Loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <Container 
        maxWidth="sm" 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <Typography>Loading...</Typography>
      </Container>
    );
  }
  
  // Not authenticated - show login screen
  if (!isAuthenticated) {
    return (
      <Container 
        maxWidth="sm" 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 3
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Invisible Demos
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please sign in to continue
        </Typography>
        <Button 
          href="/api/auth/login" 
          variant="contained" 
          size="large"
          sx={{ mt: 2 }}
        >
          Sign In
        </Button>
      </Container>
    );
  }
  
  // Authenticated - show full app layout
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar />
      <LeftNavDrawer />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          p: { xs: 2, sm: 2 },
          mt: '64px',
          ml: '100px',
          width: { xs: 'calc(100% - 100px)' },
          maxWidth: { sm: 'calc(100% - 100px)' }, 
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 