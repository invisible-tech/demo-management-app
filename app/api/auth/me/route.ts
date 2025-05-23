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
      email: session.user?.email || null
    });
  } catch (error) {
    console.error('[Auth API] Error checking auth status:', error);
    return new NextResponse(null, { status: 500 });
  }
} 