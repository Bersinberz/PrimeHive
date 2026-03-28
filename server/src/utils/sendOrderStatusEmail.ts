import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail, fmtDate } from "./emailBase";

interface OrderStatusEmailPayload {
  to: string;
  customerName: string;
  orderId: string;
  newStatus: string;
  note?: string;
}

const STATUS_META: Record<string, { icon: string; color: string; bg: string; border: string; message: string }> = {
  Paid: {
    icon: "💳", color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe",
    message: "Your payment has been received and confirmed. We're getting your order ready.",
  },
  Processing: {
    icon: "⚙️", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc",
    message: "Your order is being prepared and will be dispatched soon.",
  },
  Shipped: {
    icon: "🚚", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
    message: "Great news — your order is on its way! You'll receive it shortly.",
  },
  Delivered: {
    icon: "✅", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0",
    message: "Your order has been delivered. We hope you love your purchase!",
  },
  Cancelled: {
    icon: "❌", color: "#dc2626", bg: "#fef2f2", border: "#fecaca",
    message: "Your order has been cancelled. If you have any questions, please contact our support team.",
  },
  Refunded: {
    icon: "↩️", color: "#b45309", bg: "#fffbeb", border: "#fde68a",
    message: "Your refund has been initiated. Please allow 5–7 business days for it to reflect in your account.",
  },
};

export const sendOrderStatusEmail = async (payload: OrderStatusEmailPayload): Promise<void> => {
  const { to, customerName, orderId, newStatus, note } = payload;
  const brand = await getBrand();
  const meta = STATUS_META[newStatus] || {
    icon: "📦", color: "#ff6b35", bg: "#fff7f0", border: "#ffe4cc",
    message: `Your order status has been updated to ${newStatus}.`,
  };

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">

        <!-- Greeting -->
        <p style="margin:0 0 6px;font-size:15px;color:#6c757d;line-height:1.6;">
          Hi <strong style="color:#1a1a1a;">${customerName}</strong>,
        </p>
        <p style="margin:0 0 28px;font-size:15px;color:#6c757d;line-height:1.6;">
          There's an update on your order <strong style="color:#1a1a1a;">${orderId}</strong>.
        </p>

        <!-- Status card -->
        <div style="background:${meta.bg};border:2px solid ${meta.border};border-radius:16px;padding:28px 24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:12px;">${meta.icon}</div>
          <p style="margin:0 0 6px;font-size:11px;font-weight:800;color:${meta.color};text-transform:uppercase;letter-spacing:1.5px;">Order Status</p>
          <h2 style="margin:0 0 12px;font-size:28px;font-weight:900;color:${meta.color};letter-spacing:-0.5px;">${newStatus}</h2>
          <p style="margin:0;font-size:14px;color:#495057;line-height:1.7;max-width:380px;margin:0 auto;">${meta.message}</p>
          ${note ? `
          <div style="margin-top:16px;background:rgba(255,255,255,0.7);border-radius:10px;padding:12px 16px;">
            <p style="margin:0;font-size:13px;color:#6c757d;font-style:italic;line-height:1.6;">"${note}"</p>
          </div>` : ""}
        </div>

        <!-- Order ID pill -->
        <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Order Reference</p>
          <p style="margin:0;font-size:18px;font-weight:900;color:#1a1a1a;letter-spacing:0.5px;">${orderId}</p>
        </div>

        <p style="margin:0;font-size:13px;color:#adb5bd;line-height:1.6;text-align:center;">
          You can track your order anytime from your account dashboard.
        </p>
      </td>
    </tr>`;

  const html = buildEmail(
    brand,
    `Your order ${orderId} is now ${newStatus} — ${meta.message.slice(0, 60)}`,
    content
  );

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to,
      subject: `Order ${orderId} — Status Updated to ${newStatus}`,
      html,
    });
    logger.info(`Order status email sent to ${to} for order ${orderId} → ${newStatus}`);
  } catch (err) {
    logger.error(`Failed to send order status email to ${to}:`, err);
  }
};
