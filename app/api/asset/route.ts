import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/lib/db';
import { Demo } from '@/lib/schema';

/**
 * API route specifically for proxying static assets from demo sites
 * This avoids all the complexities of the dynamic slug route for assets
 */
export async function GET(request: NextRequest) {
  try {
    // Parse the URL parameters
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const path = searchParams.get('path');
    
    console.log(`[AssetProxy] Proxying asset for slug: "${slug}", path: "${path}"`);
    
    if (!slug || !path) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    // Get all demos IDs
    const demoIds = await redis.smembers(KEYS.DEMOS);
    
    if (demoIds.length === 0) {
      console.log(`[AssetProxy] No demos in database`);
      return NextResponse.json({ error: 'No demos available' }, { status: 404 });
    }
    
    // Use a pipeline to get all demos efficiently
    const pipeline = redis.pipeline();
    demoIds.forEach(id => {
      pipeline.hgetall(KEYS.DEMO_DETAIL(id));
    });
    
    const allDemos = await pipeline.exec();
    const matchingDemo = allDemos.find((demo: any) => demo?.slug === slug) as Demo | undefined;
    
    if (!matchingDemo) {
      console.log(`[AssetProxy] No demo found with slug: "${slug}"`);
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }
    
    // Get the base URL without paths
    let targetUrl = matchingDemo.url || '';
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // Extract just the domain without any path components
    const originalUrl = new URL(targetUrl);
    const baseUrl = `${originalUrl.protocol}//${originalUrl.hostname}`;
    
    // Get any query parameters from the request URL
    const originalQuery = request.nextUrl.search || '';
    
    // Create the direct URL to the static asset
    const assetUrl = `${baseUrl}${path}${originalQuery}`;
    console.log(`[AssetProxy] Loading asset from: ${assetUrl}`);
    
    // Fetch the asset directly
    const response = await fetch(assetUrl, {
      headers: {
        'Referer': baseUrl,
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        'Accept': '*/*',
        'Origin': baseUrl
      }
    });
    
    if (!response.ok && response.status !== 304) {
      console.error(`[AssetProxy] Error fetching asset: ${response.statusText} (${response.status})`);
      console.error(`[AssetProxy] Failed to fetch from URL: ${assetUrl}`);
      
      // Try an alternative URL structure for Next.js assets
      if (path.includes('/_next/')) {
        const altPath = path.replace(/^\/?_next\//, '/_next/');
        const alternativeUrl = `${baseUrl}${altPath}${originalQuery}`;
        console.log(`[AssetProxy] Trying alternative URL: ${alternativeUrl}`);
        
        const altResponse = await fetch(alternativeUrl, {
          headers: {
            'Referer': baseUrl,
            'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
            'Accept': '*/*',
            'Origin': baseUrl
          }
        });
        
        if (altResponse.ok || altResponse.status === 304) {
          // Use the alternative response if it worked
          const buffer = await altResponse.arrayBuffer();
          return new NextResponse(buffer, {
            status: altResponse.status,
            headers: {
              'Content-Type': altResponse.headers.get('content-type') || '',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      }
      
      return NextResponse.json(
        { error: `Failed to fetch asset: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the asset as-is
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || '',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('[AssetProxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 