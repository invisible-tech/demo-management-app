
import { auth0 } from "./lib/auth0";
import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/lib/db';
import { Demo } from '@/lib/schema';

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/auth')) {
    return await auth0.middleware(request);
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
    // For resource requests, we need to determine if this is related to a slug page
    // or a normal application page
    const referer = request.headers.get('referer') || '';
    
    // Skip proxying if there's no referrer
    if (!referer) {
      return NextResponse.next();
    }
    
    try {
      const refererUrl = new URL(referer);
      const refererPathParts = refererUrl.pathname.split('/').filter(Boolean);
      
      // Skip proxying if the referrer is a known application path
      if (
        refererUrl.pathname === '/' ||
        refererPathParts[0] === 'api' ||
        refererPathParts[0] === 'demos' ||
        refererPathParts[0] === 'admin' ||
        refererPathParts[0] === 'how-to-demo'
      ) {
        console.log(`[Middleware] Resource request from application path: ${refererUrl.pathname}, allowing directly`);
        return NextResponse.next();
      }
      
      // If we get here, the resource might be related to a slug page
      // Check if the first path segment is a valid slug
      if (refererPathParts.length > 0) {
        const potentialSlug = refererPathParts[0];
        
        // Get all demos to check if this is a valid slug
        const demoIds = await redis.smembers(KEYS.DEMOS);
        if (demoIds.length === 0) {
          return NextResponse.next();
        }
        
        const pipeline = redis.pipeline();
        demoIds.forEach(id => {
          pipeline.hgetall(KEYS.DEMO_DETAIL(id));
        });
        
        const allDemos = await pipeline.exec();
        
        // Check if the potential slug matches any demo
        const demoWithRefererSlug = allDemos.find(demo => 
          demo && typeof demo === 'object' && 'slug' in demo && demo.slug === potentialSlug
        ) as { slug: string } | undefined;
        
        if (demoWithRefererSlug) {
          // This is a resource request from a slug page, proxy it
          console.log(`[Middleware] Resource request from slug page: ${potentialSlug}, proxying`);
          
          if (pathname.startsWith('/_next/static/chunks/') && pathname.endsWith('.js')) {
            console.log(`[Middleware] Detected Next.js chunk request: ${pathname}`);
          } else {
            console.log(`[Middleware] Detected media or asset request: ${pathname}`);
          }
          
          // Create the URL for the asset proxy
          const url = request.nextUrl.clone();
          url.pathname = `/api/asset`;
          
          // Preserve query parameters
          const originalParams = new URLSearchParams(request.nextUrl.search);
          const params = new URLSearchParams();
          
          // Add slug and path parameters
          params.set('slug', potentialSlug);
          params.set('path', pathname);
          
          // Copy over any other parameters
          for (const [key, value] of originalParams.entries()) {
            if (key !== 'slug' && key !== 'path') {
              params.set(key, value);
            }
          }
          
          url.search = params.toString();
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error('[Middleware] Error processing resource request:', error);
    }
    
    // If we reach here, let the request pass through normally
    return NextResponse.next();
  }
  
  // Check if this is a direct media request (like /image.jpg or /video.mp4)
  // that doesn't have a referrer (direct navigation)
  if (pathname.match(/\.(jpg|jpeg|png|gif|mp4|webm|svg)$/i)) {
    console.log(`[Middleware] Detected direct media request without referrer: ${pathname}`);
    
    // Get all demos with slugs to find the active demo
    try {
      const demoIds = await redis.smembers(KEYS.DEMOS);
      if (demoIds.length === 0) {
        console.log(`[Middleware] No demos in database, cannot redirect media`);
        return NextResponse.next();
      }
      
      // Use a pipeline to get all demos efficiently
      const pipeline = redis.pipeline();
      demoIds.forEach(id => {
        pipeline.hgetall(KEYS.DEMO_DETAIL(id));
      });
      
      const allDemos = await pipeline.exec();
      
      // Find any demo with a valid slug - we assume the user is looking at a demo
      // and these media files belong to that demo
      const demoWithSlug = allDemos.find(demo => 
        demo && typeof demo === 'object' && 'slug' in demo && demo.slug
      ) as { slug: string } | undefined;
      
      if (demoWithSlug && demoWithSlug.slug) {
        // We found a demo with a slug, redirect the media request to our asset proxy
        console.log(`[Middleware] Redirecting media request to asset proxy with slug: ${demoWithSlug.slug}`);
        
        // Get the referrer to check which demo the user is viewing
        const referer = request.headers.get('referer') || '';
        let activeSlug = demoWithSlug.slug;
        
        // If we can extract a slug from the referrer, use that instead
        if (referer) {
          const refererUrl = new URL(referer);
          const refererPathParts = refererUrl.pathname.split('/').filter(Boolean);
          if (refererPathParts.length > 0) {
            // Check if this referrer slug exists in our demos
            const refererSlug = refererPathParts[0];
            const demoWithRefererSlug = allDemos.find(demo => 
              demo && typeof demo === 'object' && 'slug' in demo && demo.slug === refererSlug
            ) as { slug: string } | undefined;
            
            if (demoWithRefererSlug) {
              activeSlug = refererSlug;
              console.log(`[Middleware] Using slug from referrer: ${activeSlug}`);
            }
          }
        }
        
        // Create the URL for the asset proxy
        const url = request.nextUrl.clone();
        url.pathname = `/api/asset`;
        url.search = `?slug=${activeSlug}&path=${pathname}`;
        
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('[Middleware] Error handling media redirect:', error);
    }
  }
  
  // Extract potential slug from pathname (first path segment)
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length === 0) {
    return NextResponse.next();
  }
  
  const slug = pathParts[0];
  
  // Special handling for asset requests - don't log every asset request
  const isAssetRequest = request.nextUrl.pathname.includes('/api/asset') || 
                        request.nextUrl.searchParams.has('path');
  
  if (!isAssetRequest) {
    console.log(`[Middleware] Processing potential slug: "${slug}"`);
  }
  
  try {
    // Skip asset proxy API requests entirely
    if (isAssetRequest) {
      return NextResponse.next();
    }
    
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