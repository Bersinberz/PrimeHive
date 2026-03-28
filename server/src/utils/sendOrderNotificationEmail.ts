import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail, fmtINR } from "./emailBase";
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
  const brand = await getBrand();

  // Group items by staff
  const staffItemMap = new Map<string, OrderItem[]>();
  for (const item of items) {
    if (!item.createdBy) continue;
    const staffId = item.createdBy.toString();
    if (!staffItemMap.has(staffId)) staffItemMap.set(staffId, []);
    staffItemMap.get(staffId)!.push(item);
  }

  if (staffItemMap.size === 0) return;

  const staffIds = [...staffItemMap.keys()].map(id => new mongoose.Types.ObjectId(id));
  const staffList = await User.find({
    _id: { $in: staffIds },
    role: "staff",
    status: "active",
    "notificationPreferences.orderPlaced": true,
  }).select("_id name email").lean();

  for (const staff of staffList) {
    const staffItems = staffItemMap.get(staff._id.toString()) ?? [];
    if (staffItems.length === 0) continue;

    const staffTotal = staffItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const itemRows = staffItems.map(item => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;vertical-align:middle;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            ${item.image ? `
            <td style="padding-right:12px;vertical-align:middle;">
              <img src="${item.image}" width="48" height="48" alt="${item.name}"
                style="border-radius:8px;object-fit:cover;display:block;border:1px solid #e9ecef;"/>
            </td>` : ""}
            <td style="vertical-align:middle;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1a1a1a;">${item.name}</p>
              <p style="margin:0;font-size:12px;color:#adb5bd;">Qty: ${item.quantity}</p>
            </td>
          </tr></table>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;text-align:right;vertical-align:middle;white-space:nowrap;">
          <span style="font-size:14px;font-weight:800;color:#1a1a1a;">${fmtINR(item.price * item.quantity)}</span>
        </td>
      </tr>`).join("");

    const content = `
      <tr>
        <td style="padding:40px 40px 32px;">

          <!-- Alert banner -->
          <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:18px 22px;border-radius:12px;margin-bottom:28px;text-align:center;">
            <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#15803d;">🛍️ New Order Received!</p>
            <p style="margin:0;font-size:13px;color:#166534;">
              Hey ${staff.name}, a customer just purchased your product(s).
            </p>
          </div>

          <!-- Order ID -->
          <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1.2px;">Order ID</p>
            <p style="margin:0;font-size:18px;font-weight:900;color:#6d28d9;">${orderId}</p>
          </div>

          <!-- Items -->
          <p style="margin:0 0 12px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Your Items in This Order</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <th style="text-align:left;font-size:11px;font-weight:700;color:#adb5bd;padding-bottom:8px;">Product</th>
              <th style="text-align:right;font-size:11px;font-weight:700;color:#adb5bd;padding-bottom:8px;">Amount</th>
            </tr>
            ${itemRows}
            <tr>
              <td style="padding-top:12px;font-size:14px;font-weight:800;color:#1a1a1a;">Your Total</td>
              <td style="padding-top:12px;text-align:right;font-size:16px;font-weight:900;color:#ff6b35;">${fmtINR(staffTotal)}</td>
            </tr>
          </table>

          <!-- Customer info -->
          <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Ordered By</p>
            <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">${customerName}</p>
          </div>

        </td>
      </tr>`;

    const html = buildEmail(
      brand,
      `New order ${orderId} — ${customerName} just bought your product(s).`,
      content
    );

    try {
      await getTransporter().sendMail({
        from: `"${brand.storeName}" <${brand.fromEmail}>`,
        to: staff.email,
        subject: `New Order ${orderId} — ${brand.storeName}`,
        html,
      });
      logger.info(`Order notification sent to staff ${staff.email} for order ${orderId}`);
    } catch (err) {
      logger.error(`Failed to send order notification to ${staff.email}:`, err);
    }
  }
};
