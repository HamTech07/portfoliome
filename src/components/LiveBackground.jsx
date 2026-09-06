import { motion } from "framer-motion";

export default function LiveBackground() {
  return (
    <motion.div
      className="live-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="live-background-grid" />
      <div className="ambient-ribbon ambient-ribbon-one" />
      <div className="ambient-ribbon ambient-ribbon-two" />
      <div className="ambient-stream ambient-stream-cyan" />
      <div className="ambient-stream ambient-stream-violet" />
      <div className="ambient-stream ambient-stream-warm" />
      <div className="ambient-noise" />
    </motion.div>
  );
}
