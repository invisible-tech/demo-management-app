"use client"

import { 
  Typography, 
  Box, 
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip
} from '@mui/material';

// Component data with direct links
const coreComponents = [
  {
    id: 'data-environment',
    title: 'Data Platform',
    description: 'Unify fragmented data from any source or format into a clean, structured layer for analysis and automation.',
    demos: [
      { 
        title: 'Data Platform Visualization', 
        url: 'https://demos.inv.tech/data-platform'
      }
    ]
  },
  {
    id: 'evaluations-training',
    title: 'Evaluations & Training',
    description: 'Train your model to your specifications and evaluate outputs for quality, safety, and accuracy.',
    demos: [
      { 
        title: 'RLHF Annotation', 
        url: 'https://demos.inv.tech/rlhf-annotation-msft'
      },
      { 
        title: 'Evaluation Report', 
        url: 'https://demos.inv.tech/multilingual-evaluation'
      },
      { 
        title: 'Evals for enterprise', 
        url: 'https://demos.inv.tech/evals-enterprise'
      }
    ]
  },
  {
    id: 'agentic-engine',
    title: 'Agentic Engine',
    description: 'Build and deploy AI agents tailored to your processes, with coordinated handoffs and full control over training and execution.',
    demos: [
      { 
        title: 'Ad Ops Workflow', 
        url: 'https://demos.inv.tech/agentic'
      }
    ]
  },
  {
    id: 'expert-marketplace',
    title: 'Expert Marketplace',
    description: 'Find top-tier specialists to fine-tune your models, with custom sourcing available on demand.',
    demos: [
      { 
        title: 'Invisible Trainers', 
        url: 'https://demos.inv.tech/trainers'
      }
    ]
  },
  {
    id: 'process-builder',
    title: 'Process Builder',
    description: 'Turn manual workflows into automated processes and connect with 300+ integrations.',
    demos: [
      { 
        title: 'Process Builder Dashboard', 
        url: 'https://demos.inv.tech/builder'
      }
    ]
  }
];

export default function CorePlatformDemos() {
  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
        Core Platform
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
      The Invisible Platform is a modular AI operating system that helps you solve challenges, from messy data to agentic execution, using only the components you need. 
      </Typography>
      
      <Grid container spacing={3}>
        {coreComponents.map((component) => (
          <Grid item xs={12} md={6} key={component.id}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderTop: '4px solid',
                borderColor: 'primary.main',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  gutterBottom 
                  fontWeight="bold"
                  color="primary.dark"
                >
                  {component.title}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  {component.description}
                </Typography>
                
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0, flexWrap: 'wrap', gap: 1 }}>
                {component.demos.map((demo) => (
                  <Button 
                    key={demo.url}
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderRadius: '4px',
                      textTransform: 'none'
                    }}
                  >
                    {demo.title}
                  </Button>
                ))}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 