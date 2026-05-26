import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const data = await resend.emails.send({
      from: "Make My Memory <orders@makemymemory.in>",
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@makemymemory.in";
