import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, MapPin, Mail, ArrowUpRight } from "lucide-react";
import FAQ from "../components/FAQ";
import SEO from "../components/SEO";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", service: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Reject bot submissions silently
    if (honeypot) { setIsSubmitting(false); return; }
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: serverTimestamp(),
        read: false
      });
      setIsSuccess(true);
      setFormData({ name: "", email: "", service: "", message: "" });
    } catch (error) {
      console.error("Error submitting message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = ["Frontend Development", "Full Stack Development", "UI/UX Design", "Consulting"];

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://example.com/contact`;

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Jaimin Umaraniya - Consulting & Engineering",
    "description": "Contact Jaimin Umaraniya for Full Stack Development, UI/UX Design, and Engineering Consultation.",
    "url": currentUrl,
    "mainEntity": {
      "@type": "Person",
      "name": "Jaimin Umaraniya",
      "email": "umaraniyajaimin5@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Ahmedabad",
        "addressCountry": "India"
      }
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-24 md:pt-32 pb-16 md:pb-24"
    >
      <script type="application/ld+json">
        {JSON.stringify(contactSchema)}
      </script>
      <SEO
        title="Contact Jaimin Umaraniya"
        description="I'm currently available for freelance work and open to full-time opportunities. Drop a message to discuss your next project."
      />
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">

          {/* Left Column - Info */}
          <div className="flex flex-col">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="font-hero text-5xl sm:text-6xl md:text-8xl uppercase tracking-wider mb-8"
            >
              Let's Start <br /> Something <br /> <span className="text-[#E85D04]">Great.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-gray-600 text-lg md:text-xl leading-relaxed mb-12 max-w-md"
            >
              I'm currently available for freelance work and open to full-time opportunities. Drop a message to discuss your next project.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-8 md:mt-auto space-y-6 md:space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-full mt-1">
                  <Mail className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-mono text-sm uppercase text-gray-500 mb-1">Email</h3>
                  <a href="mailto:umaraniyajaimin5@gmail.com" className="font-display text-xl hover:text-[#E85D04] transition-colors relative group inline-block">
                    umaraniyajaimin5@gmail.com
                    <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#E85D04] transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-full mt-1">
                  <MapPin className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-mono text-sm uppercase text-gray-500 mb-1">Location</h3>
                  <p className="font-display text-xl">Ahmedabad, Working Globally
                    <br /> <span className="text-gray-400 text-base">Remote available globally</span></p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-black/5 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E85D04]/5 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">Send a message</h2>

            {/* Screen-reader announcement for form success */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isSuccess ? "Your message has been sent successfully. I will get back to you soon." : ""}
            </div>
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center text-center py-16 h-full min-h-[400px]"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">Message sent successfully!</h3>
                  <p className="text-gray-600 mb-8 max-w-xs">
                    Thank you for reaching out. I'll get back to you within 24-48 hours.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-3 border border-black/10 rounded-full font-mono text-sm hover:bg-black hover:text-white transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4 md:gap-6 relative z-10"
                >
                  {/* Honeypot � hidden from users, traps bots */}
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: "none" }}
                    aria-hidden="true"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="font-mono text-xs uppercase text-gray-500 ml-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-gray-50 border border-black/5 rounded-2xl px-3 py-2.5 md:px-4 md:py-3 focus:outline-none focus:bg-white focus:border-[#E85D04]/50 focus:ring-4 focus:ring-[#E85D04]/10 transition-all text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="font-mono text-xs uppercase text-gray-500 ml-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-gray-50 border border-black/5 rounded-2xl px-3 py-2.5 md:px-4 md:py-3 focus:outline-none focus:bg-white focus:border-[#E85D04]/50 focus:ring-4 focus:ring-[#E85D04]/10 transition-all text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="font-mono text-xs uppercase text-gray-500 ml-1">What are you looking for?</label>
                    <div className="flex flex-wrap gap-3">
                      {services.map((service) => (
                        <button
                          type="button"
                          key={service}
                          onClick={() => setFormData({ ...formData, service })}
                          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#E85D04]/10 ${formData.service === service
                              ? 'bg-black border-black text-white'
                              : 'bg-white border-black/10 text-gray-600 hover:border-black/30'
                            }`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="font-mono text-xs uppercase text-gray-500 ml-1">Project Details</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-gray-50 border border-black/5 rounded-2xl px-3 py-2.5 md:px-4 md:py-3 focus:outline-none focus:bg-white focus:border-[#E85D04]/50 focus:ring-4 focus:ring-[#E85D04]/10 transition-all text-sm resize-none"
                      placeholder="Tell me about your project goals, timeline, and budget..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 bg-[#E85D04] text-white py-3 px-6 md:py-4 md:px-8 rounded-xl md:rounded-2xl font-medium flex items-center justify-center gap-3 group overflow-hidden relative"
                  >
                    <span className="absolute inset-0 w-full h-full bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 flex items-center gap-2">
                      {isSubmitting ? "Sending..." : "Send Message"}
                      {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <FAQ />
      </div>
    </motion.main>
  );
}


