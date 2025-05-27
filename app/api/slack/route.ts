import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { demoTitle, adminNotes, demoUrl, assignedTo, demoType } = body;

    // Get Slack webhook URL from environment variables
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
      console.warn("SLACK_WEBHOOK_URL not configured");
      return NextResponse.json(
        { error: "Slack webhook not configured" },
        { status: 400 }
      );
    }

    // Create Slack message payload
    const slackMessage = {
      text: `🔄 Demo Edit Request`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🔄 Demo Edit Request"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Demo Title:*\n${demoTitle}`
            },
            {
              type: "mrkdwn",
              text: `*Type:*\n${demoType === 'specific' ? 'Client-Specific' : 'General'}`
            },
            {
              type: "mrkdwn",
              text: `*Assigned To:*\n${assignedTo || 'Unassigned'}`
            },
            {
              type: "mrkdwn",
              text: `*Demo URL:*\n${demoUrl ? `<${demoUrl}|View Demo>` : 'No URL provided'}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Admin Notes:*\n\`\`\`${adminNotes}\`\`\``
          }
        },
        {
          type: "divider"
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📅 Requested at ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    // Send message to Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!slackResponse.ok) {
      throw new Error(`Slack API error: ${slackResponse.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending Slack notification:", error);
    return NextResponse.json(
      { error: "Failed to send Slack notification", details: error.message },
      { status: 500 }
    );
  }
} 