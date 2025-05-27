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
- **Integrations**: Slack notifications for admin actions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Upstash Redis account (for database)
- Slack workspace (optional, for notifications)

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
   SLACK_WEBHOOK_URL=your-slack-webhook-url  # Optional
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Slack Integration Setup

The app can send notifications to a Slack channel when admins request edits on demos. To set this up:

### 1. Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Demo Management Bot") and select your workspace

### 2. Enable Incoming Webhooks

1. In your app settings, go to "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" to On
3. Click "Add New Webhook to Workspace"
4. Select the channel where you want notifications (e.g., #demo-requests)
5. Copy the webhook URL

### 3. Configure Environment Variable

Add the webhook URL to your `.env.local` file:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 4. Notification Features

When an admin requests edits on a demo, the Slack channel will receive a formatted message containing:
- Demo title and type
- Assigned team member
- Admin notes with requested changes
- Demo URL (if available)
- Timestamp

**Note**: Slack integration is optional. The app will work normally without it, but notifications won't be sent.

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Create a new project on Vercel and connect it to your GitHub repository
3. Add the environment variables in the Vercel project settings:
   - `UPSTASH_REDIS_REST_URL` (required)
   - `UPSTASH_REDIS_REST_TOKEN` (required)
   - `SLACK_WEBHOOK_URL` (optional, for notifications)
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
