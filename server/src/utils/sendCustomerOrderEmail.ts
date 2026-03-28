import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail, fmtINR, fmtDate } from "./emailBase";

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

  const brand = await getBrand();

  const addrLine = [
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zip,
    shippingAddress.country,
  ].filter(Boolean).join(", ");

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;vertical-align:middle;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          ${item.image ? `
          <td style="padding-right:14px;vertical-align:middle;">
            <img src="${item.image}" width="56" height="56" alt="${item.name}"
              style="border-radius:10px;object-fit:cover;display:block;border:1px solid #e9ecef;"/>
          </td>` : ""}
          <td style="vertical-align:middle;">
            <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1a1a1a;line-height:1.4;">${item.name}</p>
            <p style="margin:0;font-size:12px;color:#adb5bd;">Qty: ${item.quantity} &times; ${fmtINR(item.price)}</p>
          </td>
        </tr></table>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;text-align:right;vertical-align:middle;white-space:nowrap;">
        <span style="font-size:14px;font-weight:800;color:#1a1a1a;">${fmtINR(item.price * item.quantity)}</span>
      </td>
    </tr>`).join("");

  const content = `
    <tr>
      <td style="padding:0;">

        <!-- Success banner -->
        <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:20px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#15803d;">✓ Order Confirmed!</p>
          <p style="margin:0;font-size:13px;color:#166534;line-height:1.5;">
            Hi ${customerName}, we've received your order and are getting it ready.
          </p>
        </div>

        <div style="padding:32px 40px;">

          <!-- Order meta -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="width:50%;padding-right:8px;">
                <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:14px 18px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1.2px;">Order ID</p>
                  <p style="margin:0;font-size:16px;font-weight:900;color:#6d28d9;">${orderId}</p>
                </div>
              </td>
              <td style="width:50%;padding-left:8px;">
                <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:14px 18px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Order Date</p>
                  <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">${fmtDate(createdAt)}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Items -->
          <p style="margin:0 0 12px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Items Ordered</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <th style="text-align:left;font-size:11px;font-weight:700;color:#adb5bd;padding-bottom:8px;">Product</th>
              <th style="text-align:right;font-size:11px;font-weight:700;color:#adb5bd;padding-bottom:8px;">Total</th>
            </tr>
            ${itemRows}
          </table>

          <!-- Bill summary -->
          <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:14px;padding:20px 22px;margin-bottom:20px;">
            <p style="margin:0 0 14px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Bill Summary</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:#6c757d;padding-bottom:8px;">Subtotal</td>
                <td style="font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;padding-bottom:8px;">${fmtINR(subtotal)}</td>
              </tr>
              ${couponCode && couponDiscount ? `
              <tr>
                <td style="font-size:13px;color:#059669;padding-bottom:8px;">Coupon (${couponCode})</td>
                <td style="font-size:13px;font-weight:700;color:#059669;text-align:right;padding-bottom:8px;">−${fmtINR(couponDiscount)}</td>
              </tr>` : ""}
              <tr>
                <td style="font-size:13px;color:#6c757d;padding-bottom:8px;">Shipping</td>
                <td style="font-size:13px;font-weight:700;color:${shippingCost === 0 ? "#059669" : "#1a1a1a"};text-align:right;padding-bottom:8px;">
                  ${shippingCost === 0 ? "Free" : fmtINR(shippingCost)}
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6c757d;padding-bottom:14px;">
                  Tax (GST ${taxRate}%)${taxInclusive ? " <em style='font-size:11px;'>(included)</em>" : ""}
                </td>
                <td style="font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;padding-bottom:14px;">
                  ${taxInclusive ? "Included" : fmtINR(tax)}
                </td>
              </tr>
              <tr style="border-top:2px solid #dee2e6;">
                <td style="font-size:16px;font-weight:900;color:#1a1a1a;padding-top:14px;">Total Paid</td>
                <td style="font-size:20px;font-weight:900;color:#ff6b35;text-align:right;padding-top:14px;">${fmtINR(totalAmount)}</td>
              </tr>
            </table>
          </div>

          <!-- Delivery + Payment -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="width:50%;padding-right:8px;vertical-align:top;">
                <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:14px 18px;height:100%;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Deliver To</p>
                  <p style="margin:0;font-size:13px;color:#495057;line-height:1.7;">${addrLine}</p>
                </div>
              </td>
              <td style="width:50%;padding-left:8px;vertical-align:top;">
                <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:14px 18px;height:100%;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Payment Method</p>
                  <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1a1a1a;">${paymentMethod}</p>
                  <span style="display:inline-block;background:rgba(245,158,11,0.12);color:#d97706;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">Pending Confirmation</span>
                </div>
              </td>
            </tr>
          </table>

          <p style="margin:0;font-size:13px;color:#adb5bd;line-height:1.6;text-align:center;">
            We'll send you another email when your order is shipped.
          </p>
        </div>
      </td>
    </tr>`;

  const html = buildEmail(
    brand,
    `Your order ${orderId} is confirmed — here's your receipt.`,
    content
  );

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to,
      subject: `Order Confirmed: ${orderId} — ${brand.storeName}`,
      html,
    });
    logger.info(`Customer order confirmation email sent to ${to} for order ${orderId}`);
  } catch (err) {
    logger.error(`Failed to send customer order email to ${to}:`, err);
  }
};
