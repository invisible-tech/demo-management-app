"use client";

import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HowToDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'getting-started';
  
  const [activeTab, setActiveTab] = useState(tab);

  useEffect(() => {
    // Update the URL when the tab changes
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (event: React.SyntheticEvent, newTab: string) => {
    setActiveTab(newTab);
    router.push(`/how-to-demo?tab=${newTab}`);
  };

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          How to Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Guidelines for requesting, creating, and presenting demos
        </Typography>
      </Box>
              
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value="getting-started" label="Getting Started" />
          <Tab value="sales" label="For Sales" />
          <Tab value="creators" label="For Demo Creators" />
        </Tabs>
      </Paper>

      <Box sx={{ 
        width: '100%', 
        height: 'calc(100vh - 250px)', 
        minHeight: '600px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: activeTab === 'getting-started' ? 'block' : 'none'
      }}>
        <iframe
          src="https://docs.google.com/document/d/1p8ikeWtpytZ4CXgpzfIvw5rS9gXJX0P9BHNJEFCPLD0/edit?tab=t.0"
          title="Getting Started Documentation"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none' }}
          allowFullScreen
        />
      </Box>
      
      <Box sx={{ 
        width: '100%', 
        height: 'calc(100vh - 250px)', 
        minHeight: '600px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: activeTab === 'sales' ? 'block' : 'none'
      }}>
        <iframe
          src="https://docs.google.com/document/d/166s-xA9EwzEuMhk16vqDLwwURo_U84ejEN-3L3fRytE/edit?usp=sharing&rm=minimal&embedded=true"
          title="Sales Demo Documentation"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none' }}
          allowFullScreen
        />
      </Box>
              
      <Box sx={{ 
        width: '100%', 
        height: 'calc(100vh - 250px)', 
        minHeight: '600px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: activeTab === 'creators' ? 'block' : 'none'
      }}>
        <iframe
          src="https://docs.google.com/document/d/1dt_R7CsSxYAZxGVSMa_QyBvesYn41Nffq2qfBcF0z2o/edit?usp=sharing&rm=minimal&embedded=true"
          title="Demo Creators Documentation"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none' }}
          allowFullScreen
        />
      </Box>
    </Box>
  );
}

// Add loading fallback
function LoadingFallback() {
  return (
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <Typography variant="h6">Loading...</Typography>
    </Box>
  );
}

export default function HowToDemoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HowToDemoContent />
    </Suspense>
  );
} 