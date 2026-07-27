import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "#home", label: "Home" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (href) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.1 }}
      className="fixed top-0 inset-x-0 z-50 glass-nav"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#home");
          }}
          className="text-xl font-extrabold tracking-tight text-dark"
        >
          Hamdan<span className="text-primary">.dev</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="relative text-sm font-medium text-gray-600 hover:text-primary transition-colors group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </button>
          ))}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#contact");
            }}
            className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-blue-500/30"
          >
            Let's Talk
          </motion.a>
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden text-2xl text-dark"
          aria-label="Toggle menu"
        >
          <i className={`fas ${open ? "fa-times" : "fa-bars"}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-lg border-t border-gray-100"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-left text-gray-700 font-medium py-1"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo("#contact")}
                className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold text-center"
              >
                Let's Talk
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
