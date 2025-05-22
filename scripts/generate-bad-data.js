#!/usr/bin/env node
/**
 * Generate Bad Data Script
 * 
 * This script creates intentionally malformed data in the database
 * to test the data-cleanup script. It generates demos with various issues:
 * - Tags as strings instead of arrays
 * - Missing required fields
 * - Wrong status values
 * - Inconsistent type values
 * - Demos with incorrect completion status
 */

const { Redis } = require('@upstash/redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

// Redis connection using Upstash
const client = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Sample data
const verticals = ['Healthcare', 'Finance', 'Retail', 'Education', 'Manufacturing'];
const clients = ['Acme Inc', 'TechCorp', 'MediHealth', 'EduSystems', 'FinanceFirst'];
const tags = ['ai', 'ml', 'analytics', 'dashboard', 'reports', 'mobile', 'web', 'enterprise'];
const assignees = ['Sarah Johnson', 'Michael Chen', 'Jessica Williams', 'David Kim'];

// Create bad demos
function createBadDemo(index) {
  // Base ID
  const id = uuidv4();
  
  // Determine which type of bad data to create
  const badDataType = index % 8;
  
  switch (badDataType) {
    case 0:
      // Demo with tags as a comma-separated string instead of array
      return {
        id,
        title: `Bad Tags Demo ${index}`,
        description: `This demo has tags as a string instead of an array`,
        type: 'general',
        status: 'in_progress',
        vertical: verticals[0],
        tags: 'ai,ml,dashboard', // Bad: tags as string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
    case 1:
      // Demo missing vertical and client fields
      return {
        id,
        title: `Missing Fields Demo ${index}`,
        description: `This demo is missing both vertical and client fields`,
        type: 'general',
        status: 'in_progress',
        // Missing vertical and client fields
        assignedTo: assignees[1],
        tags: getRandomItems(tags, 2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
    case 2:
      // Demo with client field but wrong type value
      return {
        id,
        title: `Wrong Type Demo ${index}`,
        description: `This demo has a client field but type is still general`,
        type: 'general', // Wrong: should be 'specific'
        status: 'ready',
        client: clients[2],
        vertical: verticals[2],
        assignedTo: assignees[0],
        tags: getRandomItems(tags, 3),
        url: 'https://demo.example.com/wrong-type',
        scriptUrl: 'https://docs.google.com/document/d/wrong-type',
        recordingUrl: 'https://vimeo.com/wrong-type',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
    case 3:
      // Demo with status 'ready' but missing resources
      return {
        id,
        title: `Incomplete Ready Demo ${index}`,
        description: `This demo has status 'ready' but doesn't have all required resources`,
        type: 'specific',
        status: 'ready', // Wrong: should be 'in_progress'
        client: clients[1],
        vertical: verticals[1],
        assignedTo: assignees[3],
        url: 'https://demo.example.com/incomplete', 
        // Missing scriptUrl and recordingUrl
        tags: getRandomItems(tags, 2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
    case 4:
      // Demo with status 'in_progress' but having all resources
      return {
        id,
        title: `Complete In-Progress Demo ${index}`,
        description: `This demo has status 'in_progress' but has all resources`,
        type: 'general',
        status: 'in_progress', // Wrong: should be 'ready'
        vertical: verticals[3],
        assignedTo: assignees[2],
        url: 'https://demo.example.com/complete-progress',
        scriptUrl: 'https://docs.google.com/document/d/complete-progress',
        recordingUrl: 'https://vimeo.com/complete-progress',
        tags: getRandomItems(tags, 3),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
    case 5:
      // Demo with client-specific in the type field (invalid enum value)
      return {
        id,
        title: `Invalid Type Enum Demo ${index}`,
        description: `This demo has an invalid type value`,
        type: 'client-specific', // Invalid: not in the enum
        status: 'requested',
        client: clients[0],
        vertical: verticals[4],
        tags: getRandomItems(tags, 2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
    case 6:
      // Demo with null or undefined values
      return {
        id,
        title: null, // Bad: null title
        description: `This demo has null/undefined values`,
        type: 'general',
        status: 'in_progress',
        vertical: verticals[2],
        tags: undefined, // Bad: undefined tags
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
    case 7:
      // Demo with missing creation date
      return {
        id,
        title: `Missing Date Demo ${index}`,
        description: `This demo is missing creation date`,
        type: 'specific',
        status: 'requested',
        client: clients[3],
        vertical: verticals[0],
        assignedTo: assignees[1],
        // Missing createdAt
        updatedAt: new Date().toISOString(),
        tags: getRandomItems(tags, 2),
      };
  }
  
  // Default case if somehow none of the cases match
  return {
    id,
    title: `Fallback Demo ${index}`,
    description: `This is a fallback demo`,
    type: 'general',
    status: 'requested',
    vertical: verticals[0],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Get random items from an array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log('Starting bad data generation process...');
  
  try {
    console.log('Connected to Upstash Redis');
    
    // Clear existing demo data if requested
    if (process.argv.includes('--clear')) {
      const keys = await client.keys('demo:*');
      if (keys.length > 0) {
        console.log(`Clearing ${keys.length} existing demo records...`);
        for (const key of keys) {
          await client.del(key);
        }
        console.log('Existing data cleared.');
      }
    }
    
    // Create bad demo data
    const badDemoCount = process.argv.includes('--count') 
      ? parseInt(process.argv[process.argv.indexOf('--count') + 1], 10) 
      : 16;
    
    console.log(`Creating ${badDemoCount} bad demo records...`);
    
    // Generate and save bad demos
    for (let i = 1; i <= badDemoCount; i++) {
      const demo = createBadDemo(i);
      await client.json.set(`demo:${demo.id}`, '$', demo);
      console.log(`Created bad demo #${i}: ${demo.title || 'Untitled'}`);
    }
    
    console.log(`Bad data generation complete! Created ${badDemoCount} bad demo records.`);
    console.log('Now you can run data-cleanup.js to test how it handles these issues.');
    
  } catch (error) {
    console.error('Error in data generation process:', error);
  }
}

// Run the script
main().catch(console.error); 