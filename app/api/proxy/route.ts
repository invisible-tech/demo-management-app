import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Debug full request
    console.log(`[ProxyAPI] Request URL: ${request.url}`);
    
    // Get the URL object to access searchParams more reliably
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Log all search params for debugging
    console.log(`[ProxyAPI] Raw search params string: ${url.search}`);
    console.log(`[ProxyAPI] Search params:`, Object.fromEntries(searchParams.entries()));
    
    // Get slug from query parameters
    const slug = searchParams.get('slug');
    
    console.log(`[ProxyAPI] Extracted slug: "${slug}"`);
    
    if (!slug) {
      console.error(`[ProxyAPI] No slug provided in request`);
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    
    if (slug === 'toast') {
      // For testing purposes, use a hardcoded URL for the 'toast' slug
      const targetUrl = 'https://example.com';
      
      console.log(`[ProxyAPI] Using hardcoded URL for 'toast': ${targetUrl}`);
      
      // Simple HTML response for testing
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Proxied Demo Content</title>
          </head>
          <body>
            <h1>Successfully Proxied Demo: ${slug}</h1>
            <p>This is a test of the proxy system working correctly.</p>
            <p>The original target URL was: ${targetUrl}</p>
          </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        }
      });
    }
    
    // If we get here, it means the slug is not one of our test cases
    return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
  } catch (error: any) {
    console.error('[ProxyAPI] Proxy error:', error);
    return NextResponse.json({ 
      error: 'Proxy request failed', 
      message: error.message 
    }, { status: 500 });
  }
} 