'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 

  Typography, 
  TextField, 
  Button, 
  FormControl, 

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
  const formTitle = isRequest ? 'Request a Demo' : isEdit ? 'Edit Demo' : 'Register a Demo';
  
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
    type: 'general', // Default type
    url: '',
    scriptUrl: '',
    recordingUrl: '',
    authDetails: '',
    assignedTo: isRequest ? 'n/a' : '',
    slug: '',
    vertical: '',
    useCase: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState<{
    clientVertical?: string;
  }>({});
  
  // Update slug preview when slug changes
  useEffect(() => {
    if (formData.slug) {
      setSlugPreview(`https://demos.inv.tech/${formData.slug}`);
    } else {
      setSlugPreview('');
    }
  }, [formData.slug]);
  
  // Determine type based on client field
  useEffect(() => {
    // If client field has a value, type is 'specific', otherwise 'general'
    const newType = formData.requestedBy ? 'specific' : 'general';
    
    // Only update if the type has changed
    if (newType !== formData.type) {
      setFormData(prev => ({
        ...prev,
        type: newType
      }));
    }
  }, [formData.requestedBy, formData.type]);
  
  // If editing, populate form with demo data
  useEffect(() => {
    if (demo && isEdit) {
      setFormData({
        title: demo.title || '',
        requestedBy: demo.client || '',
        description: demo.description || '',
        priority: 'medium',
        dueDate: demo.dueDate || '',
        stakeholders: '',
        status: demo.status || 'requested',
        type: demo.type || 'general',
        url: demo.url || '',
        scriptUrl: demo.scriptUrl || '',
        recordingUrl: demo.recordingUrl || '',
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
    
    // Reset errors
    setErrors({});
    
    // Validate that either client OR vertical is set, but not both
    const hasClient = !!formData.requestedBy?.trim();
    const hasVertical = !!formData.vertical?.trim();
    
    if (isEdit || isRegister) {
      if (hasClient && hasVertical) {
        setErrors({
          clientVertical: "Please specify either Client OR Vertical, but not both. This helps categorize the demo correctly."
        });
        return; // Don't proceed with submission
      }
      
      if (!hasClient && !hasVertical) {
        setErrors({
          clientVertical: "Please specify either Client OR Vertical. At least one is required."
        });
        return; // Don't proceed with submission
      }
    }
    
    // Ensure the type is correctly set based on client field
    const updatedFormData = {
      ...formData,
      type: formData.requestedBy ? 'specific' : 'general'
    };
    
    // Prepare data for submission based on form type
    let submissionData = {};
    
    if (isRequest) {
      submissionData = {
        title: updatedFormData.title || 'Demo Request',
        description: updatedFormData.description,
        status: 'requested',
        type: updatedFormData.type,
        assignedTo: 'n/a',
        url: '',
        scriptUrl: '',
        recordingUrl: '',
        authDetails: '',
        dueDate: updatedFormData.dueDate || undefined,
        client: updatedFormData.requestedBy || undefined,
      };
    } else if (isEdit) {
      submissionData = {
        title: updatedFormData.title,
        description: updatedFormData.description,
        status: updatedFormData.status,
        type: updatedFormData.type,
        assignedTo: updatedFormData.assignedTo,
        url: updatedFormData.url,
        scriptUrl: updatedFormData.scriptUrl,
        recordingUrl: updatedFormData.recordingUrl,
        authDetails: updatedFormData.authDetails,
        dueDate: updatedFormData.dueDate || undefined,
        client: updatedFormData.requestedBy,
        slug: updatedFormData.slug,
        vertical: updatedFormData.vertical,
        useCase: updatedFormData.useCase
      };
    } else if (isRegister) {
      submissionData = {
        title: updatedFormData.title,
        description: updatedFormData.description,
        status: updatedFormData.status,
        type: updatedFormData.type,
        assignedTo: updatedFormData.assignedTo,
        url: updatedFormData.url,
        scriptUrl: updatedFormData.scriptUrl,
        recordingUrl: updatedFormData.recordingUrl,
        authDetails: updatedFormData.authDetails,
        slug: updatedFormData.slug,
        vertical: updatedFormData.vertical,
        useCase: updatedFormData.useCase,
        client: updatedFormData.requestedBy
      };
    } else {
      // Submit logic
      submissionData = {
        title: updatedFormData.title,
        description: updatedFormData.description,
        status: updatedFormData.status,
        type: updatedFormData.type,
        assignedTo: updatedFormData.assignedTo,
        url: updatedFormData.url,
        scriptUrl: updatedFormData.scriptUrl,
        recordingUrl: updatedFormData.recordingUrl,
        authDetails: updatedFormData.authDetails,
        slug: updatedFormData.slug,
        vertical: updatedFormData.vertical,
        useCase: updatedFormData.useCase,
        client: updatedFormData.requestedBy
      };
    }
    
    onSubmit(submissionData);
  };
  
  return (
    <FormPaper elevation={3}>
      <Box component="form" onSubmit={handleSubmit}>
        {errors.clientVertical && (
          <Box 
            sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              borderRadius: 1
            }}
          >
            <Typography>{errors.clientVertical}</Typography>
          </Box>
        )}
        
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
            
            {(!isRegister || isRequest) && (
              <TextField
                name="requestedBy"
                label={isEdit ? 'Client' : 'Requested By'}
                fullWidth
                required={isEdit || isRegister ? false : true}
                variant="outlined"
                value={formData.requestedBy}
                onChange={handleTextChange}
                error={Boolean(errors.clientVertical) && isEdit}
                helperText={isEdit ? "Specify either Client OR Vertical, not both" : ""}
              />
            )}
          </Box>

          {/* Type dropdown is removed - now automatically determined */}
          
          {/* Display the current type without allowing edits */}
          {(isRegister || isEdit) && (
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Demo Type: <strong>{formData.type === 'specific' ? 'Client Specific' : 'General'}</strong>
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Type is automatically determined based on Client field
              </Typography>
            </Box>
          )}

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
                  required={isRegister || isEdit}
                />
                
                <TextField
                  name="vertical"
                  label="Vertical"
                  fullWidth
                  variant="outlined"
                  value={formData.vertical}
                  onChange={handleTextChange}
                  error={Boolean(errors.clientVertical) && (isEdit || isRegister)}
                  helperText={(isEdit || isRegister) ? "Choose one: Either fill Client OR Vertical field" : ""}
                />
              </Box>
              
              {/* Client field for register form */}
              {isRegister && (
                <TextField
                  name="requestedBy"
                  label="Client"
                  fullWidth
                  variant="outlined"
                  value={formData.requestedBy}
                  onChange={handleTextChange}
                  error={Boolean(errors.clientVertical)}
                  helperText="Choose one: Either fill Client OR Vertical field"
                  sx={{ mb: 3 }}
                />
              )}
              
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
              
              {isEdit && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="requested">Requested</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              )}

              {isEdit && (
                <TextField
                  name="dueDate"
                  label="Due Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                  value={formData.dueDate}
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
                name="scriptUrl"
                label="Script URL"
                fullWidth
                sx={{ mb: 3 }}
                value={formData.scriptUrl}
                onChange={handleTextChange}
                placeholder="Add URL to demo script document"
              />
              
              <TextField
                name="recordingUrl"
                label="Recording URL"
                fullWidth
                sx={{ mb: 3 }}
                value={formData.recordingUrl}
                onChange={handleTextChange}
                placeholder="Add URL to demo recording/video"
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
            {isSubmitting ? 'Saving...' : (isRequest ? 'Submit Request' : isEdit ? 'Save Changes' : 'Register Demo')}
          </Button>
        </FormActions>
      </Box>
    </FormPaper>
  );
} 