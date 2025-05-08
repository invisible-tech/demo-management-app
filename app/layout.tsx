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
  title: "Demo Management App",
  description: "Manage company demos efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#f5f5f5' }}>
        <ThemeRegistry>
          <CssBaseline />
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar />
            <LeftNavDrawer />
            <Box
              component="main"
              sx={{ 
                flexGrow: 1,
                p: 3,
                mt: '64px', // AppBar height
                ml: '240px', // Drawer width
                width: { xs: 'calc(100% - 240px)' },
                maxWidth: { sm: 'calc(100% - 240px)' }, 
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
