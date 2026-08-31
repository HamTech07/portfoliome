import { ArrowDownRight, ArrowUpRight, GitFork, Layers3, Sparkles } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { lazy, Suspense, useRef } from "react";
import useMediaQuery from "../hooks/useMediaQuery";

const reveal = { duration: 0.4, ease: "easeOut" };
const DeveloperScene = lazy(() => import("./DeveloperScene"));

export default function HeroStudio() {
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneNearViewport = useInView(sceneRef, { once: true, margin: "160px" });
  const enhancedMotion = useMediaQuery("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const sceneRotate = useTransform(scrollYProgress, [0, 1], [0, 4]);

  return (
    <section ref={sectionRef} id="home" className="hero-section relative min-h-screen overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="grid-overlay absolute inset-0 opacity-40" />
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-3xl">
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...reveal, delay: 0.32 }} className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Layers3, value: "03", label: "Live products" },
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
        </div>

        <div ref={sceneRef} className="relative mx-auto w-full max-w-[620px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...reveal, delay: 0.18 }}
            style={enhancedMotion ? { y: sceneY, rotate: sceneRotate } : undefined}
            className="scene-shell relative"
          >
            <div className="scene-glow" />
            <Suspense fallback={<div className="scene-skeleton" aria-label="Loading 3D scene" />}>
              {sceneNearViewport && <DeveloperScene />}
            </Suspense>
            <div className="scene-label scene-label-top">Creative developer</div>
            <div className="scene-label scene-label-bottom">Web · Apps · Games</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
