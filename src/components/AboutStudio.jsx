import { ArrowUpRight, CheckCircle2, GraduationCap, MapPin } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import useMediaQuery from "../hooks/useMediaQuery";
import { useSite } from "../lib/SiteContext";

const reveal = { duration: 0.4, ease: "easeOut" };

export default function AboutStudio() {
  const { site } = useSite();
  const { about, profile } = site;
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
            <img src={profile.portrait} alt={profile.name} loading="lazy" decoding="async" />
            <div className="portrait-caption">
              <span>{profile.location}</span>
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
            <h2>{about.title}</h2>
          </div>
          <p className="mt-7 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            {about.intro}
          </p>
          <p className="mt-4 leading-7 text-slate-500 dark:text-slate-400">
            {about.description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              [GraduationCap, about.education, about.university],
              [MapPin, "Open to opportunities", about.availability],
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
