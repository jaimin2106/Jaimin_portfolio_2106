import SEO from "../components/SEO";
import { motion } from "motion/react";

export default function PrivacyPolicy() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto prose prose-gray prose-headings:font-display"
    >
      <SEO title="Privacy Policy | Jaimin Umaraniya" description="Learn how information submitted through Jaimin Umaraniya's portfolio website is collected, used, and stored." />
      <h1>Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3>1. Information Collection</h3>
      <p>We collect information you provide directly to us when using the contact form, including your name, email address, and message content.</p>

      <h3>2. Use of Information</h3>
      <p>The information collected is used solely to respond to your inquiries and communicate regarding potential projects or collaborations.</p>

      <h3>3. Data Storage</h3>
      <p>Your data is stored securely using industry-standard cloud infrastructure. We do not sell or share your personal information with third parties.</p>

      <h3>4. Cookies & Analytics</h3>
      <p>This website uses essential cookies and local storage to cache content for offline use and improve performance. We may use privacy-friendly analytics to understand website traffic.</p>
    </motion.main>
  );
}
