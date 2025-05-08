"use client"

import { useState } from "react"
import { Box, Typography, Paper, Tabs, Tab, Divider } from '@mui/material'
import DemoStatus from "@/components/ui/DemoStatus"

// Sample demo data - in a real app, this would come from an API
const sampleDemos = [
  {
    title: "Enterprise Feature Demo",
    status: "in development",
    requestedBy: "Marketing Team",
    createdDate: "2023-04-15",
    lastUpdated: "2023-04-20",
    description: "A comprehensive demo showcasing our enterprise features for potential clients in the financial sector.",
    assignedTo: "Alex Johnson",
    comments: [
      { author: "Sara Lee", date: "2023-04-16", text: "Started working on the authentication module." },
      { author: "Alex Johnson", date: "2023-04-18", text: "Added reporting features and dashboard components." }
    ]
  },
  {
    title: "Mobile App Integration",
    status: "review",
    requestedBy: "Product Team",
    createdDate: "2023-03-28",
    lastUpdated: "2023-04-19",
    description: "Demo showing how our platform integrates with the new mobile application for field workers.",
    assignedTo: "Michael Chen",
    comments: [
      { author: "Michael Chen", date: "2023-04-10", text: "Completed the basic integration flow." },
      { author: "Lisa Wong", date: "2023-04-19", text: "Reviewing the data synchronization features." }
    ]
  },
  {
    title: "Healthcare Data Visualization",
    status: "ready",
    requestedBy: "Healthcare Division",
    createdDate: "2023-02-15",
    lastUpdated: "2023-03-30",
    description: "Interactive demo showcasing patient data visualization and analytics capabilities.",
    assignedTo: "David Miller",
    comments: [
      { author: "David Miller", date: "2023-03-10", text: "Finalized all charts and interactive elements." },
      { author: "Sarah Parker", date: "2023-03-25", text: "Confirmed HIPAA compliance for all demo data." },
      { author: "Admin", date: "2023-03-30", text: "Demo approved and ready for client presentations." }
    ]
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-status-tabpanel-${index}`}
      aria-labelledby={`demo-status-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function DemoStatusPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Demo Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the status of all demo requests and submissions
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="In Development" />
          <Tab label="In Review" />
          <Tab label="Ready" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <DemoStatus {...sampleDemos[0]} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <DemoStatus {...sampleDemos[1]} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <DemoStatus {...sampleDemos[2]} />
        </TabPanel>
      </Paper>
    </Box>
  );
} 