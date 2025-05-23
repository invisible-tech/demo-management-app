import { Redis } from "@upstash/redis"
import { Demo } from "./schema"

// You'll need to set these environment variables in your Vercel project
// or locally in a .env.local file
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || "https://missing-url.upstash.io",
  token: process.env.KV_REST_API_TOKEN || "missing-token",
})

// Helper to check Redis connection
export async function checkRedisConnection() {
  try {
    // Simple ping to check if Redis is available
    await redis.ping();
    return { success: true, message: "Redis connection successful" };
  } catch (error: any) {
    console.error("Redis connection error:", error);
    return { 
      success: false, 
      message: "Redis connection failed", 
      error: error.message 
    };
  }
}

// Keys for Redis 
export const KEYS = {
  DEMOS: "demos", // For storing the list of all demos
  DEMO_DETAIL: (id: string) => `demo:${id}`, // For storing individual demo details
}

// Demo repository functions
export async function getAllDemos() {
  try {
    // Get all demo IDs
    const demoIds = await redis.smembers(KEYS.DEMOS)
    
    if (!demoIds.length) {
      return []
    }
    
    // Get demo details using pipeline for efficiency
    const pipeline = redis.pipeline()
    demoIds.forEach(id => {
      pipeline.hgetall(KEYS.DEMO_DETAIL(id))
    })
    
    const demosRaw = await pipeline.exec()
    
    // Process and normalize data
    const demos = demosRaw.filter(Boolean).map(demo => {
      // Type assertion for demo as Record<string, any>
      const demoObj = demo as Record<string, any>;
      
      // Ensure tags is an array (it might be stored as a string)
      if (demoObj.tags && typeof demoObj.tags === 'string') {
        try {
          demoObj.tags = JSON.parse(demoObj.tags);
        } catch (e) {
          // If parsing fails, default to empty array
          demoObj.tags = [];
        }
      }
      
      // Ensure tags is an array even if it's undefined
      if (!demoObj.tags) {
        demoObj.tags = [];
      }
      
      // Set default type to "general" if undefined
      if (!demoObj.type) {
        demoObj.type = "general";
      }
      
      return demoObj;
    });
    
    return demos;
  } catch (error) {
    console.error("Failed to get demos:", error)
    return []
  }
}

export async function getDemoById(id: string) {
  try {
    const demo = await redis.hgetall(KEYS.DEMO_DETAIL(id))
    return demo
  } catch (error) {
    console.error(`Failed to get demo ${id}:`, error)
    return null
  }
}

export async function createDemo(demo: Partial<Demo>) {
  try {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const newDemo = {
      ...demo,
      id,
      createdAt: now,
      updatedAt: now,
    }
    
    // Store demo details
    await redis.hset(KEYS.DEMO_DETAIL(id), newDemo)
    
    // Add demo ID to the set of all demos
    await redis.sadd(KEYS.DEMOS, id)
    
    return newDemo
  } catch (error) {
    console.error("Failed to create demo:", error)
    throw error
  }
}

export async function updateDemo(id: string, updates: Partial<Demo>) {
  try {
    // Check if demo exists
    const exists = await redis.exists(KEYS.DEMO_DETAIL(id))
    if (!exists) {
      throw new Error(`Demo with ID ${id} not found`)
    }
    
    // Add updatedAt timestamp
    const updatedDemo = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    // Update demo details
    await redis.hset(KEYS.DEMO_DETAIL(id), updatedDemo)
    
    // Return updated demo
    return await getDemoById(id)
  } catch (error) {
    console.error(`Failed to update demo ${id}:`, error)
    throw error
  }
}

export async function deleteDemo(id: string) {
  try {
    // Delete demo details
    await redis.del(KEYS.DEMO_DETAIL(id))
    
    // Remove from set of all demos
    await redis.srem(KEYS.DEMOS, id)
    
    return true
  } catch (error) {
    console.error(`Failed to delete demo ${id}:`, error)
    throw error
  }
} 