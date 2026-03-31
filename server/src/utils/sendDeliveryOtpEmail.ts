import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail } from "./emailBase";

interface DeliveryOtpPayload {
  to: string;
  customerName: string;
  orderId: string;
  otp: string;
}

export const sendDeliveryOtpEmail = async (payload: DeliveryOtpPayload): Promise<void> => {
  const { to, customerName, orderId, otp } = payload;
  const brand = await getBrand();

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">
        <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">
          Your Delivery OTP 🚚
        </h2>
        <p style="margin:0 0 28px;font-size:15px;color:#6c757d;line-height:1.7;">
          Hi <strong style="color:#1a1a1a;">${customerName}</strong>, your order
          <strong style="color:#ff6b35;">${orderId}</strong> is about to be delivered.
          Share this OTP with the delivery partner to confirm receipt.
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(135deg,#fff8f0,#fff3e8);border:2px solid #ffd4a8;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#c05621;text-transform:uppercase;letter-spacing:1.5px;">One-Time Password</p>
          <p style="margin:0;font-size:48px;font-weight:900;color:#ff6b35;letter-spacing:12px;font-family:monospace;">${otp}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#c05621;">Valid for 15 minutes</p>
        </div>

        <div style="background:#fff8f0;border:1px solid #ffe4cc;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#c05621;line-height:1.6;">
            <strong>⚠️ Do not share this OTP</strong> with anyone other than the delivery partner at your door.
            ${brand.storeName} will never ask for this OTP via phone or chat.
          </p>
        </div>

        <hr style="border:none;border-top:1px solid #f0f0f2;margin:0 0 20px;"/>
        <p style="margin:0;font-size:13px;color:#adb5bd;line-height:1.6;">
          If you did not expect a delivery, contact us at
          <a href="mailto:${brand.supportEmail}" style="color:#ff6b35;text-decoration:none;font-weight:600;">${brand.supportEmail}</a>.
        </p>
      </td>
    </tr>`;

  const html = buildEmail(brand, `Your delivery OTP for order ${orderId} — share with delivery partner only.`, content);

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to,
      subject: `${otp} — Delivery OTP for ${orderId}`,
      html,
    });
    logger.info(`Delivery OTP email sent to ${to} for order ${orderId}`);
  } catch (err) {
    logger.error(`Failed to send delivery OTP email to ${to}:`, err);
  }
};
