import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail } from "./emailBase";

interface VerificationEmailPayload {
  name: string;
  email: string;
  token: string;
}

export const sendVerificationEmail = async (payload: VerificationEmailPayload): Promise<void> => {
  const { name, email, token } = payload;
  const clientUrl = process.env.CLIENT_URL || "";
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
  const brand = await getBrand();

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">Verify your email address</h2>
        <p style="margin:0 0 28px;font-size:15px;color:#6c757d;line-height:1.7;">
          Hi <strong style="color:#1a1a1a;">${name}</strong>, thanks for signing up.
          Please confirm your email address to activate your account and start shopping.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr>
            <td align="center">
              <a href="${verifyUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(255,107,53,0.35);">
                Verify Email Address
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry notice -->
        <div style="background:#fff8f0;border:1px solid #ffe4cc;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#c05621;line-height:1.6;">
            <strong>⏱ This link expires in 24 hours.</strong>
            If it expires, you can request a new verification email from your account settings.
          </p>
        </div>

        <!-- Fallback link -->
        <p style="margin:0 0 6px;font-size:12px;color:#adb5bd;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="margin:0;font-size:11px;word-break:break-all;">
          <a href="${verifyUrl}" style="color:#ff6b35;text-decoration:none;">${verifyUrl}</a>
        </p>

        <hr style="border:none;border-top:1px solid #f0f0f2;margin:28px 0;"/>
        <p style="margin:0;font-size:13px;color:#adb5bd;line-height:1.6;">
          If you didn't create an account with ${brand.storeName}, you can safely ignore this email.
          Your email address will not be used without verification.
        </p>
      </td>
    </tr>`;

  const html = buildEmail(
    brand,
    `Verify your email to activate your ${brand.storeName} account.`,
    content
  );

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to: email,
      subject: `Verify your email — ${brand.storeName}`,
      html,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification email to ${email}:`, err);
    throw err;
  }
};
