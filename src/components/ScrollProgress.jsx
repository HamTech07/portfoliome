import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 24, mass: 0.25 });

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
