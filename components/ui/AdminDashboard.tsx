'use client';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  let color;
  switch (status.toLowerCase()) {
    case 'ready':
      color = theme.palette.success.main;
      break;
    case 'in progress':
      color = theme.palette.warning.main;
      break;
    case 'needs review':
      color = theme.palette.info.main;
      break;
    case 'pending':
      color = theme.palette.error.main;
      break;
    default:
      color = theme.palette.grey[500];
  }
  
  return {
    backgroundColor: color,
    color: '#fff',
    fontWeight: 'bold',
  };
});

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface DemoData {
  id: string;
  title: string;
  requestedBy: string;
  status: string;
  date: string;
}

// Sample data
const recentDemos: DemoData[] = [
  { id: '1', title: 'Product Feature Demo', requestedBy: 'Marketing Team', status: 'Ready', date: '2023-06-10' },
  { id: '2', title: 'Internal Tool Showcase', requestedBy: 'Engineering', status: 'In Progress', date: '2023-06-08' },
  { id: '3', title: 'Client Onboarding Flow', requestedBy: 'Customer Success', status: 'Needs Review', date: '2023-06-05' },
  { id: '4', title: 'Mobile App Features', requestedBy: 'Product Team', status: 'Pending', date: '2023-06-01' },
];

// Stats data
const statsData = [
  { label: 'Active Demos', value: 12, color: '#4CAF50' },
  { label: 'Pending Requests', value: 8, color: '#FF9800' },
  { label: 'Completed This Month', value: 24, color: '#2196F3' },
  { label: 'Total Users', value: 56, color: '#9C27B0' },
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Admin Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledCard sx={{ bgcolor: stat.color + '10' }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Recent Demos" />
          <Tab label="Pending Requests" />
          <Tab label="User Management" />
        </Tabs>

        {/* Recent Demos Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: (theme) => theme.palette.primary.main }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Demo Title</TableCell>
                  <TableCell sx={{ color: 'white' }}>Requested By</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentDemos.map((demo) => (
                  <TableRow key={demo.id} hover>
                    <TableCell>{demo.title}</TableCell>
                    <TableCell>{demo.requestedBy}</TableCell>
                    <TableCell>
                      <StatusChip 
                        label={demo.status}
                        status={demo.status}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{demo.date}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined"
                        href={`/demos/${demo.id}`}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Other tabs would be implemented similarly */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">
            Pending demo requests content would appear here.
          </Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1">
            User management content would appear here.
          </Typography>
        </TabPanel>
      </Paper>
    </DashboardContainer>
  );
} 