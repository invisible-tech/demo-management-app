import { NextRequest, NextResponse } from 'next/server';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

// Initialize Mailgun client on the server side
const mg = new Mailgun(FormData);
const mailgun = mg.client({
  username: "api",
  key: process.env.MG_REST_API_TOKEN || "",
});
console.log(process.env.MG_REST_API_TOKEN)
// Email notification route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html } = body;
    
    if (!process.env.MG_REST_API_TOKEN) {
      console.error('Mailgun API token not found in environment variables');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    // Send email using Mailgun
    const result = await mailgun.messages.create(
      process.env.MG_DOMAIN || 'mail.example.com', 
      {
        from: process.env.MG_FROM_EMAIL || 'demo-app@example.com',
        to: to,
        subject: subject,
        text: text,
        html: html,
      }
    );
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 