import Settings from "../models/Settings";

export interface EmailBrand {
  storeName: string;
  fromEmail: string;
  supportEmail: string;
  logoUrl: string;
}

const LOGO_URL = "https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png";

/**
 * Fetches store branding from DB with env fallbacks.
 * Non-blocking — always resolves.
 */
export const getBrand = async (): Promise<EmailBrand> => {
  const fallbackEmail = process.env.SMTP_USER || "noreply@primehive.com";
  let storeName = "PrimeHive";
  let fromEmail = fallbackEmail;
  let supportEmail = fallbackEmail;

  try {
    const settings = await Settings.findOne()
      .select("storeName supportEmail")
      .lean();
    if (settings?.storeName) storeName = settings.storeName;
    if (settings?.supportEmail) {
      fromEmail = settings.supportEmail;
      supportEmail = settings.supportEmail;
    }
  } catch {
    // non-blocking — use defaults
  }

  return { storeName, fromEmail, supportEmail, logoUrl: LOGO_URL };
};

/**
 * Wraps content in the shared professional email shell.
 * All emails use this for consistent branding.
 */
export const buildEmail = (
  brand: EmailBrand,
  preheader: string,
  content: string
): string => {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
    <tr><td align="center">

      <!-- Outer card -->
      <table role="presentation" width="620" cellpadding="0" cellspacing="0"
        style="max-width:620px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ff6b35 0%,#ff8c42 100%);padding:32px 40px;text-align:center;">
            <img src="${brand.logoUrl}" alt="${brand.storeName}" width="52" height="52"
              style="border-radius:14px;display:block;margin:0 auto 14px;border:3px solid rgba(255,255,255,0.25);"/>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;line-height:1.2;">${brand.storeName}</h1>
          </td>
        </tr>

        <!-- Content -->
        ${content}

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:24px 40px;border-top:1px solid #e9ecef;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#6c757d;line-height:1.6;">
              Questions or concerns?
              <a href="mailto:${brand.supportEmail}" style="color:#ff6b35;text-decoration:none;font-weight:600;">${brand.supportEmail}</a>
            </p>
            <p style="margin:0;font-size:11px;color:#adb5bd;line-height:1.5;">
              &copy; ${year} ${brand.storeName}. All rights reserved.<br/>
              You received this email because you have an account with ${brand.storeName}.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/** Formats a number as Indian Rupee currency */
export const fmtINR = (n: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/** Formats a date in readable Indian locale */
export const fmtDate = (d: Date | string): string =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Shared section label style (inline) */
export const LABEL = `font-size:10px;font-weight:800;color:#adb5bd;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 6px;`;

/** Shared info box style */
export const INFO_BOX = `background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:16px 20px;`;
