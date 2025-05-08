import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/lib/db';

export async function GET(
  request,
  { params }
) {
  try {
    const { slug } = params;
    console.log(`[SlugRoute] Processing slug: "${slug}"`);
  
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
    console.log(`[SlugRoute] All slugs in database: ${allDemos.map(demo => demo?.slug || "none")}`);
    
    // Find the demo with the matching slug
    const matchingDemo = allDemos.find(demo => demo?.slug === slug);
    
    if (!matchingDemo) {
      console.log(`[SlugRoute] No demo found with slug: ${slug}`);
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }
    
    console.log(`[SlugRoute] Found demo with matching slug: ${matchingDemo.id}`);
    
    // Get the URL from the demo
    let targetUrl = matchingDemo.url || '';
    console.log(`[SlugRoute] Demo URL: ${targetUrl}`);
    
    // Ensure the URL has a protocol
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // Get the current host for branding
    const proxyHost = request.headers.get('host') || 'localhost:3000';
    
    // Create a simple HTML page with an iframe that loads the target URL
    // The iframe takes up the full viewport and has no borders
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${matchingDemo.title || 'Demo'}</title>
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100vh;
          border: none;
          position: absolute;
          top: 0;
          left: 0;
        }
      </style>
    </head>
    <body>
      <iframe src="${targetUrl}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; camera; microphone; geolocation" allowfullscreen></iframe>
    </body>
    </html>
    `;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    });
  } catch (error) {
    console.error('[SlugRoute] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 