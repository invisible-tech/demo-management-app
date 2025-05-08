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
      
      // Override the fetch function to proxy all requests
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
          // Handle paths starting with _next directly (Next.js specific)
          else if (url.includes('/_next/')) {
            url = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent('/' + url.split('/_next/')[1]);
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
        
        // Add a global error handler to catch script loading errors
        window.addEventListener('error', function(event) {
          if (event.target && event.target.tagName === 'SCRIPT' && event.target.src) {
            console.error('Script loading error:', event.target.src);
            
            // If the script has a URL pattern that looks like a Next.js asset but was loaded directly,
            // it might be missing our proxy. Let's retry with our proxy.
            if (event.target.src.includes('/_next/') && !event.target.src.includes('/api/asset')) {
              const newSrc = API_BASE + '?slug=' + SLUG + '&path=' + 
                             encodeURIComponent('/_next/' + event.target.src.split('/_next/')[1]);
              console.log('Retrying with:', newSrc);
              
              // Create a new script element with our proxied URL
              const newScript = document.createElement('script');
              newScript.src = newSrc;
              document.head.appendChild(newScript);
              
              // Prevent the default error handling
              event.preventDefault();
            }
          }
        }, true);
        
        // For Next.js, fix publicPath for webpack
        if (window.__webpack_require__ && window.__webpack_require__.p) {
          const originalPublicPath = window.__webpack_require__.p;
          window.__webpack_require__.p = API_BASE + '?slug=' + SLUG + '&path=' + 
                                          encodeURIComponent(originalPublicPath.startsWith('/') ? 
                                          originalPublicPath : '/' + originalPublicPath);
          console.log('Fixed webpack public path:', originalPublicPath, '->', window.__webpack_require__.p);
        }
        
        // Handle dynamically loaded scripts via Next.js
        const originalDocument = document.createElement;
        document.createElement = function(tagName) {
          const element = originalDocument.call(document, tagName);
          
          if (tagName.toLowerCase() === 'script') {
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
              if (name === 'src' && typeof value === 'string') {
                // Handle _next paths for scripts
                if (value.includes('/_next/') && !value.includes('/api/asset')) {
                  const newValue = API_BASE + '?slug=' + SLUG + '&path=' + 
                                 encodeURIComponent('/_next/' + value.split('/_next/')[1]);
                  console.log('Rewriting script src:', value, '->', newValue);
                  value = newValue;
                }
              }
              return originalSetAttribute.call(this, name, value);
            };
          }
          
          return element;
        };
      }
      
      // Handle dynamically inserted images and videos
      // This uses a MutationObserver to watch for new elements added to the DOM
      const mediaObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) { // Element node
                // Process the element and its children
                processMediaElements(node);
              }
            });
          }
        });
      });
      
      // Start observing the document body for DOM changes
      mediaObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Function to find and process media elements
      function processMediaElements(rootElement) {
        // Handle IMG elements
        const images = rootElement.querySelectorAll ? rootElement.querySelectorAll('img') : [];
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (img.src && !img.src.includes('/api/asset') && !img.hasAttribute('data-proxied')) {
            img.setAttribute('data-proxied', 'true');
            
            if (img.src.startsWith('http')) {
              // For absolute URLs
              const urlObj = new URL(img.src);
              img.src = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(urlObj.pathname);
            } else if (img.src.startsWith('/')) {
              // For root-relative URLs
              img.src = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(img.src);
            } else {
              // For relative URLs
              img.src = API_BASE + '?slug=' + SLUG + '&path=/' + encodeURIComponent(img.src);
            }
          }
        }
        
        // Handle VIDEO elements
        const videos = rootElement.querySelectorAll ? rootElement.querySelectorAll('video') : [];
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          
          // Handle video source elements
          const sources = video.querySelectorAll('source');
          for (let j = 0; j < sources.length; j++) {
            const source = sources[j];
            if (source.src && !source.src.includes('/api/asset') && !source.hasAttribute('data-proxied')) {
              source.setAttribute('data-proxied', 'true');
              
              if (source.src.startsWith('http')) {
                const urlObj = new URL(source.src);
                source.src = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(urlObj.pathname);
              } else if (source.src.startsWith('/')) {
                source.src = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(source.src);
              } else {
                source.src = API_BASE + '?slug=' + SLUG + '&path=/' + encodeURIComponent(source.src);
              }
            }
          }
          
          // Also check the video src attribute
          if (video.src && !video.src.includes('/api/asset') && !video.hasAttribute('data-proxied')) {
            video.setAttribute('data-proxied', 'true');
            
            if (video.src.startsWith('http')) {
              const urlObj = new URL(video.src);
              video.src = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(urlObj.pathname);
            } else if (video.src.startsWith('/')) {
              video.src = API_BASE + '?slug=' + SLUG + '&path=' + encodeURIComponent(video.src);
            } else {
              video.src = API_BASE + '?slug=' + SLUG + '&path=/' + encodeURIComponent(video.src);
            }
          }
        }
      }
      
      // Run once on page load to process initial media elements
      document.addEventListener('DOMContentLoaded', function() {
        processMediaElements(document.body);
      });
      
      // Also run immediately in case DOM is already loaded
      processMediaElements(document.body);
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
    // Use a proper async/await approach for params
    const slug = context.params.slug;
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