#!/usr/bin/env node

/**
 * Database Population Script
 * 
 * This script populates the Redis database with sample demos following
 * the updated schema requirements:
 * - Demos must have either client OR vertical
 * - Demos with client go to Client-Specific tabs
 * - Demos with only vertical go to General tabs
 * - Demos with all three: URL, script, and recording are Complete
 * - Others are In Progress
 */

require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

// Connect to Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Keys for Redis
const KEYS = {
  DEMOS: "demos", // For storing the list of all demos
  DEMO_DETAIL: (id) => `demo:${id}`, // For storing individual demo details
};

// Sample data
const sampleDemos = [
  // General Complete demos (vertical, no client, all URLs)
  {
    title: "AI Customer Service Assistant",
    description: "Demo showing our AI-powered customer service chatbot capabilities",
    status: "ready",
    vertical: "AI Solutions",
    url: "https://demo-customer-service-bot.example.com",
    scriptUrl: "https://docs.example.com/scripts/ai-customer-service",
    recordingUrl: "https://recording.example.com/ai-customer-service",
    assignedTo: "Sarah Johnson",
    useCase: "Customer service automation",
    slug: "ai-customer-service",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    tags: ["AI", "chatbot", "customer service"]
  },
  {
    title: "Data Visualization Dashboard",
    description: "Interactive dashboard for business intelligence data visualization",
    status: "ready",
    vertical: "Business Intelligence",
    url: "https://data-viz-demo.example.com",
    scriptUrl: "https://docs.example.com/scripts/data-viz",
    recordingUrl: "https://recording.example.com/data-viz",
    assignedTo: "Michael Chen",
    useCase: "Executive decision making",
    slug: "data-viz-dashboard",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["dashboard", "BI", "visualization"]
  },
  
  // General In Progress demos (vertical, no client, missing URLs)
  {
    title: "Machine Learning Model Training Platform",
    description: "Platform for training and deploying ML models",
    status: "in_progress",
    vertical: "Machine Learning",
    template: "old_template",
    url: "https://ml-platform.example.com",
    scriptUrl: "", // Missing script
    recordingUrl: "", // Missing recording
    assignedTo: "David Wilson",
    useCase: "ML model deployment",
    slug: "ml-platform",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["ML", "AI", "platform"]
  },
  {
    title: "Security Monitoring System",
    description: "Real-time security monitoring and threat detection",
    status: "in_progress",
    vertical: "Cybersecurity",
    template: "old_template",
    url: "", // Missing URL
    scriptUrl: "https://docs.example.com/scripts/security-monitoring",
    recordingUrl: "", // Missing recording
    assignedTo: "Emily Rodriguez",
    useCase: "Security operations centers",
    slug: "security-monitoring",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["security", "monitoring", "SOC"]
  },
  
  // Client-Specific Complete demos (has client, all URLs)
  {
    title: "Acme Corp ERP Integration",
    description: "Demo of our ERP integration for Acme Corporation",
    status: "ready",
    client: "Acme Corporation",
    template: "old_template",
    url: "https://acme-erp-demo.example.com",
    scriptUrl: "https://docs.example.com/scripts/acme-erp",
    recordingUrl: "https://recording.example.com/acme-erp",
    assignedTo: "Robert Taylor",
    useCase: "ERP system integration",
    slug: "acme-erp",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["ERP", "integration", "Acme"]
  },
  {
    title: "Globex Healthcare Analytics",
    description: "Healthcare analytics dashboard for Globex Medical",
    status: "ready",
    client: "Globex Medical",
    template: "old_template",
    url: "https://globex-healthcare.example.com",
    scriptUrl: "https://docs.example.com/scripts/globex-healthcare",
    recordingUrl: "https://recording.example.com/globex-healthcare",
    assignedTo: "Amanda Martinez",
    useCase: "Patient outcome analysis",
    slug: "globex-healthcare",
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["healthcare", "analytics", "Globex"]
  },
  
  // Client-Specific In Progress demos (has client, missing URLs)
  {
    title: "TechDynamics Cloud Migration",
    description: "Cloud migration solution for TechDynamics",
    status: "in_progress",
    client: "TechDynamics Inc.",
    template: "old_template",
    url: "https://techdynamics-cloud.example.com",
    scriptUrl: "https://docs.example.com/scripts/techdynamics-cloud",
    recordingUrl: "", // Missing recording
    assignedTo: "Jason Kim",
    useCase: "Infrastructure migration",
    slug: "techdynamics-cloud",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["cloud", "migration", "infrastructure"]
  },
  {
    title: "Oceanic Airlines Booking System",
    description: "New booking system demo for Oceanic Airlines",
    status: "in_progress",
    client: "Oceanic Airlines",
    template: "old_template",
    url: "", // Missing URL
    scriptUrl: "", // Missing script
    recordingUrl: "", // Missing recording
    assignedTo: "Lisa Park",
    useCase: "Flight booking optimization",
    slug: "oceanic-booking",
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["booking", "airlines", "travel"]
  },
  
  // Demo with both client and vertical
  {
    title: "Universal Bank Fraud Detection",
    description: "AI-powered fraud detection system for Universal Bank",
    status: "in_progress",
    client: "Universal Bank",
    vertical: "Financial Services",
    url: "https://universal-fraud.example.com",
    scriptUrl: "", // Missing script
    recordingUrl: "https://recording.example.com/universal-fraud",
    assignedTo: "Thomas White",
    useCase: "Transaction fraud prevention",
    slug: "universal-fraud",
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["banking", "fraud", "AI", "financial"]
  }
];

// Function to clear existing demos
async function clearExistingDemos() {
  console.log("Clearing existing demos...");
  // Get all demo IDs
  const demoIds = await redis.smembers(KEYS.DEMOS);
  
  if (demoIds.length > 0) {
    // Delete all demo details
    const pipeline = redis.pipeline();
    demoIds.forEach(id => {
      pipeline.del(KEYS.DEMO_DETAIL(id));
    });
    await pipeline.exec();
    
    // Clear the demos set
    await redis.del(KEYS.DEMOS);
    console.log(`Cleared ${demoIds.length} existing demos`);
  } else {
    console.log("No existing demos to clear");
  }
}

// Function to add a demo to the database
async function addDemo(demo) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const newDemo = {
    ...demo,
    id,
    createdAt: now,
    updatedAt: now,
    tags: JSON.stringify(demo.tags || []), // Convert tags array to string for Redis
  };
  
  // Store demo details
  await redis.hset(KEYS.DEMO_DETAIL(id), newDemo);
  
  // Add demo ID to the set of all demos
  await redis.sadd(KEYS.DEMOS, id);
  
  return id;
}

// Main function to populate the database
async function populateDatabase() {
  try {
    // Check Redis connection
    const ping = await redis.ping();
    console.log("Redis connection:", ping === "PONG" ? "OK" : "FAILED");
    
    if (ping !== "PONG") {
      console.error("Failed to connect to Redis");
      return;
    }
    
    // Clear existing demos
    await clearExistingDemos();
    
    console.log("Adding new demos...");
    // Add each demo
    for (const demo of sampleDemos) {
      const id = await addDemo(demo);
      console.log(`Added demo: "${demo.title}" (${id})`);
    }
    
    console.log(`Successfully added ${sampleDemos.length} demos to the database`);
  } catch (error) {
    console.error("Error populating database:", error);
  }
}

// Run the script
populateDatabase().then(() => {
  console.log("Database population completed");
  process.exit(0);
}).catch(error => {
  console.error("Failed to populate database:", error);
  process.exit(1);
}); 