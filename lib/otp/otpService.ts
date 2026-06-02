import { OTP, IOTP } from "@/lib/db/models/Otp";
import { generateOtp, verifyOtpExpiry, sendOtpEmail, sendOtpSms } from "@/lib/notifications/notificationService";

export interface OTPRequest {
  email: string;
  phone?: string;
  type: "password_reset" | "login" | "account_deletion" | "email_verification";
  method: "email" | "sms" | "both";
}

export interface OTPVerification {
  valid: boolean;
  message: string;
  data?: any;
}

/**
 * Create and send OTP
 */
export async function createAndSendOtp(request: OTPRequest): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔐 Creating OTP for:", { email: request.email, type: request.type, method: request.method });

    // Generate OTP code
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const otp = await OTP.create({
      email: request.email,
      phone: request.phone,
      code,
      type: request.type,
      isUsed: false,
      expiresAt,
    });

    console.log(`✓ OTP created: ${code} for ${request.email}`);

    // Send via email
    if (request.method === "email" || request.method === "both") {
      const emailSent = await sendOtpEmail(request.email, code);
      if (!emailSent && request.method === "email") {
        return {
          success: false,
          message: "Failed to send OTP email. Please try again.",
        };
      }
    }

    // Send via SMS
    if ((request.method === "sms" || request.method === "both") && request.phone) {
      const smsSent = await sendOtpSms(request.phone, code);
      if (!smsSent && request.method === "sms") {
        return {
          success: false,
          message: "Failed to send OTP SMS. Please try again.",
        };
      }
    }

    return {
      success: true,
      message: `OTP sent via ${request.method}. Valid for 10 minutes.`,
    };
  } catch (error) {
    console.error("❌ Error creating OTP:", error);
    return {
      success: false,
      message: "Failed to create OTP. Please try again.",
    };
  }
}

/**
 * Verify OTP
 */
export async function verifyOtp(
  email: string,
  code: string,
  type: string
): Promise<OTPVerification> {
  try {
    console.log("🔍 Verifying OTP:", { email, type, code: code.substring(0, 3) + "***" });

    // Find OTP
    const otp = await OTP.findOne({
      email: email.toLowerCase(),
      code,
      type,
      isUsed: false,
    });

    if (!otp) {
      console.error("❌ OTP not found or already used");
      return {
        valid: false,
        message: "Invalid OTP code.",
      };
    }

    // Check expiry
    if (!verifyOtpExpiry(otp.createdAt, 10)) {
      console.error("❌ OTP expired");
      return {
        valid: false,
        message: "OTP has expired. Please request a new one.",
      };
    }

    // Mark as used
    otp.isUsed = true;
    otp.usedAt = new Date();
    await otp.save();

    console.log("✓ OTP verified successfully");

    return {
      valid: true,
      message: "OTP verified successfully.",
      data: { otpId: otp._id },
    };
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return {
      valid: false,
      message: "Error verifying OTP. Please try again.",
    };
  }
}

/**
 * Resend OTP
 */
export async function resendOtp(
  email: string,
  type: string,
  method: "email" | "sms" | "both",
  phone?: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔄 Resending OTP:", { email, type, method });

    // Delete old OTPs
    await OTP.deleteMany({
      email: email.toLowerCase(),
      type,
      isUsed: false,
    });

    // Create new OTP
    return createAndSendOtp({
      email,
      phone,
      type: type as any,
      method,
    });
  } catch (error) {
    console.error("❌ Error resending OTP:", error);
    return {
      success: false,
      message: "Failed to resend OTP. Please try again.",
    };
  }
}

/**
 * Get OTP details (for admin/debugging)
 */
export async function getOtpDetails(email: string, type: string): Promise<Partial<IOTP> | null> {
  try {
    const otp = await OTP.findOne({
      email: email.toLowerCase(),
      type,
      isUsed: false,
    }).select("code email type createdAt expiresAt");

    return otp || null;
  } catch (error) {
    console.error("❌ Error getting OTP details:", error);
    return null;
  }
}

/**
 * Clean up expired OTPs
 */
export async function cleanupExpiredOtps(): Promise<number> {
  try {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    console.log(`✓ Cleaned up ${result.deletedCount} expired OTPs`);
    return result.deletedCount;
  } catch (error) {
    console.error("❌ Error cleaning up OTPs:", error);
    return 0;
  }
}
