import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail } from "./emailBase";

interface CustomerWelcomePayload {
  name: string;
  email: string;
}

export const sendCustomerWelcomeEmail = async (payload: CustomerWelcomePayload): Promise<void> => {
  const { name, email } = payload;
  const clientUrl = process.env.CLIENT_URL || "";
  const brand = await getBrand();

  const features = [
    { icon: "🛍️", title: "Browse & Shop", desc: "Explore our curated collection of products." },
    { icon: "📦", title: "Track Orders", desc: "Real-time updates on every order you place." },
    { icon: "↩️", title: "Easy Returns", desc: "Hassle-free returns within our return window." },
    { icon: "🔒", title: "Secure Checkout", desc: "Your data is always encrypted and protected." },
  ];

  const featureRows = features.map(f => `
    <tr>
      <td width="40" style="padding:10px 0;vertical-align:top;font-size:20px;">${f.icon}</td>
      <td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1a1a1a;">${f.title}</p>
        <p style="margin:0;font-size:13px;color:#6c757d;line-height:1.5;">${f.desc}</p>
      </td>
    </tr>`).join("");

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">

        <!-- Greeting -->
        <h2 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px;">
          Welcome, ${name}! 🎉
        </h2>
        <p style="margin:0 0 32px;font-size:15px;color:#6c757d;line-height:1.7;">
          Your <strong style="color:#1a1a1a;">${brand.storeName}</strong> account is ready.
          We're excited to have you — here's everything you can do right away.
        </p>

        <!-- Account info box -->
        <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:18px 22px;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Your account email</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;">${email}</p>
        </div>

        <!-- Features -->
        <div style="background:#fff8f0;border:1px solid #ffe4cc;border-radius:14px;padding:20px 24px;margin-bottom:32px;">
          <p style="margin:0 0 14px;font-size:12px;font-weight:800;color:#c05621;text-transform:uppercase;letter-spacing:1px;">What you can do</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${featureRows}
          </table>
        </div>

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${clientUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 52px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(255,107,53,0.35);">
                Start Shopping →
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:#adb5bd;line-height:1.6;text-align:center;">
          Need help? We're always here at
          <a href="mailto:${brand.supportEmail}" style="color:#ff6b35;text-decoration:none;font-weight:600;">${brand.supportEmail}</a>
        </p>
      </td>
    </tr>`;

  const html = buildEmail(
    brand,
    `Welcome to ${brand.storeName}! Your account is ready — start exploring now.`,
    content
  );

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to: email,
      subject: `Welcome to ${brand.storeName} — You're all set! 🎉`,
      html,
    });
    logger.info(`Customer welcome email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send customer welcome email to ${email}:`, err);
  }
};
