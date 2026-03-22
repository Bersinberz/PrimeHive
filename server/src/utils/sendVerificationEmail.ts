import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";

interface VerificationEmailPayload {
  name: string;
  email: string;
  token: string;
}

export const sendVerificationEmail = async (payload: VerificationEmailPayload): Promise<void> => {
  const { name, email, token } = payload;
  const clientUrl = process.env.CLIENT_URL || "";
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
  const logoUrl = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

  let storeName = "PrimeHive";
  let fromEmail = process.env.SMTP_USER || "noreply@primehive.com";
  try {
    const settings = await Settings.findOne().select("storeName supportEmail").lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) fromEmail = settings.supportEmail;
  } catch {
    // non-blocking
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email — ${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">Verify your email address to secure your ${storeName} account.</span>
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
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a1a1a;">Verify your email</p>
              <p style="margin:0 0 28px;font-size:15px;color:#666;line-height:1.6;">
                Hi <strong>${name}</strong>, click the button below to verify your email address. This link expires in <strong>24 hours</strong>.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 44px;border-radius:50px;letter-spacing:0.3px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#aaa;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f0f0f2;text-align:center;">
              <p style="margin:0;font-size:12px;color:#bbb;">
                © ${new Date().getFullYear()} ${storeName}. All rights reserved.
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
      subject: `Verify your email — ${storeName}`,
      html,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification email to ${email}:`, err);
    throw err; // re-throw so the controller can return a 500
  }
};
