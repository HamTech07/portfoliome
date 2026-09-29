import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const sections = [
  ["home", "Start"],
  ["skills", "Skills"],
  ["projects", "Work"],
  ["about", "About"],
  ["contact", "Contact"],
];

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 24, mass: 0.25 });
  const [active, setActive] = useState("home");
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -45%", threshold: [0.05, 0.25, 0.5, 0.75] });
    sections.forEach(([id]) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  return <>
    <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
    <nav className="scroll-rail" aria-label="Page sections">
      {sections.map(([id, label], index) => <a key={id} className={active === id ? "is-active" : ""} href={`#${id}`} aria-label={`Go to ${label}`} aria-current={active === id ? "location" : undefined}><span>{String(index + 1).padStart(2, "0")}</span><i /><em>{label}</em></a>)}
    </nav>
  </>;
}
