import { ArrowUpRight, Bot, Code2, FolderOpen, Gamepad2, Layers3, PenTool, Smartphone, Workflow, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { capabilities, projects } from "../data/portfolio";
import WorkingStack from "./WorkingStack";
import "./working-stack.css";
import "./capability-dialog.css";

const icons = {
  web: Code2,
  mobile: Smartphone,
  games: Gamepad2,
  design: PenTool,
  automation: Workflow,
};

const reveal = { duration: 0.4, ease: "easeOut" };

const capabilityWork = {
  web: {
    summary: "Responsive products built from interface to deployment.",
    projectIds: ["juna", "ecourish"],
  },
  mobile: {
    summary: "A complete Android product experience ready to explore.",
    projectIds: ["caloverse"],
  },
  automation: {
    summary: "Connected commerce thinking applied to smarter product workflows.",
    projectIds: ["juna"],
  },
  design: {
    summary: "Caloverse UI/UX screens shaped around calm nutrition tracking and clear daily actions.",
    gallery: true,
  },
  games: {
    summary: "The first playable game project is currently being developed.",
    inProgress: true,
  },
};

const caloverseScreens = [
  { src: "/images/caloverse/sign_in_sign_up.jpg", label: "Sign in", alt: "Caloverse sign-in and sign-up interface" },
  { src: "/images/caloverse/onboarding_bmr_calc.jpg", label: "Onboarding", alt: "Caloverse BMR onboarding interface" },
  { src: "/images/caloverse/daily_progress_dashboard.jpg", label: "Daily progress", alt: "Caloverse daily nutrition progress dashboard" },
  { src: "/images/caloverse/ai_photo_scanner_pro.jpg", label: "AI scanner", alt: "Caloverse AI food photo scanner interface" },
  { src: "/images/caloverse/regional_food_database.jpg", label: "Food database", alt: "Caloverse regional food database interface" },
  { src: "/images/caloverse/voice_ai_assistant_pro.jpg", label: "Voice assistant", alt: "Caloverse voice AI assistant interface" },
  { src: "/images/caloverse/hydration_habits_tracker.jpg", label: "Hydration", alt: "Caloverse hydration and habits tracker" },
];

function ProjectTile({ project }) {
  const Icon = project.id === "juna" ? Bot : project.id === "caloverse" ? Smartphone : Code2;
  const isDownloadFolder = Boolean(project.downloadUrl);

  return (
    <motion.a
      href={project.downloadUrl ?? project.url}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={"capability-project-tile accent-" + project.accent}
    >
      <span className="capability-project-icon"><Icon size={20} /></span>
      <div>
        <span>{project.category}</span>
        <strong>{project.title}</strong>
        <small>{project.description}</small>
      </div>
      {isDownloadFolder ? <FolderOpen size={18} /> : <ArrowUpRight size={18} />}
    </motion.a>
  );
}

function CaloverseGallery() {
  const gallery = (duplicate = false) => (
    <div className="caloverse-gallery-group" aria-hidden={duplicate || undefined}>
      {caloverseScreens.map((screen) => (
        <figure key={(duplicate ? "copy-" : "") + screen.src} className="caloverse-screen">
          <img src={screen.src} alt={duplicate ? "" : screen.alt} width="520" height="1280" loading="lazy" decoding="async" />
          <figcaption>{screen.label}</figcaption>
        </figure>
      ))}
    </div>
  );

  return (
    <div className="caloverse-gallery" aria-label="Caloverse UI and UX screen gallery">
      <div className="caloverse-gallery-track">
        {gallery()}
        {gallery(true)}
      </div>
    </div>
  );
}

export default function SkillsStudio() {
  const [selectedKey, setSelectedKey] = useState(null);
  const selectedCapability = useMemo(
    () => capabilities.find(({ key }) => key === selectedKey) ?? null,
    [selectedKey],
  );
  const selectedWork = selectedKey ? capabilityWork[selectedKey] : null;

  useEffect(() => {
    if (!selectedCapability) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedKey(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedCapability]);

  return (
    <section id="skills" className="section-shell overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={reveal} className="section-heading">
          <span>Capabilities</span>
          <h2>One developer. Multiple dimensions.</h2>
          <p>Open a capability to see the products and interface work behind it.</p>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {capabilities.map((capability, index) => {
            const Icon = icons[capability.key] ?? Layers3;
            return (
              <motion.button
                type="button"
                key={capability.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ ...reveal, delay: index * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedKey(capability.key)}
                className={"capability-card capability-photo-card accent-" + capability.accent + (capability.key === "automation" ? " capability-featured" : "")}
                aria-haspopup="dialog"
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
                    {capability.stack.map((item) => <span key={item} className="stack-pill">{item}</span>)}
                  </div>
                  <span className="capability-open">Explore work <ArrowUpRight size={16} /></span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <WorkingStack />
      </div>

      <AnimatePresence>
        {selectedCapability && selectedWork && (
          <motion.div
            className="capability-dialog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reveal}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedKey(null);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="capability-dialog-title"
              className={"capability-dialog accent-" + selectedCapability.accent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={reveal}
            >
              <div className="capability-dialog-header">
                <div>
                  <span className="card-eyebrow">{selectedCapability.eyebrow}</span>
                  <h3 id="capability-dialog-title">{selectedCapability.title}</h3>
                  <p>{selectedWork.summary}</p>
                </div>
                <motion.button type="button" autoFocus whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedKey(null)} className="dialog-close" aria-label="Close capability details">
                  <X size={20} />
                </motion.button>
              </div>

              <div className="capability-dialog-body">
                {selectedWork.gallery && (
                  <div className="capability-gallery-section">
                    <div className="capability-gallery-title"><PenTool size={18} /><span>Caloverse product design</span></div>
                    <CaloverseGallery />
                  </div>
                )}

                {selectedWork.inProgress && (
                  <motion.div className="capability-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={reveal}>
                    <span><Gamepad2 size={26} /></span>
                    <strong>In progress</strong>
                    <p>A playable game project is currently in development. The first case study will appear here when it is ready.</p>
                  </motion.div>
                )}

                {selectedWork.projectIds?.length > 0 && (
                  <div className="capability-project-grid">
                    {selectedWork.projectIds.map((projectId) => {
                      const project = projects.find(({ id }) => id === projectId);
                      return project ? <ProjectTile key={project.id} project={project} /> : null;
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
