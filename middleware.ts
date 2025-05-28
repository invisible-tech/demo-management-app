import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/lib/db';
import { Demo } from '@/lib/schema';
import { auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Authentication is disabled - always skip auth checks
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }
  
  // Skip middleware processing for known paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/demos') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/how-to-demo') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  // Skip processing for favicon, robots.txt, etc.
  if (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }
  
  // Check if this is a resource request (JS, CSS, images, etc.)
  const isResourceRequest = pathname.startsWith('/_next/') || 
                           pathname.match(/\.(jpg|jpeg|png|gif|mp4|webm|svg|js|css)$/i);
  
  if (isResourceRequest) {
    return NextResponse.next();
  }
  
  // Extract potential slug from pathname (first path segment)
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length === 0) {
    return NextResponse.next();
  }
  
  const slug = pathParts[0];
  
  try {
    // Check if this slug exists in our database
    const demoIds = await redis.smembers(KEYS.DEMOS);
    
    if (demoIds.length === 0) {
      console.log(`[Middleware] No demos in database`);
      return NextResponse.next();
    }
    
    // Use a pipeline to get all demos efficiently
    const pipeline = redis.pipeline();
    demoIds.forEach(id => {
      pipeline.hgetall(KEYS.DEMO_DETAIL(id));
    });
    
    const allDemos = await pipeline.exec();
    
    // Find demo with matching slug
    const demoWithSlug = allDemos.find(demo => 
      demo && typeof demo === 'object' && 'slug' in demo && demo.slug === slug
    );
    
    if (!demoWithSlug) {
      // If no matching slug is found, continue with normal routing
      console.log(`[Middleware] No demo found with slug "${slug}"`);
      return NextResponse.next();
    }
    
    // If a matching slug is found, continue to the slug route handler
    console.log(`[Middleware] Matching slug found for "${slug}", continuing to route handler`);
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error:', error);
    return NextResponse.next();
  }
}

// Allow middleware to run on all paths (we'll handle filtering internally)
export const config = {
  matcher: [
    // Include everything except favicon.ico
    '/((?!favicon.ico).*)',
  ],
}; 