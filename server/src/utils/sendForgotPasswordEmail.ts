import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail } from "./emailBase";

interface ForgotPasswordPayload {
  name: string;
  email: string;
  rawToken: string;
}

export const sendForgotPasswordEmail = async (payload: ForgotPasswordPayload): Promise<void> => {
  const { name, email, rawToken } = payload;
  const clientUrl = process.env.CLIENT_URL || "";
  const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;
  const brand = await getBrand();

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">

        <!-- Icon + heading -->
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;width:72px;height:72px;border-radius:50%;background:rgba(255,107,53,0.1);line-height:72px;font-size:32px;margin-bottom:16px;">🔑</div>
          <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">Reset Your Password</h2>
          <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
            Hi <strong style="color:#1a1a1a;">${name}</strong>, we received a request to reset your password.
          </p>
        </div>

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${resetLink}"
                style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 52px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(255,107,53,0.35);">
                Reset Password →
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry warning -->
        <div style="background:#fff8f0;border:1px solid #ffe4cc;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#c05621;line-height:1.6;">
            <strong>⏱ This link expires in 1 hour.</strong>
            After that, you'll need to request a new password reset.
          </p>
        </div>

        <!-- Security notice -->
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.7;">
            <strong>Didn't request this?</strong> If you didn't ask to reset your password,
            please ignore this email. Your account remains secure and no changes have been made.
            If you're concerned, contact us at
            <a href="mailto:${brand.supportEmail}" style="color:#ef4444;font-weight:700;text-decoration:none;">${brand.supportEmail}</a>.
          </p>
        </div>

        <!-- Fallback link -->
        <p style="margin:0 0 6px;font-size:12px;color:#adb5bd;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="margin:0;font-size:11px;word-break:break-all;">
          <a href="${resetLink}" style="color:#ff6b35;text-decoration:none;">${resetLink}</a>
        </p>

      </td>
    </tr>`;

  const html = buildEmail(
    brand,
    `Reset your ${brand.storeName} password — link expires in 1 hour.`,
    content
  );

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to: email,
      subject: `Reset your ${brand.storeName} password`,
      html,
    });
    logger.info(`Forgot password email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send forgot password email to ${email}:`, err);
    throw err;
  }
};
