import SEO from "../components/SEO";
import { motion } from "motion/react";

export default function RefundPolicy() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto prose prose-gray prose-headings:font-display"
    >
      <SEO title="Refund Policy | Jaimin Umaraniya" description="Review the refund and cancellation terms for freelance services and development projects." />
      <h1>Refund Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3>1. Service Contracts</h3>
      <p>Refunds for freelance services and development projects are governed by the specific terms outlined in our individual project contracts or statements of work (SOW).</p>

      <h3>2. Retainers and Deposits</h3>
      <p>Unless otherwise specified in writing, initial project deposits and monthly retainer fees are non-refundable as they secure time and resources on our schedule.</p>

      <h3>3. Cancellations</h3>
      <p>If a project is cancelled before completion, you will be billed for the hours completed and any expenses incurred up to the cancellation date. Any remaining balance from deposits will be evaluated on a case-by-case basis according to the contract.</p>
    </motion.main>
  );
}
