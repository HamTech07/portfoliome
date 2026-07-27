import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden"
    >
      {/* Blobs */}
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -50, 20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 -left-20 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 40, -20, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center md:text-left"
        >
          <motion.div
            variants={item}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-primary text-sm font-semibold mb-5"
          >
            👋 Hi, I'm Muhammad Hamdan Amir
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl md:text-6xl font-extrabold text-dark leading-tight mb-6"
          >
            Full Stack <span className="text-primary">MERN</span> Developer
            <br />& <span className="text-purple-600">Game</span> Developer
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg text-gray-600 mb-8 max-w-lg mx-auto md:mx-0"
          >
            A passionate <span className="font-semibold text-primary">Full Stack MERN Developer</span>{" "}
            & <span className="font-semibold text-purple-600">Game Developer</span>,
            dedicated to building robust web architectures with{" "}
            <span className="font-medium">React, Node.js, Express & MongoDB</span>,
            and crafting interactive games with{" "}
            <span className="font-medium">Unity (C#)</span> and JavaScript.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <motion.a
              whileHover={{ scale: 1.06, boxShadow: "0 20px 30px -10px rgba(37,99,235,0.5)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold shadow-lg shadow-blue-500/30"
            >
              Get In Touch
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              href="#skills"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#skills")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-full bg-white border border-gray-200 text-dark font-semibold shadow-sm"
            >
              View My Work
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.3 }}
          className="flex justify-center md:justify-end"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-64 h-64 md:w-80 md:h-80"
          >
            <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-primary via-purple-400 to-orange-300 opacity-70 blur-xl" />
            <img
              src="/images/Profile1.jpeg"
              alt="Muhammad Hamdan Amir"
              className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
