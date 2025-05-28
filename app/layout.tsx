import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeRegistry from "../theme/ThemeRegistry";
import { Box, CssBaseline, Container } from "@mui/material";
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { auth0 } from "@/lib/auth0";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demos | Invisible",
  description: "Access, request, & manage Invisible Demos",
};
const session  = await auth0.getSession();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#f5f5f5' }}>
        {session ? (
          <ThemeRegistry>
            <CssBaseline />
            <Container maxWidth={false} disableGutters sx={{ p: 0 }}>
              <AuthenticatedLayout>
                {children}
              </AuthenticatedLayout>
            </Container>
            <Toaster position="top-right" />
          </ThemeRegistry>
        ) : null}
      </body>
    </html>
  );
}
