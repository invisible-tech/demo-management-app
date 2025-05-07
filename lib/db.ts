import { Redis } from "@upstash/redis"

// You'll need to set these environment variables in your Vercel project
// or locally in a .env.local file
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

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
    
    const demos = await pipeline.exec()
    return demos.filter(Boolean)
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

export async function createDemo(demo: Record<string, any>) {
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

export async function updateDemo(id: string, updates: Record<string, any>) {
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