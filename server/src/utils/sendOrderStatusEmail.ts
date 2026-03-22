import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";

interface OrderStatusEmailPayload {
  to: string;
  customerName: string;
  orderId: string;
  newStatus: string;
  note?: string;
}

const STATUS_META: Record<string, { icon: string; color: string; bg: string; message: string }> = {
  Paid: {
    icon: "💳",
    color: "#6d28d9",
    bg: "#f5f3ff",
    message: "Your payment has been received and confirmed.",
  },
  Processing: {
    icon: "⚙️",
    color: "#0891b2",
    bg: "#ecfeff",
    message: "We're preparing your order for shipment.",
  },
  Shipped: {
    icon: "🚚",
    color: "#2563eb",
    bg: "#eff6ff",
    message: "Your order is on its way to you.",
  },
  Delivered: {
    icon: "✅",
    color: "#15803d",
    bg: "#f0fdf4",
    message: "Your order has been delivered. Enjoy your purchase!",
  },
  Cancelled: {
    icon: "❌",
    color: "#dc2626",
    bg: "#fef2f2",
    message: "Your order has been cancelled. If you have questions, please contact support.",
  },
  Refunded: {
    icon: "↩️",
    color: "#b45309",
    bg: "#fffbeb",
    message: "Your refund has been initiated. It may take 5–7 business days to reflect.",
  },
};

export const sendOrderStatusEmail = async (payload: OrderStatusEmailPayload): Promise<void> => {
  const { to, customerName, orderId, newStatus, note } = payload;

  let storeName = "PrimeHive";
  let fromEmail = process.env.SMTP_USER || "noreply@primehive.com";
  let supportEmail = fromEmail;
  const logoUrl = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

  try {
    const settings = await Settings.findOne().select("storeName supportEmail").lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) { fromEmail = settings.supportEmail; supportEmail = settings.supportEmail; }
  } catch { /* non-blocking */ }

  const meta = STATUS_META[newStatus] || {
    icon: "📦",
    color: "#ff6b35",
    bg: "#fff7f0",
    message: `Your order status has been updated to ${newStatus}.`,
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Update — ${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">Your order ${orderId} status has been updated to ${newStatus}.</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:36px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 28px rgba(0,0,0,0.09);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ff6b35,#ff8c42);padding:28px 36px;text-align:center;">
            <img src="${logoUrl}" alt="${storeName}" width="44" height="44"
              style="border-radius:10px;display:block;margin:0 auto 10px;"/>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">${storeName}</h1>
            <p style="margin:5px 0 0;color:rgba(255,255,255,0.82);font-size:12px;letter-spacing:0.5px;">ORDER STATUS UPDATE</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 36px 0;">
            <p style="margin:0;font-size:15px;color:#444;line-height:1.6;">
              Hi <strong style="color:#1a1a1a;">${customerName}</strong>,
            </p>
            <p style="margin:8px 0 0;font-size:14px;color:#666;line-height:1.6;">
              There's an update on your order <strong style="color:#1a1a1a;">${orderId}</strong>.
            </p>
          </td>
        </tr>

        <!-- Status card -->
        <tr>
          <td style="padding:20px 36px;">
            <div style="background:${meta.bg};border:1.5px solid ${meta.color}22;border-radius:14px;padding:22px 24px;text-align:center;">
              <div style="font-size:36px;margin-bottom:10px;">${meta.icon}</div>
              <p style="margin:0 0 6px;font-size:11px;font-weight:800;color:${meta.color};text-transform:uppercase;letter-spacing:1.2px;">Status Updated</p>
              <h2 style="margin:0 0 10px;font-size:26px;font-weight:900;color:${meta.color};letter-spacing:-0.5px;">${newStatus}</h2>
              <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">${meta.message}</p>
              ${note ? `<p style="margin:12px 0 0;font-size:12px;color:#888;font-style:italic;background:#fff;border-radius:8px;padding:8px 12px;">"${note}"</p>` : ""}
            </div>
          </td>
        </tr>

        <!-- Order ID pill -->
        <tr>
          <td style="padding:0 36px 24px;text-align:center;">
            <div style="display:inline-block;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:10px 20px;">
              <p style="margin:0 0 2px;font-size:9px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
              <p style="margin:0;font-size:16px;font-weight:900;color:#6d28d9;">${orderId}</p>
            </div>
          </td>
        </tr>

        <!-- Footer note -->
        <tr>
          <td style="padding:16px 36px 24px;border-top:1px solid #f0f0f2;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#888;">
              You can track your order status in your account.
            </p>
            <p style="margin:0;font-size:11px;color:#bbb;">
              Questions? <a href="mailto:${supportEmail}" style="color:#ff6b35;text-decoration:none;font-weight:600;">${supportEmail}</a>
            </p>
          </td>
        </tr>

        <!-- Bottom bar -->
        <tr>
          <td style="background:#f8f8f8;padding:12px 36px;border-top:1px solid #f0f0f2;text-align:center;">
            <p style="margin:0;font-size:10px;color:#ccc;">
              &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
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
      to,
      subject: `Order Update: ${orderId} is now ${newStatus} — ${storeName}`,
      html,
    });
    logger.info(`Order status email sent to ${to} for order ${orderId} → ${newStatus}`);
  } catch (err) {
    logger.error(`Failed to send order status email to ${to}:`, err);
  }
};
