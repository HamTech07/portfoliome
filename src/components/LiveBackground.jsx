import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export default function LiveBackground() {
  const background = useRef(null);
  const { scrollYProgress } = useScroll();
  const ambientY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const ambientRotate = useTransform(scrollYProgress, [0, 1], [0, 5]);
  useEffect(() => {
    const update = () => background.current?.classList.toggle("is-paused", document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <motion.div
      ref={background}
      className="live-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="live-background-grid" />
      <div className="aurora-field" />
      <div className="orbital-ring orbital-ring-one" />
      <div className="orbital-ring orbital-ring-two" />
      <div className="ambient-particles">
        {Array.from({ length: 16 }, (_, index) => <i key={index} style={{ "--x": `${(index * 37 + 9) % 100}%`, "--y": `${(index * 23 + 5) % 100}%`, "--delay": `${-index * 1.7}s`, "--duration": `${12 + index % 7}s` }} />)}
      </div>
      <motion.div className="scroll-reactive-field" style={{ y: ambientY, rotate: ambientRotate }}>
        <div className="ambient-ribbon ambient-ribbon-one" />
        <div className="ambient-ribbon ambient-ribbon-two" />
        <div className="ambient-stream ambient-stream-cyan" />
        <div className="ambient-stream ambient-stream-violet" />
        <div className="ambient-stream ambient-stream-warm" />
      </motion.div>
      <div className="ambient-noise" />
    </motion.div>
  );
}
