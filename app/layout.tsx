import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeRegistry from "../theme/ThemeRegistry";
import { CssBaseline, Container, Box, Typography, Button } from "@mui/material";
import { auth0 } from "@/lib/auth0";
import LeftNavDrawer from "@/components/ui/LeftNavDrawer";
import AppBar from "@/components/AppBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demos | Invisible",
  description: "Access, request, & manage Invisible Demos",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();
  const invisibleUser = session?.user?.email?.includes('invisible.email')
  console.log(session)
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#f5f5f5' }}>
        <ThemeRegistry>
          <CssBaseline />
          {session && invisibleUser ? (
            // Show full app layout when authenticated
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <AppBar />
              <LeftNavDrawer />
              <Box
                component="main"
                sx={{ 
                  flexGrow: 1,
                  p: { xs: 2, sm: 2 },
                  mt: '64px',
                  ml: '100px',
                  width: { xs: 'calc(100% - 100px)' },
                  maxWidth: { sm: 'calc(100% - 100px)' }, 
                  overflow: 'auto'
                }}
              >
                {children}
              </Box>
            </Box>
          ) : (
            // Show login screen when not authenticated
            <Container 
              maxWidth="sm" 
              sx={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 3
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome to Invisible Demos
              </Typography>
              <Typography variant="body1" gutterBottom>
                Please sign in to continue
              </Typography>
              <Button 
                href="/auth/login" 
                variant="contained" 
                size="large"
                sx={{ mt: 2 }}
              >
                Sign In
              </Button>
            </Container>
          )}
          <Toaster position="top-right" />
        </ThemeRegistry>
      </body>
    </html>
  );
}
