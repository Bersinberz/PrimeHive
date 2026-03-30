import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail } from "./emailBase";

interface StaffWelcomePayload {
  name: string;
  email: string;
  rawToken: string;
}

export const sendStaffWelcomeEmail = async (payload: StaffWelcomePayload): Promise<void> => {
  const { name, email, rawToken } = payload;
  const clientUrl = process.env.CLIENT_URL || "";
  const setupLink = `${clientUrl}/set-password?token=${rawToken}`;
  const brand = await getBrand();

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">

        <!-- Greeting -->
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">
          Welcome to the team, ${name}!
        </h2>
        <p style="margin:0 0 28px;font-size:15px;color:#6c757d;line-height:1.7;">
          Your staff account on <strong style="color:#1a1a1a;">${brand.storeName}</strong> has been created by an administrator.
          To get started, you need to set a secure password for your account.
        </p>

        <!-- Account info -->
        <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:18px 22px;margin-bottom:28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Your login email</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;">${email}</p>
              </td>
              <td align="right">
                <span style="display:inline-block;background:rgba(255,107,53,0.1);color:#ff6b35;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">Staff Account</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${setupLink}"
                style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(255,107,53,0.35);">
                Set Your Password →
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry warning -->
        <div style="background:#fff8f0;border:1px solid #ffe4cc;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#c05621;line-height:1.6;">
            <strong>⏱ This link expires in 24 hours.</strong>
            If it expires, contact your administrator to resend the setup email.
          </p>
        </div>

        <!-- Fallback link removed for security -->

        <hr style="border:none;border-top:1px solid #f0f0f2;margin:0 0 24px;"/>
        <p style="margin:0;font-size:13px;color:#adb5bd;line-height:1.6;">
          If you believe this email was sent in error, please contact
          <a href="mailto:${brand.supportEmail}" style="color:#ff6b35;text-decoration:none;font-weight:600;">${brand.supportEmail}</a> immediately.
        </p>
      </td>
    </tr>`;

  const html = buildEmail(
    brand,
    `Your ${brand.storeName} staff account is ready — set your password to get started.`,
    content
  );

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to: email,
      subject: `Welcome to ${brand.storeName} — Set Up Your Password`,
      html,
    });
    logger.info(`Staff welcome email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send staff welcome email to ${email}:`, err);
  }
};
