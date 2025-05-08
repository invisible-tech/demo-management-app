"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress } from "@mui/material";
import DemoForm from "@/components/ui/DemoForm";
import { Demo } from "@/lib/schema";
import { toast } from "sonner";

interface EditDemoPageProps {
  params: {
    id: string;
  };
}

export default function EditDemoPage({ params }: EditDemoPageProps) {
  const router = useRouter();
  const { id } = params;
  const [demo, setDemo] = useState<Demo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: any) => {
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
      router.push(`/demos/${id}`);
    } catch (error: any) {
      console.error("Error updating demo:", error);
      toast.error(error.message || "Failed to update demo. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Edit Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update the details for this demo
        </Typography>
      </Box>
      
      <DemoForm
        type="edit"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        demo={demo}
      />
    </Box>
  );
} 