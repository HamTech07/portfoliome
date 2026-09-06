import { Bot, Code2, Radio, Smartphone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const reveal = { duration: 0.4, ease: "easeOut" };

const nodes = [
  { key: "web", icon: Code2, label: "Web", detail: "Juna · Ecourish" },
  { key: "mobile", icon: Smartphone, label: "Mobile", detail: "Caloverse" },
  { key: "ai", icon: Bot, label: "AI", detail: "Connected workflows" },
];

export default function HeroSignal() {
  const signalRef = useRef(null);

  useEffect(() => {
    const element = signalRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle("is-paused", !entry.isIntersecting);
    }, { rootMargin: "120px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={signalRef}
      className="hero-signal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...reveal, delay: 0.18 }}
    >
      <div className="hero-signal-grid" aria-hidden="true" />
      <div className="hero-signal-orbit hero-signal-orbit-one" aria-hidden="true" />
      <div className="hero-signal-orbit hero-signal-orbit-two" aria-hidden="true" />

      <div className="signal-window">
        <div className="signal-window-bar">
          <span><i /><i /><i /></span>
          <strong><Radio size={13} /> Live product system</strong>
        </div>
        <div className="signal-window-body">
          <div className="signal-brand"><span>H</span><div><strong>Hamdan Studio</strong><small>Design → build → ship</small></div></div>
          <div className="signal-score"><Sparkles size={16} /><strong>04</strong><span>products shipped</span></div>
          <div className="signal-bars" aria-hidden="true"><i /><i /><i /></div>
          <div className="signal-status"><span><i /> Portfolio system online</span><small>Web · Mobile · AI · UI/UX</small></div>
        </div>
      </div>

      <div className="signal-nodes">
        {nodes.map(({ key, icon: Icon, label, detail }, index) => (
          <motion.div
            key={key}
            className={"signal-node signal-node-" + key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.28 + index * 0.07 }}
          >
            <span><Icon size={17} /></span>
            <div><strong>{label}</strong><small>{detail}</small></div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
