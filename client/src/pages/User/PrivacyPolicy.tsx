import React from "react";
import { useSettings } from "../../context/SettingsContext";

const PrivacyPolicy: React.FC = () => {
  const { storeName, supportEmail } = useSettings();

  const section = (title: string, content: React.ReactNode) => (
    <div className="mb-5">
      <h2 className="fw-black mb-3" style={{ fontSize: "1.15rem", color: "#1a1a1a" }}>{title}</h2>
      <div style={{ fontSize: "0.92rem", color: "#444", lineHeight: 1.8 }}>{content}</div>
    </div>
  );

  return (
    <div className="container py-5" style={{ maxWidth: 820 }}>
      <div className="mb-5">
        <h1 className="fw-black mb-2" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>Privacy Policy</h1>
        <p className="text-muted" style={{ fontSize: "0.88rem" }}>
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.8 }}>
          At {storeName}, we take your privacy seriously. This policy explains what information we collect,
          how we use it, and the choices you have regarding your data.
        </p>
      </div>

      {section("1. Information We Collect", (
        <>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="ps-4">
            <li>Name, email address, phone number, and delivery address when you create an account or place an order</li>
            <li>Payment information (processed securely — we do not store card details)</li>
            <li>Profile picture if you choose to upload one</li>
            <li>Reviews and feedback you submit</li>
          </ul>
          <p className="mt-3">We also automatically collect certain information when you use our platform:</p>
          <ul className="ps-4">
            <li>Device type, browser, and operating system</li>
            <li>Pages visited, time spent, and interactions on the site</li>
            <li>IP address and approximate location</li>
          </ul>
        </>
      ))}

      {section("2. How We Use Your Information", (
        <ul className="ps-4">
          <li>To process and fulfil your orders</li>
          <li>To send order confirmations, shipping updates, and support responses</li>
          <li>To personalise your shopping experience and show relevant products</li>
          <li>To improve our platform, detect fraud, and ensure security</li>
          <li>To send promotional emails (you can opt out at any time)</li>
        </ul>
      ))}

      {section("3. Sharing Your Information", (
        <>
          <p>We do not sell your personal data. We may share it with:</p>
          <ul className="ps-4">
            <li>Delivery partners to fulfil your orders</li>
            <li>Payment processors to handle transactions securely</li>
            <li>Service providers who help us operate the platform (under strict confidentiality agreements)</li>
            <li>Law enforcement or regulators when required by law</li>
          </ul>
        </>
      ))}

      {section("4. Cookies", (
        <p>
          We use cookies and similar technologies to keep you signed in, remember your cart, and understand
          how you use our site. You can control cookies through your browser settings, though disabling them
          may affect some features.
        </p>
      ))}

      {section("5. Data Retention", (
        <p>
          We retain your account data for as long as your account is active. If you request account deletion,
          we begin a 30-day grace period after which your data is permanently removed, except where we are
          required to retain it for legal or financial compliance purposes.
        </p>
      ))}

      {section("6. Your Rights", (
        <>
          <p>You have the right to:</p>
          <ul className="ps-4">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${supportEmail}`} style={{ color: "var(--prime-orange)", fontWeight: 600 }}>
              {supportEmail}
            </a>.
          </p>
        </>
      ))}

      {section("7. Security", (
        <p>
          We use industry-standard encryption (HTTPS/TLS) and secure authentication to protect your data.
          However, no method of transmission over the internet is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      ))}

      {section("8. Children's Privacy", (
        <p>
          Our platform is not directed at children under 13. We do not knowingly collect personal information
          from children. If you believe a child has provided us with their data, please contact us immediately.
        </p>
      ))}

      {section("9. Changes to This Policy", (
        <p>
          We may update this policy from time to time. We will notify you of significant changes by email or
          by posting a notice on our site. Continued use of {storeName} after changes constitutes acceptance
          of the updated policy.
        </p>
      ))}

      {section("10. Contact Us", (
        <p>
          If you have any questions about this Privacy Policy, please reach out to us at{" "}
          <a href={`mailto:${supportEmail}`} style={{ color: "var(--prime-orange)", fontWeight: 600 }}>
            {supportEmail}
          </a>.
        </p>
      ))}
    </div>
  );
};

export default PrivacyPolicy;
