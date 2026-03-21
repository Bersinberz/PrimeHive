import React from "react";
import { motion } from "framer-motion";

const FAQPage: React.FC = () => {
  const faqs = [
    { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Expedited options are available at checkout." },
    { q: "Do you ship internationally?", a: "Currently, we only ship within India. We are working on expanding our delivery network soon!" },
    { q: "What is your return policy?", a: "We offer a 30-day return policy for unused items in their original packaging. Please visit our Returns page for details." },
    { q: "How can I track my order?", a: "Once your order ships, you will receive a tracking number via email. You can also view it in your account under 'My Orders'." },
    { q: "Can I change my order after placing it?", a: "Orders are processed quickly. If you need to make changes, please contact support within 1 hour of placing your order." }
  ];

  return (
    <div className="container py-xl-5 py-4 min-vh-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto"
        style={{ maxWidth: "800px" }}
      >
        <h1 className="fw-black mb-4 display-5 text-center">Frequently Asked Questions</h1>
        <p className="text-muted fs-5 mb-5 text-center">Find answers to our most common queries below.</p>

        <div className="d-flex flex-column gap-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-4 shadow-sm border"
            >
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28, background: "var(--prime-orange)", fontSize: "0.9rem" }}>Q</span>
                {faq.q}
              </h5>
              <p className="text-muted mb-0 lh-lg ms-4" style={{ paddingLeft: "10px" }}>{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FAQPage;
