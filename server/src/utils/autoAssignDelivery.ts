import User from "../models/User";
import Order from "../models/Order";
import logger from "../config/logger";

const MAX_ATTEMPTS = 5; // max delivery partners to try before giving up

/**
 * Auto-assigns a delivery partner to an order.
 * Picks a random online+active delivery partner, excluding already-rejected ones.
 * Called fire-and-forget after order creation.
 */
export const autoAssignDelivery = async (orderId: string): Promise<void> => {
  try {
    const order = await Order.findById(orderId).populate("customer", "name email");
    if (!order) return;

    const rejectedIds: string[] = [];

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Find a random online active delivery partner not already rejected
      const partners = await User.find({
        role: "delivery_partner",
        status: "active",
        isOnline: true,
        _id: { $nin: rejectedIds },
      }).select("_id name email phone").lean();

      if (partners.length === 0) {
        logger.info(`autoAssignDelivery: no online partners available for order ${order.orderId} (attempt ${attempt + 1})`);
        break;
      }

      // Pick random partner
      const partner = partners[Math.floor(Math.random() * partners.length)];

      // Assign
      order.deliveryPartnerId = partner._id as any;
      order.deliveryStatus    = "assigned";
      order.assignedAt        = new Date();
      await order.save();

      logger.info(`autoAssignDelivery: order ${order.orderId} assigned to ${partner.name} (attempt ${attempt + 1})`);

      // Email notification to delivery partner
      if (partner.email) {
        sendDeliveryAssignmentEmail({
          to: partner.email,
          partnerName: partner.name,
          orderId: order.orderId,
          customerName: (order.customer as any)?.name || "Customer",
          address: order.shippingAddress,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
        }).catch(() => {});
      }

      // Wait up to 2 minutes for accept/reject, then check
      // (polling-based — delivery partner accepts via API, reject triggers re-assign)
      return;
    }

    logger.warn(`autoAssignDelivery: could not assign order ${order.orderId} after ${MAX_ATTEMPTS} attempts`);
  } catch (err) {
    logger.error("autoAssignDelivery error:", err);
  }
};

interface AssignmentEmailPayload {
  to: string;
  partnerName: string;
  orderId: string;
  customerName: string;
  address: { line1: string; line2?: string; city: string; state: string; zip: string; country: string };
  totalAmount: number;
  paymentMethod: string;
}

const sendDeliveryAssignmentEmail = async (payload: AssignmentEmailPayload): Promise<void> => {
  const { to, partnerName, orderId, customerName, address, totalAmount, paymentMethod } = payload;
  const { getBrand, buildEmail } = await import("./emailBase");
  const getTransporter = (await import("../config/mailer")).default;
  const logger = (await import("../config/logger")).default;

  const brand = await getBrand();
  const isCOD = paymentMethod?.toLowerCase().includes("cod") || paymentMethod?.toLowerCase().includes("cash");
  const fmtINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const shortAddr = [address.line1, address.city, address.state].filter(Boolean).join(", ");

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">
          New Delivery Assigned 🚚
        </h2>
        <p style="margin:0 0 28px;font-size:15px;color:#6c757d;line-height:1.7;">
          Hi <strong style="color:#1a1a1a;">${partnerName}</strong>, a new order has been assigned to you.
          Please open the app to accept or reject within <strong>2 minutes</strong>.
        </p>

        <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0 0 3px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Order ID</p>
                <p style="margin:0;font-size:16px;font-weight:800;color:#ff6b35;">${orderId}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:12px;border-top:1px solid #e9ecef;padding-top:12px;">
                <p style="margin:0 0 3px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Customer</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">${customerName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:12px;border-top:1px solid #e9ecef;padding-top:12px;">
                <p style="margin:0 0 3px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Deliver To</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">${shortAddr}</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e9ecef;padding-top:12px;">
                <p style="margin:0 0 3px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Amount</p>
                <p style="margin:0;font-size:16px;font-weight:900;color:#1a1a1a;">${fmtINR(totalAmount)}
                  <span style="font-size:12px;font-weight:700;color:${isCOD ? '#dc2626' : '#059669'};background:${isCOD ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'};padding:2px 10px;border-radius:20px;margin-left:8px;">${isCOD ? "💵 COD" : "✅ Paid"}</span>
                </p>
              </td>
            </tr>
          </table>
        </div>

        <div style="background:#fff8f0;border:1px solid #ffe4cc;border-radius:12px;padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#c05621;line-height:1.6;">
            ⏱ <strong>Open the delivery app</strong> to accept this order. If you don't respond, it will be reassigned automatically.
          </p>
        </div>
      </td>
    </tr>`;

  const html = buildEmail(brand, `New delivery order ${orderId} assigned to you — open app to accept.`, content);

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to,
      subject: `🚚 New Order Assigned — ${orderId}`,
      html,
    });
    logger.info(`Delivery assignment email sent to ${to} for order ${orderId}`);
  } catch (err) {
    logger.error(`Failed to send delivery assignment email to ${to}:`, err);
  }
};
