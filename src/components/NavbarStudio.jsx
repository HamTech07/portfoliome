import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";

const links = [
  ["#home", "Home"],
  ["#skills", "Skills"],
  ["#projects", "Projects"],
  ["#about", "About"],
  ["#contact", "Contact"],
];

export default function NavbarStudio() {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const useDark = localStorage.getItem("hamdan-theme") !== "light";
    setDark(useDark);
    document.documentElement.classList.toggle("dark", useDark);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55%", threshold: [0.05, 0.25, 0.5] },
    );

    links.forEach(([href]) => {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("hamdan-theme", next ? "dark" : "light");
      return next;
    });
  };

  const scrollTo = (href) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
    >
      <div className="glass-nav mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            scrollTo("#home");
          }}
          className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-950 dark:text-white"
        >
          <span className="logo-mark">H</span>
          Hamdan<span className="text-cyan-500 dark:text-cyan-300">.dev</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <button key={href} onClick={() => scrollTo(href)} className={"nav-link " + (active === href.slice(1) ? "is-active" : "")} aria-current={active === href.slice(1) ? "page" : undefined}>
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={toggleTheme} className="icon-button" aria-label={dark ? "Use light mode" : "Use dark mode"}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              scrollTo("#contact");
            }}
            className="nav-cta hidden sm:flex"
          >
            Let's talk <ArrowUpRight size={15} />
          </motion.a>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setOpen((value) => !value)} className="icon-button mobile-menu-toggle" aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mobile-nav mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              {links.map(([href, label]) => (
                <button key={href} onClick={() => scrollTo(href)} className={"nav-link text-left " + (active === href.slice(1) ? "is-active" : "")} aria-current={active === href.slice(1) ? "page" : undefined}>
                  {label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
