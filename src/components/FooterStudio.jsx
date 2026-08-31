import { ArrowUp, BriefcaseBusiness, GitFork, Mail, Store } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { freelanceProfiles } from "../data/portfolio";

export default function FooterStudio() {
  const reducedMotion = useReducedMotion();
  const backToTop = () => window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });

  return (
    <footer className="studio-footer">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <strong>Muhammad Hamdan Amir</strong>
          <p>Full-stack · Mobile · Game developer</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="mailto:hamdanamir2005@gmail.com" className="footer-icon" aria-label="Email Muhammad Hamdan Amir"><Mail size={17} /></motion.a>
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="https://github.com/HamTech07" target="_blank" rel="noreferrer" className="footer-icon" aria-label="View GitHub profile"><GitFork size={17} /></motion.a>
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={freelanceProfiles.upwork} target="_blank" rel="noreferrer" className="footer-icon" aria-label="Hire on Upwork"><BriefcaseBusiness size={17} /></motion.a>
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={freelanceProfiles.fiverr} target="_blank" rel="noreferrer" className="footer-icon" aria-label="View Fiverr profile"><Store size={17} /></motion.a>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={backToTop} className="back-to-top">
            Back to top <ArrowUp size={16} />
          </motion.button>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Muhammad Hamdan Amir. Designed and developed with intent.</div>
    </footer>
  );
}
