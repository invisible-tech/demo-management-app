'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import DemoTable from './DemoTable';
import { Demo } from '@/lib/schema';
import styles from './DemoTabs.module.css';

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
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      {...other}
    >
      {value === index && <Box className={styles.tabPanel}>{children}</Box>}
    </div>
  );
}

export default function DemoTabs({ 
  demos, 
  verticals, 
  clients, 
  statuses 
}: { 
  demos: Demo[]; 
  verticals: string[]; 
  clients: string[]; 
  statuses: string[]; 
}) {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Helper function to determine if a demo is complete
  const isDemoComplete = (demo: Demo): boolean => {
    return !!demo.url && !!demo.scriptUrl && !!demo.recordingUrl;
  };
  
  // Helper function to determine if a demo is general or client-specific
  const isClientSpecific = (demo: Demo): boolean => {
    return !!demo.client;
  };

  // Filter demos for each tab - now using client/vertical to determine type
  const generalCompleteDemos = demos.filter(
    demo => !isClientSpecific(demo) && isDemoComplete(demo)
  );
  
  const generalInProgressDemos = demos.filter(
    demo => !isClientSpecific(demo) && !isDemoComplete(demo)
  );
  
  const clientSpecificCompleteDemos = demos.filter(
    demo => isClientSpecific(demo) && isDemoComplete(demo)
  );
  
  const clientSpecificInProgressDemos = demos.filter(
    demo => isClientSpecific(demo) && !isDemoComplete(demo)
  );

  return (
    <Box className={styles.container}>
      <Box 
        className={styles.tabsContainer}
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="demo category tabs"
          variant="scrollable"
          scrollButtons="auto"
          className={styles.tabs}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#1976d2',
            }
          }}
        >
          <Tab 
            label={`General Complete (${generalCompleteDemos.length})`} 
            id="demo-tab-0" 
            className={styles.tabItem}
          />
          <Tab 
            label={`General In Progress (${generalInProgressDemos.length})`} 
            id="demo-tab-1" 
            className={styles.tabItem}
          />
          <Tab 
            label={`Client-Specific Complete (${clientSpecificCompleteDemos.length})`} 
            id="demo-tab-2" 
            className={styles.tabItem}
          />
          <Tab 
            label={`Client-Specific In Progress (${clientSpecificInProgressDemos.length})`} 
            id="demo-tab-3" 
            className={styles.tabItem}
          />
          <Tab 
            label={`All Demos (${demos.length})`} 
            id="demo-tab-4" 
            className={styles.tabItem}
          />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <DemoTable 
          demos={generalCompleteDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
          tabType="general"
        />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <DemoTable 
          demos={generalInProgressDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
          tabType="general"
        />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <DemoTable 
          demos={clientSpecificCompleteDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
          tabType="client-specific"
        />
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <DemoTable 
          demos={clientSpecificInProgressDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
          tabType="client-specific"
        />
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <DemoTable 
          demos={demos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
          tabType="all"
        />
      </TabPanel>
    </Box>
  );
} 