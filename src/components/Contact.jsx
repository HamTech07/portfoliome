import { motion } from "framer-motion";
import { socials } from "../data/content";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 130, damping: 16 } },
};

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-dark text-white relative overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.span variants={item} className="text-blue-400 font-semibold uppercase tracking-widest text-sm">
            Get In Touch
          </motion.span>
          <motion.h2 variants={item} className="text-3xl md:text-5xl font-extrabold mt-2 mb-6">
            Let's Build Something Great
          </motion.h2>
          <motion.p variants={item} className="text-gray-300 mb-6">
            Available for Full Stack (MERN) Web Apps / Business & Company Websites /
            E-Commerce & Online Stores / Dashboard & Management Systems / Game
            Development Projects (Unity C# & JavaScript) / Daily Use Web Applications.
            Freelancing-ready for professional projects and full-time opportunities.
          </motion.p>
          <motion.p variants={item} className="text-gray-400 mb-10">
            Have a full stack web app or game idea in mind? Let's build it together.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap justify-center gap-5 mb-10">
            <motion.a
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              href={socials.email}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary font-semibold shadow-lg shadow-blue-500/30"
            >
              <i className="fas fa-envelope" />
              <span>Email Me</span>
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              href={socials.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 border border-white/20 font-semibold"
            >
              <i className="fab fa-github" />
              <span>GitHub</span>
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              href={socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 border border-white/20 font-semibold"
            >
              <i className="fab fa-linkedin" />
              <span>LinkedIn</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
