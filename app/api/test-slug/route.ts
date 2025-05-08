import { NextResponse } from 'next/server';
import { redis, KEYS } from '@/lib/db';

export async function GET() {
  try {
    // Create a test demo with slug 'toast'
    const id = 'test-demo-' + Date.now();
    
    const demoData = {
      id,
      title: 'Test Demo with Slug',
      description: 'A test demo for slug proxying',
      slug: 'toast',
      url: 'https://hackernews-demo.vercel.app',
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save demo to Redis
    await redis.hset(KEYS.DEMO_DETAIL(id), demoData);
    await redis.sadd(KEYS.DEMOS, id);
    
    // Log the stored demo details for debugging
    const storedDemo = await redis.hgetall(KEYS.DEMO_DETAIL(id));
    
    return NextResponse.json({
      success: true,
      message: 'Created test demo with slug: toast',
      demoId: id,
      storedData: storedDemo
    });
  } catch (error: any) {
    console.error('Error creating test demo:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test demo' },
      { status: 500 }
    );
  }
} 