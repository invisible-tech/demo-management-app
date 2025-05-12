"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DemoForm from "@/components/ui/DemoForm";
import { toast } from "sonner";

export default function EditDemoPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [demo, setDemo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  useEffect(() => {
    // Fetch the demo data
    const fetchDemo = async () => {
      try {
        const response = await fetch(`/api/demos/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch demo");
        }
        
        const demoData = await response.json();
        setDemo(demoData);
      } catch (error) {
        console.error("Error fetching demo:", error);
        toast.error("Failed to load demo data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemo();
  }, [id]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/demos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server response:", response.status, errorData);
        
        if (errorData?.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      const updatedDemo = await response.json();
      toast.success("Demo updated successfully");
      router.push('/demos');
    } catch (error) {
      console.error("Error updating demo:", error);
      toast.error(error.message || "Failed to update demo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/demos/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server error: ${response.status}`);
      }
      
      toast.success("Demo deleted successfully");
      handleCloseDeleteDialog();
      router.push('/demos');
    } catch (error) {
      console.error("Error deleting demo:", error);
      toast.error(error.message || "Failed to delete demo");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!demo) {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Demo Not Found
        </Typography>
        <Typography>
          The requested demo could not be found or you do not have permission to edit it.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Edit Demo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update the details for this demo
          </Typography>
        </div>
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleOpenDeleteDialog}
        >
          Delete Demo
        </Button>
      </Box>
      
      <DemoForm
        type="edit"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        demo={demo}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Demo
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the demo "{demo.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 