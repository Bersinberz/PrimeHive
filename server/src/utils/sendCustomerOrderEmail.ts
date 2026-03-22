import getTransporter from "../config/mailer";
import logger from "../config/logger";
import Settings from "../models/Settings";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CustomerOrderEmailPayload {
  to: string;
  customerName: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  taxRate: number;
  taxInclusive: boolean;
  couponCode?: string;
  couponDiscount?: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  createdAt: Date;
}

export const sendCustomerOrderEmail = async (payload: CustomerOrderEmailPayload): Promise<void> => {
  const {
    to, customerName, orderId, items,
    subtotal, shippingCost, tax, taxRate, taxInclusive,
    couponCode, couponDiscount, totalAmount,
    paymentMethod, shippingAddress, createdAt,
  } = payload;

  let storeName = "PrimeHive";
  let fromEmail = process.env.SMTP_USER || "noreply@primehive.com";
  let supportEmail = fromEmail;
  const logoUrl = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

  try {
    const settings = await Settings.findOne().select("storeName supportEmail").lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) { fromEmail = settings.supportEmail; supportEmail = settings.supportEmail; }
  } catch { /* non-blocking */ }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const dateStr = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const addrLine = [
    shippingAddress.line1, shippingAddress.line2,
    shippingAddress.city, shippingAddress.state,
    shippingAddress.zip, shippingAddress.country,
  ].filter(Boolean).join(", ");

  // Left column: item rows
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;vertical-align:middle;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          ${item.image ? `
          <td style="padding-right:12px;vertical-align:middle;">
            <img src="${item.image}" width="52" height="52" alt="${item.name}"
              style="border-radius:8px;object-fit:cover;display:block;border:1px solid #eee;"/>
          </td>` : ""}
          <td style="vertical-align:middle;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#1a1a1a;line-height:1.4;">${item.name}</p>
            <p style="margin:3px 0 0;font-size:11px;color:#999;">Qty: ${item.quantity} &times; ${fmt(item.price)}</p>
          </td>
        </tr></table>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;text-align:right;vertical-align:middle;white-space:nowrap;">
        <span style="font-size:13px;font-weight:800;color:#1a1a1a;">${fmt(item.price * item.quantity)}</span>
      </td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmation — ${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">Your order ${orderId} is confirmed. Here is your receipt.</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:36px 12px;">
    <tr><td align="center">
      <table width="680" cellpadding="0" cellspacing="0"
        style="max-width:680px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 28px rgba(0,0,0,0.09);">

        <!-- Header -->
        <tr>
          <td colspan="2" style="background:linear-gradient(135deg,#ff6b35,#ff8c42);padding:28px 36px;text-align:center;">
            <img src="${logoUrl}" alt="${storeName}" width="44" height="44"
              style="border-radius:10px;display:block;margin:0 auto 10px;"/>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">${storeName}</h1>
            <p style="margin:5px 0 0;color:rgba(255,255,255,0.82);font-size:12px;letter-spacing:0.5px;">ORDER CONFIRMATION</p>
          </td>
        </tr>

        <!-- Success banner -->
        <tr>
          <td colspan="2" style="background:#f0fdf4;padding:18px 36px;border-bottom:1px solid #dcfce7;text-align:center;">
            <p style="margin:0;font-size:16px;font-weight:800;color:#15803d;">&#10003; Order Placed Successfully!</p>
            <p style="margin:5px 0 0;font-size:12px;color:#166534;">
              Hi ${customerName}, we've received your order and are getting it ready.
            </p>
          </td>
        </tr>

        <!-- Order ID + Date bar -->
        <tr>
          <td colspan="2" style="padding:18px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:50%;padding-right:8px;">
                  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0 0 3px;font-size:9px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                    <p style="margin:0;font-size:15px;font-weight:900;color:#6d28d9;">${orderId}</p>
                  </div>
                </td>
                <td style="width:50%;padding-left:8px;">
                  <div style="background:#fafafa;border:1px solid #f0f0f2;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0 0 3px;font-size:9px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:1px;">Order Date</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#1a1a1a;">${dateStr}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Two-column body -->
        <tr>
          <!-- LEFT: Items -->
          <td style="padding:20px 20px 20px 36px;vertical-align:top;width:55%;">
            <p style="margin:0 0 10px;font-size:9px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <th style="text-align:left;font-size:9px;font-weight:800;color:#ccc;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:6px;">Product</th>
                <th style="text-align:right;font-size:9px;font-weight:800;color:#ccc;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:6px;">Total</th>
              </tr>
              ${itemRows}
            </table>
          </td>

          <!-- RIGHT: Bill + Details -->
          <td style="padding:20px 36px 20px 16px;vertical-align:top;width:45%;">

            <!-- Bill summary box -->
            <div style="background:#fafafa;border:1px solid #f0f0f2;border-radius:12px;padding:16px;margin-bottom:16px;">
              <p style="margin:0 0 10px;font-size:9px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:1px;">Bill Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#666;padding-bottom:6px;">Subtotal</td>
                  <td style="font-size:12px;font-weight:700;color:#1a1a1a;text-align:right;padding-bottom:6px;">${fmt(subtotal)}</td>
                </tr>
                ${couponCode && couponDiscount ? `
                <tr>
                  <td style="font-size:12px;color:#10b981;padding-bottom:6px;">Coupon (${couponCode})</td>
                  <td style="font-size:12px;font-weight:700;color:#10b981;text-align:right;padding-bottom:6px;">-${fmt(couponDiscount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size:12px;color:#666;padding-bottom:6px;">Shipping</td>
                  <td style="font-size:12px;font-weight:700;color:${shippingCost === 0 ? "#10b981" : "#1a1a1a"};text-align:right;padding-bottom:6px;">
                    ${shippingCost === 0 ? "Free" : fmt(shippingCost)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#666;padding-bottom:10px;">Tax (GST ${taxRate}%)${taxInclusive ? " <small>(incl.)</small>" : ""}</td>
                  <td style="font-size:12px;font-weight:700;color:#1a1a1a;text-align:right;padding-bottom:10px;">
                    ${taxInclusive ? "Included" : fmt(tax)}
                  </td>
                </tr>
                <tr style="border-top:2px solid #e5e7eb;">
                  <td style="font-size:14px;font-weight:900;color:#1a1a1a;padding-top:10px;">Total</td>
                  <td style="font-size:16px;font-weight:900;color:#ff6b35;text-align:right;padding-top:10px;">${fmt(totalAmount)}</td>
                </tr>
              </table>
            </div>

            <!-- Deliver to -->
            <div style="background:#fafafa;border:1px solid #f0f0f2;border-radius:10px;padding:12px 14px;margin-bottom:12px;">
              <p style="margin:0 0 5px;font-size:9px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:1px;">Deliver To</p>
              <p style="margin:0;font-size:11px;color:#444;line-height:1.6;">${addrLine}</p>
            </div>

            <!-- Payment -->
            <div style="background:#fafafa;border:1px solid #f0f0f2;border-radius:10px;padding:12px 14px;">
              <p style="margin:0 0 5px;font-size:9px;font-weight:800;color:#bbb;text-transform:uppercase;letter-spacing:1px;">Payment</p>
              <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#1a1a1a;">${paymentMethod}</p>
              <span style="display:inline-block;background:rgba(245,158,11,0.1);color:#d97706;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;">Pending</span>
            </div>

          </td>
        </tr>

        <!-- Footer note -->
        <tr>
          <td colspan="2" style="padding:16px 36px 24px;border-top:1px solid #f0f0f2;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#888;">
              We'll notify you when your order is shipped.
            </p>
            <p style="margin:0;font-size:11px;color:#bbb;">
              Questions? <a href="mailto:${supportEmail}" style="color:#ff6b35;text-decoration:none;font-weight:600;">${supportEmail}</a>
            </p>
          </td>
        </tr>

        <!-- Bottom bar -->
        <tr>
          <td colspan="2" style="background:#f8f8f8;padding:12px 36px;border-top:1px solid #f0f0f2;text-align:center;">
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
      subject: `Order Confirmed: ${orderId} — ${storeName}`,
      html,
    });
    logger.info(`Customer order confirmation email sent to ${to} for order ${orderId}`);
  } catch (err) {
    logger.error(`Failed to send customer order email to ${to}:`, err);
  }
};
