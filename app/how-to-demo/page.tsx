import { Box, Typography } from '@mui/material';

export default function HowToDemoPage() {
  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          How to Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Guidelines for requesting, creating, and presenting demos
        </Typography>
      </Box>

      <Box sx={{ 
        width: '100%', 
        height: 'calc(100vh - 200px)', 
        minHeight: '600px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <iframe
          src="https://docs.google.com/document/d/166s-xA9EwzEuMhk16vqDLwwURo_U84ejEN-3L3fRytE/edit?usp=sharing&rm=minimal&embedded=true"
          title="How to Demo Documentation"
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