import { ArrowUpRight, BriefcaseBusiness, GitFork, Mail, MessageSquareText, Store } from "lucide-react";
import { motion } from "framer-motion";
import { freelanceProfiles } from "../data/portfolio";

const reveal = { duration: 0.4, ease: "easeOut" };

export default function ContactStudio() {
  return (
    <section id="contact" className="contact-section overflow-hidden">
      <div className="contact-grid" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={reveal}
          className="contact-card"
        >
          <div className="max-w-3xl">
            <span className="contact-eyebrow"><span className="status-dot" /> Available for new projects</span>
            <h2>Have an idea worth building?</h2>
            <p>Let’s turn it into a fast, memorable and genuinely useful digital product.</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="mailto:hamdanamir2005@gmail.com"
              className="primary-button focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Mail size={18} /> Start a conversation
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://github.com/HamTech07"
              target="_blank"
              rel="noreferrer"
              className="contact-secondary focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <GitFork size={18} /> Explore GitHub <ArrowUpRight size={16} />
            </motion.a>
          </div>
          <div className="freelance-grid">
            <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={freelanceProfiles.upwork} target="_blank" rel="noreferrer" className="freelance-link">
              <span className="freelance-icon"><BriefcaseBusiness size={20} /></span>
              <span><strong>Hire me on Upwork</strong><small>Discuss a custom project</small></span>
              <ArrowUpRight size={17} />
            </motion.a>
            <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={freelanceProfiles.fiverr} target="_blank" rel="noreferrer" className="freelance-link">
              <span className="freelance-icon"><Store size={20} /></span>
              <span><strong>Find me on Fiverr</strong><small>Explore ready-to-order services</small></span>
              <ArrowUpRight size={17} />
            </motion.a>
          </div>
          <div className="contact-meta">
            <div><MessageSquareText size={17} /><span>Usually responds within 24–48 hours</span></div>
            <a href="mailto:hamdanamir2005@gmail.com">hamdanamir2005@gmail.com</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
