import { ArrowDownRight, ArrowUpRight, GitFork, Layers3, MousePointer2, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import useMediaQuery from "../hooks/useMediaQuery";
import ScrollStory from "./ScrollStory";
import "./hero-scroll.css";

const reveal = { duration: 0.4, ease: "easeOut" };

function HeroCopy({ style }) {
  return (
    <motion.div style={style} className="hero-copy-layer max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={reveal} className="eyebrow mb-6">
        <span className="status-dot" /> Available for ambitious digital products
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...reveal, delay: 0.08 }} className="display-title">
        I engineer ideas into
        <span className="gradient-text block">immersive products.</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...reveal, delay: 0.16 }} className="mt-7 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
        Muhammad Hamdan Amir — a full-stack MERN, Flutter, React Native and game developer building fast, thoughtful experiences across web, mobile and interactive worlds.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...reveal, delay: 0.24 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
        <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="#projects" className="primary-button focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950">
          Explore selected work <ArrowDownRight size={18} />
        </motion.a>
        <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="https://github.com/HamTech07" target="_blank" rel="noreferrer" className="secondary-button focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <GitFork size={18} /> GitHub <ArrowUpRight size={16} />
        </motion.a>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...reveal, delay: 0.32 }} className="hero-metrics mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { icon: Layers3, value: "04", label: "Shipped projects" },
          { icon: Sparkles, value: "05", label: "Core disciplines" },
          { icon: ArrowUpRight, value: "∞", label: "Ideas in motion" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="metric-card last:col-span-2 sm:last:col-span-1">
            <Icon size={17} className="text-cyan-500 dark:text-cyan-300" />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...reveal, delay: 0.45 }} className="hero-scroll-cue">
        <MousePointer2 size={15} /> Scroll to open the build system
      </motion.div>
    </motion.div>
  );
}

export default function HeroStudio() {
  const sectionRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reducedMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const copyOpacity = useTransform(scrollYProgress, [0, 0.2, 0.34], [1, 1, 0]);
  const copyY = useTransform(scrollYProgress, [0.18, 0.36], [0, -70]);
  const copyVisibility = useTransform(scrollYProgress, (value) => value < 0.34 ? "visible" : "hidden");
  const storyOpacity = useTransform(scrollYProgress, [0.14, 0.34], [0, 1]);
  const storyVisibility = useTransform(scrollYProgress, (value) => value > 0.14 ? "visible" : "hidden");

  const mobileCopyStyle = !isDesktop && !reducedMotion ? { opacity: copyOpacity, y: copyY, visibility: copyVisibility } : undefined;
  const mobileStoryStyle = !isDesktop && !reducedMotion ? { opacity: storyOpacity, visibility: storyVisibility } : undefined;

  return (
    <section ref={sectionRef} id="home" className={"hero-section hero-scroll-section relative overflow-clip px-4 sm:px-6 lg:px-8" + (reducedMotion ? " is-reduced" : "")}>
      <div className="grid-overlay absolute inset-0 opacity-40" />
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />

      <div className="hero-story-sticky relative z-10 mx-auto max-w-7xl">
        <div className="hero-story-layout">
          <HeroCopy style={mobileCopyStyle} />
          <ScrollStory progress={scrollYProgress} reducedMotion={reducedMotion} compact={!isDesktop} style={mobileStoryStyle} />
        </div>
      </div>
    </section>
  );
}
