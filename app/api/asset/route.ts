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
    let path = searchParams.get('path');
    
    console.log(`[AssetProxy] Proxying asset for slug: "${slug}", path: "${path}"`);
    
    if (!slug || !path) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    // Normalize the path to ensure it starts with a slash
    if (!path.startsWith('/')) {
      path = '/' + path;
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
    
    // If the targetUrl has a path component, get the path without any query string
    const basePath = originalUrl.pathname !== '/' ? originalUrl.pathname : '';
    console.log(`[AssetProxy] Base URL: ${baseUrl}, Base Path: ${basePath}`);
    
    // Preserve original query parameters from the asset URL
    // First, extract query params from the path if they exist
    let assetQuery = '';
    if (path.includes('?')) {
      const [pathOnly, pathQuery] = path.split('?', 2);
      path = pathOnly;
      assetQuery = '?' + pathQuery;
    }
    
    // Add any query parameters from the original request
    // Filter out slug and path params that we added
    const additionalParams = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'slug' && key !== 'path') {
        additionalParams.append(key, value);
      }
    }
    
    const additionalQuery = additionalParams.toString();
    if (additionalQuery) {
      assetQuery = assetQuery ? `${assetQuery}&${additionalQuery}` : `?${additionalQuery}`;
    }
    
    // Create the direct URL to the static asset
    // If the original URL has a path, make sure we're accessing static assets from the base URL
    const assetUrl = `${baseUrl}${path}${assetQuery}`;
    console.log(`[AssetProxy] Loading asset from: ${assetUrl}`);
    
    // Special fixes for Next.js _next paths
    let finalAssetUrl = assetUrl;
    
    // Ensure _next paths have the correct format
    if (path.includes('/_next/')) {
      // Make sure we have the correct Next.js path format
      const nextPathMatch = path.match(/\/?_next\/(.+)/);
      if (nextPathMatch) {
        finalAssetUrl = `${baseUrl}/_next/${nextPathMatch[1]}${assetQuery}`;
        console.log(`[AssetProxy] Fixed Next.js path to: ${finalAssetUrl}`);
      }
    }
    
    // Check if this is a media file - if so, try using the base URL + base path + filename
    // This handles cases where media files are referenced relative to the app's base path
    if (/\.(jpg|jpeg|png|gif|mp4|webm|mp3|wav|svg)$/i.test(path)) {
      console.log(`[AssetProxy] Detected media file: ${path}`);
      
      // Get just the filename
      const fileName = path.split('/').pop();
      
      // If there's a base path and the path doesn't already include it, try an alternative URL
      if (basePath && !path.includes(basePath)) {
        const mediaUrl = `${baseUrl}${basePath}${path.startsWith('/') ? path : '/' + path}${assetQuery}`;
        console.log(`[AssetProxy] Also trying media URL: ${mediaUrl}`);
        
        try {
          const mediaResponse = await fetch(mediaUrl, {
            headers: {
              'Referer': baseUrl,
              'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
              'Accept': '*/*',
              'Origin': baseUrl
            }
          });
          
          if (mediaResponse.ok) {
            console.log(`[AssetProxy] Media URL worked: ${mediaUrl}`);
            const buffer = await mediaResponse.arrayBuffer();
            
            // Determine content type based on extension
            let contentType = mediaResponse.headers.get('content-type') || '';
            if (!contentType) {
              if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
              else if (path.endsWith('.png')) contentType = 'image/png';
              else if (path.endsWith('.gif')) contentType = 'image/gif';
              else if (path.endsWith('.mp4')) contentType = 'video/mp4';
              else if (path.endsWith('.webm')) contentType = 'video/webm';
              else if (path.endsWith('.mp3')) contentType = 'audio/mpeg';
              else if (path.endsWith('.wav')) contentType = 'audio/wav';
              else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
            }
            
            return new NextResponse(buffer, {
              status: mediaResponse.status,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
              }
            });
          }
        } catch (error) {
          console.error(`[AssetProxy] Error fetching media from ${mediaUrl}:`, error);
          // Continue with the regular path if this fails
        }
      }
      
      // Also try different path variations for media files with the correct base URL
      // Don't use a hardcoded domain like example.com
      const mediaVariations = [
        `${baseUrl}/assets${path.startsWith('/') ? path : '/' + path}${assetQuery}`,
        `${baseUrl}/media${path.startsWith('/') ? path : '/' + path}${assetQuery}`,
        `${baseUrl}/images${path.startsWith('/') ? path : '/' + path}${assetQuery}`,
        `${baseUrl}/videos${path.startsWith('/') ? path : '/' + path}${assetQuery}`,
        `${baseUrl}/static${path.startsWith('/') ? path : '/' + path}${assetQuery}`,
      ];
      
      // If the path already has directories, also try just the filename at common locations
      if (path.includes('/') && fileName) {
        mediaVariations.push(
          `${baseUrl}/assets/${fileName}${assetQuery}`,
          `${baseUrl}/media/${fileName}${assetQuery}`,
          `${baseUrl}/images/${fileName}${assetQuery}`,
          `${baseUrl}/videos/${fileName}${assetQuery}`,
          `${baseUrl}/static/${fileName}${assetQuery}`
        );
      }
      
      // Try each variation
      for (const variationUrl of mediaVariations) {
        try {
          console.log(`[AssetProxy] Trying media variation: ${variationUrl}`);
          const variationResponse = await fetch(variationUrl, {
            headers: {
              'Referer': baseUrl,
              'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
              'Accept': '*/*',
              'Origin': baseUrl
            }
          });
          
          if (variationResponse.ok) {
            console.log(`[AssetProxy] Media variation worked: ${variationUrl}`);
            const buffer = await variationResponse.arrayBuffer();
            
            // Determine content type based on extension
            let contentType = variationResponse.headers.get('content-type') || '';
            if (!contentType) {
              if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
              else if (path.endsWith('.png')) contentType = 'image/png';
              else if (path.endsWith('.gif')) contentType = 'image/gif';
              else if (path.endsWith('.mp4')) contentType = 'video/mp4';
              else if (path.endsWith('.webm')) contentType = 'video/webm';
              else if (path.endsWith('.mp3')) contentType = 'audio/mpeg';
              else if (path.endsWith('.wav')) contentType = 'audio/wav';
              else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
            }
            
            return new NextResponse(buffer, {
              status: variationResponse.status,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
              }
            });
          }
        } catch (error) {
          console.error(`[AssetProxy] Error fetching media variation ${variationUrl}:`, error);
          // Continue to next variation
        }
      }
    }
    
    try {
      // Fetch the asset directly
      const response = await fetch(finalAssetUrl, {
        headers: {
          'Referer': baseUrl,
          'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
          'Accept': '*/*',
          'Origin': baseUrl
        }
      });
      
      console.log(`[AssetProxy] Response status for ${finalAssetUrl}: ${response.status}`);
      
      if (!response.ok && response.status !== 304) {
        console.error(`[AssetProxy] Error fetching asset: ${response.statusText} (${response.status})`);
        console.error(`[AssetProxy] Failed to fetch from URL: ${finalAssetUrl}`);
        
        // Try an alternative URL structure for Next.js assets
        if (path.includes('/_next/')) {
          const altPath = path.replace(/^\/?_next\//, '/_next/');
          const alternativeUrl = `${baseUrl}${altPath}${assetQuery}`;
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
            console.log(`[AssetProxy] Alternative URL worked: ${alternativeUrl}`);
            // Use the alternative response if it worked
            const buffer = await altResponse.arrayBuffer();
            return new NextResponse(buffer, {
              status: altResponse.status,
              headers: {
                'Content-Type': altResponse.headers.get('content-type') || '',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          } else {
            // If we're dealing with a JavaScript file that is failing, return an empty JavaScript file
            // to prevent client-side errors from breaking the app
            if (path.endsWith('.js') || path.includes('/chunks/') || path.includes('/_next/static/chunks/')) {
              console.log(`[AssetProxy] Returning empty JS file for failed asset: ${path}`);
              return new NextResponse('// Empty JS file provided by proxy', {
                status: 200,
                headers: {
                  'Content-Type': 'application/javascript',
                  'Cache-Control': 'no-cache'
                }
              });
            }
          }
        }
        
        // Special handling for media files - return transparent 1x1 pixel for images, empty video for videos
        if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          console.log(`[AssetProxy] Returning transparent 1x1 pixel for failed image: ${path}`);
          // Base64 encoded 1x1 transparent PNG
          const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
          return new NextResponse(transparentPixel, {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'no-cache'
            }
          });
        } else if (path.match(/\.(mp4|webm|avi|mov)$/i)) {
          console.log(`[AssetProxy] Returning empty video for failed video: ${path}`);
          return new NextResponse('', {
            status: 200,
            headers: {
              'Content-Type': 'video/mp4',
              'Cache-Control': 'no-cache'
            }
          });
        } else if (path.match(/\.css$/i)) {
          console.log(`[AssetProxy] Returning empty CSS for failed stylesheet: ${path}`);
          return new NextResponse('/* Empty CSS provided by proxy */', {
            status: 200,
            headers: {
              'Content-Type': 'text/css',
              'Cache-Control': 'no-cache'
            }
          });
        }
        
        // Return a JSON error for non-critical assets
        return NextResponse.json(
          { error: `Failed to fetch asset: ${response.statusText}` },
          { status: response.status }
        );
      }
      
      // Return the asset as-is
      const buffer = await response.arrayBuffer();
      
      // Determine if this is a critical asset (JS/CSS) for proper MIME type
      let contentType = response.headers.get('content-type') || '';
      if (!contentType) {
        // Infer content type from path extension if not provided
        if (path.endsWith('.js')) contentType = 'application/javascript';
        else if (path.endsWith('.css')) contentType = 'text/css';
        else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
        else if (path.endsWith('.png')) contentType = 'image/png';
        else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (path.endsWith('.gif')) contentType = 'image/gif';
        else if (path.endsWith('.webp')) contentType = 'image/webp';
        else if (path.endsWith('.woff2')) contentType = 'font/woff2';
        else if (path.endsWith('.woff')) contentType = 'font/woff';
        else if (path.endsWith('.ttf')) contentType = 'font/ttf';
        else if (path.endsWith('.mp4')) contentType = 'video/mp4';
        else if (path.endsWith('.webm')) contentType = 'video/webm';
      }
      
      return new NextResponse(buffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (fetchError) {
      console.error(`[AssetProxy] Fetch error for ${finalAssetUrl}:`, fetchError);
      
      // Special handling for critical assets to prevent app from breaking
      if (path.endsWith('.js') || path.includes('/chunks/') || path.includes('/_next/static/chunks/')) {
        console.log(`[AssetProxy] Returning empty JS file for failed asset: ${path}`);
        return new NextResponse('// Empty JS file provided by proxy', {
          status: 200,
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache'
          }
        });
      } else if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        console.log(`[AssetProxy] Returning transparent 1x1 pixel for failed image: ${path}`);
        // Base64 encoded 1x1 transparent PNG
        const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        return new NextResponse(transparentPixel, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache'
          }
        });
      } else if (path.match(/\.(mp4|webm|avi|mov)$/i)) {
        console.log(`[AssetProxy] Returning empty video for failed video: ${path}`);
        return new NextResponse('', {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4',
            'Cache-Control': 'no-cache'
          }
        });
      } else if (path.match(/\.css$/i)) {
        console.log(`[AssetProxy] Returning empty CSS for failed stylesheet: ${path}`);
        return new NextResponse('/* Empty CSS provided by proxy */', {
          status: 200,
          headers: {
            'Content-Type': 'text/css',
            'Cache-Control': 'no-cache'
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch asset', details: (fetchError as Error).message },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('[AssetProxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 