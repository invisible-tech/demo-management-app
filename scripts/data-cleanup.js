#!/usr/bin/env node
/**
 * Data Cleanup Script
 * 
 * This script takes production data and cleans it up to match the current schema.
 * It handles:
 * - Converting string tags to arrays
 * - Setting default types (general/specific)
 * - Fixing status based on available resources (URL, script, recording)
 * - Ensuring all required fields are present
 */

const { Redis } = require('@upstash/redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

// Redis connection using Upstash
const client = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

async function main() {
  console.log('Starting data cleanup process...');
  
  try {
    console.log('Connected to Upstash Redis');
    
    // Get all demo keys
    const keys = await client.keys('demo:*');
    console.log(`Found ${keys.length} demo records`);

    // Process each demo
    let processedCount = 0;
    let errorCount = 0;
    
    for (const key of keys) {
      try {
        // Get the demo data
        const demoData = await client.json.get(key);
        if (!demoData) {
          console.warn(`No data found for key ${key}, skipping`);
          continue;
        }
        
        // Clean up the demo data
        const cleanedDemo = cleanDemoData(demoData, key.replace('demo:', ''));
        
        // Save the cleaned demo back to Redis
        await client.json.set(key, '$', cleanedDemo);
        processedCount++;
        
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount} demos`);
        }
      } catch (error) {
        console.error(`Error processing demo ${key}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Data cleanup complete!`);
    console.log(`Successfully processed: ${processedCount} demos`);
    console.log(`Errors encountered: ${errorCount} demos`);
    
  } catch (error) {
    console.error('Error in cleanup process:', error);
  }
}

/**
 * Clean up a demo record to match the current schema
 */
function cleanDemoData(data, id) {
  // Create base demo object with default values
  const demo = {
    id: id || uuidv4(),
    title: data.title || 'Untitled Demo',
    description: data.description || '',
    type: data.type || 'general',
    status: 'in_progress', // Will be recomputed based on resources
    template: data.template || 'old_template', // Default template
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: data.slug || '',
    tags: [], // Initialize with empty array
  };
  
  // Handle tags (convert from string to array if needed)
  if (data.tags) {
    if (typeof data.tags === 'string') {
      demo.tags = data.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(data.tags)) {
      demo.tags = data.tags;
    }
  }
  
  // Handle optional fields
  if (data.url) demo.url = data.url;
  if (data.scriptUrl) demo.scriptUrl = data.scriptUrl;
  if (data.recordingUrl) demo.recordingUrl = data.recordingUrl;
  if (data.vertical) demo.vertical = data.vertical;
  if (data.client) demo.client = data.client;
  if (data.assignedTo) demo.assignedTo = data.assignedTo;
  if (data.dueDate) demo.dueDate = data.dueDate;
  if (data.useCase) demo.useCase = data.useCase;
  if (data.authDetails) demo.authDetails = data.authDetails;
  
  // Determine proper type based on client field
  // Make sure we're using a valid type from the enum
  demo.type = data.client ? 'specific' : 'general';
  
  // Determine status based on availability of resources
  if (demo.url && demo.scriptUrl && demo.recordingUrl) {
    demo.status = 'ready';
  } else {
    demo.status = 'in_progress';
  }
  
  return demo;
}

// Run the script
main().catch(console.error); 