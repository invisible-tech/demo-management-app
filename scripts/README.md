# Demo Management App Scripts

This directory contains utility scripts for managing and working with the demo database.

## Prerequisites

Before running these scripts, make sure you have the required dependencies:

```
npm install @upstash/redis uuid dotenv @types/uuid
```

Also, make sure you have a `.env.local` file in the root directory with your Upstash Redis connection credentials:

```
UPSTASH_REDIS_REST_URL=https://your-upstash-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

## Available Scripts

### Data Cleanup Script

`data-cleanup.js` - Takes production data and cleans it up to match the current schema.

This script:
- Converts string tags to arrays
- Sets default types (general/specific)
- Fixes status based on available resources (URL, script, recording)
- Ensures all required fields are present

To run:

```bash
node scripts/data-cleanup.js
```

### Seed Test Data Script

`seed-test-data.js` - Populates the database with test demo data for development purposes.

This script creates:
- General complete demos
- General in-progress demos
- Client-specific complete demos
- Client-specific in-progress demos

Each demo will have appropriate data for its category and randomly selected attributes.

To run:

```bash
# To add to existing data
node scripts/seed-test-data.js

# To clear existing data first
node scripts/seed-test-data.js --clear
```

### Generate Bad Data Script

`generate-bad-data.js` - Creates intentionally malformed data to test the data-cleanup script.

This script generates demos with various issues:
- Tags as strings instead of arrays
- Missing required fields
- Wrong status values
- Inconsistent type values
- Demos with incorrect completion status
- Null or undefined values

To run:

```bash
# Create 16 bad demo records (default)
node scripts/generate-bad-data.js

# Clear existing data and create bad records
node scripts/generate-bad-data.js --clear

# Specify the number of bad records to create
node scripts/generate-bad-data.js --count 24
```

After generating bad data, run the data-cleanup script to fix the issues:

```bash
node scripts/data-cleanup.js
```

## Redis Data Structure

The demo data is stored in Redis using RedisJSON with the following key structure:

- Keys: `demo:{uuid}`
- Value: JSON object representing the demo

## Troubleshooting

If you encounter errors:

1. Ensure your Upstash Redis database is configured properly
2. Check your `.env.local` file for the correct Upstash Redis credentials
3. Ensure you have the required dependencies installed
4. Make sure your Upstash Redis instance has the RedisJSON module enabled 