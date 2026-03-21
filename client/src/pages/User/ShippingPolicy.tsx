import React from "react";
import { motion } from "framer-motion";

const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="container py-xl-5 py-4 min-vh-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto"
        style={{ maxWidth: "800px" }}
      >
        <h1 className="fw-black mb-4 display-5 text-center">Shipping Policy</h1>
        <p className="text-muted fs-5 mb-5 text-center">Everything you need to know about our delivery process.</p>

        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border lh-lg text-dark">
          <h4 className="fw-bold mb-3 text-primary" style={{ color: "var(--prime-orange) !important" }}>Processing Time</h4>
          <p>
            All orders are processed within 1 to 2 business days (excluding weekends and holidays) after 
            receiving your order confirmation email. You will receive another notification when your order has shipped.
          </p>
          <hr className="my-4 opacity-25" />

          <h4 className="fw-bold mb-3 text-primary" style={{ color: "var(--prime-orange) !important" }}>Shipping Rates & Estimates</h4>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout. 
            We offer <strong>Free Delivery</strong> for all orders above our standard threshold. 
            For orders below this, a standard nominal shipping fee will apply.
          </p>
          <hr className="my-4 opacity-25" />

          <h4 className="fw-bold mb-3 text-primary" style={{ color: "var(--prime-orange) !important" }}>Local Delivery</h4>
          <p>
            Local delivery is available for addresses within select zones. Deliveries are made 
            from 9 AM - 6 PM on business days. We will contact you via text message with the phone number 
            you provided at checkout to notify you on the day of our arrival.
          </p>
          <hr className="my-4 opacity-25" />

          <h4 className="fw-bold mb-3 text-primary" style={{ color: "var(--prime-orange) !important" }}>How do I check the status of my order?</h4>
          <p>
            When your order has shipped, you will receive an email notification from us which will include 
            a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ShippingPolicyPage;
