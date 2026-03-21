import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";

interface PasswordChangedPayload {
  name: string;
  email: string;
}

export const sendPasswordChangedEmail = async (payload: PasswordChangedPayload): Promise<void> => {
  const { name, email } = payload;
  const logoUrl = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

  let storeName = "PrimeHive";
  let fromEmail = process.env.SMTP_USER || "noreply@primehive.com";
  let supportEmail = fromEmail;

  try {
    const settings = await Settings.findOne().select("storeName supportEmail").lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) { fromEmail = settings.supportEmail; supportEmail = settings.supportEmail; }
  } catch { /* non-blocking */ }

  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata",
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">Your ${storeName} password was changed — if this wasn't you, act now.</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:linear-gradient(135deg,#ff6b35,#ff8c42);padding:28px 40px;text-align:center;">
            <img src="${logoUrl}" alt="${storeName} Logo" width="44" height="44" style="border-radius:12px;display:block;margin:0 auto 10px;"/>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">${storeName}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#1a1a1a;">🔐 Password Changed</p>
            <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
              Hi ${name}, your password for <strong>${storeName}</strong> was successfully changed.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e8eaff;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:18px 22px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:4px;">Account</td>
                    <td style="font-size:12px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:4px;text-align:right;">Changed at</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;font-weight:700;color:#1a1a1a;">${email}</td>
                    <td style="font-size:14px;font-weight:700;color:#1a1a1a;text-align:right;">${now}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.7;">
                <strong>Wasn't you?</strong> If you didn't make this change, your account may be compromised.
                Please contact our support team immediately at
                <a href="mailto:${supportEmail}" style="color:#ef4444;font-weight:700;">${supportEmail}</a>.
              </p>
            </div>

            <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">
              If you made this change, no further action is needed. Keep your password safe and never share it with anyone.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px 28px;border-top:1px solid #f0f0f2;text-align:center;">
            <p style="margin:0;font-size:12px;color:#bbb;">
              This is an automated security notification from ${storeName}. If you didn't create this account, please contact our support team immediately.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await getTransporter().sendMail({
      from: `"${storeName}" <${fromEmail}>`,
      to: email,
      subject: `Your ${storeName} password was changed`,
      html,
    });
    logger.info(`Password changed email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send password changed email to ${email}:`, err);
  }
};
