# Demo Management App

A comprehensive application for managing company demos, tracking demo requests, and streamlining the demo creation process.

## Features

- **View Demos**: Browse all demos with search and filtering capabilities
- **Request Demos**: Submit requests for new demos
- **Track Status**: Monitor the progress of requested demos
- **Admin Interface**: Assign demos to demo makers, update status, manage the demo lifecycle
- **Submit Demos**: Add completed demos to the repository
- **How to Demo**: Guidelines and best practices for creating effective demos

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, React Hook Form
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Upstash Redis
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Upstash Redis account (for database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd demo-management-app
   npm install
   ```
3. Create a `.env.local` file using the `.env.local.example` as a template:
   ```
   UPSTASH_REDIS_REST_URL=your-upstash-url
   UPSTASH_REDIS_REST_TOKEN=your-upstash-token
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Create a new project on Vercel and connect it to your GitHub repository
3. Add the environment variables (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) in the Vercel project settings
4. Deploy the project

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/app/api` - API routes for demo CRUD operations
- `/components` - Reusable React components
- `/lib` - Utilities, database functions, and schemas

## Using the App

### Requesting a Demo

1. Navigate to the "Request Demo" page
2. Fill out the form with demo details
3. Submit the request

### Admin Workflow

1. Admin assigns the demo to a demo maker
2. Demo maker creates the demo and updates its status
3. When ready, the demo is marked as delivered
4. The demo can be archived when no longer needed

### Submitting a Demo

1. Navigate to the "Submit Demo" page
2. Fill out the form with demo details, including URL and access information
3. Submit the demo to add it to the repository

## License

MIT
