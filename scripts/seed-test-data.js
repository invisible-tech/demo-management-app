#!/usr/bin/env node
/**
 * Seed Test Data Script
 * 
 * This script populates the database with test data for development
 * and demonstration purposes. It creates a variety of demo entries
 * in different states (complete, in progress) and categories.
 */

const { Redis } = require('@upstash/redis');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

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

// Create a random date within the last 30 days
function randomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return date.toISOString();
}

// Create a future date for due dates (between 1-30 days in the future)
function randomFutureDate() {
  const now = new Date();
  const daysAhead = Math.floor(Math.random() * 30) + 1;
  const date = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
  return date.toISOString();
}

// Get random items from an array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Create a complete general demo
function createCompleteGeneralDemo(index) {
  const id = uuidv4();
  const vertical = getRandomItem(verticals);
  
  return {
    id,
    title: `${vertical} Analytics Dashboard Demo ${index}`,
    slug: `${vertical.toLowerCase()}-analytics-demo-${index}`,
    description: `A comprehensive demo showcasing analytics capabilities for the ${vertical} industry.`,
    status: 'ready',
    type: 'general',
    vertical,
    assignedTo: getRandomItem(assignees),
    url: 'https://demo.example.com/analytics-dashboard',
    scriptUrl: 'https://docs.google.com/document/d/demo-script',
    recordingUrl: 'https://vimeo.com/demo-recording',
    tags: getRandomItems(tags, 3),
    createdAt: randomRecentDate(),
    updatedAt: new Date().toISOString(),
    dueDate: randomFutureDate()
  };
}

// Create an in-progress general demo
function createInProgressGeneralDemo(index) {
  const id = uuidv4();
  const vertical = getRandomItem(verticals);
  
  // Randomly determine which resources are missing
  const hasUrl = Math.random() > 0.5;
  const hasScript = Math.random() > 0.5;
  const hasRecording = Math.random() > 0.5;
  
  // Ensure at least one resource is missing
  const demo = {
    id,
    title: `${vertical} Data Visualization Demo ${index}`,
    slug: `${vertical.toLowerCase()}-data-viz-demo-${index}`,
    description: `An interactive data visualization demo for ${vertical} sector applications.`,
    status: 'in_progress',
    type: 'general',
    vertical,
    assignedTo: getRandomItem(assignees),
    tags: getRandomItems(tags, 2),
    createdAt: randomRecentDate(),
    updatedAt: new Date().toISOString(),
    dueDate: randomFutureDate()
  };
  
  if (hasUrl) demo.url = 'https://demo.example.com/data-visualization';
  if (hasScript) demo.scriptUrl = 'https://docs.google.com/document/d/data-viz-script';
  if (hasRecording) demo.recordingUrl = 'https://vimeo.com/data-viz-recording';
  
  return demo;
}

// Create a complete client-specific demo
function createCompleteClientSpecificDemo(index) {
  const id = uuidv4();
  const client = getRandomItem(clients);
  const vertical = getRandomItem(verticals);
  
  return {
    id,
    title: `${client} Custom Solution Demo ${index}`,
    slug: `${client.toLowerCase().replace(' ', '-')}-solution-demo-${index}`,
    description: `A tailored demo built specifically for ${client} showcasing solutions for their ${vertical} division.`,
    status: 'ready',
    type: 'specific',
    client,
    vertical,
    assignedTo: getRandomItem(assignees),
    url: 'https://demo.example.com/custom-solution',
    scriptUrl: 'https://docs.google.com/document/d/custom-script',
    recordingUrl: 'https://vimeo.com/custom-recording',
    tags: getRandomItems(tags, 4),
    createdAt: randomRecentDate(),
    updatedAt: new Date().toISOString(),
    dueDate: randomFutureDate()
  };
}

// Create an in-progress client-specific demo
function createInProgressClientSpecificDemo(index) {
  const id = uuidv4();
  const client = getRandomItem(clients);
  const vertical = getRandomItem(verticals);
  
  // Randomly determine which resources are missing
  const hasUrl = Math.random() > 0.5;
  const hasScript = Math.random() > 0.5;
  const hasRecording = Math.random() > 0.5;
  
  // Ensure at least one resource is missing
  const demo = {
    id,
    title: `${client} Integration Demo ${index}`,
    slug: `${client.toLowerCase().replace(' ', '-')}-integration-demo-${index}`,
    description: `Integration demonstration for ${client}'s existing ${vertical} systems.`,
    status: 'in_progress',
    type: 'specific',
    client,
    vertical,
    assignedTo: getRandomItem(assignees),
    tags: getRandomItems(tags, 3),
    createdAt: randomRecentDate(),
    updatedAt: new Date().toISOString(),
    dueDate: randomFutureDate()
  };
  
  if (hasUrl) demo.url = 'https://demo.example.com/integration';
  if (hasScript) demo.scriptUrl = 'https://docs.google.com/document/d/integration-script';
  if (hasRecording) demo.recordingUrl = 'https://vimeo.com/integration-recording';
  
  return demo;
}

async function main() {
  console.log('Starting test data seeding process...');
  
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
    
    // Create demo data
    const demoCount = {
      completeGeneral: 10,
      inProgressGeneral: 8,
      completeClientSpecific: 7,
      inProgressClientSpecific: 5
    };
    
    // Create and save demo data
    console.log('Creating and saving demo data...');
    
    // Complete general demos
    for (let i = 1; i <= demoCount.completeGeneral; i++) {
      const demo = createCompleteGeneralDemo(i);
      await client.json.set(`demo:${demo.id}`, '$', demo);
      console.log(`Created complete general demo: ${demo.title}`);
    }
    
    // In-progress general demos
    for (let i = 1; i <= demoCount.inProgressGeneral; i++) {
      const demo = createInProgressGeneralDemo(i);
      await client.json.set(`demo:${demo.id}`, '$', demo);
      console.log(`Created in-progress general demo: ${demo.title}`);
    }
    
    // Complete client-specific demos
    for (let i = 1; i <= demoCount.completeClientSpecific; i++) {
      const demo = createCompleteClientSpecificDemo(i);
      await client.json.set(`demo:${demo.id}`, '$', demo);
      console.log(`Created complete client-specific demo: ${demo.title}`);
    }
    
    // In-progress client-specific demos
    for (let i = 1; i <= demoCount.inProgressClientSpecific; i++) {
      const demo = createInProgressClientSpecificDemo(i);
      await client.json.set(`demo:${demo.id}`, '$', demo);
      console.log(`Created in-progress client-specific demo: ${demo.title}`);
    }
    
    const totalCreated = Object.values(demoCount).reduce((sum, count) => sum + count, 0);
    console.log(`Test data seeding complete! Created ${totalCreated} demo records.`);
    
  } catch (error) {
    console.error('Error in seeding process:', error);
  }
}

// Run the script
main().catch(console.error); 