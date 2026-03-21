import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";

interface StaffWelcomePayload {
  name: string;
  email: string;
  rawToken: string;
}

export const sendStaffWelcomeEmail = async (payload: StaffWelcomePayload): Promise<void> => {
  const { name, email, rawToken } = payload;
  const clientUrl = process.env.CLIENT_URL || "";
  const setupLink = `${clientUrl}/set-password?token=${rawToken}`;
  const logoUrl = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

  // Fetch store name + support email from DB (fall back to env/defaults)
  let storeName = "PrimeHive";
  let fromEmail = process.env.SMTP_USER || "noreply@primehive.com";
  try {
    const settings = await Settings.findOne().select("storeName supportEmail").lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) fromEmail = settings.supportEmail;
  } catch {
    // non-blocking — use defaults
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to ${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b35,#ff8c42);padding:32px 40px;text-align:center;">
              <img src="${logoUrl}" alt="${storeName}" width="52" height="52" style="border-radius:14px;display:block;margin:0 auto 12px;" />
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">${storeName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a1a1a;">Welcome, ${name}!</p>
              <p style="margin:0 0 28px;font-size:15px;color:#666;line-height:1.6;">
                Your account on <strong>${storeName}</strong> has been created.
                To get started, set your own password using the button below.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e8eaff;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Your login email</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-weight:700;">${email}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${setupLink}" style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 44px;border-radius:50px;letter-spacing:0.3px;">
                      Set Your Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Warning -->
              <p style="margin:0;font-size:13px;color:#999;line-height:1.6;background:#fffbf0;border:1px solid #ffe4b5;border-radius:10px;padding:14px 18px;">
                <strong style="color:#f59e0b;">This link expires in 24 hours.</strong>
                If it expires, contact your administrator to resend the setup email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f0f0f2;text-align:center;">
              <p style="margin:0;font-size:12px;color:#bbb;">
                This email was sent automatically by ${storeName}. If you believe this was a mistake, please ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await getTransporter().sendMail({
      from: `"${storeName}" <${fromEmail}>`,
      to: email,
      subject: `Welcome to ${storeName} — Set Up Your Password`,
      html,
    });
    logger.info(`Staff welcome email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send staff welcome email to ${email}:`, err);
  }
};
