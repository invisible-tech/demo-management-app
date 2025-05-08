import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/lib/db';
import { Demo } from '@/lib/schema';

// Helper to rewrite HTML to replace absolute URLs
function rewriteHtml(html: string, originalOrigin: string, proxyBase: string): string {
  try {
    console.log(`[SlugRoute] Rewriting URLs from ${originalOrigin} to ${proxyBase}`);
    
    // Create a simpler version that focuses on the key transformations
    let modifiedHtml = html
      // Add base href to ensure relative paths work correctly - use more robust head tag detection
      .replace(/<head[^>]*>/, match => `${match}\n<base href="${proxyBase}/">\n`)
      
      // Replace absolute URLs in src and href attributes
      .replace(new RegExp(`(src|href)=["']${originalOrigin}([^"']*)["']`, 'g'), 
               `$1="${proxyBase}$2"`)
      
      // Replace root-relative URLs in src and href
      .replace(/(src|href)=["']\/([^"']*)["']/g, 
               `$1="${proxyBase}/$2"`)
      
      // Handle _next paths specifically
      .replace(/(src|href)=["']\/_next\//g, 
               `$1="${proxyBase}/_next/`);
    
    // Add a simple client-side script to handle navigation - use more robust head tag detection
    if (/<\/head\s*>/i.test(modifiedHtml)) {
      modifiedHtml = modifiedHtml.replace(/<\/head\s*>/i, `
<script>
// Proxy configuration
const PROXY_BASE = "${proxyBase}";
const ORIGINAL_ORIGIN = "${originalOrigin}";

// Debug logging
console.log('Proxy script initialized', { PROXY_BASE, ORIGINAL_ORIGIN });

// Rewrite links when clicked
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.href) {
    // Check if it's a link we should rewrite
    if (link.href.startsWith(ORIGINAL_ORIGIN) || 
        (link.href.startsWith('/') && !link.href.startsWith(PROXY_BASE))) {
      e.preventDefault();
      
      let newUrl;
      if (link.href.startsWith(ORIGINAL_ORIGIN)) {
        // Absolute URL to the original site
        newUrl = PROXY_BASE + link.href.substring(ORIGINAL_ORIGIN.length);
      } else if (link.href.startsWith('/')) {
        // Root-relative URL
        newUrl = PROXY_BASE + link.href;
      }
      
      if (newUrl) {
        console.log('Rewriting link:', link.href, '->', newUrl);
        window.location.href = newUrl;
      }
    }
  }
}, true);

// Intercept fetch API for AJAX requests
if (window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string') {
      // Rewrite absolute URLs to the original site
      if (input.startsWith(ORIGINAL_ORIGIN)) {
        input = PROXY_BASE + input.substring(ORIGINAL_ORIGIN.length);
      }
      // Rewrite root-relative URLs
      else if (input.startsWith('/')) {
        input = PROXY_BASE + input;
      }
    }
    return originalFetch.call(this, input, init);
  };
}
</script>
</head>`);
    } else {
      // If no head tag found, add the script at the end of body or html
      const bodyCloseTag = modifiedHtml.indexOf('</body>');
      const htmlCloseTag = modifiedHtml.indexOf('</html>');
      
      const script = `
<script>
// Proxy configuration
const PROXY_BASE = "${proxyBase}";
const ORIGINAL_ORIGIN = "${originalOrigin}";

// Debug logging
console.log('Proxy script initialized', { PROXY_BASE, ORIGINAL_ORIGIN });

// Rewrite links when clicked
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.href) {
    // Check if it's a link we should rewrite
    if (link.href.startsWith(ORIGINAL_ORIGIN) || 
        (link.href.startsWith('/') && !link.href.startsWith(PROXY_BASE))) {
      e.preventDefault();
      
      let newUrl;
      if (link.href.startsWith(ORIGINAL_ORIGIN)) {
        // Absolute URL to the original site
        newUrl = PROXY_BASE + link.href.substring(ORIGINAL_ORIGIN.length);
      } else if (link.href.startsWith('/')) {
        // Root-relative URL
        newUrl = PROXY_BASE + link.href;
      }
      
      if (newUrl) {
        console.log('Rewriting link:', link.href, '->', newUrl);
        window.location.href = newUrl;
      }
    }
  }
}, true);

// Intercept fetch API for AJAX requests
if (window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string') {
      // Rewrite absolute URLs to the original site
      if (input.startsWith(ORIGINAL_ORIGIN)) {
        input = PROXY_BASE + input.substring(ORIGINAL_ORIGIN.length);
      }
      // Rewrite root-relative URLs
      else if (input.startsWith('/')) {
        input = PROXY_BASE + input;
      }
    }
    return originalFetch.call(this, input, init);
  };
}
</script>`;
      
      if (bodyCloseTag !== -1) {
        modifiedHtml = modifiedHtml.slice(0, bodyCloseTag) + script + modifiedHtml.slice(bodyCloseTag);
      } else if (htmlCloseTag !== -1) {
        modifiedHtml = modifiedHtml.slice(0, htmlCloseTag) + script + modifiedHtml.slice(htmlCloseTag);
      } else {
        modifiedHtml += script;
      }
    }

    return modifiedHtml;
  } catch (error) {
    console.error('[SlugRoute] Error rewriting HTML:', error);
    return html; // Return original HTML if rewriting fails
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Make sure to await params before using
  const slug = params.slug;
  console.log(`[SlugRoute] Processing slug: "${slug}"`);
  
  try {
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
    console.log(`[SlugRoute] Retrieved ${allDemos.length} demo details`);
    
    // Debug output to show all slugs in database
    const allSlugs = allDemos
      .filter(demo => demo && typeof demo === 'object' && 'slug' in demo)
      .map(demo => (demo as any).slug);
    
    console.log(`[SlugRoute] All slugs in database: ${JSON.stringify(allSlugs)}`);
    
    // Find demo with matching slug
    const demoWithSlug = allDemos.find(demo => 
      demo && typeof demo === 'object' && 'slug' in demo && demo.slug === slug
    ) as Demo | undefined;
    
    if (!demoWithSlug) {
      console.log(`[SlugRoute] No demo found with slug "${slug}"`);
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }
    
    if (!demoWithSlug.url) {
      console.log(`[SlugRoute] Demo found but has no URL: ${demoWithSlug.id}`);
      return NextResponse.json({ error: 'Demo has no URL configured' }, { status: 404 });
    }
    
    console.log(`[SlugRoute] Found demo with matching slug: ${demoWithSlug.id}`);
    console.log(`[SlugRoute] Raw Demo URL: ${demoWithSlug.url}`);
    
    // Ensure URL has a protocol
    let demoUrl = demoWithSlug.url;
    if (!demoUrl.startsWith('http')) {
      demoUrl = 'https://' + demoUrl;
    }
    
    console.log(`[SlugRoute] Normalized Demo URL: ${demoUrl}`);
    
    // Extract path and query parameters from the request
    const requestUrl = new URL(request.url);
    const requestPath = requestUrl.pathname;
    const requestSearch = requestUrl.search;
    
    // Preserve the full query-string (including the `dpl` preview token)
    let cleanSearch = requestSearch;
    
    // Get the path relative to the slug
    const relativePathWithQuery = requestPath.slice(slug.length + 2) + cleanSearch; // +2 for the slashes
    
    // Construct the full target URL on the original domain
    const demoBaseUrl = new URL(demoUrl);
    let targetUrl: string;
    
    if (requestPath === `/${slug}` || requestPath === `/${slug}/`) {
      // If requesting the root page of the slug, use the full demo URL
      targetUrl = demoUrl;
    } else {
      // For static assets and other paths, resolve against the demo origin
      targetUrl = new URL(relativePathWithQuery || '/', demoBaseUrl.origin).toString();
    }
    
    console.log(`[SlugRoute] Proxying to: ${targetUrl}`);
    
    // Get the base URL for the proxy (for URL rewriting in HTML)
    const proxyBase = `${requestUrl.origin}/${slug}`;
    
    try {
      // Forward the original request headers to the target
      const headers = new Headers();
      request.headers.forEach((value, key) => {
        // Skip headers that might cause issues
        const skipHeaders = [
          'host', 
          'connection',
          'content-length'
        ];
        if (!skipHeaders.includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      });
      
      // Use original Referer or set a custom one
      if (!headers.has('Referer')) {
        headers.set('Referer', demoBaseUrl.origin);
      }
      
      // Fetch the content from the target URL
      const response = await fetch(targetUrl, {
        headers,
        cache: 'no-store' // Bypass cache to ensure fresh content
      });
      
      if (!response.ok) {
        console.error(`[SlugRoute] Target URL returned ${response.status}: ${targetUrl}`);
        return new NextResponse(null, { status: response.status });
      }
      
      // Get the content type
      const contentType = response.headers.get('Content-Type') || '';
      console.log(`[SlugRoute] Content-Type from target: ${contentType}`);
      
      // Copy all response headers to our response
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        // Skip headers that might cause issues
        const skipHeaders = [
          'content-encoding', 
          'content-security-policy', 
          'strict-transport-security',
          'x-frame-options',
          'transfer-encoding'
        ];
        if (!skipHeaders.includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });
      
      // Ensure CORS is allowed for all content
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      
      // For HTML content, rewrite the URLs to maintain our proxy
      if (contentType.includes('text/html')) {
        const originalHtml = await response.text();
        const rewrittenHtml = rewriteHtml(originalHtml, demoBaseUrl.origin, proxyBase);
        
        return new NextResponse(rewrittenHtml, {
          status: response.status,
          headers: responseHeaders
        });
      } 
      // For all other content types, pass through directly
      else {
        const buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
          status: response.status,
          headers: responseHeaders
        });
      }
    } catch (fetchError: any) {
      console.error(`[SlugRoute] Error fetching from ${targetUrl}:`, fetchError.message);
      return NextResponse.json({
        error: 'Failed to fetch content from target URL',
        message: fetchError.message,
        targetUrl
      }, { status: 502 });
    }
  } catch (error: any) {
    console.error('[SlugRoute] Error:', error.message);
    return NextResponse.json({ 
      error: 'Request failed', 
      message: error.message 
    }, { status: 500 });
  }
} 