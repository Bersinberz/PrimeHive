import getTransporter from "../config/mailer";
import logger from "../config/logger";
import { getBrand, buildEmail } from "./emailBase";

interface PasswordChangedPayload {
  name: string;
  email: string;
}

export const sendPasswordChangedEmail = async (payload: PasswordChangedPayload): Promise<void> => {
  const { name, email } = payload;
  const brand = await getBrand();

  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">

        <!-- Icon + heading -->
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:rgba(255,107,53,0.1);line-height:64px;font-size:28px;margin-bottom:16px;">🔐</div>
          <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">Password Changed</h2>
          <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
            Hi <strong style="color:#1a1a1a;">${name}</strong>, your password was successfully updated.
          </p>
        </div>

        <!-- Details box -->
        <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:12px;border-bottom:1px solid #e9ecef;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Account</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">${email}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:12px;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;">Changed at</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">${now} IST</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Security warning -->
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#991b1b;">⚠️ Wasn't you?</p>
          <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.7;">
            If you did not make this change, your account may be compromised.
            Please contact our support team immediately at
            <a href="mailto:${brand.supportEmail}" style="color:#ef4444;font-weight:700;text-decoration:none;">${brand.supportEmail}</a>
            and we'll help you secure your account right away.
          </p>
        </div>

        <p style="margin:0;font-size:13px;color:#adb5bd;line-height:1.6;">
          If you made this change, no further action is needed. Keep your password safe and never share it with anyone.
        </p>
      </td>
    </tr>`;

  const html = buildEmail(
    brand,
    `Your ${brand.storeName} password was changed — if this wasn't you, act immediately.`,
    content
  );

  try {
    await getTransporter().sendMail({
      from: `"${brand.storeName}" <${brand.fromEmail}>`,
      to: email,
      subject: `Security Alert: Your ${brand.storeName} password was changed`,
      html,
    });
    logger.info(`Password changed email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send password changed email to ${email}:`, err);
  }
};
