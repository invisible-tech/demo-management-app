'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import DemoTable from './DemoTable';
import { Demo } from '@/lib/schema';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
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

  // Filter demos for each tab
  const generalCompleteDemos = demos.filter(
    demo => demo.type === 'general' && demo.status === 'ready'
  );
  
  const generalInProgressDemos = demos.filter(
    demo => demo.type === 'general' && demo.status === 'in_progress'
  );
  
  const specificCompleteDemos = demos.filter(
    demo => demo.type === 'specific' && demo.status === 'ready'
  );
  
  const specificInProgressDemos = demos.filter(
    demo => demo.type === 'specific' && demo.status === 'in_progress'
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="demo category tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`General Complete (${generalCompleteDemos.length})`} id="demo-tab-0" />
          <Tab label={`General In Progress (${generalInProgressDemos.length})`} id="demo-tab-1" />
          <Tab label={`Specific Complete (${specificCompleteDemos.length})`} id="demo-tab-2" />
          <Tab label={`Specific In Progress (${specificInProgressDemos.length})`} id="demo-tab-3" />
          <Tab label={`All Demos (${demos.length})`} id="demo-tab-4" />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <DemoTable 
          demos={generalCompleteDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
        />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <DemoTable 
          demos={generalInProgressDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
        />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <DemoTable 
          demos={specificCompleteDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
        />
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <DemoTable 
          demos={specificInProgressDemos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
        />
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <DemoTable 
          demos={demos} 
          verticals={verticals} 
          clients={clients} 
          statuses={statuses} 
        />
      </TabPanel>
    </Box>
  );
} 