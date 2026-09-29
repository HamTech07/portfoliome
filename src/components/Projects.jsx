import { ArrowUpRight, CheckCircle2, Download, Eye, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSite } from "../lib/SiteContext";
import ProjectPreview from "./ProjectPreview";

const reveal = { duration: 0.4, ease: "easeOut" };

export default function Projects() {
  const { site } = useSite();
  const projects = site.projects;
  const filters = ["All", ...new Set(projects.map((project) => project.category))];
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const visibleProjects = useMemo(
    () => filter === "All" ? projects : projects.filter((project) => project.category === filter),
    [filter, projects],
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
    <section id="projects" className="section-shell section-tinted overflow-clip">
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
              <h2>{site.headings.projects}</h2>
              <p>{site.headings.projectsDescription}</p>
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

          <motion.div layout="position" layoutDependency={filter} className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project, index) => {
                return (
                  <motion.article
                    layout="position"
                    layoutDependency={filter}
                    key={project.id}
                    initial={{ opacity: 0, y: 48, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.12 }}
                    onViewportEnter={(entry) => entry?.target.classList.add("is-in-view")}
                    onViewportLeave={(entry) => entry?.target.classList.remove("is-in-view")}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.025, 0.1) }}
                    className={"project-card accent-" + project.accent}
                  >
                    {project.downloadUrl ? <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={project.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={project.downloadName}
                      className="project-visual"
                      aria-label={"Download " + project.title + " Android APK"}
                    >
                      <span className="project-number">{project.number}</span>
                      {project.image ? <img className="project-cover" src={project.image} alt={project.title} loading="lazy" /> : <ProjectPreview project={project} />}
                      <span className="project-domain"><Download size={13} /> {project.domain}</span>
                    </motion.a> : <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedProject(project)}
                      className="project-visual"
                      aria-label={"Open details for " + project.title}
                    >
                      <span className="project-number">{project.number}</span>
                      {project.image ? <img className="project-cover" src={project.image} alt={project.title} loading="lazy" /> : <ProjectPreview project={project} />}
                      <span className="project-domain">{new URL(project.url, window.location.origin).hostname}</span>
                    </motion.button>}
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
                          href={project.downloadUrl || project.url}
                          target="_blank"
                          rel="noreferrer"
                          download={project.downloadUrl ? project.downloadName || undefined : undefined}
                          className="project-link"
                          aria-label={project.downloadUrl ? "Download " + project.title + " Android APK" : "Open " + project.title + " live website"}
                        >
                          {project.downloadUrl ? <><Download size={17} /> Download APK</> : <>{project.liveLabel ?? "Live website"} <ArrowUpRight size={17} /></>}
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
                <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={selectedProject.downloadUrl || selectedProject.url} target="_blank" rel="noreferrer" download={selectedProject.downloadName || undefined} className="primary-button">
                  {selectedProject.downloadUrl ? <><Download size={17} /> Download Android APK</> : <>Open {selectedProject.liveLabel?.toLowerCase() ?? "live website"} <ArrowUpRight size={17} /></>}
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
