import React from "react";
import { useSettings } from "../../context/SettingsContext";

const TermsOfUse: React.FC = () => {
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
        <h1 className="fw-black mb-2" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>Terms of Use</h1>
        <p className="text-muted" style={{ fontSize: "0.88rem" }}>
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.8 }}>
          By accessing or using {storeName}, you agree to be bound by these Terms of Use. Please read them
          carefully before using our platform.
        </p>
      </div>

      {section("1. Acceptance of Terms", (
        <p>
          By creating an account, browsing, or placing an order on {storeName}, you confirm that you are at
          least 18 years old (or have parental consent) and agree to these terms. If you do not agree, please
          do not use our platform.
        </p>
      ))}

      {section("2. Your Account", (
        <>
          <p>When you create an account, you are responsible for:</p>
          <ul className="ps-4">
            <li>Keeping your login credentials confidential</li>
            <li>All activity that occurs under your account</li>
            <li>Providing accurate and up-to-date information</li>
            <li>Notifying us immediately of any unauthorised access</li>
          </ul>
          <p className="mt-3">
            We reserve the right to suspend or terminate accounts that violate these terms or engage in
            fraudulent activity.
          </p>
        </>
      ))}

      {section("3. Orders and Payments", (
        <>
          <p>When you place an order:</p>
          <ul className="ps-4">
            <li>You confirm that all information provided is accurate</li>
            <li>Prices are displayed in INR and are subject to change without notice</li>
            <li>We reserve the right to cancel orders due to stock unavailability, pricing errors, or suspected fraud</li>
            <li>Payment is processed securely — we do not store your card details</li>
          </ul>
        </>
      ))}

      {section("4. Shipping and Delivery", (
        <p>
          Delivery timelines are estimates and may vary due to factors outside our control. We are not liable
          for delays caused by courier partners, weather, or other unforeseen circumstances. Please refer to
          our Shipping Policy for full details.
        </p>
      ))}

      {section("5. Returns and Refunds", (
        <p>
          We offer returns and refunds in accordance with our Returns Policy. Items must be returned in their
          original condition within the specified return window. We reserve the right to refuse returns that
          do not meet our policy criteria.
        </p>
      ))}

      {section("6. Prohibited Conduct", (
        <>
          <p>You agree not to:</p>
          <ul className="ps-4">
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorised access to any part of the platform</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Post offensive, defamatory, or harmful reviews or content</li>
            <li>Use automated tools to scrape, crawl, or extract data from the platform</li>
            <li>Resell products purchased on our platform without prior written consent</li>
          </ul>
        </>
      ))}

      {section("7. Intellectual Property", (
        <p>
          All content on {storeName} — including logos, product images, text, and design — is the property
          of {storeName} or its licensors. You may not reproduce, distribute, or create derivative works
          without our express written permission.
        </p>
      ))}

      {section("8. Limitation of Liability", (
        <p>
          To the fullest extent permitted by law, {storeName} shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the platform, including loss of data,
          revenue, or profits. Our total liability for any claim shall not exceed the amount you paid for the
          relevant order.
        </p>
      ))}

      {section("9. Disclaimer of Warranties", (
        <p>
          The platform is provided "as is" without warranties of any kind, express or implied. We do not
          guarantee that the platform will be uninterrupted, error-free, or free of viruses or other harmful
          components.
        </p>
      ))}

      {section("10. Governing Law", (
        <p>
          These terms are governed by the laws of India. Any disputes arising from these terms shall be
          subject to the exclusive jurisdiction of the courts in India.
        </p>
      ))}

      {section("11. Changes to These Terms", (
        <p>
          We may update these terms from time to time. We will notify you of significant changes by email or
          by posting a notice on our site. Continued use of {storeName} after changes constitutes acceptance
          of the updated terms.
        </p>
      ))}

      {section("12. Contact Us", (
        <p>
          If you have any questions about these Terms of Use, please contact us at{" "}
          <a href={`mailto:${supportEmail}`} style={{ color: "var(--prime-orange)", fontWeight: 600 }}>
            {supportEmail}
          </a>.
        </p>
      ))}
    </div>
  );
};

export default TermsOfUse;
