import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";

interface CustomerWelcomePayload {
  name: string;
  email: string;
}

export const sendCustomerWelcomeEmail = async (payload: CustomerWelcomePayload): Promise<void> => {
  const { name, email } = payload;
  const clientUrl = process.env.CLIENT_URL || "";
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
  <title>Welcome to ${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <!-- Preheader (shows in Gmail/Outlook preview) -->
  <span style="display:none;max-height:0;overflow:hidden;">Welcome to ${storeName}! Your account is ready — start exploring now.</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b35,#ff8c42);padding:32px 40px;text-align:center;">
              <img src="${logoUrl}" alt="${storeName} Logo" width="52" height="52" style="border-radius:14px;display:block;margin:0 auto 12px;" />
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">${storeName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a1a1a;">Hey ${name}, welcome aboard!</p>
              <p style="margin:0 0 28px;font-size:15px;color:#666;line-height:1.6;">
                Your account on <strong>${storeName}</strong> is ready. Start exploring our collection and find something you'll love.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e8eaff;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Your account email</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-weight:700;">${email}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${clientUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 44px;border-radius:50px;letter-spacing:0.3px;">
                      Explore Products →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f0f0f2;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px;">What you can do</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["🛍️", "Browse & buy products from our curated collection"],
                        ["📦", "Track your orders in real time"],
                        ["💬", "Reach out to us anytime for support"],
                      ].map(([icon, text]) => `
                      <tr>
                        <td width="28" style="padding:5px 0;vertical-align:top;font-size:16px;">${icon}</td>
                        <td style="padding:5px 0;font-size:14px;color:#555;line-height:1.5;">${text}</td>
                      </tr>`).join("")}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Trust signals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  ${[
                    ["🔒", "Secure Checkout", "SSL-encrypted payments"],
                    ["🚚", "Fast Delivery", "Reliable shipping partners"],
                    ["↩️", "Easy Returns", "Hassle-free return policy"],
                  ].map(([icon, title, sub]) => `
                  <td align="center" style="padding:0 8px;">
                    <div style="font-size:20px;margin-bottom:6px;">${icon}</div>
                    <p style="margin:0 0 2px;font-size:12px;font-weight:700;color:#1a1a1a;">${title}</p>
                    <p style="margin:0;font-size:11px;color:#aaa;">${sub}</p>
                  </td>`).join("")}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f0f0f2;text-align:center;">
              <p style="margin:0;font-size:12px;color:#bbb;">
                This email was sent because you created an account on ${storeName}. If you didn't create this account, please contact our support team immediately.
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
      subject: `Welcome to ${storeName} — You're all set!`,
      html,
    });
    logger.info(`Customer welcome email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send customer welcome email to ${email}:`, err);
  }
};
