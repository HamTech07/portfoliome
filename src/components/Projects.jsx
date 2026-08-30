import { ArrowUpRight, CheckCircle2, Eye, Leaf, ShoppingBag, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { projects } from "../data/portfolio";

const filters = ["All", "Commerce", "Web Experience", "Tournament Platform"];
const icons = { juna: ShoppingBag, ecourish: Leaf, besports: Trophy };
const reveal = { duration: 0.4, ease: "easeOut" };

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const visibleProjects = useMemo(
    () => filter === "All" ? projects : projects.filter((project) => project.category === filter),
    [filter],
  );

  useEffect(() => {
    if (!selectedProject) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedProject(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedProject]);

  return (
    <section id="projects" className="section-shell section-tinted overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={reveal}
            className="lg:sticky lg:top-32 lg:h-fit"
          >
            <div className="section-heading">
              <span>Selected work</span>
              <h2>Live ideas, shipped to the web.</h2>
              <p>Three focused products shaped around strong usability, responsiveness and a clear visual identity.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Filter projects">
              {filters.map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(item)}
                  className={"filter-button " + (filter === item ? "is-active" : "")}
                  aria-pressed={filter === item}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div layout className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project, index) => {
                const Icon = icons[project.id];
                return (
                  <motion.article
                    layout
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ ...reveal, delay: index * 0.05 }}
                    className={"project-card accent-" + project.accent}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedProject(project)}
                      className="project-visual"
                      aria-label={"Open details for " + project.title}
                    >
                      <span className="project-number">{project.number}</span>
                      <div className="project-glyph"><Icon size={30} /></div>
                      <span className="project-domain">{new URL(project.url).hostname}</span>
                    </motion.button>
                    <div className="project-content">
                      <span className="card-eyebrow">{project.category}</span>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.tags.map((tag) => <span key={tag} className="stack-pill">{tag}</span>)}
                      </div>
                      <div className="project-actions">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedProject(project)}
                          className="project-detail-button"
                          aria-haspopup="dialog"
                        >
                          <Eye size={17} /> View details
                        </motion.button>
                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          className="project-link"
                          aria-label={"Open " + project.title + " live website"}
                        >
                          Live website <ArrowUpRight size={17} />
                        </motion.a>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reveal}
            className="project-dialog-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedProject(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={reveal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-dialog-title"
              className={"project-dialog accent-" + selectedProject.accent}
            >
              <div className="project-dialog-header">
                <div>
                  <span className="card-eyebrow">{selectedProject.category}</span>
                  <h3 id="project-dialog-title">{selectedProject.title}</h3>
                  <p>{selectedProject.role}</p>
                </div>
                <motion.button autoFocus whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedProject(null)} className="dialog-close" aria-label="Close project details">
                  <X size={20} />
                </motion.button>
              </div>

              <div className="project-dialog-body">
                <div className="dialog-copy">
                  <span>Challenge</span>
                  <p>{selectedProject.challenge}</p>
                </div>
                <div className="dialog-copy">
                  <span>Approach</span>
                  <p>{selectedProject.solution}</p>
                </div>
                <div className="dialog-highlights">
                  {selectedProject.highlights.map((highlight) => (
                    <div key={highlight}><CheckCircle2 size={17} /><span>{highlight}</span></div>
                  ))}
                </div>
              </div>

              <div className="project-dialog-footer">
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag) => <span key={tag} className="stack-pill">{tag}</span>)}
                </div>
                <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={selectedProject.url} target="_blank" rel="noreferrer" className="primary-button">
                  Open live website <ArrowUpRight size={17} />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
