import { Code2, Gamepad2, Layers3, PenTool, Smartphone, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { capabilities } from "../data/portfolio";
import WorkingStack from "./WorkingStack";
import "./working-stack.css";

const icons = {
  web: Code2,
  mobile: Smartphone,
  games: Gamepad2,
  design: PenTool,
  automation: Workflow,
};

const reveal = { duration: 0.4, ease: "easeOut" };

export default function SkillsStudio() {
  return (
    <section id="skills" className="section-shell overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={reveal}
          className="section-heading"
        >
          <span>Capabilities</span>
          <h2>One developer. Multiple dimensions.</h2>
          <p>I connect engineering, design and AI automation to build thoughtful products across web, mobile and interactive experiences.</p>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {capabilities.map((capability, index) => {
            const Icon = icons[capability.key] ?? Layers3;
            return (
              <motion.div
                key={capability.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ ...reveal, delay: index * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={"capability-card capability-photo-card accent-" + capability.accent + (capability.key === "automation" ? " capability-featured" : "")}
              >
                <img src={capability.image} alt="" width="960" height="640" loading="lazy" decoding="async" className="capability-background" />
                <div className="capability-shade" aria-hidden="true" />
                <div className="capability-copy">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="card-eyebrow">{capability.eyebrow}</span>
                    <h3>{capability.title}</h3>
                  </div>
                  <div className="capability-icon"><Icon size={24} /></div>
                </div>
                <p>{capability.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {capability.stack.map((item) => (
                    <span key={item} className="stack-pill">{item}</span>
                  ))}
                </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <WorkingStack />
      </div>
    </section>
  );
}
