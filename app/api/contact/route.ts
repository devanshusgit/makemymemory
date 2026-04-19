import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // TODO: Send via Nodemailer / Resend / SendGrid
    // Example with Resend:
    // await resend.emails.send({
    //   from: "noreply@makemymemory.in",
    //   to: "hello@makemymemory.in",
    //   subject: `New contact: ${subject ?? "General Enquiry"} from ${name}`,
    //   text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    // });

    console.log("Contact form submission:", { name, email, subject, message });

    return NextResponse.json(
      { success: true, message: "Message received. We'll get back to you soon!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
