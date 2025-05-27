import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Mock Auth0 client code (commented out - can be re-enabled for testing)
/*
// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Create a mock Auth0 client for development that bypasses authentication
class MockAuth0Client {
  // Mock middleware function that always passes through
  async middleware(_req: any) {
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
*/

// Use the real Auth0 client
export const auth0 = new Auth0Client();

// Initialize the Auth0 client
// Configuration to minimize header size:
// 1. Uses code flow instead of implicit flow
// 2. Requests minimal scopes
// The Auth0Client will read configuration from environment variables
// export const auth0 = new Auth0Client();