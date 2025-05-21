import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Create a mock Auth0 client for development that bypasses authentication
class MockAuth0Client {
  // Mock middleware function that always passes through
  async middleware(req: any) {
    console.log('[Auth0] Using mock Auth0 client in development mode');
    return new Response(null);
  }
  
  // Mock getSession that returns a fake user session
  async getSession() {
    console.log('[Auth0] Returning mock user session in development mode');
    return {
      user: {
        sub: 'mock-user-id',
        email: 'dev@example.com',
        name: 'Development User',
        email_verified: true,
        picture: 'https://via.placeholder.com/150',
      },
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
  }
}

// Use the mock client in development, real client in production
export const auth0 = isDev 
  ? new MockAuth0Client() as unknown as Auth0Client
  : new Auth0Client({
      // domain: process.env.AUTH0_DOMAIN || '',
      // clientId: process.env.AUTH0_CLIENT_ID || '',
      // clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      // appBaseUrl: process.env.APP_BASE_URL || '',
      // secret: process.env.AUTH0_SECRET || '',
    });