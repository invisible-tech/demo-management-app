'use client';
import { Card, CardContent, CardHeader, Typography, Chip, Box, Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  borderRadius: theme.shape.borderRadius,
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  paddingBottom: theme.spacing(1),
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
    default:
      color = theme.palette.grey[500];
  }
  
  return {
    backgroundColor: color,
    color: '#fff',
    fontWeight: 'bold',
  };
});

interface DemoCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  date?: string;
  assignee?: string;
}

export default function DemoCard({ id, title, description, status, date, assignee }: DemoCardProps) {
  return (
    <StyledCard>
      <StyledCardHeader
        title={title}
        titleTypographyProps={{
          variant: 'h6',
          noWrap: true,
          sx: { textOverflow: 'ellipsis' }
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <StatusChip 
            label={status} 
            status={status}
            size="small"
          />
          {date && (
            <Typography variant="caption" color="text.secondary">
              {date}
            </Typography>
          )}
        </Box>
        
        {assignee && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Assigned to: {assignee}
          </Typography>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            component={Link} 
            href={`/demos/${id}`} 
            size="small" 
            variant="outlined"
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
}

// Grid layout to display multiple cards
export function DemoCardGrid({ demos }: { demos: DemoCardProps[] }) {
  return (
    <Grid container spacing={3}>
      {demos.map((demo) => (
        <Grid item xs={12} sm={6} md={4} key={demo.id}>
          <DemoCard {...demo} />
        </Grid>
      ))}
    </Grid>
  );
} 