import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const ReturnsPage: React.FC = () => {
  return (
    <div className="container py-xl-5 py-4 min-vh-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto"
        style={{ maxWidth: "800px" }}
      >
        <h1 className="fw-black mb-4 display-5 text-center">Returns & Refunds</h1>
        <p className="text-muted fs-5 mb-5 text-center">Hassle-free returns for a smooth shopping experience.</p>

        <div className="bg-light p-4 rounded-4 border mb-5 d-flex gap-3 align-items-start text-dark">
          <AlertCircle size={24} className="flex-shrink-0 mt-1" style={{ color: "var(--prime-orange)" }} />
          <div>
            <h5 className="fw-bold mb-2">30-Day Money-Back Guarantee</h5>
            <p className="mb-0">
              We want you to be 100% satisfied with your purchase. If you're not entirely happy, we've outlined our simple return instructions below.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border lh-lg text-dark">
          <h4 className="fw-bold mb-3 text-primary" style={{ color: "var(--prime-orange) !important" }}>Return Conditions</h4>
          <ul className="ps-3 mb-4">
            <li className="mb-2">Items must be returned within 30 days of the delivery date.</li>
            <li className="mb-2">Items must be unused, in their original condition and packaging.</li>
            <li className="mb-2">A receipt or proof of purchase is required.</li>
          </ul>
          
          <hr className="my-4 opacity-25" />

          <h4 className="fw-bold mb-3 text-primary" style={{ color: "var(--prime-orange) !important" }}>How to Return an Item</h4>
          <p className="mb-4">
            To initiate a return, please visit the Contact Us page and send an inquiry with your order number. Once approved, we will send you a pre-paid shipping label via email.
          </p>

          <hr className="my-4 opacity-25" />
          
          <h4 className="fw-bold mb-3 text-primary" style={{ color: "var(--prime-orange) !important" }}>Refunds</h4>
          <p className="mb-0">
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. 
            If approved, your refund will be processed and a credit will automatically be applied to your 
            original method of payment within 5-7 business days.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ReturnsPage;
