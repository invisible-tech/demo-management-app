import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Fully disabled mock Auth0 client
class DisabledAuth0Client {
  // Mock middleware function that always passes through
  async middleware(req: any) {
    console.log('[Auth0] Auth0 is fully disabled');
    return new Response(null);
  }
  
  // Mock getSession that always returns an admin user session
  async getSession() {
    console.log('[Auth0] Returning mock admin session (Auth0 fully disabled)');
    return {
      user: {
        sub: 'mock-user-id',
        email: 'dev@example.com', // Admin email
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

// Always use the disabled client regardless of environment
export const auth0 = new DisabledAuth0Client() as unknown as Auth0Client;