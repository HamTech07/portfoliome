import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 100, damping: 16 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
          <span className="text-primary font-semibold uppercase tracking-widest text-sm">
            About Me
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-dark mt-2 mb-6">
            Who I Am
          </h2>

          <p className="text-gray-600 leading-relaxed mb-8">
            I am a dedicated Full Stack MERN Developer and Game Developer with
            hands-on experience building complete web platforms using{" "}
            <span className="font-medium text-dark">React, Node.js, Express & MongoDB</span>,
            and interactive games in{" "}
            <span className="font-medium text-dark">Unity (C#)</span> and{" "}
            <span className="font-medium text-dark">JavaScript</span>. My goal
            is to craft seamless, high-performance digital experiences — from
            database-driven web apps to polished, playable games.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Degree", value: "Computer Science" },
              { label: "Focus", value: "Full Stack (MERN) & Game Dev" },
              { label: "Student ID", value: "F20232661028" },
              { label: "University", value: "UMT" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 16,
                  delay: i * 0.08,
                }}
              >
                <h4 className="font-bold text-dark text-lg">{item.label}</h4>
                <p className="text-gray-500">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
