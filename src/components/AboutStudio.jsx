import { ArrowUpRight, CheckCircle2, GraduationCap, MapPin } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import useMediaQuery from "../hooks/useMediaQuery";

const reveal = { duration: 0.4, ease: "easeOut" };

export default function AboutStudio() {
  const sectionRef = useRef(null);
  const enhancedMotion = useMediaQuery("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [24, -24]);

  return (
    <section ref={sectionRef} id="about" className="section-shell overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-8 lg:py-32">
        <motion.div style={enhancedMotion ? { y: imageY } : undefined} className="relative mx-auto w-full max-w-lg">
          <div className="portrait-glow" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={reveal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="portrait-frame"
          >
            <img src="/images/Profile1.jpeg" alt="Muhammad Hamdan Amir" loading="lazy" decoding="async" />
            <div className="portrait-caption">
              <span>Based in Pakistan</span>
              <strong>Building globally</strong>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reveal}
        >
          <div className="section-heading">
            <span>About me</span>
            <h2>Curious by nature. Precise by practice.</h2>
          </div>
          <p className="mt-7 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            I’m Muhammad Hamdan Amir, a Computer Science student and multidisciplinary developer. I enjoy taking a product from its first rough idea to a refined experience—connecting interface detail with the engineering underneath it.
          </p>
          <p className="mt-4 leading-7 text-slate-500 dark:text-slate-400">
            My work spans full-stack web development, Flutter and React Native app-development skills, Unity game systems and user-centered interface design.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              [GraduationCap, "Computer Science", "University of Management & Technology"],
              [MapPin, "Open to opportunities", "Freelance, internship & full-time"],
              [CheckCircle2, "Product mindset", "Performance, accessibility & polish"],
              [ArrowUpRight, "Continuous learner", "Exploring better ways to build"],
            ].map(([Icon, title, text]) => (
              <motion.div key={title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="detail-card">
                <Icon size={19} />
                <div><strong>{title}</strong><span>{text}</span></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
