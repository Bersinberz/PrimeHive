import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail } from "./emailBase";
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

  const brand = await getBrand();

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
      const isOut = p.stock === 0;
      const isCritical = p.stock > 0 && p.stock <= 5;
      const color = isOut ? "#dc2626" : isCritical ? "#d97706" : "#6366f1";
      const bg = isOut ? "#fef2f2" : isCritical ? "#fffbeb" : "#eef2ff";
      const border = isOut ? "#fecaca" : isCritical ? "#fde68a" : "#c7d2fe";
      const label = isOut ? "Out of Stock" : `${p.stock} left`;

      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:14px;font-weight:600;color:#1a1a1a;vertical-align:middle;">${p.name}</td>
        <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;text-align:right;vertical-align:middle;">
          <span style="display:inline-block;background:${bg};border:1px solid ${border};color:${color};font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;">${label}</span>
        </td>
      </tr>`;
    }).join("");

    const outCount = staffProducts.filter(p => p.stock === 0).length;
    const criticalCount = staffProducts.filter(p => p.stock > 0 && p.stock <= 5).length;

    const content = `
      <tr>
        <td style="padding:40px 40px 32px;">

          <!-- Alert heading -->
          <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">⚠️ Low Stock Alert</h2>
          <p style="margin:0 0 28px;font-size:15px;color:#6c757d;line-height:1.7;">
            Hey <strong style="color:#1a1a1a;">${staff.name}</strong>,
            ${staffProducts.length} of your product(s) are running low and may need restocking soon.
          </p>

          <!-- Summary badges -->
          <div style="display:flex;gap:12px;margin-bottom:24px;">
            ${outCount > 0 ? `
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 18px;flex:1;text-align:center;">
              <p style="margin:0 0 4px;font-size:20px;font-weight:900;color:#dc2626;">${outCount}</p>
              <p style="margin:0;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.8px;">Out of Stock</p>
            </div>` : ""}
            ${criticalCount > 0 ? `
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 18px;flex:1;text-align:center;">
              <p style="margin:0 0 4px;font-size:20px;font-weight:900;color:#d97706;">${criticalCount}</p>
              <p style="margin:0;font-size:11px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.8px;">Critical (≤5)</p>
            </div>` : ""}
            <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:12px 18px;flex:1;text-align:center;">
              <p style="margin:0 0 4px;font-size:20px;font-weight:900;color:#6366f1;">${staffProducts.length}</p>
              <p style="margin:0;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.8px;">Total Affected</p>
            </div>
          </div>

          <!-- Products table -->
          <p style="margin:0 0 12px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Affected Products</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <th style="text-align:left;font-size:11px;font-weight:700;color:#adb5bd;padding-bottom:8px;">Product Name</th>
              <th style="text-align:right;font-size:11px;font-weight:700;color:#adb5bd;padding-bottom:8px;">Stock Status</th>
            </tr>
            ${rows}
          </table>

          <!-- Info box -->
          <div style="background:#fff8f0;border:1px solid #ffe4cc;border-radius:12px;padding:16px 20px;">
            <p style="margin:0;font-size:13px;color:#c05621;line-height:1.7;">
              <strong>Alert threshold:</strong> Products with fewer than ${LOW_STOCK_THRESHOLD} units trigger this notification.
              Please restock promptly to avoid missed sales and customer disappointment.
            </p>
          </div>

        </td>
      </tr>`;

    const html = buildEmail(
      brand,
      `⚠️ ${staffProducts.length} product(s) are running low — restock needed.`,
      content
    );

    try {
      await getTransporter().sendMail({
        from: `"${brand.storeName}" <${brand.fromEmail}>`,
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
