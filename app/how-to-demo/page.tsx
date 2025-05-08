import { Box, Typography, Paper, Grid, Card, CardContent, CardMedia } from '@mui/material';

export default function HowToDemoPage() {
  const howToSteps = [
    {
      title: "Request a Demo",
      description: "Start by submitting a demo request form. Include all necessary details about the client, use case, and timeline.",
      image: "/file.svg",
    },
    {
      title: "Development Phase",
      description: "Our team will create a custom demo based on your specifications. You can track progress in the Demo Status page.",
      image: "/globe.svg",
    },
    {
      title: "Review and Approve",
      description: "Review the demo when it's ready and provide feedback if needed. Approve when it meets all requirements.",
      image: "/window.svg",
    },
    {
      title: "Present to Client",
      description: "Use the approved demo with your client. Detailed access instructions will be provided.",
      image: "/inv-workplace.svg",
    },
  ];

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          How to Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Follow these steps to request, access, and present demos to your clients
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Demo Process Overview
        </Typography>
        <Typography paragraph>
          Our demo management system streamlines the process of creating and delivering
          product demonstrations. Whether you need a simple feature showcase or a complex
          custom demo for an enterprise client, the platform helps you manage the entire lifecycle.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {howToSteps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: 80,
                      height: 80,
                      objectFit: 'contain'
                    }}
                    image={step.image}
                    alt={step.title}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom align="center">
                    {index + 1}. {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Best Practices
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Before the Demo
          </Typography>
          <Typography paragraph>
            • Check your client's specific requirements and tailor the demo accordingly<br />
            • Ensure all features highlighted are relevant to the client's needs<br />
            • Test the demo thoroughly before presenting<br />
            • Prepare talking points and questions to engage the client
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            During the Demo
          </Typography>
          <Typography paragraph>
            • Start with a brief overview of what will be covered<br />
            • Focus on benefits rather than just features<br />
            • Invite questions throughout or at designated points<br />
            • Be prepared to adapt based on client feedback and interests
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            After the Demo
          </Typography>
          <Typography paragraph>
            • Follow up with resources and answers to any outstanding questions<br />
            • Collect feedback on the demo for continuous improvement<br />
            • Document client reactions and areas of interest for sales follow-up<br />
            • Request demo updates if client requirements change
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 