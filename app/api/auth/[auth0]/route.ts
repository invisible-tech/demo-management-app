import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPath = pathname.split('/').pop();
  
  try {
    switch (authPath) {
      case 'login':
        // Redirect to Auth0 login
        const loginUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/authorize?` +
          `response_type=code&` +
          `client_id=${process.env.AUTH0_CLIENT_ID}&` +
          `redirect_uri=${process.env.AUTH0_BASE_URL}/api/auth/callback&` +
          `scope=openid profile email`;
        return NextResponse.redirect(loginUrl);
        
      case 'logout':
        // Clear session and redirect to Auth0 logout
        const logoutUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout?` +
          `client_id=${process.env.AUTH0_CLIENT_ID}&` +
          `returnTo=${process.env.AUTH0_BASE_URL}`;
        return NextResponse.redirect(logoutUrl);
        
      case 'callback':
        // Handle Auth0 callback
        return new NextResponse('Auth callback handled', { status: 200 });
        
              
      default:
        return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Auth route error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 