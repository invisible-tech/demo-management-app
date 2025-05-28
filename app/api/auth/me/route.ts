import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

// Simple endpoint to check authentication status
export async function GET() {
  try {
    // Get basic session information - lightweight check
    const session = await auth0.getSession();
    
    if (!session) {
      // Not authenticated
      return new NextResponse(null, { status: 401 });
    }
    
    // Return minimal user info to reduce payload size
    return NextResponse.json({
      authenticated: true,
      user: {
        name: session.user.name,
        email: session.user.email,
        picture: session.user.picture
      }
    });
  } catch (error) {
    console.error('Auth check failed:', error);
    return new NextResponse(null, { status: 401 });
  }
} 