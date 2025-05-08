import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/lib/db';
import { Demo } from '@/lib/schema';

// Helper to rewrite HTML to replace absolute URLs
function rewriteHtml(html: string, baseUrl: string, originalOrigin: string, proxyBase: string): string {
  try {
    console.log(`[SlugRoute] Rewriting URLs from ${baseUrl} and ${originalOrigin} to ${proxyBase}`);
    
    // Get the slug from the proxyBase URL (last part after the last slash)
    const slug = proxyBase.split('/').pop();
    
    // Build the asset proxy URL base
    const apiBase = proxyBase.substring(0, proxyBase.lastIndexOf('/')) + '/api/asset';
    
    // Add special route handling for assets
    const scriptToInject = `
    <script>
      // Proxy configuration
      const PROXY_BASE = '${proxyBase}';
      const API_BASE = '${apiBase}';
      const BASE_URL = '${baseUrl}';
      const ORIGINAL_ORIGIN = '${originalOrigin}';
      const SLUG = '${slug}';
      
      // Intercept fetch requests to rewrite URLs
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (typeof url === 'string') {
          // Handle absolute URLs
          if (url.startsWith(ORIGINAL_ORIGIN) || url.startsWith(BASE_URL)) {
            const urlPath = new URL(url).pathname;
            url = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(urlPath) + 
                 (new URL(url).search || '');
          } 
          // Handle root-relative URLs
          else if (url.startsWith('/')) {
            url = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(url);
          }
        }
        return originalFetch.call(this, url, options);
      };

      // Handle direct navigation
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('/') || href.startsWith(ORIGINAL_ORIGIN) || href.startsWith(BASE_URL))) {
            e.preventDefault();
            
            // For navigation links, keep using the slug directly
            if (href.startsWith('/')) {
              window.location.href = PROXY_BASE + href;
            } else {
              const urlPath = new URL(href).pathname;
              window.location.href = PROXY_BASE + urlPath;
            }
          }
        }
      });
      
      // Special handling for webpack/Next.js
      if (window.__NEXT_DATA__ || window.__webpack_require__) {
        console.log('Next.js application detected, fixing asset paths');
        // For Next.js, fix publicPath for webpack
        if (window.__webpack_require__ && window.__webpack_require__.p) {
          const originalPublicPath = window.__webpack_require__.p;
          window.__webpack_require__.p = API_BASE + '?slug=' + SLUG + '&path=' + 
                                          encodeURIComponent(originalPublicPath.startsWith('/') ? 
                                          originalPublicPath : '/' + originalPublicPath);
          console.log('Fixed webpack public path:', originalPublicPath, '->', window.__webpack_require__.p);
        }
      }
    </script>`;
    
    // Create a simpler version that focuses on the key transformations
    let modifiedHtml = html
      // Add base href to ensure relative paths work correctly
      .replace(/<head[^>]*>/, match => `${match}\n${scriptToInject}`)
      
      // Replace absolute URLs in src and href attributes for images and stylesheets
      .replace(new RegExp(`(src|href)=["']${originalOrigin}([^"']*)["']`, 'g'), 
               (match, attr, path) => `${attr}="${apiBase}?slug=${slug}&path=${encodeURIComponent(path)}"`)
      
      // Also replace the base URL in src and href attributes
      .replace(new RegExp(`(src|href)=["']${baseUrl}([^"']*)["']`, 'g'), 
               (match, attr, path) => `${attr}="${apiBase}?slug=${slug}&path=${encodeURIComponent(path)}"`)
      
      // Replace root-relative URLs in src and href to use the asset proxy
      .replace(/(src|href)=["']\/([^"']*)["']/g, 
               (match, attr, path) => `${attr}="${apiBase}?slug=${slug}&path=/${path}"`)
               
      // Replace _next paths specifically - this pattern needed for all _next/static resources
      .replace(/(src|href)=["']\/_next\/([^"']*)["']/g, 
              (match, attr, path) => `${attr}="${apiBase}?slug=${slug}&path=/_next/${path}"`);
    
    return modifiedHtml;
  } catch (error) {
    console.error('[SlugRoute] Error rewriting HTML:', error);
    return html;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // Make sure to correctly destructure params from context
    const { params } = context;
    const slug = params.slug;
    console.log(`[SlugRoute] Processing slug: "${slug}"`);
  
    // Regular slug handling
    // Get all demos IDs
    const demoIds = await redis.smembers(KEYS.DEMOS);
    console.log(`[SlugRoute] Found ${demoIds.length} demos in database`);
    
    if (demoIds.length === 0) {
      console.log(`[SlugRoute] No demos in database`);
      return NextResponse.json({ error: 'No demos available' }, { status: 404 });
    }
    
    // Use a pipeline to get all demos efficiently
    const pipeline = redis.pipeline();
    demoIds.forEach(id => {
      pipeline.hgetall(KEYS.DEMO_DETAIL(id));
    });
    
    const allDemos = await pipeline.exec();
    console.log(`[SlugRoute] All slugs in database: ${allDemos.map((demo: any) => demo?.slug || "none")}`);
    
    // Find the demo with the matching slug
    const matchingDemo = allDemos.find((demo: any) => demo?.slug === slug) as Demo | undefined;
    
    if (!matchingDemo) {
      console.log(`[SlugRoute] No demo found with slug: ${slug}`);
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }
    
    console.log(`[SlugRoute] Found demo with matching slug: ${matchingDemo.id}`);
    
    // Get the URL from the demo
    let targetUrl = matchingDemo.url || '';
    console.log(`[SlugRoute] Raw Demo URL: ${targetUrl}`);
    
    // Ensure the URL has a protocol
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    console.log(`[SlugRoute] Normalized Demo URL: ${targetUrl}`);
    
    // Get the original hostname and protocol for our proxy
    const originalUrl = new URL(targetUrl);
    
    // Extract the base domain without any path components
    // This will be used for static assets
    const baseUrl = `${originalUrl.protocol}//${originalUrl.hostname}`;
    
    // Extract path and query parameters from the request
    const requestPath = request.nextUrl.pathname.substring(slug.length + 1) || '';
    const requestSearch = request.nextUrl.search || '';
    
    // Preserve the full query-string (including any tokens)
    let cleanSearch = requestSearch;
    
    // Create the full URL to proxy to 
    const fullProxyPath = `${targetUrl}${requestPath}${cleanSearch}`;
    
    console.log(`[SlugRoute] Proxying to: ${fullProxyPath}`);
    
    // Get the current host for rewriting URLs
    const proxyHost = request.headers.get('host') || 'localhost:3000';
    const protocol = proxyHost.includes('localhost') ? 'http' : 'https';
    const proxyBase = `${protocol}://${proxyHost}/${slug}`;
    
    // Fetch content from the target
    const response = await fetch(fullProxyPath);
    
    console.log(`[SlugRoute] Target URL returned ${response.status}: ${fullProxyPath}`);
    
    if (!response.ok && response.status !== 304) {
      console.error(`[SlugRoute] Error fetching content: ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch content: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the content type
    const contentType = response.headers.get('content-type') || '';
    
    // Handle different content types appropriately
    if (contentType.includes('text/html')) {
      // For HTML, rewrite links to maintain the proxy facade
      const html = await response.text();
      
      // Use the base URL for static assets, but the proxy URL for navigation
      const rewrittenHtml = rewriteHtml(html, baseUrl, originalUrl.origin, proxyBase);
      
      return new NextResponse(rewrittenHtml, {
        status: response.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        }
      });
    } else if (contentType.includes('text/css')) {
      // For CSS content, rewrite URLs to maintain the proxy facade
      const css = await response.text();
      
      // Get the slug from the proxyBase URL (last part after the last slash)
      const cssSlug = proxyBase.split('/').pop() || slug;
      
      // Build the asset proxy URL base
      const apiBase = proxyBase.substring(0, proxyBase.lastIndexOf('/')) + '/api/asset';
      
      // Rewrite CSS URLs to point to our asset proxy
      const rewrittenCss = css
        .replace(new RegExp(`url\\(['"](https?://[^'"]+)['"]*\\)`, 'g'), 
                (match, url) => {
                  if (url.includes(originalUrl.hostname)) {
                    return `url('${apiBase}?slug=${cssSlug}&path=${encodeURIComponent(new URL(url).pathname)}')`;
                  }
                  return match;
                })
        .replace(new RegExp(`url\\(['"]?(/[^'"\\)]+)['"]?\\)`, 'g'), 
                (match, path) => `url('${apiBase}?slug=${cssSlug}&path=${encodeURIComponent(path)}')`);
      
      return new NextResponse(rewrittenCss, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
        }
      });
    } else {
      // For other content types (images, JS, etc.), pass through as-is
      const data = await response.arrayBuffer();
      
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
        }
      });
    }
  } catch (error) {
    console.error('[SlugRoute] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 