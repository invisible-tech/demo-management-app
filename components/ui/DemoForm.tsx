'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  MenuItem, 
  Select,
  SelectChangeEvent,
  InputLabel,
  Divider,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Demo } from '@/lib/schema';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  border: `1px solid ${theme.palette.divider}`
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 'bold',
  color: theme.palette.primary.main
}));

const FormDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(4, 0),
}));

const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4)
}));

interface DemoFormProps {
  type: 'request' | 'submit' | 'register' | 'edit';
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  demo?: Demo;
}

export default function DemoForm({ type, onSubmit, isSubmitting = false, demo }: DemoFormProps) {
  const isRequest = type === 'request';
  const isRegister = type === 'register';
  const isEdit = type === 'edit';
  const isSubmit = type === 'submit';
  const formTitle = isRequest ? 'Request a Demo' : isEdit ? 'Edit Demo' : isRegister ? 'Register a Demo' : 'Submit a Demo';
  
  // URL preview for slug
  const [slugPreview, setSlugPreview] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    requestedBy: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    stakeholders: '',
    status: isRequest ? 'requested' : 'ready',
    url: '',
    authDetails: '',
    assignedTo: isRequest ? 'n/a' : '',
    slug: '',
    vertical: '',
    useCase: ''
  });

  // Update slug preview when slug changes
  useEffect(() => {
    if (formData.slug) {
      setSlugPreview(`https://demos.inv.tech/${formData.slug}`);
    } else {
      setSlugPreview('');
    }
  }, [formData.slug]);
  
  // If editing, populate form with demo data
  useEffect(() => {
    if (demo && isEdit) {
      setFormData({
        title: demo.title || '',
        requestedBy: demo.client || '',
        description: demo.description || '',
        priority: 'medium', // Not stored in the demo object
        dueDate: demo.dueDate || '',
        stakeholders: '', // Not stored in the demo object
        status: demo.status || 'requested',
        url: demo.url || '',
        authDetails: demo.authDetails || '',
        assignedTo: demo.assignedTo || '',
        slug: demo.slug || '',
        vertical: demo.vertical || '',
        useCase: demo.useCase || ''
      });
    }
  }, [demo, isEdit]);
  
  // Handle text field changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for submission based on form type
    let submissionData = {};
    
    if (isRequest) {
      submissionData = {
        title: formData.title || 'Demo Request',
        description: formData.description,
        status: 'requested',
        assignedTo: 'n/a',
        url: '',
        authDetails: '',
        dueDate: formData.dueDate || undefined,
        client: formData.requestedBy || undefined,
        vertical: formData.vertical,
      };
    } else if (isEdit) {
      submissionData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo,
        url: formData.url,
        authDetails: formData.authDetails,
        dueDate: formData.dueDate || undefined,
        client: formData.requestedBy,
        slug: formData.slug,
        vertical: formData.vertical,
        useCase: formData.useCase
      };
    } else if (isRegister) {
      submissionData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo,
        url: formData.url,
        authDetails: formData.authDetails,
        slug: formData.slug,
        vertical: formData.vertical,
        useCase: formData.useCase,
        client: formData.requestedBy
      };
    } else {
      // Submit logic
      submissionData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo,
        url: formData.url,
        authDetails: formData.authDetails,
        slug: formData.slug,
        vertical: formData.vertical,
        useCase: formData.useCase,
        client: formData.requestedBy
      };
    }
    
    onSubmit(submissionData);
  };
  
  return (
    <FormPaper elevation={3}>
      <Box component="form" onSubmit={handleSubmit}>
        <FormSection>
          
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField
              name="title"
              label="Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleTextChange}
              required={!isRequest}
            />
            
            {!isRegister && (
              <TextField
                name="requestedBy"
                label={isEdit ? 'Client' : isRequest ? 'Client' : 'Requested By'}
                fullWidth
                required
                variant="outlined"
                value={formData.requestedBy}
                onChange={handleTextChange}
              />
            )}
          </Box>

          {(isEdit || isRegister || isSubmit) && (
            <TextField
              name="slug"
              label={isRegister ? "Slug (required)" : "Slug (optional)"}
              fullWidth={!isRegister}
              sx={{ 
                mt: 3,
                ...(isRegister ? { width: '50%' } : {})
              }}
              required={isRegister}
              variant="outlined"
              value={formData.slug}
              onChange={handleTextChange}
              helperText={slugPreview ? `URL: ${slugPreview}` : "This will create your URL for the demo, eg https://demos.inv.tech/MY_DEMO"}
            />
          )}
          
          <TextField
            name="description"
            label="Description"
            fullWidth
            required={!isRegister}
            multiline
            rows={4}
            sx={{ mt: 3 }}
            variant="outlined"
            value={formData.description}
            onChange={handleTextChange}
          />
        </FormSection>
        
        <FormSection>
          {isRequest ? (
            <>
              <TextField
                name="vertical"
                label="Vertical"
                fullWidth
                variant="outlined"
                value={formData.vertical}
                onChange={handleTextChange}
                sx={{ mb: 3 }}
              />
              
              <TextField
                name="dueDate"
                label="Target Completion Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
                value={formData.dueDate}
                onChange={handleTextChange}
              />
            </>
          ) : (
            <>
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 3 }}>
                <TextField
                  name="assignedTo"
                  label={isRegister ? "Demo Creator" : "Assigned To"}
                  fullWidth
                  variant="outlined"
                  value={formData.assignedTo}
                  onChange={handleTextChange}
                />
                
                {!isRegister && (
                  <TextField
                    name="vertical"
                    label="Vertical"
                    fullWidth
                    variant="outlined"
                    value={formData.vertical}
                    onChange={handleTextChange}
                  />
                )}
              </Box>
              
              {!isRegister && (
                <TextField
                  name="useCase"
                  label="Use Case"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  sx={{ mb: 3 }}
                  value={formData.useCase}
                  onChange={handleTextChange}
                />
              )}
              
              <TextField
                name="url"
                label="Demo URL"
                fullWidth
                sx={{ mb: 3 }}
                value={formData.url}
                onChange={handleTextChange}
              />
              
              <TextField
                name="authDetails"
                label={isRegister ? "Password" : "Auth Details"}
                fullWidth
                multiline={!isRegister}
                rows={isRegister ? 1 : 3}
                placeholder={isRegister ? "Provide password if needed" : "Provide access credentials if needed"}
                value={formData.authDetails}
                onChange={handleTextChange}
              />
            </>
          )}
        </FormSection>
        
        <FormActions>
          <Button 
            variant="outlined" 
            color="inherit"
            type="button"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isRequest ? 'Submit Request' : isEdit ? 'Save Changes' : isRegister ? 'Register Demo' : 'Submit Demo')}
          </Button>
        </FormActions>
      </Box>
    </FormPaper>
  );
} 