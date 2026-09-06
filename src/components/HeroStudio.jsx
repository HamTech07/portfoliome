import { ArrowDownRight, ArrowUpRight, GitFork, Layers3, Sparkles, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import HeroSignal from "./HeroSignal";
import "./hero-scroll.css";

const reveal = { duration: 0.4, ease: "easeOut" };

function HeroCopy() {
  return (
    <div className="hero-copy-layer max-w-3xl">
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
          { icon: Workflow, value: "∞", label: "Connected ideas" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="metric-card last:col-span-2 sm:last:col-span-1">
            <Icon size={17} className="text-cyan-500 dark:text-cyan-300" />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function HeroStudio() {
  return (
    <section id="home" className="hero-section relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
      <div className="hero-layout relative z-10 mx-auto max-w-7xl">
        <HeroCopy />
        <HeroSignal />
      </div>
    </section>
  );
}
