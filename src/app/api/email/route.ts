// Importing necessary modules and components
import { EmailTemplate } from "@/components/emails/FirstEmail";
import { resend } from "@/lib/email/index";
import { emailSchema } from "@/lib/email/utils";
import { NextResponse } from "next/server";

// This function handles POST requests
export async function POST(request: Request) {
  // Parse the request body to JSON
  const body = await request.json();
  
  // Validate and extract name and email from the request body
  const { name, email } = emailSchema.parse(body);
  
  try {
    // Attempt to send an email using the 'resend' library
    const data = await resend.emails.send({
      from: "Test <onboarding@resend.dev>", // Sender's email
      to: [email], // Recipient's email
      subject: "Hello world!", // Email subject
      react: EmailTemplate({ firstName: name }), // Email body (HTML)
      text: "Email powered by Resend.", // Email body (plain text)
    });

    // If email sending is successful, return the response data
    return NextResponse.json(data);
  } catch (error) {
    // If there's an error, return the error
    return NextResponse.json({ error });
  }
}