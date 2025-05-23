import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeRegistry from "../theme/ThemeRegistry";
import AppBar from "../components/AppBar";
import LeftNavDrawer from "../components/ui/LeftNavDrawer";
import { Box, CssBaseline } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demos | Invisible",
  description: "Access, request, & manage Invisible Demos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth0 is fully disabled, always show authenticated view
  
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#f5f5f5' }}>
        <ThemeRegistry>
          <CssBaseline />
          {/* Always show authenticated layout */}
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
          <Toaster position="top-right" />
        </ThemeRegistry>
      </body>
    </html>
  );
}
