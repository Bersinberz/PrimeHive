import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";
import User from "../models/User";
import mongoose from "mongoose";

interface LowStockProduct {
  name: string;
  stock: number;
  createdBy: mongoose.Types.ObjectId | string;
}

const LOW_STOCK_THRESHOLD = 15;

export const sendLowStockEmail = async (products: LowStockProduct[]): Promise<void> => {
  const lowStock = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);
  if (lowStock.length === 0) return;

  let storeName = "PrimeHive";
  let fromEmail = process.env.SMTP_USER || "noreply@primehive.com";
  const logoUrl = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

  try {
    const settings = await Settings.findOne().select("storeName supportEmail").lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) fromEmail = settings.supportEmail;
  } catch { /* non-blocking */ }

  // Group by staff
  const staffProductMap = new Map<string, LowStockProduct[]>();
  for (const p of lowStock) {
    if (!p.createdBy) continue;
    const staffId = p.createdBy.toString();
    if (!staffProductMap.has(staffId)) staffProductMap.set(staffId, []);
    staffProductMap.get(staffId)!.push(p);
  }

  if (staffProductMap.size === 0) return;

  const staffIds = [...staffProductMap.keys()].map(id => new mongoose.Types.ObjectId(id));
  const staffList = await User.find({
    _id: { $in: staffIds },
    role: "staff",
    status: "active",
    "notificationPreferences.lowStock": true,
  }).select("_id name email").lean();

  for (const staff of staffList) {
    const staffProducts = staffProductMap.get(staff._id.toString()) ?? [];
    if (staffProducts.length === 0) continue;

    const rows = staffProducts.map(p => {
      const urgency = p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#6366f1';
      const label = p.stock === 0 ? 'Out of stock' : `${p.stock} left`;
      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;font-size:14px;font-weight:600;color:#1a1a1a;">${p.name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;text-align:right;">
          <span style="font-size:12px;font-weight:700;color:${urgency};background:${urgency}18;padding:3px 10px;border-radius:20px;">${label}</span>
        </td>
      </tr>`;
    }).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">⚠️ Low stock alert — ${staffProducts.length} product(s) need restocking.</span>
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
            <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#1a1a1a;">⚠️ Low Stock Alert</p>
            <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
              Hey ${staff.name}, the following product(s) are running low and may need restocking soon.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <th style="text-align:left;font-size:11px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Product</th>
                <th style="text-align:right;font-size:11px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Stock</th>
              </tr>
              ${rows}
            </table>

            <div style="background:#fffbf0;border:1px solid #ffe4b5;border-radius:10px;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                <strong>Threshold:</strong> Products with fewer than ${LOW_STOCK_THRESHOLD} units trigger this alert. Please restock to avoid missed sales.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px 28px;border-top:1px solid #f0f0f2;text-align:center;">
            <p style="margin:0;font-size:12px;color:#bbb;">You're receiving this because you have low stock alerts enabled in your account settings.</p>
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
        subject: `⚠️ Low Stock Alert — ${staffProducts.length} product(s) need attention`,
        html,
      });
      logger.info(`Low stock alert sent to staff ${staff.email}`);
    } catch (err) {
      logger.error(`Failed to send low stock alert to ${staff.email}:`, err);
    }
  }
};
