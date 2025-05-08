'use client';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Divider, 
  Paper, 
  Avatar, 
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StatusContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[2],
}));

const StatusHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  let color;
  switch (status.toLowerCase()) {
    case 'requested':
      color = theme.palette.info.main;
      break;
    case 'in development':
      color = theme.palette.warning.main;
      break;
    case 'review':
      color = theme.palette.secondary.main;
      break;
    case 'ready':
      color = theme.palette.success.main;
      break;
    case 'rejected':
      color = theme.palette.error.main;
      break;
    default:
      color = theme.palette.grey[500];
  }
  
  return {
    backgroundColor: color,
    color: '#fff',
    fontWeight: 'bold',
    padding: theme.spacing(1, 2),
  };
});

const MetadataCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface DemoStatusProps {
  title: string;
  status: string;
  requestedBy: string;
  createdDate: string;
  lastUpdated: string;
  description: string;
  assignedTo?: string;
  comments?: Array<{ author: string; date: string; text: string }>;
}

export default function DemoStatus({
  title,
  status,
  requestedBy,
  createdDate,
  lastUpdated,
  description,
  assignedTo,
  comments = [],
}: DemoStatusProps) {
  // Determine the active step based on status
  const getActiveStep = () => {
    switch (status.toLowerCase()) {
      case 'requested':
        return 0;
      case 'in development':
        return 1;
      case 'review':
        return 2;
      case 'ready':
        return 3;
      case 'rejected':
        return -1; // Special case for rejected
      default:
        return 0;
    }
  };

  const activeStep = getActiveStep();
  const steps = ['Requested', 'In Development', 'Review', 'Ready'];

  return (
    <StatusContainer>
      <StatusHeader>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <StatusChip label={status} status={status} />
      </StatusHeader>

      {/* Stepper for status visualization */}
      {status.toLowerCase() !== 'rejected' ? (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      ) : (
        <Box sx={{ 
          bgcolor: (theme) => theme.palette.error.light + '20', 
          p: 2, 
          borderRadius: 1, 
          mb: 4 
        }}>
          <Typography color="error" variant="body1">
            This demo request has been rejected.
          </Typography>
        </Box>
      )}

      {/* Demo info */}
      <MetadataCard variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Demo Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Requested by
              </Typography>
              <Typography variant="body1" gutterBottom>
                {requestedBy}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created on
              </Typography>
              <Typography variant="body1" gutterBottom>
                {createdDate}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Last updated
              </Typography>
              <Typography variant="body1" gutterBottom>
                {lastUpdated}
              </Typography>
            </Grid>
            
            {assignedTo && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Assigned to
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {assignedTo}
                </Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {description}
          </Typography>
        </CardContent>
      </MetadataCard>

      {/* Comments/Activity */}
      {comments.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Activity
          </Typography>
          
          <List>
            {comments.map((comment, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar>{comment.author.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">{comment.author}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comment.date}
                      </Typography>
                    </Box>
                  }
                  secondary={comment.text}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        {activeStep < 3 && (
          <Button variant="contained" color="primary">
            {activeStep === 0 ? 'Start Development' : 
             activeStep === 1 ? 'Submit for Review' : 
             'Mark as Ready'}
          </Button>
        )}
        
        <Button variant="outlined" color="inherit">
          Back to List
        </Button>
      </Box>
    </StatusContainer>
  );
}

// Helper Grid component
const Grid = ({ container, item, xs, md, spacing, children, ...props }: any) => {
  if (container) {
    return (
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: spacing * 8,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
  
  return (
    <Box {...props}>
      {children}
    </Box>
  );
}; 