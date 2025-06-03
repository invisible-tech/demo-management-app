import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize the Auth0 client 
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  // domain: process.env.AUTH0_DOMAIN,
  // clientId: process.env.AUTH0_CLIENT_ID,
  // clientSecret: process.env.AUTH0_CLIENT_SECRET,
  // appBaseUrl: process.env.APP_BASE_URL,
  // secret: process.env.AUTH0_SECRET,
});

// Mock session for development that matches Auth0 SessionData structure
const mockSession = {
  user: {
    sub: 'dev-user-123',
    name: 'Development User',
    email: 'dev@example.com',
    picture: 'https://via.placeholder.com/150'
  },
  tokenSet: {},
  internal: {}
};

// Override getSession to return mock session in development
if (isDevelopment) {
  const originalGetSession = auth0.getSession.bind(auth0);
  (auth0 as any).getSession = async () => {
    console.log('🔓 Auth0 getSession bypassed in development mode');
    return mockSession;
  };
} 