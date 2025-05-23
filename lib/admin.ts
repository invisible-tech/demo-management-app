// Admin configuration

// List of emails that have admin access
export const ADMIN_EMAILS = [
  'admin@example.com',
  'manager@example.com',
  'dev@example.com' // For development testing
];

// Check if a user has admin access
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Function to check if user is admin from auth session
export function checkAdminAccess(session: any): boolean {
  if (!session || !session.user || !session.user.email) {
    return false;
  }
  
  return isAdmin(session.user.email);
} 