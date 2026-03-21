import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";
import User from "../models/User";
import mongoose from "mongoose";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderNotificationPayload {
  orderId: string;
  totalAmount: number;
  customerName: string;
  items: (OrderItem & { createdBy?: mongoose.Types.ObjectId | string })[];
}

export const sendOrderNotificationEmail = async (payload: OrderNotificationPayload): Promise<void> => {
  const { orderId, totalAmount, customerName, items } = payload;

  let storeName = "PrimeHive";
  let fromEmail = process.env.SMTP_USER || "noreply@primehive.com";
  const logoUrl = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

  try {
    const settings = await Settings.findOne().select("storeName supportEmail").lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) fromEmail = settings.supportEmail;
  } catch { /* non-blocking */ }

  // Group items by createdBy staff
  const staffItemMap = new Map<string, OrderItem[]>();
  for (const item of items) {
    if (!item.createdBy) continue;
    const staffId = item.createdBy.toString();
    if (!staffItemMap.has(staffId)) staffItemMap.set(staffId, []);
    staffItemMap.get(staffId)!.push(item);
  }

  if (staffItemMap.size === 0) return;

  // Fetch all relevant staff who have orderPlaced notification enabled
  const staffIds = [...staffItemMap.keys()].map(id => new mongoose.Types.ObjectId(id));
  const staffList = await User.find({
    _id: { $in: staffIds },
    role: "staff",
    status: "active",
    "notificationPreferences.orderPlaced": true,
  }).select("_id name email notificationPreferences").lean();

  for (const staff of staffList) {
    const staffItems = staffItemMap.get(staff._id.toString()) ?? [];
    if (staffItems.length === 0) continue;

    const itemRows = staffItems.map(item => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f2;">
          <span style="font-size:14px;font-weight:600;color:#1a1a1a;">${item.name}</span>
          <span style="font-size:12px;color:#aaa;margin-left:8px;">×${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f2;text-align:right;font-size:14px;font-weight:700;color:#1a1a1a;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>`).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">New order ${orderId} — a customer just bought your product(s).</span>
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
            <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#1a1a1a;">🛍️ New Order Received!</p>
            <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
              Hey ${staff.name}, a customer just placed an order containing your product(s).
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e8eaff;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Order ID</p>
                <p style="margin:0;font-size:16px;font-weight:900;color:#6366f1;">${orderId}</p>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <th style="text-align:left;font-size:11px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Your Items</th>
                <th style="text-align:right;font-size:11px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Amount</th>
              </tr>
              ${itemRows}
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f0f0f2;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <div style="display:flex;justify-content:space-between;">
                  <span style="font-size:13px;color:#666;font-weight:600;">Ordered by</span>
                  <span style="font-size:13px;color:#1a1a1a;font-weight:700;">${customerName}</span>
                </div>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px 28px;border-top:1px solid #f0f0f2;text-align:center;">
            <p style="margin:0;font-size:12px;color:#bbb;">You're receiving this because you have order notifications enabled in your account settings.</p>
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
        to: staff.email,
        subject: `New Order ${orderId} — ${storeName}`,
        html,
      });
      logger.info(`Order notification sent to staff ${staff.email} for order ${orderId}`);
    } catch (err) {
      logger.error(`Failed to send order notification to ${staff.email}:`, err);
    }
  }
};
