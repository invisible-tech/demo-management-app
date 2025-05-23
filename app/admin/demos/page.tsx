"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableContainer,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tab,
  Tabs
} from "@mui/material";
import { Demo } from "@/lib/schema";
import { toast } from "sonner";
import { auth0 } from "@/lib/auth0";
import { checkAdminAccess } from "@/lib/admin";
import DemoTable from "@/components/ui/DemoTable";
import Link from "next/link";

export default function AdminDemosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'request-edits'>('approve');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load demos list
  useEffect(() => {
    const loadDemos = async () => {
      try {
        // Auth0 is fully disabled - always grant admin access
        console.log('[Admin] Auth0 is fully disabled - granting admin access');
        
        // Fetch all demos
        const response = await fetch('/api/demos');
        
        if (response.ok) {
          const data = await response.json();
          setDemos(data);
        }
      } catch (error) {
        console.error("Error loading demos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDemos();
  }, []);

  // Handle opening the action dialog
  const handleOpenDialog = (demo: Demo, actionType: 'approve' | 'request-edits') => {
    setSelectedDemo(demo);
    setAction(actionType);
    setAdminNotes(demo.adminNotes || '');
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDemo(null);
    setAdminNotes('');
  };

  // Handle approve or request edits
  const handleSubmitAction = async () => {
    if (!selectedDemo) return;

    setIsSubmitting(true);
    try {
      const updatedDemo = {
        ...selectedDemo,
        adminNotes,
        status: action === 'approve' ? 'ready' : 'in_progress',
      };

      const response = await fetch(`/api/demos/${selectedDemo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDemo),
      });

      if (!response.ok) {
        throw new Error('Failed to update demo');
      }
      
      // Send email notification based on action
      try {
        // Determine the appropriate subject and content based on the action
        const subject = action === 'approve' 
          ? `Demo Approved: ${selectedDemo.title}`
          : `Updates Requested: ${selectedDemo.title}`;
        
        const htmlContent = action === 'approve'
          ? `
            <h2>Your Demo Has Been Approved!</h2>
            <p>Great news! Your demo "${selectedDemo.title}" has been approved and is now available in the demos library.</p>
            <p>You can view your demo at: <a href="${window.location.origin}/${selectedDemo.slug}">${window.location.origin}/${selectedDemo.slug}</a></p>
          `
          : `
            <h2>Updates Requested for Your Demo</h2>
            <p>The admin team has reviewed your demo "${selectedDemo.title}" and is requesting some changes:</p>
            <p><strong>Admin Notes:</strong></p>
            <div style="padding: 10px; background-color: #f5f5f5; border-left: 4px solid #0070f3;">
              ${adminNotes}
            </div>
            <p>Please make the requested changes and resubmit your demo.</p>
          `;
        
        // Get the creator's email from the demo
        const recipientEmail = selectedDemo.createdBy || "demo-creator@example.com";
        
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: recipientEmail,
            subject: subject,
            text: action === 'approve' 
              ? `Your demo "${selectedDemo.title}" has been approved.`
              : `The admin team has requested changes to your demo "${selectedDemo.title}": ${adminNotes}`,
            html: htmlContent
          })
        });
        
        console.log(`Email notification sent to ${recipientEmail}`);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue with success flow even if email fails
      }

      // Remove from list
      setDemos(demos.filter(demo => demo.id !== selectedDemo.id));
      
      toast.success(
        action === 'approve' 
          ? "Demo approved successfully" 
          : "Edits requested successfully"
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating demo:", error);
      toast.error("Failed to update demo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Admin: Demo Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve demos or request edits
        </Typography>
      </Box>

      {demos.length === 0 ? (
        <Alert severity="info">No demos awaiting approval</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {demos.map((demo) => (
                <TableRow key={demo.id} hover>
                  <TableCell>{demo.title}</TableCell>
                  <TableCell>{formatDate(demo.createdAt)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={demo.type === 'general' ? 'General' : 'Client Specific'} 
                      color={demo.type === 'general' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {demo.url ? (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        href={demo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Preview
                      </Button>
                    ) : (
                      <Chip label="No URL" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleOpenDialog(demo, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => handleOpenDialog(demo, 'request-edits')}
                      >
                        Request Edits
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for approve/request edits */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {action === 'approve' ? 'Approve Demo' : 'Request Edits'}
        </DialogTitle>
        <DialogContent>
          {selectedDemo && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedDemo.title}
              </Typography>
              
              <TextField
                label="Admin Notes"
                multiline
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                fullWidth
                margin="normal"
                required={action === 'request-edits'}
                helperText={action === 'request-edits' ? "Please provide feedback about required changes" : "Optional notes"}
                error={action === 'request-edits' && !adminNotes.trim()}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAction} 
            variant="contained" 
            color={action === 'approve' ? 'success' : 'warning'}
            disabled={isSubmitting || (action === 'request-edits' && !adminNotes.trim())}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : action === 'approve' ? (
              'Approve Demo'
            ) : (
              'Send Edit Request'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 