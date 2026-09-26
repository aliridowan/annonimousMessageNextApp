import { resend } from "@/lib/resend";
import { VarificationEmail } from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {
  try {
    // Resend returns failures in `error` instead of throwing
    const { error } = await resend.emails.send({
      // Must be an address on a domain verified in Resend
      from: process.env.RESEND_FROM_EMAIL || "True Feedback <no-reply@mail.aliridowan.com>",
      to: email,
      subject: "True Feedback | Verification Code",
      react: VarificationEmail({ username, otp: verifyCode }),
    });

    if (error) {
      console.error("Resend rejected verification email", error);
      return { success: false, message: `Error sending verification email: ${error.message}` };
    }

    return { success: true, message: "verification email send successfully" };

  } catch (error) {
    console.error("Error sending verification email", error);
    return { success: false, message: "Error sending verification email" };
  }
}
